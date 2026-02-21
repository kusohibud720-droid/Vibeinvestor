import { useState, useEffect } from 'react';
import { Brain, TrendingDown, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { Trade, AnxietyLog, Asset } from '../types';

const MOODS = [
  { emoji: '😌', label: 'Уверенность', value: 'confidence' },
  { emoji: '😨', label: 'Страх', value: 'fear' },
  { emoji: '🤔', label: 'Сомнения', value: 'doubt' },
  { emoji: '🤑', label: 'Жадность', value: 'greed' },
  { emoji: '😤', label: 'Азарт', value: 'excitement' },
  { emoji: '🛡️', label: 'Защита', value: 'protection' },
];

export default function EmotionDiary() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [anxietyLogs, setAnxietyLogs] = useState<AnxietyLog[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [isLoggingAnxiety, setIsLoggingAnxiety] = useState(false);
  const [newTrade, setNewTrade] = useState({
    asset_id: 0,
    type: 'buy',
    quantity: 0,
    price: 0,
    commission: 0,
    mood: 'confidence',
    note: ''
  });
  const [analysis, setAnalysis] = useState({
    reason: '',
    what_differently: '',
    lesson: ''
  });
  const [newAnxiety, setNewAnxiety] = useState({
    level: 5,
    event: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [tRes, aRes, pRes] = await Promise.all([
      fetch('/api/trades'),
      fetch('/api/anxiety'),
      fetch('/api/portfolio')
    ]);
    setTrades(await tRes.json());
    setAnxietyLogs(await aRes.json());
    setAssets(await pRes.json());
  };

  const handleLogTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAsset = assets.find(a => a.id === newTrade.asset_id);
    const isLoss = selectedAsset && newTrade.type === 'sell' && newTrade.price < selectedAsset.avg_price;
    
    await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newTrade,
        analysis: isLoss ? analysis : null
      })
    });
    setIsLogging(false);
    setAnalysis({ reason: '', what_differently: '', lesson: '' });
    fetchData();
  };

  const handleLogAnxiety = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/anxiety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnxiety)
    });
    setIsLoggingAnxiety(false);
    setNewAnxiety({ level: 5, event: '' });
    fetchData();
  };

  const currentAnxiety = anxietyLogs[0]?.level || 3;

  const WORM_LEVELS = [
    { label: 'Сплит', range: '1-2', value: 2, emoji: '😴' },
    { label: 'Шевелится', range: '3-4', value: 4, emoji: '🐛' },
    { label: 'Грызёт', range: '5-6', value: 6, emoji: '😬' },
    { label: 'Сожрал весь покой', range: '7-8', value: 8, emoji: '😱' },
    { label: 'Я его приручил', range: '9-10', value: 10, emoji: '🧘' },
  ];

  const getWormStatus = (level: number) => {
    if (level <= 2) return 'Сплит';
    if (level <= 4) return 'Шевелится';
    if (level <= 6) return 'Грызёт';
    if (level <= 8) return 'Сожрал весь покой';
    return 'Я его приручил';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Дневник эмоций</h2>
        <button 
          onClick={() => setIsLogging(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white rounded-xl text-sm font-medium"
        >
          <Plus size={18} />
          Записать сделку
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Anxiety Scale */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#151619] p-8 rounded-[32px] shadow-sm border border-black/5 dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="text-[#5A5A40]" />
                <h3 className="text-lg font-semibold">Червячкометр</h3>
              </div>
              <button 
                onClick={() => setIsLoggingAnxiety(true)}
                className="p-2 rounded-xl bg-[#5A5A40]/5 dark:bg-white/5 text-[#5A5A40] dark:text-white/60 hover:bg-[#5A5A40]/10 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-black/40 dark:text-white/40 uppercase font-bold tracking-wider">Состояние</p>
                  <p className="text-xl font-bold text-[#5A5A40] dark:text-white/90">{getWormStatus(currentAnxiety)}</p>
                </div>
                <p className="text-4xl font-light">{currentAnxiety}/10</p>
              </div>
              <div className="relative h-4 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${currentAnxiety > 7 ? 'bg-red-500' : currentAnxiety > 4 ? 'bg-amber-500' : 'bg-[#5A5A40]'}`}
                  style={{ width: `${currentAnxiety * 10}%` }}
                />
              </div>
              <p className="text-sm text-black/60 dark:text-white/60 italic">
                {currentAnxiety > 7 ? 'Рынок в панике. Дыши глубже, не принимай поспешных решений.' : 'Состояние стабильное. Хорошее время для анализа.'}
              </p>
            </div>
          </div>

          <div className="bg-[#1A1A1A] dark:bg-[#1A1A1A] text-white p-8 rounded-[32px] space-y-4 border border-white/5">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle size={20} />
              <h4 className="font-bold">Анализ ошибок</h4>
            </div>
            <p className="text-sm text-white/70">
              В этом месяце 60% твоих покупок были совершены в состоянии <span className="text-white font-bold">"Страха"</span>. 
              Сделки по Газпрому могли принести на 5% больше, если бы не паническая продажа на лоях.
            </p>
          </div>
        </div>

        {/* Trades List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold px-2">История сделок и чувств</h3>
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="bg-white dark:bg-[#151619] p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] dark:bg-white/5 flex items-center justify-center text-2xl">
                      {MOODS.find(m => m.value === trade.mood)?.emoji || '🤔'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{trade.symbol}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${trade.type === 'buy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {trade.type === 'buy' ? 'Покупка' : 'Продажа'}
                        </span>
                      </div>
                      <p className="text-xs text-black/40 dark:text-white/40">{new Date(trade.created_at).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">₽{(trade.quantity * trade.price).toLocaleString()}</p>
                    <p className="text-xs text-black/40 dark:text-white/40 italic">Комиссия: ₽{trade.commission}</p>
                  </div>
                </div>
                
                {trade.reason && (
                  <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                      <AlertCircle size={14} />
                      Анализ ошибки
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] text-rose-400 font-bold uppercase mb-1">Причина</p>
                        <p className="text-xs font-medium text-black/80 dark:text-white/80">{trade.reason}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-rose-400 font-bold uppercase mb-1">Иначе</p>
                        <p className="text-xs font-medium text-black/80 dark:text-white/80">{trade.what_differently}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-rose-400 font-bold uppercase mb-1">Урок</p>
                        <p className="text-xs font-medium text-black/80 dark:text-white/80">{trade.lesson}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {trades.length === 0 && (
              <div className="text-center py-12 text-black/40 dark:text-white/40 italic">
                Сделок пока нет. Запишите свою первую сделку и эмоции.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Trade Modal */}
      {isLogging && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151619] w-full max-w-lg rounded-[32px] p-8 shadow-2xl text-black dark:text-white">
            <h3 className="text-2xl font-bold mb-6">Записать сделку</h3>
            <form onSubmit={handleLogTrade} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Актив</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                    required
                    value={newTrade.asset_id}
                    onChange={e => setNewTrade({...newTrade, asset_id: Number(e.target.value)})}
                  >
                    <option value="">Выберите актив</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.symbol} - {a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Тип</label>
                  <div className="flex bg-[#F5F5F0] dark:bg-white/5 rounded-xl p-1">
                    <button 
                      type="button"
                      onClick={() => setNewTrade({...newTrade, type: 'buy'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTrade.type === 'buy' ? 'bg-white dark:bg-white/10 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-black/40 dark:text-white/40'}`}
                    >
                      Купить
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewTrade({...newTrade, type: 'sell'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTrade.type === 'sell' ? 'bg-white dark:bg-white/10 shadow-sm text-red-600 dark:text-red-400' : 'text-black/40 dark:text-white/40'}`}
                    >
                      Продать
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Кол-во</label>
                  <input 
                    type="number" 
                    className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                    required
                    value={newTrade.quantity}
                    onChange={e => setNewTrade({...newTrade, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Цена</label>
                  <input 
                    type="number" 
                    className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                    required
                    value={newTrade.price}
                    onChange={e => setNewTrade({...newTrade, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Комиссия</label>
                  <input 
                    type="number" 
                    className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                    required
                    value={newTrade.commission}
                    onChange={e => setNewTrade({...newTrade, commission: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-3">Что ты чувствуешь?</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setNewTrade({...newTrade, mood: m.value})}
                      className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${newTrade.mood === m.value ? 'bg-[#5A5A40] border-[#5A5A40] text-white scale-105 shadow-lg' : 'bg-[#F5F5F0] dark:bg-white/5 border-black/5 dark:border-white/10 text-black/40 dark:text-white/40 hover:border-black/20 dark:hover:border-white/30'}`}
                    >
                      <span className="text-2xl mb-1">{m.emoji}</span>
                      <span className="text-[10px] font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Заметка</label>
                <textarea 
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5 h-24 resize-none text-black dark:text-white"
                  placeholder="Почему ты совершил эту сделку?"
                  value={newTrade.note}
                  onChange={e => setNewTrade({...newTrade, note: e.target.value})}
                />
              </div>

              {/* Error Analysis Section */}
              {newTrade.type === 'sell' && assets.find(a => a.id === newTrade.asset_id) && newTrade.price < (assets.find(a => a.id === newTrade.asset_id)?.avg_price || 0) && (
                <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <AlertCircle size={18} />
                    <h4 className="font-bold text-sm">Анализ ошибок (сделка в убыток)</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-rose-400 mb-1">Почему ты продал именно в этот момент?</label>
                      <select 
                        className="w-full p-2 rounded-lg border border-rose-200 dark:border-rose-900/30 bg-white dark:bg-white/5 text-sm text-black dark:text-white"
                        value={analysis.reason}
                        onChange={e => setAnalysis({...analysis, reason: e.target.value})}
                        required
                      >
                        <option value="">Выберите причину</option>
                        <option value="Страх">Страх</option>
                        <option value="Паника">Паника</option>
                        <option value="Нужны были деньги">Нужны были деньги</option>
                        <option value="Послушал совет">Послушал совет</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-rose-400 mb-1">Что бы ты сделал иначе?</label>
                      <input 
                        type="text"
                        className="w-full p-2 rounded-lg border border-rose-200 dark:border-rose-900/30 bg-white dark:bg-white/5 text-sm text-black dark:text-white"
                        placeholder="Например: дождался бы отскока..."
                        value={analysis.what_differently}
                        onChange={e => setAnalysis({...analysis, what_differently: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-rose-400 mb-1">Какой урок вынес?</label>
                      <input 
                        type="text"
                        className="w-full p-2 rounded-lg border border-rose-200 dark:border-rose-900/30 bg-white dark:bg-white/5 text-sm text-black dark:text-white"
                        placeholder="Например: не торговать на эмоциях..."
                        value={analysis.lesson}
                        onChange={e => setAnalysis({...analysis, lesson: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsLogging(false)}
                  className="flex-1 py-4 rounded-2xl border border-black/10 dark:border-white/10 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-[#5A5A40] text-white font-bold hover:bg-[#4A4A30] transition-colors"
                >
                  Зафиксировать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Log Anxiety Modal */}
      {isLoggingAnxiety && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151619] w-full max-w-lg rounded-[32px] p-8 shadow-2xl text-black dark:text-white">
            <h3 className="text-2xl font-bold mb-2">Как твой внутренний червячок сегодня?</h3>
            <p className="text-sm text-black/40 dark:text-white/40 mb-6">Выбери состояние, которое лучше всего описывает твое настроение.</p>
            
            <form onSubmit={handleLogAnxiety} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WORM_LEVELS.map((level) => (
                  <button
                    key={level.label}
                    type="button"
                    onClick={() => setNewAnxiety({...newAnxiety, level: level.value})}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${newAnxiety.level === level.value ? 'bg-[#5A5A40] border-[#5A5A40] text-white shadow-lg scale-[1.02]' : 'bg-[#F5F5F0] dark:bg-white/5 border-black/5 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/20 dark:hover:border-white/30'}`}
                  >
                    <span className="text-2xl">{level.emoji}</span>
                    <div>
                      <p className="text-sm font-bold">{level.label}</p>
                      <p className="text-[10px] opacity-60 uppercase tracking-widest">{level.range}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Что вызвало тревогу или радость?</label>
                <textarea 
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5 h-24 resize-none text-black dark:text-white"
                  placeholder="Опиши событие или мысль..."
                  required
                  value={newAnxiety.event}
                  onChange={e => setNewAnxiety({...newAnxiety, event: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsLoggingAnxiety(false)}
                  className="flex-1 py-4 rounded-2xl border border-black/10 dark:border-white/10 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-[#5A5A40] text-white font-bold hover:bg-[#4A4A30] transition-colors"
                >
                  Зафиксировать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
