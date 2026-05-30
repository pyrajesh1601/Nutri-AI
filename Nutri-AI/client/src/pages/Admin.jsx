import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  FileText, 
  Activity, 
  MessageSquare, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  Zap,
  LayoutDashboard,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const Admin = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userPage, setUserPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const [searchUser, setSearchUser] = useState('');
  const itemsPerPage = 10;

  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deletePostId, setDeletePostId] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, postsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/posts')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || usersRes.data);
      setPosts(postsRes.data.posts || postsRes.data);
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/users/${deleteUserId}`);
      setUsers(users.filter(u => u._id !== deleteUserId));
      toast.success("User and all associated data deleted");
      setStats(prev => ({ ...prev, totalUsers: (prev.totalUsers || 0) - 1 }));
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/admin/posts/${deletePostId}`);
      setPosts(posts.filter(p => p._id !== deletePostId));
      toast.success("Post deleted by admin");
      setStats(prev => ({ ...prev, totalCommunityPosts: (prev.totalCommunityPosts || 0) - 1 }));
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );
  
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  const paginatedPosts = posts.slice((postPage - 1) * itemsPerPage, postPage * itemsPerPage);
  const totalPostPages = Math.ceil(posts.length / itemsPerPage) || 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 pb-32 flex flex-col items-center justify-center">
        <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
        <p className="text-text-muted mt-4 font-black uppercase tracking-[0.3em] text-[10px]">Authorising Session</p>
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
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">Administration</span>
            </div>
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">System Controls</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <p className="text-text-secondary font-light text-sm">Global oversight active. <span className="text-brand font-bold">Override Mode Enabled.</span></p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Total Users', val: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400' },
            { label: 'Community Posts', val: stats?.totalCommunityPosts || stats?.totalPosts || 0, icon: FileText, color: 'text-purple-400' },
            { label: 'Workout Logs', val: stats?.totalWorkoutLogs || 0, icon: Activity, color: 'text-orange-400' },
            { label: 'AI Messages', val: stats?.totalAIChatMessages || stats?.totalChatMessages || 0, icon: MessageSquare, color: 'text-brand' }
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-4xl border border-white/5 group hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 glass rounded-2xl border-white/5 ${stat.color} group-hover:brand-glow transition-all`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-text-primary tracking-tighter">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Users Management */}
        <div className="glass rounded-4xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/2">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-text-muted" />
              <h2 className="text-xl font-bold text-text-primary tracking-tight">User Registry</h2>
            </div>
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
              <input
                type="text"
                placeholder="Search user identity..."
                className="input-dark pl-12 h-11 text-xs"
                value={searchUser}
                onChange={(e) => { setSearchUser(e.target.value); setUserPage(1); }}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/2 text-text-muted text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                  <th className="p-6">Identity</th>
                  <th className="p-6">Credential</th>
                  <th className="p-6">Authorisation</th>
                  <th className="p-6">Registration</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-text-muted italic">No records matching search criteria.</td></tr>
                ) : paginatedUsers.map(u => (
                  <tr key={u._id} className="hover:bg-white/2 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl glass border-white/10 flex items-center justify-center text-[10px] font-black text-brand uppercase">
                          {u.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-text-primary">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-sm text-text-secondary font-light">{u.email}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-brand/10 text-brand'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-6 text-sm text-text-muted font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-6 text-right">
                      {String(u._id) !== String(currentUser?._id) && (
                        <button 
                          onClick={() => setDeleteUserId(u._id)} 
                          className="flex items-center gap-2 ml-auto px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-xl active:scale-95 group"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Delete Identity</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-white/2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Shard {userPage} of {totalUserPages}</span>
            <div className="flex gap-3">
              <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)} className="p-2 rounded-xl glass border-white/5 text-text-muted hover:text-brand disabled:opacity-30 transition-all active:scale-90">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button disabled={userPage === totalUserPages} onClick={() => setUserPage(p => p + 1)} className="p-2 rounded-xl glass border-white/5 text-text-muted hover:text-brand disabled:opacity-30 transition-all active:scale-90">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Posts Management */}
        <div className="glass rounded-4xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center gap-3 bg-white/2">
            <FileText className="w-5 h-5 text-text-muted" />
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Content Moderation</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/2 text-text-muted text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                  <th className="p-6">Author</th>
                  <th className="p-6">Content Extract</th>
                  <th className="p-6">Engagement</th>
                  <th className="p-6">Timeline</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedPosts.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-text-muted italic">No content discovered.</td></tr>
                ) : paginatedPosts.map(p => (
                  <tr key={p._id} className="hover:bg-white/2 transition-colors group">
                    <td className="p-6 text-sm font-bold text-text-primary">{p.userId?.name || 'Unknown'}</td>
                    <td className="p-6 text-sm text-text-secondary font-light max-w-xs truncate italic">"{p.content}"</td>
                    <td className="p-6">
                       <div className="flex items-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-tighter">
                         <span className="flex items-center gap-1.5"><Heart className="w-3 h-3" /> {p.likes?.length || 0}</span>
                         <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> {p.comments?.length || 0}</span>
                       </div>
                    </td>
                    <td className="p-6 text-sm text-text-muted font-medium">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-6 text-right">
                      <button onClick={() => setDeletePostId(p._id)} className="p-2 glass border-white/10 text-text-muted hover:text-red-400 hover:border-red-400/30 transition-all rounded-xl active:scale-90">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-white/2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Shard {postPage} of {totalPostPages}</span>
            <div className="flex gap-3">
              <button disabled={postPage === 1} onClick={() => setPostPage(p => p - 1)} className="p-2 rounded-xl glass border-white/5 text-text-muted hover:text-brand disabled:opacity-30 transition-all active:scale-90">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button disabled={postPage === totalPostPages} onClick={() => setPostPage(p => p + 1)} className="p-2 rounded-xl glass border-white/5 text-text-muted hover:text-brand disabled:opacity-30 transition-all active:scale-90">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Erasure Request"
        message="Permanently delete this identity and all associated neural patterns? This action is irreversible."
        confirmText="Confirm Erasure"
        isDanger={true}
      />

      <ConfirmModal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={handleDeletePost}
        title="Content Removal"
        message="Permanently purge this content from the community neural network?"
        confirmText="Confirm Purge"
        isDanger={true}
      />

    </motion.div>
  );
};

export default Admin;
