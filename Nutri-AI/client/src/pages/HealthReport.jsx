import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FileText, RefreshCw, HeartPulse, Info, Zap, Sparkles, Activity, Target, AlertTriangle, Heart, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const HealthReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReport = async () => {
    try {
      const { data } = await api.get('/health/report');
      setReport(data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch health report");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/health/report/generate');
      setReport(data);
      toast.success("Health report generated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Generation failed. Quota might be exceeded.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 pb-32 flex flex-col items-center justify-center">
        <Activity className="w-12 h-12 text-brand animate-pulse" />
        <p className="text-text-muted mt-4 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Database</p>
      </div>
    );
  }

  if (!report && !generating) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 pb-32 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass p-10 rounded-4xl border border-white/10 text-center"
        >
          <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto mb-8 border-white/5">
            <FileText className="w-10 h-10 text-text-muted opacity-40" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-3">No Blueprint Found</h2>
          <p className="text-text-secondary mb-10 font-light leading-relaxed">
            You haven't generated a comprehensive health analysis yet. Let Nutri-AI analyze 
            your profile metrics to build your roadmap.
          </p>
          <button
            onClick={handleGenerate}
            className="btn-primary w-full shadow-lg shadow-brand/20"
          >
            Generate Analysis
          </button>
        </motion.div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 pb-32 flex items-center justify-center">
        <div className="max-w-md w-full glass p-10 rounded-4xl border border-brand/20 text-center space-y-8">
          <div className="relative inline-block">
            <RefreshCw className="w-16 h-16 text-brand mx-auto animate-spin" />
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-brand animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Analysing Neural Data</h2>
            <p className="text-text-secondary mt-3 font-light leading-relaxed">
              NutriBot is crunching the biological numbers to build your personalised transformation plan...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const p = report.macros?.protein || 30;
  const c = report.macros?.carbs || 40;
  const f = report.macros?.fat || 30;

  const getBmiStyle = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    if (bmi < 25) return { label: 'Healthy', color: 'text-brand', bg: 'bg-brand/10' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    return { label: 'Obese', color: 'text-red-400', bg: 'bg-red-400/10' };
  };

  const bmiStyle = getBmiStyle(report.bmiScore);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background p-8 pt-24 pb-32"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand/10 rounded-xl">
                <HeartPulse className="w-6 h-6 text-brand" />
              </div>
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">Health Analysis</span>
            </div>
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">AI Health Blueprint</h1>
            <p className="text-text-secondary mt-2 font-light">Calculated on {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-ghost flex items-center gap-2 group px-6 py-2.5"
          >
            <RefreshCw className={`w-4 h-4 transition-transform group-hover:rotate-180 duration-500 ${generating ? 'animate-spin' : ''}`} /> 
            <span className="text-[10px] uppercase font-black tracking-widest">Regenerate Analysis</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* BMI Card */}
          <div className="glass p-10 rounded-4xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <span className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-8 block">Body Mass Index (BMI)</span>
            
            <div className="flex items-end gap-6 mb-8">
              <span className="text-7xl font-bold text-text-primary tracking-tighter">{report.bmiScore}</span>
              <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 border border-white/5 ${bmiStyle.color} ${bmiStyle.bg}`}>
                {report.bmiCategory || bmiStyle.label}
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/2 rounded-2xl border border-white/5">
              <Info className="w-4 h-4 text-brand shrink-0" /> 
              <p className="text-xs text-text-secondary font-medium italic">Analyzed based on your latest biometric profile measurements.</p>
            </div>
          </div>

          {/* Calories Card */}
          <div className="glass p-10 rounded-4xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <span className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-8 block">Metabolic Targets</span>
            
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-7xl font-bold text-brand tracking-tighter">{report.dailyCalories}</span>
              <span className="text-xl font-black text-text-muted uppercase tracking-widest">kcal</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest px-1">
                <span className="text-blue-400">Protein {p}%</span>
                <span className="text-yellow-400">Carbs {c}%</span>
                <span className="text-orange-500">Fat {f}%</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden flex bg-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 1 }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${c}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${f}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Heart Health & Safety Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Heart Health */}
          <div className="glass p-10 rounded-4xl border border-brand/20 bg-brand/5 relative overflow-hidden group">
            <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Heart className="w-48 h-48" />
            </div>
            <div className="flex items-center gap-3 mb-8">
              <Heart className="w-5 h-5 text-brand" />
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Cardiovascular Blueprint</h3>
            </div>
            <div className="space-y-6 relative z-10">
              {report.heartHealthInsights?.map((tip, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shadow-[0_0_8px_rgba(168,224,99,0.8)]" />
                  <p className="text-sm text-text-secondary font-light leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Warnings */}
          <div className="glass p-10 rounded-4xl border border-red-500/20 bg-red-500/5 relative overflow-hidden group">
            <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert className="w-48 h-48" />
            </div>
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Training Risk Alerts</h3>
            </div>
            <div className="space-y-6 relative z-10">
              {report.riskWarnings?.map((warning, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/10">
                  <p className="text-xs text-red-200 font-medium leading-relaxed">{warning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass p-10 rounded-4xl border border-white/10">
           <div className="flex items-center gap-3 mb-10">
             <Target className="w-5 h-5 text-brand" />
             <h3 className="text-2xl font-bold text-text-primary tracking-tight">Holistic Wellness Roadmap</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {(report.wellnessRecommendations || report.recommendations)?.map((rec, index) => (
               <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 p-6 rounded-3xl bg-white/2 border border-white/5 hover:border-brand/20 transition-all group"
               >
                 <div className="shrink-0">
                   <div className="w-10 h-10 rounded-2xl glass border-white/5 flex items-center justify-center text-brand font-black text-sm group-hover:brand-glow transition-all">
                     {index + 1}
                   </div>
                 </div>
                 <p className="text-text-secondary font-light leading-relaxed text-sm md:text-base group-hover:text-text-primary transition-colors">{rec}</p>
               </motion.div>
             ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthReport;
