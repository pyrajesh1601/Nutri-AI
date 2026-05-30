import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      await login(data.token, data);
      toast.success('Account created!');
      navigate('/onboarding');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Ambient Circle */}
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-bold tracking-tighter text-text-primary">
            nutri<span className="text-brand">.ai</span>
          </Link>
        </div>

        <div className="glass p-10 rounded-4xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <h2 className="text-2xl font-semibold text-text-primary mb-2">Create Account</h2>
          <p className="text-text-secondary font-light mb-8">Join the community and start your journey.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-2 block ml-1">
                Full Name
              </label>
              <input
                type="text"
                required
                className="input-dark"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-2 block ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="input-dark"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-2 block ml-1">
                Password
              </label>
              <input
                type="password"
                required
                className="input-dark"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 flex justify-center items-center gap-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-text-secondary font-light">
              Already have an account?{' '}
              <Link to="/login" className="text-brand hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
