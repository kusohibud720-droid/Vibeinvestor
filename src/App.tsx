import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Brain,
  PlusCircle,
  Menu,
  X,
  Moon,
  Sun,
  Trophy,
  Activity,
  Sparkles,
  Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Portfolio from './components/Portfolio';
import EmotionDiary from './components/EmotionDiary';
import SocialFeed from './components/SocialFeed';
import Forecast from './components/Forecast';
import EmotionalCalendar from './components/EmotionalCalendar';
import CommissionCalculator from './components/CommissionCalculator';
import { Trade, AnxietyLog, Asset, Goal, Achievement, MarketSentiment } from './types';

type Tab = 'dashboard' | 'portfolio' | 'diary' | 'social' | 'forecast' | 'calendar' | 'commissions';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [anxietyLogs, setAnxietyLogs] = useState<AnxietyLog[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [digest, setDigest] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    // Check system preference once on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const fetchData = async () => {
    const [tRes, aRes, pRes, gRes, achRes, sRes, dRes] = await Promise.all([
      fetch('/api/trades'),
      fetch('/api/anxiety'),
      fetch('/api/portfolio'),
      fetch('/api/goals'),
      fetch('/api/achievements'),
      fetch('/api/market-sentiment'),
      fetch('/api/digest')
    ]);
    setTrades(await tRes.json());
    setAnxietyLogs(await aRes.json());
    setAssets(await pRes.json());
    setGoals(await gRes.json());
    setAchievements(await achRes.json());
    setSentiment(await sRes.json());
    const digestData = await dRes.json();
    setDigest(digestData.content || digestData.text);
  };

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-portfolio', { method: 'POST' });
      const data = await res.json();
      setAiAdvice(data.advice);
    } catch (e) {
      setAiAdvice("Не удалось провести анализ. Попробуйте позже.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const portfolioValue = assets.reduce((sum, a) => sum + (a.quantity * a.avg_price), 0);

  const navItems = [
    { id: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Портфель', icon: PieChart },
    { id: 'diary', label: 'Дневник', icon: Brain },
    { id: 'calendar', label: 'Календарь', icon: MessageSquare },
    { id: 'commissions', label: 'Комиссии', icon: LayoutDashboard },
    { id: 'social', label: 'Пульс', icon: Users },
    { id: 'forecast', label: 'Прогноз', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-white font-sans transition-colors duration-300">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#151619] border-b border-black/5 dark:border-white/10">
        <h1 className="text-xl font-bold tracking-tight">Vibeinvestor</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl bg-[#F5F5F0] dark:bg-white/5 text-[#5A5A40] dark:text-white/60">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#151619] border-r border-black/5 dark:border-white/10 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold tracking-tighter hidden lg:block">Vibeinvestor</h1>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="hidden lg:block p-2 rounded-xl bg-[#F5F5F0] dark:bg-white/5 text-[#5A5A40] dark:text-white/60">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as Tab);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${activeTab === item.id 
                      ? 'bg-[#5A5A40] text-white' 
                      : 'text-[#5A5A40]/60 dark:text-white/40 hover:bg-[#5A5A40]/5 dark:hover:bg-white/5 hover:text-[#5A5A40] dark:hover:text-white'}
                  `}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-full p-6 border-t border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center">
                <Users size={20} className="text-[#5A5A40]" />
              </div>
              <div>
                <p className="text-sm font-semibold">VibeUser</p>
                <p className="text-xs text-black/40">Инвестор</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  setActiveTab={setActiveTab} 
                  portfolioValue={portfolioValue}
                  sentiment={sentiment}
                  goals={goals}
                  achievements={achievements}
                  digest={digest}
                  aiAdvice={aiAdvice}
                  isAnalyzing={isAnalyzing}
                  runAiAnalysis={runAiAnalysis}
                  trades={trades}
                />
              )}
              {activeTab === 'portfolio' && <Portfolio />}
              {activeTab === 'diary' && <EmotionDiary />}
              {activeTab === 'social' && <SocialFeed />}
              {activeTab === 'forecast' && <Forecast />}
              {activeTab === 'calendar' && <EmotionalCalendar trades={trades} anxietyLogs={anxietyLogs} />}
              {activeTab === 'commissions' && <CommissionCalculator trades={trades} portfolioValue={portfolioValue} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Dashboard({ 
  setActiveTab, 
  portfolioValue, 
  sentiment, 
  goals, 
  achievements, 
  digest, 
  aiAdvice, 
  isAnalyzing, 
  runAiAnalysis,
  trades
}: { 
  setActiveTab: (tab: Tab) => void,
  portfolioValue: number,
  sentiment: MarketSentiment | null,
  goals: Goal[],
  achievements: Achievement[],
  digest: string,
  aiAdvice: string,
  isAnalyzing: boolean,
  runAiAnalysis: () => void,
  trades: Trade[]
}) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-light tracking-tight mb-2">Добро пожаловать, <span className="font-semibold">VibeUser</span></h2>
        <p className="text-black/60 dark:text-white/60 italic">Твой путь к осознанному инвестированию начинается здесь.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#151619] p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">Мой капитал</h3>
            <PieChart className="text-[#5A5A40]" size={20} />
          </div>
          <p className="text-3xl font-light">₽ {portfolioValue.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <TrendingUp size={16} />
            <span>+12.4% за год</span>
          </div>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className="w-full py-3 rounded-2xl bg-[#5A5A40] text-white text-sm font-medium hover:bg-[#4A4A30] transition-colors"
          >
            Управление активами
          </button>
        </div>

        <div className="bg-white dark:bg-[#151619] p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">Индекс Vibe</h3>
            <Activity className="text-[#5A5A40]" size={20} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Страх</span>
              <span>Жадность</span>
            </div>
            <div className="h-3 bg-[#F5F5F0] dark:bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ left: '50%' }}
                animate={{ left: `${(sentiment?.anxiety || 5) * 10}%` }}
                className="absolute top-0 w-1 h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
              />
              <div className="h-full w-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-20" />
            </div>
            <p className="text-[10px] text-black/40 dark:text-white/40 text-center italic">
              {sentiment?.anxiety && sentiment.anxiety > 7 ? 'Рынок в панике 😱' : sentiment?.anxiety && sentiment.anxiety < 4 ? 'Рынок спокоен 😎' : 'Нейтральное настроение 😐'}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('diary')}
            className="w-full py-3 rounded-2xl border border-[#5A5A40] text-[#5A5A40] text-sm font-medium hover:bg-[#5A5A40]/5 transition-colors"
          >
            Дневник эмоций
          </button>
        </div>

        <div className="bg-white dark:bg-[#151619] p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">Цели и ачивки</h3>
            <Trophy className="text-[#5A5A40]" size={20} />
          </div>
          <div className="space-y-4">
            {goals.slice(0, 3).map(goal => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[10px] font-bold leading-tight text-black/70 dark:text-white/70">{goal.title}</span>
                  <span className="text-[10px] font-bold shrink-0">{Math.round((goal.current_value / goal.target_value) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-[#F5F5F0] dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5A5A40]" style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              {achievements.map(ach => (
                <div 
                  key={ach.id} 
                  title={`${ach.title}: ${ach.description}`} 
                  className="w-10 h-10 rounded-xl bg-[#F5F5F0] dark:bg-white/5 flex items-center justify-center text-lg grayscale hover:grayscale-0 transition-all cursor-help border border-transparent hover:border-[#5A5A40]/30"
                >
                  {ach.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151619] p-8 rounded-[32px] shadow-sm border border-black/5 dark:border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              <h2 className="text-2xl font-bold">Взгляд Vibe</h2>
            </div>
            <p className="text-black/60 dark:text-white/60 max-w-xl">
              {aiAdvice || "Нажми кнопку, чтобы ИИ проанализировал твой портфель и эмоциональное состояние."}
            </p>
          </div>
          <button 
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="px-8 py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isAnalyzing ? 'Анализирую...' : 'Проанализировать портфель'}
            <Brain size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#151619] p-8 rounded-[32px] shadow-sm border border-black/5 dark:border-white/10">
          <h3 className="text-xl font-semibold mb-6">Последние сделки</h3>
          <div className="space-y-4">
            {trades.slice(0, 3).map((trade, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-black/5 dark:border-white/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5F5F0] dark:bg-white/5 flex items-center justify-center text-xl">
                    {trade.mood}
                  </div>
                  <div>
                    <p className="font-medium">{trade.symbol}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">{trade.type === 'buy' ? 'Покупка' : 'Продажа'}</p>
                  </div>
                </div>
                <p className="font-mono font-medium">₽ {(trade.quantity * trade.price).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#151619] p-8 rounded-[32px] shadow-sm border border-black/5 dark:border-white/10 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Vibe Дайджест</h3>
            <Newspaper className="text-[#5A5A40]" size={20} />
          </div>
          <div className="bg-[#F5F5F0] dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/10">
            <p className="text-sm leading-relaxed text-black/70 dark:text-white/70 italic">
              "{digest || 'Загрузка новостей...'}"
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('social')}
            className="w-full py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition-opacity"
          >
            Обсудить в Пульсе
          </button>
        </div>
      </div>
    </div>
  );
}
