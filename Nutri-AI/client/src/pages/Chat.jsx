import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Send, Bot, Trash2, Sparkles, User, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/chat/history');
        setMessages(data);
      } catch (error) {
        toast.error("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', message: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setTyping(true);

    try {
      const { data } = await api.post('/chat/message', { message: userMessage.message });
      setMessages(prev => [...prev, { role: 'assistant', message: data.message, timestamp: new Date() }]);
    } catch (error) {
      if (error.response?.status === 429) {
        setMessages(prev => [...prev, { role: 'assistant', message: "NutriBot is resting, try again in a moment 🌿" }]);
      } else {
        toast.error("Failed to send message");
      }
    } finally {
      setTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear chat history?")) return;
    try {
      await api.delete('/chat/history');
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Bot className="w-12 h-12 text-brand animate-bounce" />
          <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-brand w-1/2 animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background flex flex-col pt-24 pb-32 px-6"
    >
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col glass rounded-4xl border border-white/5 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-brand brand-glow">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">NutriBot Coach</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span className="text-[10px] uppercase font-black text-brand tracking-widest">Active Assistant</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleClearHistory} 
            className="p-3 text-text-muted hover:text-red-400 glass border-white/5 hover:border-red-400/20 rounded-2xl transition-all active:scale-95"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
              <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mb-6 border-brand/20">
                 <Sparkles className="w-10 h-10 text-brand" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">How can I assist?</h3>
              <p className="text-text-secondary text-sm font-light leading-relaxed">
                I'm your personal health architect. Ask me about your nutrition, workouts, 
                or how to optimise your routine for better results.
              </p>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                    
                    <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center glass border-white/5 ${isUser ? 'bg-brand/10 text-brand' : 'text-text-secondary'}`}>
                      {isUser ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>

                    <div className={`p-5 rounded-3xl shadow-2xl relative group ${
                      isUser 
                        ? 'bg-brand text-background rounded-tr-none' 
                        : 'glass border-white/5 text-text-primary rounded-tl-none backdrop-blur-2xl'
                    }`}>
                      <p className={`text-sm md:text-base leading-relaxed ${isUser ? 'font-bold' : 'font-light'}`}>
                        {msg.message}
                      </p>
                      <span className={`text-[9px] mt-2 block font-black uppercase tracking-widest opacity-40 ${isUser ? 'text-background' : 'text-text-muted'}`}>
                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {typing && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start"
            >
              <div className="flex flex-row gap-4 items-start">
                <div className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center glass border-white/5 text-brand">
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <div className="px-6 py-4 rounded-3xl glass border-white/5 rounded-tl-none flex gap-1.5 items-center backdrop-blur-xl shadow-2xl">
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/5 bg-white/2 backdrop-blur-xl">
          <form onSubmit={handleSend} className="flex gap-4 items-center">
            <div className="flex-1 relative group">
              <input
                type="text"
                className="input-dark pr-12 h-14"
                placeholder="Message NutriBot..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={typing}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-focus-within:opacity-40 transition-opacity">
                <Sparkles className="w-4 h-4 text-brand" />
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl transition-all transform active:scale-90 ${(!input.trim() || typing) ? 'bg-white/5 text-text-muted cursor-not-allowed' : 'bg-brand text-background shadow-lg shadow-brand/20 hover:scale-105'}`}
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-4">
             <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">Nutri-AI Neural Engine</span>
             <div className="w-1 h-1 bg-brand rounded-full shadow-[0_0_5px_rgba(168,224,99,0.8)]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;
