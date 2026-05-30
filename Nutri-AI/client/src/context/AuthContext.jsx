import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        setUser(null);
        setUserProfile(null);
        return;
      }

      // If we already have a user (from login) and userProfile is null, 
      // we can still show the app but we'll fetch details in background.
      // But for a clean mount, we should load.
      
      try {
        const [userRes, profileRes] = await Promise.allSettled([
          api.get('/auth/me'),
          api.get('/health/profile')
        ]);

        if (userRes.status === 'fulfilled') {
          setUser(userRes.value.data);
        } else if (!user) {
          // If fetch fails and we don't even have a cached user, it's a bad token
          throw new Error('User fetch failed');
        }

        if (profileRes.status === 'fulfilled') {
          setUserProfile(profileRes.value.data);
        } else {
          setUserProfile(false);
        }
      } catch (error) {
        console.error('Auth sync failed:', error);
        setToken(null);
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    
    try {
      const { data } = await api.get('/health/profile');
      setUserProfile(data);
    } catch (error) {
      setUserProfile(false);
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setUserProfile(null);
    window.location.href = '/';
  };

  const refreshProfileStatus = async () => {
    try {
      const { data } = await api.get('/health/profile');
      setUserProfile(data);
      return data;
    } catch (error) {
      setUserProfile(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isLoading, 
      userProfile, 
      setUserProfile,
      refreshProfileStatus 
    }}>
      {isLoading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-brand/20 rounded-full animate-spin border-t-brand" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
