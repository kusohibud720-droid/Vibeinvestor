import { useMemo } from 'react';
import { Percent, Wallet, Info, ArrowRight } from 'lucide-react';
import { Trade, Asset } from '../types';

interface CommissionCalculatorProps {
  trades: Trade[];
  portfolioValue: number;
}

export default function CommissionCalculator({ trades, portfolioValue }: CommissionCalculatorProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const monthTrades = trades.filter(t => new Date(t.created_at) >= oneMonthAgo);
    const yearTrades = trades.filter(t => new Date(t.created_at) >= oneYearAgo);

    const monthCommissions = monthTrades.reduce((sum, t) => sum + t.commission, 0);
    const yearCommissions = yearTrades.reduce((sum, t) => sum + t.commission, 0);

    const monthPercent = portfolioValue > 0 ? (monthCommissions / portfolioValue) * 100 : 0;
    const yearPercent = portfolioValue > 0 ? (yearCommissions / portfolioValue) * 100 : 0;

    const avgCommissionPerTrade = monthTrades.length > 0 ? monthCommissions / monthTrades.length : 0;
    const potentialSavings = monthTrades.length > 15 
      ? (monthTrades.length - 15) * avgCommissionPerTrade * 12 
      : 0;

    return {
      monthCommissions,
      yearCommissions,
      monthPercent,
      yearPercent,
      monthCount: monthTrades.length,
      potentialSavings,
      avgCommissionPerTrade
    };
  }, [trades, portfolioValue]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-black/5 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Percent className="text-[#5A5A40]" />
            <h3 className="text-xl font-bold">Калькулятор комиссий</h3>
          </div>
          <div className="px-3 py-1 bg-[#F5F5F0] rounded-full text-[10px] font-bold uppercase tracking-widest text-black/40">
            Аналитика расходов
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#F5F5F0] rounded-3xl space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-black/40">За последний месяц</p>
            <p className="text-3xl font-bold text-[#5A5A40]">₽{stats.monthCommissions.toLocaleString()}</p>
            <p className="text-xs text-black/60">{stats.monthPercent.toFixed(3)}% от портфеля</p>
          </div>
          <div className="p-6 bg-[#1A1A1A] text-white rounded-3xl space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">За последний год</p>
            <p className="text-3xl font-bold text-amber-400">₽{stats.yearCommissions.toLocaleString()}</p>
            <p className="text-xs text-white/60">{stats.yearPercent.toFixed(3)}% от портфеля</p>
          </div>
        </div>

        {stats.monthCount > 0 && (
          <div className="p-6 border border-black/5 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-[#5A5A40]">
              <Info size={18} />
              <h4 className="font-bold text-sm">Совет Vibe</h4>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-black/70 leading-relaxed">
                В этом месяце ты совершил <span className="font-bold text-black">{stats.monthCount}</span> сделок. 
                Средняя комиссия за одну операцию составила <span className="font-bold text-black">₽{Math.round(stats.avgCommissionPerTrade)}</span>.
              </p>

              {stats.monthCount > 15 ? (
                <div className="bg-[#5A5A40]/5 p-4 rounded-2xl border border-[#5A5A40]/10 flex items-start gap-4">
                  <div className="text-2xl">💡</div>
                  <div>
                    <p className="text-sm font-medium text-[#5A5A40]">
                      Если ты сократишь количество сделок с {stats.monthCount} до 15 в месяц, то сэкономишь около <span className="font-bold">₽{Math.round(stats.potentialSavings).toLocaleString()}</span> в год.
                    </p>
                    <p className="text-xs text-[#5A5A40]/60 mt-1 italic">
                      Меньше шума — больше прибыли. Попробуй пересмотреть свою стратегию в сторону более долгосрочных позиций.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-4">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">
                      Твоя торговая активность в норме. Ты не переплачиваешь лишнего брокеру и придерживаешься спокойной стратегии.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <Wallet className="text-amber-600 shrink-0" size={20} />
          <p className="text-xs text-amber-800 italic">
            Помни: комиссии — это гарантированный убыток. Каждая сэкономленная копейка на комиссии — это заработанная копейка в твоем кармане.
          </p>
        </div>
      </div>
    </div>
  );
}
