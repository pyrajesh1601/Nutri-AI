import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass rounded-4xl border border-white/10 w-full max-w-md overflow-hidden relative shadow-2xl bg-white/2"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 glass border-white/5 text-text-muted hover:text-text-primary transition-all rounded-xl active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="p-10">
              <div className="flex flex-col items-center text-center mb-8">
                {isDanger ? (
                  <div className="w-16 h-16 rounded-3xl glass border-red-500/20 flex items-center justify-center mb-6 text-red-500 brand-glow">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-3xl glass border-brand/20 flex items-center justify-center mb-6 text-brand brand-glow">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                )}
                <h3 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h3>
                <p className="text-[10px] uppercase font-black text-text-muted tracking-[0.3em] mt-2">Critical Action Required</p>
              </div>
              
              <p className="text-text-secondary text-center font-light leading-relaxed mb-10">{message}</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg ${
                    isDanger 
                      ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' 
                      : 'btn-primary shadow-brand/20'
                  }`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="btn-ghost py-3.5 text-xs font-black uppercase tracking-widest"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
