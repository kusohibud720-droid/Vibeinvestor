import { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';

export default function Forecast() {
  const [monthlyDeposit, setMonthlyDeposit] = useState(1000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(12);

  const calculateForecast = () => {
    let total = 0;
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    for (let i = 0; i < months; i++) {
      total = (total + monthlyDeposit) * (1 + monthlyRate);
    }
    return Math.round(total);
  };

  const result = calculateForecast();

  const INFLATION_RATE = 0.08; // 8% average inflation

  const getProjection = (y: number) => {
    let total = 0;
    const monthlyRate = rate / 100 / 12;
    const months = y * 12;
    for (let i = 0; i < months; i++) {
      total = (total + monthlyDeposit) * (1 + monthlyRate);
    }
    const inflationAdjusted = total / Math.pow(1 + INFLATION_RATE, y);
    return { total: Math.round(total), adjusted: Math.round(inflationAdjusted) };
  };

  const projections = [1, 3, 5, 10].map(y => ({
    years: y,
    ...getProjection(y)
  }));

  const scenarios = [
    { name: 'Старт (1000₽)', deposit: 1000, years: 5, rate: 12 },
    { name: 'Комфорт (5000₽)', deposit: 5000, years: 10, rate: 15 },
    { name: 'Свобода (20000₽)', deposit: 20000, years: 15, rate: 18 },
  ];

  const applyScenario = (s: typeof scenarios[0]) => {
    setMonthlyDeposit(s.deposit);
    setYears(s.years);
    setRate(s.rate);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">Планировщик будущего</h2>
        <p className="text-black/60">Посмотри, как маленькие шаги превращаются в большие результаты.</p>
      </div>

      {/* Scenarios Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => applyScenario(s)}
            className="bg-white p-6 rounded-3xl border border-black/5 hover:border-[#5A5A40] transition-all text-left space-y-2 group"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-black/40 group-hover:text-[#5A5A40]">{s.name}</p>
            <p className="text-lg font-bold">₽{s.deposit.toLocaleString()} / мес</p>
            <p className="text-xs text-black/60">{s.years} лет под {s.rate}%</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Inputs */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-black/5 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Симулятор "А что, если?"</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold uppercase tracking-widest text-black/40">Ежемесячный взнос</label>
                <div className="flex items-center gap-2 bg-[#F5F5F0] px-3 py-1 rounded-xl border border-black/5 focus-within:border-[#5A5A40] transition-colors">
                  <span className="text-black/40 font-mono font-bold">₽</span>
                  <input 
                    type="number"
                    min="0"
                    className="bg-transparent border-none focus:ring-0 font-mono font-bold text-[#5A5A40] w-24 text-right appearance-none"
                    value={monthlyDeposit}
                    onChange={e => setMonthlyDeposit(Math.max(0, Number(e.target.value)))}
                  />
                </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000000" 
                step="500"
                className="w-full h-2 bg-black/5 rounded-full appearance-none cursor-pointer accent-[#5A5A40]"
                value={monthlyDeposit > 1000000 ? 1000000 : monthlyDeposit}
                onChange={e => setMonthlyDeposit(Number(e.target.value))}
              />
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-black/20">
                <span>0</span>
                <span>1 млн+</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold uppercase tracking-widest text-black/40">Ожидаемая доходность (%)</label>
                <div className="flex items-center gap-1 bg-[#F5F5F0] px-3 py-1 rounded-xl border border-black/5 focus-within:border-[#5A5A40] transition-colors">
                  <input 
                    type="number"
                    min="0"
                    className="bg-transparent border-none focus:ring-0 font-mono font-bold text-[#5A5A40] w-16 text-right appearance-none"
                    value={rate}
                    onChange={e => setRate(Math.max(0, Number(e.target.value)))}
                  />
                  <span className="text-black/40 font-mono font-bold">%</span>
                </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-full h-2 bg-black/5 rounded-full appearance-none cursor-pointer accent-[#5A5A40]"
                value={rate > 100 ? 100 : rate}
                onChange={e => setRate(Number(e.target.value))}
              />
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-black/20">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-black/5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-black/40">Прогноз накоплений</h4>
            <div className="grid grid-cols-1 gap-3">
              {projections.map((p) => (
                <div key={p.years} className="flex items-center justify-between p-4 bg-[#F5F5F0] rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-[#5A5A40]">Через {p.years} {p.years === 1 ? 'год' : p.years < 5 ? 'года' : 'лет'}</p>
                    <p className="text-lg font-bold">₽{p.total.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">С учетом инфляции</p>
                    <p className="text-sm font-medium text-black/60">₽{p.adjusted.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-black/40 italic text-center">
              * Расчет с учетом средней инфляции 8% в год.
            </p>
          </div>
        </div>

        {/* Strategy Planner */}
        <div className="space-y-6">
          <div className="bg-[#1A1A1A] text-white p-8 rounded-[32px] space-y-6">
            <h3 className="text-xl font-bold">Стратегия на месяц</h3>
            <p className="text-white/60 text-sm">Распредели свои инвестиции по плану, чтобы не забывать о важном.</p>
            
            <div className="space-y-4">
              {[
                { label: 'VIM (Ликвидность)', percent: 30, color: 'bg-blue-500' },
                { label: 'Акции', percent: 30, color: 'bg-emerald-500' },
                { label: 'Облигации', percent: 20, color: 'bg-amber-500' },
                { label: 'Эксперименты', percent: 20, color: 'bg-rose-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span>{item.label}</span>
                    <span>{item.percent}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="text-2xl">🤖</div>
                <p className="text-xs text-white/70 italic">
                  Бот в Telegram спросит: "Плюс 500 рублей, куда добавим?" и предложит варианты на основе этого плана.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] flex items-center justify-center text-[#5A5A40]">
                <Calendar size={24} />
              </div>
              <div>
                <p className="font-bold">Регулярные пополнения</p>
                <p className="text-xs text-black/40">Настроено: 15-е число каждого месяца</p>
              </div>
            </div>
            <button className="p-3 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white transition-all">
              <TrendingUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
