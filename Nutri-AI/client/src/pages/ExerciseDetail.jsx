import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { ArrowLeft, Activity, Flame, Clock, CheckCircle2, Play, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [logging, setLogging] = useState(false);
  const [logData, setLogData] = useState({ duration: '', notes: '' });

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data } = await api.get(`/exercises/${id}`);
        setExercise(data);
        setLogData({ duration: data.duration, notes: '' });
      } catch (error) {
        toast.error("Failed to load exercise");
        navigate('/exercises');
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [id, navigate]);

  const handleLogWorkout = async (e) => {
    e.preventDefault();
    setLogging(true);
    try {
      await api.post('/exercises/log', {
        exerciseId: exercise._id,
        duration: Number(logData.duration),
        caloriesBurned: exercise.caloriesBurned,
        notes: logData.notes
      });
      toast.success("Workout logged!");
      setLogData({ duration: exercise.duration, notes: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log workout");
    } finally {
      setLogging(false);
    }
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 pb-32">
        <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
           <div className="h-8 w-48 bg-white/5 rounded-2xl" />
           <div className="h-[500px] w-full bg-white/5 rounded-4xl" />
        </div>
      </div>
    );
  }

  const youtubeId = exercise?.videoUrl ? extractYoutubeId(exercise.videoUrl) : null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background p-8 pt-24 pb-32"
    >
      <div className="max-w-5xl mx-auto">
        <Link to="/exercises" className="btn-ghost inline-flex items-center gap-2 mb-10 px-4 py-2 text-xs uppercase tracking-widest font-black">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="glass rounded-4xl border border-white/10 overflow-hidden">
          
          <div className="relative">
            {youtubeId ? (
              <div className="aspect-video w-full bg-black/40">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ) : (
              <div className="relative h-[400px] w-full">
                <img 
                  src={exercise.thumbnail || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000"} 
                  alt={exercise.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
              </div>
            )}
          </div>

          <div className="p-10 md:p-14">
            <div className="flex flex-wrap gap-3 mb-8">
               <span className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand border-brand/20">
                 {exercise.type}
               </span>
               <span className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-text-secondary border-white/5">
                 {exercise.difficulty}
               </span>
               <span className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-text-secondary border-white/5">
                 {exercise.muscleGroup}
               </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">{exercise.name}</h1>
              
              <div className="flex items-center gap-8 bg-white/5 p-4 rounded-3xl border border-white/5">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span className="text-xl font-bold text-text-primary">{exercise.duration}</span>
                  </div>
                  <span className="text-[10px] uppercase font-black text-text-muted tracking-tighter">Minutes</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-brand" />
                    <span className="text-xl font-bold text-text-primary">{exercise.caloriesBurned}</span>
                  </div>
                  <span className="text-[10px] uppercase font-black text-text-muted tracking-tighter">Calories</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-brand" />
                    <span className="text-xs uppercase tracking-widest text-text-muted font-black">Instructions</span>
                  </div>
                  <p className="text-text-secondary font-light leading-relaxed whitespace-pre-wrap text-lg">
                    {exercise.description}
                  </p>
                </div>
              </div>

              <div className="glass p-8 rounded-4xl border border-white/10 bg-white/2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Activity className="w-20 h-20 text-brand" /></div>
                <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand" /> Log Session
                </h3>
                
                <form onSubmit={handleLogWorkout} className="space-y-6 relative z-10">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-text-muted font-black mb-2 block ml-1">Actual Duration</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="input-dark"
                        value={logData.duration}
                        onChange={(e) => setLogData({ ...logData, duration: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-text-muted font-black mb-2 block ml-1">Notes</label>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="How did it feel?"
                        value={logData.notes}
                        onChange={(e) => setLogData({ ...logData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={logging}
                    className="btn-primary w-full shadow-lg shadow-brand/20"
                  >
                    {logging ? 'Saving...' : 'Complete Workout'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseDetail;
