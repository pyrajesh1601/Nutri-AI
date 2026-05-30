import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Image as ImageIcon, 
  Send, 
  Trash2, 
  User, 
  MoreHorizontal,
  Plus,
  Zap,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/community/posts');
      setPosts(data.posts || data);
    } catch (error) {
      toast.error("Failed to load community feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !mediaFile) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (newPostContent) formData.append('content', newPostContent);
      if (mediaFile) formData.append('media', mediaFile);

      await api.post('/community/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Post shared with community!");
      setNewPostContent('');
      setMediaFile(null);
      setMediaPreview('');
      fetchPosts(); 
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/like`);
      setPosts(posts.map(p => {
        if (p._id === postId) {
          const isLiked = p.likes.includes(user._id);
          return {
            ...p,
            likes: isLiked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
          };
        }
        return p;
      }));
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await api.post(`/community/posts/${postId}/comment`, { text: commentText });
      setCommentText('');
      fetchPosts(); 
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const storyUsers = posts.reduce((acc, post) => {
    if (!acc.find(u => u._id === post.userId?._id)) {
      acc.push(post.userId);
    }
    return acc;
  }, []).filter(Boolean).slice(0, 10);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background flex justify-center pt-24 pb-32 px-6"
    >
      <div className="w-full max-w-xl space-y-10">
        
        {/* Stories Section */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex flex-col items-center shrink-0 cursor-pointer group">
            <div className="w-16 h-16 rounded-3xl glass border-brand/40 p-1 mb-2 relative group-hover:brand-glow transition-all">
              <div className="w-full h-full rounded-2xl bg-white/5 flex items-center justify-center text-xl font-bold text-text-muted">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-brand text-background rounded-xl w-6 h-6 flex items-center justify-center text-xs border-4 border-background">
                <Plus className="w-3 h-3 stroke-[4]" />
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-text-muted tracking-tighter">Your Story</span>
          </div>
          {storyUsers.map(storyUser => (
            <div key={storyUser._id} className="flex flex-col items-center shrink-0 cursor-pointer group">
              <div className="w-16 h-16 rounded-3xl glass border-white/10 p-1 mb-2 group-hover:border-brand transition-all">
                {storyUser.avatar ? (
                  <img src={storyUser.avatar} className="w-full h-full rounded-2xl object-cover" alt={storyUser.name} />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-brand/10 flex items-center justify-center text-lg font-bold text-brand">
                    {storyUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-black uppercase text-text-muted tracking-tighter truncate w-16 text-center">{storyUser.name?.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Create Post Box */}
        <div className="glass rounded-4xl p-6 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 transition-transform group-focus-within:rotate-45 duration-700"><Sparkles className="w-12 h-12 text-brand" /></div>
          <form onSubmit={handleCreatePost} className="relative z-10">
            <div className="flex gap-4">
              <div className="shrink-0 pt-1">
                <div className="w-10 h-10 rounded-2xl glass border-white/10 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                     <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-sm font-black text-brand">{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <textarea
                  className="w-full bg-transparent border-0 focus:ring-0 resize-none outline-none text-base text-text-primary placeholder-text-muted font-light leading-relaxed"
                  placeholder="What's your progress today?"
                  rows="2"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  disabled={submitting}
                />
                
                {mediaPreview && (
                  <div className="relative inline-block rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src={mediaPreview} alt="Preview" className="max-h-80 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setMediaFile(null); setMediaPreview(''); }}
                      className="absolute top-3 right-3 glass p-2 rounded-xl text-red-400 border-white/10 hover:bg-red-400/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <label className="cursor-pointer flex items-center gap-2 text-text-muted hover:text-brand transition-all group">
                    <div className="p-2 glass border-white/10 rounded-xl group-hover:border-brand/30">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest">Media</span>
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} disabled={submitting} />
                  </label>
                  
                  <button
                    type="submit"
                    disabled={submitting || (!newPostContent.trim() && !mediaFile)}
                    className="btn-primary py-2 px-6 shadow-lg shadow-brand/10"
                  >
                    {submitting ? 'Sharing...' : 'Share Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Main Feed */}
        <div className="space-y-12">
          {loading ? (
            <div className="space-y-12">
              {[1,2].map(i => (
                <div key={i} className="glass rounded-4xl h-96 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 glass rounded-4xl border border-white/5">
               <Zap className="mx-auto h-12 w-12 text-text-muted opacity-20 mb-4" />
               <h3 className="text-xl font-bold text-text-primary">Silence in the feed</h3>
               <p className="mt-2 text-sm text-text-secondary font-light">Be the one to spark inspiration today.</p>
            </div>
          ) : (
            posts.map((post, i) => {
              const isLiked = post.likes.includes(user._id);
              const isOwner = post.userId?._id === user._id;

              return (
                <motion.div 
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass rounded-4xl overflow-hidden border border-white/10 shadow-2xl group"
                >
                  {/* Post Header */}
                  <div className="p-6 flex justify-between items-center bg-white/2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl glass border-white/10 flex items-center justify-center overflow-hidden">
                        {post.userId?.avatar ? (
                          <img src={post.userId.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-xs font-black text-brand">{post.userId?.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary tracking-tight">{post.userId?.name}</h3>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {isOwner ? (
                      <button onClick={() => handleDeletePost(post._id)} className="p-2 glass border-white/10 text-text-muted hover:text-red-400 transition-all rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : <MoreHorizontal className="w-4 h-4 text-text-muted" />}
                  </div>
                  
                  {/* Post Content */}
                  <div className="px-8 py-6">
                    <p className="text-text-primary font-light leading-relaxed text-lg">{post.content}</p>
                  </div>

                  {/* Post Media */}
                  {post.mediaUrls?.length > 0 ? (
                    <div className="px-6 pb-6">
                      <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                        {post.mediaType === 'video' ? (
                           <video src={post.mediaUrls[0]} controls className="w-full max-h-[500px] object-contain" />
                        ) : (
                           <img src={post.mediaUrls[0]} alt="" className="w-full max-h-[600px] object-cover" />
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Post Actions */}
                  <div className="p-8 border-t border-white/5 bg-white/1">
                    <div className="flex items-center gap-8 mb-6">
                      <button onClick={() => handleLike(post._id)} className="flex items-center gap-2 group/like">
                        <div className={`p-2 rounded-xl glass border-white/10 group-hover/like:border-red-400/30 transition-all ${isLiked ? 'text-red-500 brand-glow border-red-500/20' : 'text-text-secondary'}`}>
                          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-xs font-black text-text-muted uppercase tracking-widest">{post.likes?.length || 0}</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)} 
                        className="flex items-center gap-2 group/comment"
                      >
                        <div className="p-2 rounded-xl glass border-white/10 group-hover/comment:border-brand/30 transition-all text-text-secondary">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-text-muted uppercase tracking-widest">{post.comments?.length || 0}</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {activeCommentPost === post._id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 pt-4 border-t border-white/5"
                        >
                          {post.comments?.length > 0 && (
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                              {post.comments.map((comment, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-xl glass border-white/5 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black text-brand">{comment.userId?.name?.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div className="glass p-3 rounded-2xl rounded-tl-none border-white/5 flex-1">
                                    <span className="text-[10px] font-black text-text-muted block mb-1 uppercase tracking-tighter">{comment.userId?.name}</span>
                                    <p className="text-xs text-text-primary font-light">{comment.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex items-center gap-3">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              className="input-dark py-2 px-4 text-xs h-10"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button
                              type="submit"
                              disabled={!commentText.trim()}
                              className="btn-primary w-10 h-10 p-0 flex items-center justify-center"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Community;
