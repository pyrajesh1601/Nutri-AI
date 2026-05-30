import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  Utensils,
  MessageCircle,
  Users,
  Bell,
  User,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications');
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        // ignore
      }
    };
    if (user) fetchUnread();
  }, [user, isNotifPanelOpen]);

  if (['/login', '/register', '/'].includes(location.pathname) && !user) return null;
  if (['/login', '/register'].includes(location.pathname)) return null;
  if (location.pathname === '/onboarding') return null;

  const navLinks = [
    { name: 'Home', path: '/dashboard', icon: Home },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: LayoutDashboard }] : []),
    { name: 'Workouts', path: '/exercises', icon: Dumbbell },
    { name: 'Diet', path: '/diet', icon: Utensils },
    { name: 'Chat', path: '/chat', icon: MessageCircle },
    { name: 'Social', path: '/community', icon: Users },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between pointer-events-none">
        <Link to="/dashboard" className="pointer-events-auto flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter text-text-primary">
            nutri<span className="text-brand">.ai</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setIsNotifPanelOpen(true)}
            className="glass p-2.5 rounded-2xl relative text-text-secondary hover:text-brand transition-all active:scale-95"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full brand-glow" />
            )}
          </button>

          <Link
            to="/profile"
            className="glass p-1 rounded-2xl flex items-center gap-2 pr-3 hover:border-white/10 transition-all active:scale-95"
          >
            {user?.avatar ? (
              <img src={user.avatar} className="w-8 h-8 rounded-xl object-cover" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center text-brand font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-semibold text-text-secondary hidden sm:block uppercase tracking-wider">
              {user?.name?.split(' ')[0]}
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-8 left-0 right-0 z-40 px-6 flex justify-center pointer-events-none">
        <nav className="glass rounded-full px-4 py-2 flex items-center gap-1 pointer-events-auto shadow-2xl border border-white/10">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.name}
                to={link.path}
                className="relative group px-4 py-3 flex items-center gap-2 transition-all duration-300"
              >
                <div className="relative flex flex-col items-center">
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-brand scale-110' : 'text-text-muted group-hover:text-text-secondary'
                      }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-2 w-1 h-1 bg-brand rounded-full brand-glow" />
                  )}
                </div>
                <span className={`text-xs font-semibold hidden lg:block ${isActive ? 'text-text-primary' : 'text-text-muted'
                  }`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
    </>
  );
};

export default Navbar;
