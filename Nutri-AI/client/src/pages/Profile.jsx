import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Lock, 
  Trash2, 
  Camera, 
  Calendar, 
  Activity, 
  Utensils, 
  MessageCircle,
  Shield,
  Zap,
  ArrowRight,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [healthProfile, setHealthProfile] = useState(null);
  const [stats, setStats] = useState({ workouts: 0, meals: 0, posts: 0 });
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState(user?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [healthFormData, setHealthFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    goal: 'maintain', // Defaulting to maintain as we remove it from UI
    dietaryPreference: '',
    weeklyBudget: '',
    targetCalories: '',
    dailyBurnGoal: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [hpRes, workoutRes, dietRes, postsRes] = await Promise.allSettled([
          api.get('/health/profile'),
          api.get('/exercises/log/history'),
          api.get('/diet/log'),
          api.get('/community/posts')
        ]);

        if (hpRes.status === 'fulfilled') {
          setHealthProfile(hpRes.value.data);
          setHealthFormData({
            age: hpRes.value.data.age,
            gender: hpRes.value.data.gender,
            weight: hpRes.value.data.weight,
            height: hpRes.value.data.height,
            activityLevel: hpRes.value.data.activityLevel,
            goal: hpRes.value.data.goal || 'maintain',
            dietaryPreference: hpRes.value.data.dietaryPreference,
            weeklyBudget: hpRes.value.data.weeklyBudget,
            targetCalories: hpRes.value.data.targetCalories || '',
            dailyBurnGoal: hpRes.value.data.dailyBurnGoal || ''
          });
        }
        
        const workouts = workoutRes.status === 'fulfilled' ? workoutRes.value.data.length : 0;
        const meals = dietRes.status === 'fulfilled' ? dietRes.value.data.length : 0;
        const postsArray = postsRes.status === 'fulfilled' ? postsRes.value.data.posts || postsRes.value.data : [];
        const userPosts = postsArray.filter(p => p.userId?._id === user?._id || p.userId === user?._id).length;

        setStats({ workouts, meals, posts: userPosts });
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfileData();
  }, [user]);

  const handleUpdateName = async () => {
    if (!name.trim() || name === user?.name) {
      setIsEditingName(false);
      setName(user?.name || '');
      return;
    }
    try {
      await api.patch('/auth/me', { name });
      toast.success("Name updated successfully!");
      setIsEditingName(false);
    } catch (error) {
      toast.error("Failed to update name");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const loadingToast = toast.loading("Uploading avatar...");
    try {
      await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Avatar updated!", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to upload avatar", { id: loadingToast });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error("New passwords do not match");
    }

    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      toast.success("Password changed successfully!");
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/me');
      logout();
      navigate('/');
      toast.success("Account deleted.");
    } catch (error) {
      toast.error("Failed to delete account");
      setDeleting(false);
    }
  };

  const handleUpdateHealth = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Updating health data...");
    try {
      const { data } = await api.post('/health/profile', healthFormData);
      setHealthProfile(data);
      setIsEditingHealth(false);
      toast.success("Health profile updated! Regenerate analysis for best results.", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to update health profile", { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 pb-32">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-40 w-full bg-white/5 rounded-4xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-white/5 rounded-4xl" />
            <div className="h-64 bg-white/5 rounded-4xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background p-8 pt-24 pb-32"
    >
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header & Basic Info */}
        <div className="glass p-10 rounded-4xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          <button 
            onClick={logout}
            className="absolute top-8 right-8 glass p-3 rounded-2xl border-white/10 text-text-muted hover:text-red-400 hover:border-red-400/20 transition-all group/logout z-20"
            title="Logout"
          >
            <LogOut className="w-5 h-5 group-hover/logout:scale-110 transition-transform" />
          </button>

          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative group/avatar">
              <div className="w-32 h-32 rounded-3xl glass border-white/20 p-1 group-hover/avatar:border-brand transition-all duration-500 overflow-hidden shadow-2xl">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-brand/10 flex items-center justify-center text-4xl font-bold text-brand">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 glass p-2.5 rounded-xl border-white/10 cursor-pointer hover:border-brand hover:text-brand transition-all shadow-xl bg-background/80">
                <Camera className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              {isEditingName ? (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-dark py-1 px-4 text-xl font-bold"
                    autoFocus
                  />
                  <button onClick={handleUpdateName} className="btn-primary py-1 px-4">Save</button>
                  <button onClick={() => setIsEditingName(false)} className="btn-ghost py-1 px-4 text-xs font-black uppercase">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h1 className="text-4xl font-bold text-text-primary tracking-tight">{user?.name}</h1>
                  <button onClick={() => setIsEditingName(true)} className="glass px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-brand transition-all border-white/5">Edit</button>
                </div>
              )}
              <p className="text-text-secondary font-light">{user?.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                 <div className="glass px-3 py-1.5 rounded-xl border-white/5 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Stats & Health */}
          <div className="md:col-span-1 space-y-10">
            <div className="glass p-8 rounded-4xl border border-white/10">
              <span className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-6 block">Account Stats</span>
              <div className="space-y-6">
                {[
                  { label: 'Workouts', val: stats.workouts, icon: Activity, color: 'text-brand' },
                  { label: 'Meals', val: stats.meals, icon: Utensils, color: 'text-brand' },
                  { label: 'Social', val: stats.posts, icon: MessageCircle, color: 'text-brand' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 glass border-white/5 rounded-xl text-text-muted">
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-text-secondary">{stat.label}</span>
                    </div>
                    <span className="text-xl font-bold text-text-primary tracking-tighter">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-4xl border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] uppercase font-black text-text-muted tracking-widest">Health Blueprint</span>
                {healthProfile && !isEditingHealth && (
                  <button 
                    onClick={() => setIsEditingHealth(true)}
                    className="text-[10px] font-black uppercase text-brand hover:underline"
                  >
                    Update
                  </button>
                )}
              </div>
              
              {isEditingHealth ? (
                <form onSubmit={handleUpdateHealth} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-text-muted font-bold ml-1">Age</label>
                      <input 
                        type="number" 
                        className="input-dark text-xs py-2" 
                        value={healthFormData.age} 
                        onChange={e => setHealthFormData({...healthFormData, age: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-text-muted font-bold ml-1">Weight (kg)</label>
                      <input 
                        type="number" 
                        className="input-dark text-xs py-2" 
                        value={healthFormData.weight} 
                        onChange={e => setHealthFormData({...healthFormData, weight: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-text-muted font-bold ml-1">Height (cm)</label>
                      <input 
                        type="number" 
                        className="input-dark text-xs py-2" 
                        value={healthFormData.height} 
                        onChange={e => setHealthFormData({...healthFormData, height: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-text-muted font-bold ml-1">Daily Fat Burn Goal</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 500"
                        className="input-dark text-xs py-2 text-brand font-bold" 
                        value={healthFormData.dailyBurnGoal} 
                        onChange={e => setHealthFormData({...healthFormData, dailyBurnGoal: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-text-muted font-bold ml-1">Primary Objective</label>
                      <select 
                        className="input-dark text-xs py-2 bg-background" 
                        value={healthFormData.goal} 
                        onChange={e => setHealthFormData({...healthFormData, goal: e.target.value})}
                      >
                        <option value="lose">Weight Loss</option>
                        <option value="maintain">Maintenance</option>
                        <option value="gain">Muscle Gain</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-text-muted font-bold ml-1">Daily Intake Target</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 2000"
                        className="input-dark text-xs py-2" 
                        value={healthFormData.targetCalories} 
                        onChange={e => setHealthFormData({...healthFormData, targetCalories: e.target.value})}
                      />
                      <p className="text-[8px] text-text-muted italic px-1">Leave empty for AI auto-estimate</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="btn-primary flex-1 py-2 text-xs">Save</button>
                    <button type="button" onClick={() => setIsEditingHealth(false)} className="btn-ghost flex-1 py-2 text-xs uppercase font-black">Cancel</button>
                  </div>
                </form>
              ) : healthProfile ? (
                <div className="space-y-4">
                  <div className="bg-white/2 p-4 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-text-muted uppercase">Physique</span>
                      <span className="text-xs font-bold text-text-primary">{healthProfile.age}y • {healthProfile.gender}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-text-muted uppercase">Daily Goal</span>
                      <span className="text-xs font-bold text-brand">{healthProfile.targetCalories || healthProfile.dailyCalorieNeeds || 2000} kcal</span>
                    </div>
                  </div>
                  <div className="bg-brand/10 p-4 rounded-2xl border border-brand/20 flex justify-between items-center">
                    <span className="text-xs font-black text-brand uppercase">Target</span>
                    <span className="text-xs font-black text-brand uppercase tracking-widest">
                      {healthProfile.goal === 'lose' ? 'Weight Loss' : healthProfile.goal === 'gain' ? 'Muscle Gain' : 'Maintenance'}
                    </span>
                  </div>
                  <div className="bg-brand/10 p-4 rounded-2xl border border-brand/20 flex justify-between items-center">
                    <span className="text-xs font-black text-brand uppercase">Daily Burn Goal</span>
                    <span className="text-xs font-black text-brand uppercase tracking-widest">{healthProfile.dailyBurnGoal || 500} kcal</span>
                  </div>
                  <Link to="/health-report" className="btn-ghost w-full py-2.5 flex items-center justify-center gap-2 group">
                    Full Report <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">Profile under construction.</p>
              )}
            </div>
          </div>

          {/* Security & Danger */}
          <div className="md:col-span-2 space-y-10">
            <div className="glass p-10 rounded-4xl border border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <Shield className="w-5 h-5 text-text-muted" />
                <span className="text-[10px] uppercase font-black text-text-muted tracking-widest">Access Security</span>
              </div>
              
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-2 block ml-1">Current Password</label>
                  <input
                    type="password"
                    required
                    className="input-dark"
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-2 block ml-1">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="input-dark"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-2 block ml-1">Verify New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="input-dark"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-primary px-8"
                  >
                    {changingPassword ? 'Securing...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            <div className="glass p-10 rounded-4xl border border-red-500/10 bg-red-500/5 group">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
                <span className="text-[10px] uppercase font-black text-red-400 tracking-widest">Account Erasure</span>
              </div>
              <p className="text-sm text-text-secondary font-light leading-relaxed mb-8">
                Deleting your account is permanent. All your neural data, including workout logs, 
                meal blueprints, and community interactions will be lost forever.
              </p>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="glass border-red-500/20 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you absolutely sure? This action will permanently erase your digital footprint on Nutri-AI."
        confirmText={deleting ? "Erasing..." : "Confirm Deletion"}
        isDanger={true}
      />
    </motion.div>
  );
};

export default Profile;
