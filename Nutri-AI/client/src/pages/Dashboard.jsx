import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Dumbbell, 
  Utensils, 
  MessageCircle, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  ArrowRight,
  Clock,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import MealLogModal from '../components/MealLogModal';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState('');
  const [data, setData] = useState({
    profile: userProfile || null,
    recentWorkouts: [],
    mealPlan: null,
    report: null,
    burnedToday: 0,
    todayStats: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    streak: [false, false, false, false, false, false, false],
  });
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  const tips = [
    "Stay hydrated! Aim for at least 3 litres of water today.",
    "Protein helps in muscle recovery. Don't skip it after your workout.",
    "Consistency is better than intensity. Keep moving!",
    "Try to get 7-8 hours of quality sleep for better metabolism.",
    "Fiber-rich foods keep you full for longer."
  ];

  const calculateStreak = (workouts, diet) => {
    try {
      const streak = [false, false, false, false, false, false, false];
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      // Get Monday of this week
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      // Track workout activity
      if (Array.isArray(workouts)) {
        workouts.forEach(log => {
          const date = new Date(log.date || log.createdAt);
          if (date >= monday) {
            const d = date.getDay();
            const index = d === 0 ? 6 : d - 1;
            streak[index] = true;
          }
        });
      }

      // Track diet activity
      if (diet && typeof diet === 'object') {
        Object.keys(diet).forEach(dateStr => {
          const date = new Date(dateStr);
          if (date >= monday) {
            const d = date.getDay();
            const index = d === 0 ? 6 : d - 1;
            streak[index] = true;
          }
        });
      }

      return streak;
    } catch (e) {
      console.error("Streak calculation error:", e);
      return [false, false, false, false, false, false, false];
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [profileRes, workoutRes, dietRes, todayRes, reportRes, weeklyDietRes] = await Promise.allSettled([
        api.get('/health/profile'),
        api.get('/exercises/log/history'),
        api.get('/diet/meal-plan'),
        api.get('/diet/log/today'),
        api.get('/health/report'),
        api.get('/diet/log/weekly')
      ]);

      const history = (workoutRes.status === 'fulfilled' && workoutRes.value.data) ? workoutRes.value.data : [];
      
      // Calculate today's burned calories
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const burnedToday = history
        .filter(workout => new Date(workout.date) >= startOfDay)
        .reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);

      setData({
        profile: profileRes.status === 'fulfilled' ? profileRes.value.data : (userProfile || null),
        recentWorkouts: history.slice(0, 3),
        burnedToday,
        mealPlan: dietRes.status === 'fulfilled' ? dietRes.value.data : null,
        todayStats: (todayRes.status === 'fulfilled' && todayRes.value.data?.totals) ? todayRes.value.data.totals : { calories: 0, protein: 0, carbs: 0, fat: 0 },
        report: reportRes.status === 'fulfilled' ? reportRes.value.data : null,
        streak: calculateStreak(history, weeklyDietRes.status === 'fulfilled' ? weeklyDietRes.value.data : null),
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load some dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const bmi = data.profile ? (data.profile.weight / Math.pow(data.profile.height / 100, 2)).toFixed(1) : 0;
  
  const getBmiInfo = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#3B82F6' };
    if (bmi < 25) return { label: 'Healthy', color: '#A8E063' };
    if (bmi < 30) return { label: 'Overweight', color: '#F59E0B' };
    return { label: 'Obese', color: '#EF4444' };
  };

  const bmiInfo = getBmiInfo(bmi);

  const streakCount = data.streak.filter(Boolean).length;
  const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 pb-32">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-20 w-64 bg-white/5 animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-64 md:col-span-2 bg-white/5 animate-pulse rounded-4xl" />
            <div className="h-64 bg-white/5 animate-pulse rounded-4xl" />
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
      className="min-h-screen bg-background p-8 pt-24 pb-32 overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-light text-text-primary tracking-tight">
              {getGreeting()}, <span className="font-semibold text-brand">{user?.name?.split(' ')[0]}.</span>
            </h1>
            <p className="text-text-secondary mt-2 font-light">Here's your health overview for today.</p>
          </div>
          
          <div className="glass px-6 py-3 rounded-full flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">BMI</span>
              <span className="text-lg font-bold text-text-primary">{bmi}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full brand-glow" style={{ backgroundColor: bmiInfo.color }} />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{bmiInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Nutrition Card */}
          <div className="glass p-10 rounded-4xl md:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-brand/10 transition-all duration-500" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-text-muted font-bold">Today's Nutrition</span>
                <h3 className="text-2xl font-semibold text-text-primary mt-1">Nutrition Tracker</h3>
              </div>
              <button 
                onClick={() => setIsMealModalOpen(true)}
                className="p-3 bg-brand/10 border border-brand/20 text-brand rounded-2xl hover:bg-brand hover:text-background transition-all active:scale-95 flex items-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-all" />
                <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Add Meal</span>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <circle 
                    cx="96" 
                    cy="96" 
                    r="88" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={552.9} 
                    strokeDashoffset={552.9 * (1 - Math.min((data.todayStats?.calories || 0) / ((data.profile?.targetCalories || data.report?.dailyCalories || data.profile?.dailyCalorieNeeds || 2000) + (data.burnedToday || 0)), 1))} 
                    className="text-brand transition-all duration-1000 ease-out" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold text-text-primary tracking-tighter">
                    {Math.max(((data.profile?.targetCalories || data.report?.dailyCalories || data.profile?.dailyCalorieNeeds || 2000) + (data.burnedToday || 0)) - (data.todayStats?.calories || 0), 0)}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-text-muted font-bold">kcal left</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Prot', val: `${data.todayStats?.protein || 0}g`, target: `${data.report?.macros?.protein || 120}g`, current: data.todayStats?.protein || 0, max: data.report?.macros?.protein || 120 },
                    { label: 'Carb', val: `${data.todayStats?.carbs || 0}g`, target: `${data.report?.macros?.carbs || 200}g`, current: data.todayStats?.carbs || 0, max: data.report?.macros?.carbs || 200 },
                    { label: 'Fat', val: `${data.todayStats?.fat || 0}g`, target: `${data.report?.macros?.fat || 65}g`, current: data.todayStats?.fat || 0, max: data.report?.macros?.fat || 65 }
                  ].map((macro, i) => (
                    <div key={i} className="text-center space-y-2">
                      <div className="w-full aspect-square glass rounded-2xl flex flex-col items-center justify-center p-2 relative overflow-hidden group">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-brand/10 transition-all duration-1000" 
                          style={{ height: `${Math.min((macro.current / macro.max) * 100, 100)}%` }}
                        />
                        <span className="text-sm font-bold text-text-primary relative z-10">{macro.val}</span>
                        <span className="text-[10px] uppercase text-text-muted font-bold relative z-10">{macro.label}</span>
                      </div>
                      <div className="text-[9px] text-text-muted font-medium uppercase tracking-tighter">Goal: {macro.target}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Daily Progress</span>
                    <span className="text-xs font-bold text-brand">{Math.round(((data.todayStats?.calories || 0) / (data.profile?.targetCalories || data.report?.dailyCalories || data.profile?.dailyCalorieNeeds || 2000)) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand rounded-full shadow-[0_0_10px_rgba(168,224,99,0.3)] transition-all duration-1000" 
                      style={{ width: `${Math.min(((data.todayStats?.calories || 0) / (data.profile?.targetCalories || data.report?.dailyCalories || data.profile?.dailyCalorieNeeds || 2000)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass p-10 rounded-4xl flex flex-col gap-4">
             <span className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Quick Actions</span>
             <Link to="/exercises" className="btn-ghost flex items-center justify-between group">
               <div className="flex items-center gap-3">
                 <Dumbbell className="w-5 h-5 group-hover:text-brand transition-colors" />
                 <span>Log Workout</span>
               </div>
               <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
             </Link>
             <Link to="/diet" className="btn-ghost flex items-center justify-between group">
               <div className="flex items-center gap-3">
                 <Utensils className="w-5 h-5 group-hover:text-brand transition-colors" />
                 <span>Meal Plan</span>
               </div>
               <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
             </Link>
             <Link to="/chat" className="btn-ghost flex items-center justify-between group">
               <div className="flex items-center gap-3">
                 <MessageCircle className="w-5 h-5 group-hover:text-brand transition-colors" />
                 <span>NutriBot</span>
               </div>
               <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
             </Link>
             <Link to="/health-report" className="btn-ghost flex items-center justify-between group">
               <div className="flex items-center gap-3">
                 <TrendingUp className="w-5 h-5 group-hover:text-brand transition-colors" />
                 <span>Progress</span>
               </div>
               <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
             </Link>
          </div>

          {/* Recent Activity */}
          <div className="glass p-10 rounded-4xl md:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Clock className="text-brand w-5 h-5" />
                <h3 className="text-xl font-semibold text-text-primary tracking-tight">Recent Activity</h3>
              </div>
              <Link to="/exercises" className="text-xs uppercase tracking-widest text-brand font-bold hover:underline">View All</Link>
            </div>

            <div className="space-y-4">
              {data.recentWorkouts.length > 0 ? data.recentWorkouts.map((workout, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-brand">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">{workout.exerciseId?.name || 'Workout'}</h4>
                      <p className="text-xs text-text-muted font-medium">{workout.duration} mins • {workout.caloriesBurned} kcal burned</p>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted font-medium">
                    {new Date(workout.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )) : (
                <p className="text-text-muted text-sm italic py-4">No recent workouts logged.</p>
              )}
            </div>
          </div>

          {/* Weekly Streak */}
          <div className="glass p-10 rounded-4xl md:col-span-2">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <Activity className="text-brand w-5 h-5" />
                <h3 className="text-xl font-semibold text-text-primary tracking-tight">Weekly Streak</h3>
              </div>
              <span className="text-3xl font-bold text-brand tracking-tighter">{streakCount} <span className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1">Days</span></span>
            </div>
            
            <div className="flex justify-between items-center px-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                    data.streak[i] 
                      ? 'bg-brand text-background brand-glow border-brand' 
                      : i === currentDayIndex
                        ? 'bg-brand/10 text-brand border-brand/50 brand-glow-subtle animate-pulse'
                        : 'bg-white/5 text-text-muted border-white/5'
                  }`}>
                    {data.streak[i] ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{day}</span>}
                  </div>
                  <span className="text-[10px] font-bold text-text-muted uppercase">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NutriBot Tip */}
          <div className="bg-brand/90 p-10 rounded-4xl relative overflow-hidden group h-full min-h-[300px]">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all">
              <MessageCircle className="w-24 h-24 text-white" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] uppercase tracking-widest text-background font-black opacity-60">Daily Status • {data.profile?.goal === 'lose' ? 'Weight Loss' : data.profile?.goal === 'gain' ? 'Muscle Gain' : 'Maintenance'}</span>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-xs text-background/80 font-medium uppercase">Daily Burn Goal</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-background">{data.burnedToday || 0}</span>
                      <span className="text-[10px] text-background/60 font-black ml-1">/ {data.profile?.dailyBurnGoal || 500} kcal</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-background rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(((data.burnedToday || 0) / (data.profile?.dailyBurnGoal || 500)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-background font-black opacity-60">NutriBot Tip</span>
                  <button onClick={() => setTip(tips[Math.floor(Math.random() * tips.length)])} className="text-background/60 hover:text-background transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-lg font-bold text-background leading-tight italic">
                  "{tip}"
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <MealLogModal 
        isOpen={isMealModalOpen} 
        onClose={() => setIsMealModalOpen(false)} 
        onRefresh={fetchDashboardData}
      />
    </motion.div>
  );
};

export default Dashboard;
