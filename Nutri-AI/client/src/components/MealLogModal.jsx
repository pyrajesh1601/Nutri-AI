import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, Plus, Zap } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MealLogModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'snack'
  });
  const [loading, setLoading] = useState(false);
  const [isAiMode, setIsAiMode] = useState(true);
  const [description, setDescription] = useState('');
  const [parsing, setParsing] = useState(false);

  const handleAiParse = async () => {
    if (!description.trim()) return toast.error('Please describe what you ate');
    setParsing(true);
    try {
      const { data } = await api.post('/diet/log/parse', { description });
      setFormData({
        ...formData,
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat
      });
      setIsAiMode(false); // Switch to manual to let them review
      toast.success('AI Estimated successfully! Review and confirm.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze meal');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/diet/log/daily', {
        ...formData,
        calories: Number(formData.calories),
        protein: Number(formData.protein || 0),
        carbs: Number(formData.carbs || 0),
        fat: Number(formData.fat || 0),
      });
      toast.success('Meal logged successfully!');
      onRefresh();
      onClose();
      setFormData({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'snack' });
    } catch (error) {
      toast.error('Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg glass p-8 rounded-4xl border border-white/10 relative z-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand/20 rounded-2xl">
                  <Utensils className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary tracking-tight">Log Today's Meal</h2>
                  <p className="text-xs uppercase tracking-widest text-text-muted font-black mt-1">Nutrition Input</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 glass border-white/5 text-text-muted hover:text-text-primary transition-all rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={() => setIsAiMode(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${isAiMode ? 'bg-brand/20 border-brand text-brand' : 'bg-white/5 border-white/5 text-text-muted'}`}
              >
                AI Smart Log
              </button>
              <button 
                onClick={() => setIsAiMode(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${!isAiMode ? 'bg-brand/20 border-brand text-brand' : 'bg-white/5 border-white/5 text-text-muted'}`}
              >
                Manual Entry
              </button>
            </div>

            {isAiMode ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-text-muted font-black ml-1">What did you eat?</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 2 parathas with a bowl of curd and one apple"
                    className="input-dark resize-none h-32"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  <p className="text-[9px] text-text-muted italic px-1">Describe quantities for better accuracy.</p>
                </div>
                <button
                  onClick={handleAiParse}
                  disabled={parsing}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 group shadow-xl shadow-brand/10"
                >
                  {parsing ? 'Analyzing...' : (
                    <>
                      <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Analyze with Nutri-AI</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-text-muted font-black ml-1">Meal Name</label>
                     <input
                       type="text"
                       required
                       placeholder="e.g. Grilled Chicken Salad"
                       className="input-dark"
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-text-muted font-black ml-1">Meal Type</label>
                     <select
                       className="input-dark appearance-none bg-background/50"
                       value={formData.mealType}
                       onChange={e => setFormData({...formData, mealType: e.target.value})}
                     >
                       <option value="breakfast">Breakfast</option>
                       <option value="lunch">Lunch</option>
                       <option value="dinner">Dinner</option>
                       <option value="snack">Snack</option>
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-text-muted font-black ml-1">Calories (kcal)</label>
                     <input
                       type="number"
                       required
                       placeholder="350"
                       className="input-dark"
                       value={formData.calories}
                       onChange={e => setFormData({...formData, calories: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-text-muted font-black ml-1">Protein (g)</label>
                     <input
                       type="number"
                       placeholder="25"
                       className="input-dark"
                       value={formData.protein}
                       onChange={e => setFormData({...formData, protein: e.target.value})}
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-text-muted font-black ml-1">Carbs (g)</label>
                     <input
                       type="number"
                       placeholder="15"
                       className="input-dark"
                       value={formData.carbs}
                       onChange={e => setFormData({...formData, carbs: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest text-text-muted font-black ml-1">Fat (g)</label>
                     <input
                       type="number"
                       placeholder="8"
                       className="input-dark"
                       value={formData.fat}
                       onChange={e => setFormData({...formData, fat: e.target.value})}
                     />
                   </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
              >
                {loading ? 'Logging...' : (
                  <>
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Confirm & Add Meal</span>
                  </>
                )}
              </button>
            </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MealLogModal;
