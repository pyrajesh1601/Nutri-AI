import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import useDebounce from '../hooks/useDebounce';
import { Search, Activity, Flame, Clock, Filter, ChevronRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const types = ['cardio', 'strength', 'yoga', 'hiit', 'flexibility'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (typeFilter) params.append('type', typeFilter);
        if (difficultyFilter) params.append('difficulty', difficultyFilter);

        const { data } = await api.get(`/exercises?${params.toString()}`);
        setExercises(data);
      } catch (error) {
        toast.error("Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [debouncedSearch, typeFilter, difficultyFilter]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background p-8 pt-24 pb-32"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand/10 rounded-xl">
                <Activity className="w-6 h-6 text-brand" />
              </div>
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">Training</span>
            </div>
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">Workout Library</h1>
            <p className="text-text-secondary mt-2 font-light">Find the perfect session for your progress.</p>
          </div>

          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted group-focus-within:text-brand transition-colors" />
            </div>
            <input
              type="text"
              className="input-dark pl-12"
              placeholder="Search by name or muscle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="glass p-6 rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTypeFilter('')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${!typeFilter ? 'bg-brand text-background shadow-lg shadow-brand/20' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
            >
              All Types
            </button>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${typeFilter === t ? 'bg-brand text-background shadow-lg shadow-brand/20' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/5">
             <div className="px-4 py-2">
               <span className="text-[10px] font-black uppercase text-text-muted tracking-tighter">Difficulty</span>
             </div>
             <select
               className="bg-transparent text-sm font-semibold text-text-primary outline-none pr-4 py-2 appearance-none cursor-pointer"
               value={difficultyFilter}
               onChange={(e) => setDifficultyFilter(e.target.value)}
             >
               <option value="" className="bg-background">All Levels</option>
               {difficulties.map(d => (
                 <option key={d} value={d} className="bg-background capitalize">{d}</option>
               ))}
             </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white/5 animate-pulse rounded-4xl h-80"></div>
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-20 glass rounded-4xl border border-white/5">
             <Activity className="mx-auto h-16 w-16 text-text-muted opacity-20 mb-4" />
             <h3 className="text-xl font-semibold text-text-primary">No workouts found</h3>
             <p className="text-text-secondary mt-2 font-light">Try broadening your search or filters.</p>
             <button onClick={() => { setSearchTerm(''); setTypeFilter(''); setDifficultyFilter(''); }} className="btn-ghost mt-8">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exercises.map((exercise, i) => (
              <motion.div
                key={exercise._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link 
                  to={`/exercises/${exercise._id}`} 
                  className="glass rounded-4xl overflow-hidden group block hover:border-white/20 transition-all duration-500 h-full flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={exercise.thumbnail || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000"} 
                      alt={exercise.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000";
                      }}
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="glass rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-text-primary backdrop-blur-md border-white/10">
                        {exercise.type}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
                  </div>
                  
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-text-primary group-hover:text-brand transition-colors line-clamp-1">{exercise.name}</h3>
                      <div className={`w-2 h-2 rounded-full mt-2 shadow-[0_0_8px_rgba(168,224,99,0.5)] ${
                        exercise.difficulty === 'beginner' ? 'bg-brand' : 
                        exercise.difficulty === 'intermediate' ? 'bg-yellow-400' : 'bg-red-500'
                      }`} />
                    </div>
                  
                    <p className="text-sm text-text-secondary line-clamp-2 font-light leading-relaxed mb-8">{exercise.description}</p>

                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-text-muted" />
                          <span className="text-xs font-bold text-text-primary tracking-tight">{exercise.duration}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-brand" />
                          <span className="text-xs font-bold text-text-primary tracking-tight">{exercise.caloriesBurned}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand transition-all transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Exercises;
