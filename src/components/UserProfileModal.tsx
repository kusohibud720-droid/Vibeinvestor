import { X, UserPlus, UserMinus, TrendingUp, PieChart } from 'lucide-react';
import { UserProfile, Post } from '../types';
import { motion } from 'motion/react';

interface UserProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onToggleSubscribe: () => void;
  onPostAction: () => void; // To refresh if we comment/react in modal
}

export default function UserProfileModal({ profile, onClose, onToggleSubscribe, onPostAction }: UserProfileModalProps) {
  const totalValue = profile.assets.reduce((sum, a) => sum + (a.quantity * a.avg_price), 0);
  
  // Mock profitability for demo
  const profitability = 12.4; 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-[#151619] w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col text-black dark:text-white"
      >
        {/* Header */}
        <div className="p-8 border-b border-black/5 dark:border-white/10 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#5A5A40]/10 flex items-center justify-center font-bold text-[#5A5A40] text-2xl">
              {profile.username[0]}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{profile.username}</h3>
              <p className="text-sm text-black/40 dark:text-white/40">Инвестор в Vibe</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onToggleSubscribe}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${profile.isSubscribed ? 'bg-[#F5F5F0] dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-rose-50 hover:text-rose-500' : 'bg-[#5A5A40] text-white hover:bg-[#4A4A30]'}`}
            >
              {profile.isSubscribed ? <UserMinus size={18} /> : <UserPlus size={18} />}
              {profile.isSubscribed ? 'Отписаться' : 'Подписаться'}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl bg-[#F5F5F0] dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F5F5F0] dark:bg-white/5 p-6 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-black/40 dark:text-white/40">
                <PieChart size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Портфель</span>
              </div>
              <p className="text-2xl font-bold">₽{totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-[#F5F5F0] dark:bg-white/5 p-6 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-black/40 dark:text-white/40">
                <TrendingUp size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Доходность</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">+{profitability}%</p>
            </div>
          </div>

          {/* Assets Summary */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-black/40 dark:text-white/40 px-2">Активы</h4>
            <div className="flex flex-wrap gap-2">
              {profile.assets.map(asset => (
                <div key={asset.id} className="px-4 py-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-sm font-medium">
                  {asset.symbol} <span className="text-black/40 dark:text-white/40 ml-1">{Math.round((asset.quantity * asset.avg_price / totalValue) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-black/40 dark:text-white/40 px-2">Посты</h4>
            <div className="space-y-4">
              {profile.posts.map(post => (
                <div key={post.id} className="p-6 bg-[#F5F5F0] dark:bg-white/5 rounded-3xl space-y-3">
                  <p className="text-sm leading-relaxed">{post.content}</p>
                  <p className="text-[10px] text-black/40 dark:text-white/40">{new Date(post.created_at).toLocaleString('ru-RU')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
