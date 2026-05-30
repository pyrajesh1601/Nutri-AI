import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { 
  Utensils, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Coffee, 
  Sun, 
  Moon, 
  Apple, 
  CalendarDays,
  Sparkles,
  Wallet,
  Zap,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Diet = () => {
  const [mealPlan, setMealPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  const [activeTab, setActiveTab] = useState('Monday');
  const [profile, setProfile] = useState(null);

  const fetchDietData = async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes, profileRes] = await Promise.allSettled([
        api.get('/diet/meal-plan'),
        api.get('/diet/log'),
        api.get('/health/profile')
      ]);

      if (todayRes.status === 'fulfilled' && todayRes.value.data) {
        setMealPlan(todayRes.value.data);
      }

      if (historyRes.status === 'fulfilled') {
        setHistory(historyRes.value.data);
      }

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data);
      }
    } catch (error) {
      toast.error("Failed to load diet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDietData();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/diet/meal-plan/generate');
      setMealPlan(data);
      toast.success("Weekly meal plan generated!");
      const historyRes = await api.get('/diet/log');
      setHistory(historyRes.data);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("AI quota reached, try again in a few minutes", { duration: 5000 });
      } else {
        toast.error(error.response?.data?.message || "Failed to generate meal plan");
      }
    } finally {
      setGenerating(false);
    }
  };

  const getMealIcon = (mealType) => {
    const type = mealType.toLowerCase();
    if (type.includes('breakfast')) return <Coffee className="w-5 h-5 text-orange-400" />;
    if (type.includes('lunch')) return <Sun className="w-5 h-5 text-yellow-400" />;
    if (type.includes('dinner')) return <Moon className="w-5 h-5 text-blue-400" />;
    return <Apple className="w-5 h-5 text-brand" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 pb-32">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
           <div className="h-8 w-64 bg-white/5 rounded-2xl" />
           <div className="h-40 w-full bg-white/5 rounded-4xl" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-4xl" />)}
           </div>
        </div>
      </div>
    );
  }

  const renderWeeklySummary = (plan, isHistory = false) => (
    <div className={`glass p-8 rounded-4xl border border-white/10 relative overflow-hidden group mb-8 ${!isHistory ? 'bg-brand/5 border-brand/20' : ''}`}>
      {!isHistory && <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Sparkles className="w-20 h-20 text-brand" /></div>}
      
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="w-5 h-5 text-brand" />
        <span className="text-xs uppercase tracking-widest text-text-muted font-black">Weekly Summary</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-text-muted font-black tracking-tighter mb-1">Weekly Budget</span>
          <span className="text-3xl font-bold text-text-primary tracking-tighter">₹{plan.weeklyBudget}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-text-muted font-black tracking-tighter mb-1">Est. Total Cost</span>
          <span className="text-3xl font-bold text-brand tracking-tighter">₹{plan.totalCost}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-text-muted font-black tracking-tighter mb-1">Total Calories</span>
          <span className="text-3xl font-bold text-text-primary tracking-tighter">{plan.totalCalories} <span className="text-sm font-bold text-text-muted uppercase">kcal</span></span>
        </div>
      </div>
    </div>
  );

  const renderMealPlan = (plan, isHistory = false) => {
    if (!plan || !plan.days || plan.days.length === 0) return null;

    const currentDayMeals = plan.days.find(d => d.day === activeTab)?.meals || [];

    return (
      <div className="space-y-8">
        {!isHistory && renderWeeklySummary(plan, false)}
        
        {/* Day Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide">
          {DAYS_OF_WEEK.map(day => {
            const hasData = plan.days.some(d => d.day === day);
            if (!hasData) return null;
            return (
              <button
                key={day}
                onClick={() => setActiveTab(day)}
                className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === day 
                    ? 'bg-brand text-background shadow-lg shadow-brand/20 scale-105' 
                    : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/5'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {currentDayMeals.length > 0 ? currentDayMeals.map((meal, index) => (
              <motion.div 
                key={`${activeTab}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass rounded-4xl p-8 border border-white/5 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:brand-glow transition-all">
                    {getMealIcon(meal.mealType)}
                  </div>
                  <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">{meal.mealType}</span>
                </div>
                
                <h3 className="text-xl font-bold text-text-primary mb-4 leading-tight group-hover:text-brand transition-colors">{meal.name}</h3>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-text-muted uppercase tracking-tighter">Energy</span>
                     <span className="text-lg font-bold text-text-primary tracking-tighter">{meal.calories} <span className="text-[10px] text-text-muted">kcal</span></span>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-2">
                     {[
                       { l: 'P', v: meal.protein },
                       { l: 'C', v: meal.carbs },
                       { l: 'F', v: meal.fat }
                     ].map(m => (
                       <div key={m.l} className="bg-white/2 p-2 rounded-xl border border-white/5 text-center">
                         <span className="text-[10px] font-black text-text-muted block mb-0.5">{m.l}</span>
                         <span className="text-xs font-bold text-text-secondary">{m.v}g</span>
                       </div>
                     ))}
                   </div>

                   <div className="flex justify-between items-center pt-2">
                     <span className="text-xs font-bold text-text-muted uppercase tracking-tighter">Est. Cost</span>
                     <span className="text-lg font-bold text-brand tracking-tighter">₹{meal.estimatedCost}</span>
                   </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-12 text-center glass rounded-4xl border border-white/5">
                <p className="text-text-muted italic">No meals planned for {activeTab}.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background p-8 pt-24 pb-32"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 rounded-2xl">
              <Utensils className="w-8 h-8 text-brand" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-text-primary tracking-tight">Weekly Diet Plan</h1>
              <p className="text-text-secondary mt-1 font-light">Your AI-curated menu based on your profile.</p>
            </div>
          </div>

          {profile && (
            <div className="glass px-6 py-3 rounded-full flex items-center gap-4 border border-white/5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                profile.dietaryPreference === 'pure_veg' ? 'bg-green-500/20 text-green-400' :
                profile.dietaryPreference === 'mixed' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {profile.dietaryPreference === 'pure_veg' ? '🥦' :
                 profile.dietaryPreference === 'mixed' ? '🍱' : '🍗'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-text-muted tracking-widest block leading-none">Preference</span>
                <span className="text-sm font-bold text-text-primary capitalize">{profile.dietaryPreference.replace('_', ' ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="bg-brand/5 border border-brand/10 p-4 rounded-2xl flex items-center gap-3">
          <Zap className="w-4 h-4 text-brand" />
          <p className="text-xs font-medium text-text-secondary italic">
            "Your meal plan is customised for your specific dietary preference and weekly budget."
          </p>
        </div>

        {/* Current Plan */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.3em] text-text-muted font-black mb-6">Active Strategy</h2>
          
          {generating ? (
            <div className="glass rounded-4xl p-20 border border-brand/20 flex flex-col items-center justify-center space-y-6 text-center">
              <RefreshCw className="w-16 h-16 text-brand animate-spin" />
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Crafting Excellence</h3>
                <p className="text-text-secondary mt-2 font-light max-w-sm">NutriBot is balancing 21 meals across your week to perfect your macros.</p>
              </div>
            </div>
          ) : mealPlan ? (
            renderMealPlan(mealPlan)
          ) : (
            <div className="glass rounded-4xl p-20 border border-white/5 flex flex-col items-center justify-center text-center">
               <AlertCircle className="w-20 h-20 text-text-muted opacity-20 mb-6" />
               <h3 className="text-2xl font-bold text-text-primary mb-3">No Active Plan</h3>
               <p className="text-text-secondary mb-10 max-w-md font-light leading-relaxed">
                 You haven't generated a meal plan for this week. Let AI create a perfectly balanced 7-day menu tailored to your goals.
               </p>
               <button
                 onClick={handleGenerate}
                 className="btn-primary shadow-lg shadow-brand/20 px-10"
               >
                 Generate Weekly Plan
               </button>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 1 && (
          <div className="pt-10 border-t border-white/5">
            <h2 className="text-xs uppercase tracking-[0.3em] text-text-muted font-black mb-8">Past Iterations</h2>
            <div className="grid grid-cols-1 gap-4">
              {history.map(log => {
                const isExpanded = expandedLog === log._id;
                const isCurrent = mealPlan && log._id === mealPlan._id;
                if (isCurrent) return null;

                return (
                  <div key={log._id} className="glass rounded-3xl border border-white/5 overflow-hidden">
                    <button 
                      onClick={() => setExpandedLog(isExpanded ? null : log._id)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/2 transition-all"
                    >
                      <div className="flex flex-wrap items-center gap-8">
                         <div className="flex flex-col items-start">
                            <span className="text-[10px] uppercase font-black text-text-muted tracking-tighter">Generated</span>
                            <span className="font-bold text-text-primary">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                         </div>
                         <div className="flex flex-col items-start">
                            <span className="text-[10px] uppercase font-black text-text-muted tracking-tighter">Metrics</span>
                            <span className="text-sm font-semibold text-text-secondary">{log.totalCalories} kcal • ₹{log.totalCost}</span>
                         </div>
                      </div>
                      <div className={`p-2 rounded-xl glass border-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-8 pb-8 pt-4 border-t border-white/5 bg-white/2">
                        {renderMealPlan(log, true)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default Diet;
