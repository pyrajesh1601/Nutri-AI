import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Target, 
  Wallet, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'sedentary',
    goal: 'maintain',
    dietaryPreference: 'mixed',
    weeklyBudget: ''
  });
  const [loading, setLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalStep, setFinalStep] = useState(0);
  const navigate = useNavigate();
  const { refreshProfileStatus, setUserProfile } = useAuth();

  const finalizingSteps = [
    "Analyzing your health metrics...",
    "Calculating personalized caloric needs...",
    "Optimizing macro distribution...",
    "Building your lifestyle roadmap...",
    "Ready for transformation!"
  ];

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/health/profile', {
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        height: Number(formData.height),
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        dietaryPreference: formData.dietaryPreference,
        weeklyBudget: Number(formData.weeklyBudget)
      });
      
      setUserProfile(data);
      
      // Start report generation in background
      api.post('/health/report/generate').catch(err => console.warn("Background generation error:", err));
      
      // Show processing screen
      setIsFinalizing(true);
      
      // Rotate through messages
      for (let i = 0; i < finalizingSteps.length; i++) {
        setFinalStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast.success('Onboarding complete!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding.');
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (isFinalizing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-brand/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 space-y-10 max-w-md w-full"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 border-4 border-brand/20 rounded-full animate-spin border-t-brand" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-brand animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">AI Transformation</h2>
            <AnimatePresence mode="wait">
              <motion.p 
                key={finalStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-brand font-medium text-lg min-h-[1.75rem]"
              >
                {finalizingSteps[finalStep]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((finalStep + 1) / finalizingSteps.length) * 100}%` }}
              className="h-full bg-brand shadow-[0_0_15px_rgba(168,224,99,0.5)]"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full z-10">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-text-muted font-black">Step {step} of 3</span>
              <h2 className="text-2xl font-bold text-text-primary mt-1">
                {step === 1 ? "Personal Profile" : step === 2 ? "Activity & Goals" : "Lifestyle & Budget"}
              </h2>
            </div>
            <span className="text-brand font-bold text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-brand shadow-[0_0_15px_rgba(168,224,99,0.5)]" 
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="glass p-10 rounded-4xl border border-white/10 space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-black ml-1">Your Age</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 25"
                      className="input-dark"
                      value={formData.age}
                      onChange={e => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-black ml-1">Gender</label>
                    <select
                      className="input-dark appearance-none bg-background/50"
                      value={formData.gender}
                      onChange={e => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-black ml-1">Weight (kg)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 70"
                      className="input-dark"
                      value={formData.weight}
                      onChange={e => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-text-muted font-black ml-1">Height (cm)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 175"
                      className="input-dark"
                      value={formData.height}
                      onChange={e => setFormData({...formData, height: e.target.value})}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                {/* Activity Level */}
                <div className="glass p-8 rounded-4xl border border-white/10">
                   <label className="text-xs uppercase tracking-widest text-text-muted font-black mb-4 block">Activity Level</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[
                       { v: 'sedentary', l: 'Sedentary', d: 'Little to no exercise' },
                       { v: 'lightly active', l: 'Lightly Active', d: '1-3 days/week' },
                       { v: 'moderately active', l: 'Moderate', d: '3-5 days/week' },
                       { v: 'very active', l: 'Very Active', d: '6-7 days/week' }
                     ].map((item) => (
                       <button
                        key={item.v}
                        type="button"
                        onClick={() => setFormData({...formData, activityLevel: item.v})}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          formData.activityLevel === item.v 
                            ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' 
                            : 'border-white/5 bg-white/2 hover:border-white/10'
                        }`}
                       >
                         <h4 className={`font-bold ${formData.activityLevel === item.v ? 'text-brand' : 'text-text-primary'}`}>{item.l}</h4>
                         <p className="text-xs text-text-muted mt-1">{item.d}</p>
                       </button>
                     ))}
                   </div>
                </div>

                {/* Goals */}
                <div className="glass p-8 rounded-4xl border border-white/10">
                   <label className="text-xs uppercase tracking-widest text-text-muted font-black mb-4 block">Primary Goal</label>
                   <div className="grid grid-cols-3 gap-4">
                     {['lose', 'maintain', 'gain'].map((g) => (
                       <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({...formData, goal: g})}
                        className={`p-4 rounded-2xl border-2 text-center transition-all capitalize font-bold ${
                          formData.goal === g 
                            ? 'border-brand bg-brand/5 text-brand shadow-lg shadow-brand/10' 
                            : 'border-white/5 bg-white/2 text-text-muted hover:border-white/10'
                        }`}
                       >
                         {g}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Diet */}
                <div className="glass p-8 rounded-4xl border border-white/10">
                   <label className="text-xs uppercase tracking-widest text-text-muted font-black mb-4 block">Dietary Preference</label>
                   <div className="grid grid-cols-3 gap-4">
                     {[
                       { v: 'pure_veg', i: '🥦' },
                       { v: 'mixed', i: '🍱' },
                       { v: 'non_veg', i: '🍗' }
                     ].map((d) => (
                       <button
                        key={d.v}
                        type="button"
                        onClick={() => setFormData({...formData, dietaryPreference: d.v})}
                        className={`p-4 rounded-2xl border-2 text-center transition-all capitalize font-bold text-2xl ${
                          formData.dietaryPreference === d.v 
                            ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' 
                            : 'border-white/5 bg-white/2 hover:border-white/10 opacity-50'
                        }`}
                       >
                         {d.i}
                       </button>
                     ))}
                   </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <div className="glass p-10 rounded-4xl border border-white/10">
                   <label className="text-xs uppercase tracking-widest text-text-muted font-black mb-4 block">Weekly Budget (INR)</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand font-bold text-xl">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="2500"
                        className="input-dark pl-10 text-xl font-bold"
                        value={formData.weeklyBudget}
                        onChange={e => setFormData({...formData, weeklyBudget: e.target.value})}
                      />
                   </div>
                   <p className="text-xs text-text-muted mt-4 font-medium italic">NutriBot will optimise your meal plans to stay within this limit.</p>
                </div>

                <div className="glass p-10 rounded-4xl border border-brand/20 bg-brand/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10"><Sparkles className="w-16 h-16 text-brand" /></div>
                  <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-brand" /> Ready to transform?
                  </h3>
                  <p className="text-text-secondary text-sm font-light leading-relaxed">
                    We've gathered everything we need to build your personalised roadmap. 
                    Click complete to generate your first AI health report.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="btn-ghost flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[160px] flex items-center justify-center gap-2"
            >
              {step === 3 ? (loading ? 'Processing...' : 'Complete') : 'Continue'} 
              {step < 3 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
