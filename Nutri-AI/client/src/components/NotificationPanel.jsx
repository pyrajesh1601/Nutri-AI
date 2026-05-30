import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { X, Bell, CheckCircle, Activity, Utensils, MessageCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'workout': return <Activity className="w-5 h-5 text-blue-400" />;
      case 'diet': return <Utensils className="w-5 h-5 text-yellow-400" />;
      case 'community': return <MessageCircle className="w-5 h-5 text-purple-400" />;
      default: return <Zap className="w-5 h-5 text-brand" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[50]" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 max-w-sm w-full glass z-[60] border-l border-white/10 flex flex-col shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                  <Bell className="w-5 h-5 text-brand" /> Notifications
                </h2>
                <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mt-1">System Alerts</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 glass border-white/5 text-text-muted hover:text-text-primary transition-all rounded-xl active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                   <div className="w-16 h-16 glass border-white/5 rounded-3xl flex items-center justify-center mb-6 opacity-20">
                    <Bell className="h-8 w-8 text-text-muted" />
                   </div>
                   <h3 className="text-lg font-bold text-text-primary">All caught up</h3>
                   <p className="text-text-secondary text-sm font-light mt-1">No new alerts to display.</p>
                </div>
              ) : (
                notifications.map((notif, i) => (
                  <motion.div 
                    key={notif._id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                    className={`p-5 rounded-3xl border transition-all relative group ${
                      notif.isRead 
                        ? 'bg-white/2 border-white/5 opacity-50' 
                        : 'glass border-brand/20 cursor-pointer hover:border-brand/40 bg-brand/5 shadow-lg shadow-brand/5'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <div className="shrink-0 p-2 glass border-white/5 rounded-xl group-hover:brand-glow transition-all">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-text-secondary' : 'text-text-primary font-semibold'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-2">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}</p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-brand brand-glow shrink-0 mt-2"></div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
