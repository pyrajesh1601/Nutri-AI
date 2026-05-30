import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dna, Utensils, Dumbbell, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-text-primary">
            nutri<span className="text-brand">.ai</span>
          </span>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium text-text-secondary hover:text-brand transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-text-primary mb-2">
            Your Health,
          </h1>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-brand mb-8">
            Reimagined.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            AI-powered nutrition and fitness guidance built around your life.
            Science-backed plans tailored to your unique biology and goals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <Link to="/dashboard" className="btn-primary w-full sm:w-auto text-center flex items-center justify-center gap-2">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn-primary w-full sm:w-auto text-center">
                Start Free
              </Link>
            )}
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost w-full sm:w-auto"
            >
              See how it works
            </button>
          </div>

          <p className="text-sm text-text-muted">
            Joined by <span className="text-text-secondary font-medium">10,000+ people</span> on their health journey
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Dna className="w-6 h-6 text-brand" />,
              title: "Smart Analysis",
              desc: "Deep health profiling with BMI and calorie tracking."
            },
            {
              icon: <Utensils className="w-6 h-6 text-brand" />,
              title: "Meal Plans",
              desc: "AI-generated recipes fitting your budget and taste."
            },
            {
              icon: <Dumbbell className="w-6 h-6 text-brand" />,
              title: "Workout Guidance",
              desc: "Personalised exercise logs and progress tracking."
            },
            {
              icon: <MessageSquare className="w-6 h-6 text-brand" />,
              title: "AI Coach",
              desc: "NutriBot is available 24/7 for instant health advice."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass p-8 rounded-3xl glass-hover group"
            >
              <div className="mb-6 p-3 bg-white/5 rounded-2xl w-fit group-hover:brand-glow transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-text-secondary font-light leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
