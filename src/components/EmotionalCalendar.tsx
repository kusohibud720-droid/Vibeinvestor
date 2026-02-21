import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import { Trade, AnxietyLog } from '../types';

interface EmotionalCalendarProps {
  trades: Trade[];
  anxietyLogs: AnxietyLog[];
}

export default function EmotionalCalendar({ trades, anxietyLogs }: EmotionalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const data: Record<string, { anxiety: number; trades: Trade[]; logs: AnxietyLog[] }> = {};

    // Process Anxiety Logs
    anxietyLogs.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!data[date]) data[date] = { anxiety: 0, trades: [], logs: [] };
      data[date].logs.push(log);
      data[date].anxiety = Math.max(data[date].anxiety, log.level);
    });

    // Process Trades
    trades.forEach(trade => {
      const date = new Date(trade.created_at).toISOString().split('T')[0];
      if (!data[date]) data[date] = { anxiety: 0, trades: [], logs: [] };
      data[date].trades.push(trade);
    });

    return { days, startDay, data };
  }, [currentDate, trades, anxietyLogs]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getDayColor = (dateStr: string) => {
    const dayInfo = monthData.data[dateStr];
    if (!dayInfo) return 'bg-white';
    if (dayInfo.anxiety >= 7) return 'bg-rose-500 text-white';
    if (dayInfo.anxiety >= 4) return 'bg-amber-400 text-black';
    if (dayInfo.anxiety > 0) return 'bg-emerald-500 text-white';
    return 'bg-white';
  };

  const selectedDayInfo = selectedDay ? monthData.data[selectedDay] : null;

  const monthName = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-black/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold capitalize">{monthName}</h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-black/5 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-black/5 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-black/30 py-2">
              {d}
            </div>
          ))}
          
          {Array.from({ length: (monthData.startDay + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: monthData.days }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const colorClass = getWormColor(dateStr);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(dateStr)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all hover:scale-105
                  ${colorClass}
                  ${selectedDay === dateStr ? 'ring-4 ring-[#5A5A40]/20 scale-110 z-10' : 'border border-black/5'}
                  ${isToday ? 'font-black underline decoration-2 underline-offset-4' : ''}
                `}
              >
                <span className="text-sm font-bold">{day}</span>
                {monthData.data[dateStr]?.trades.length > 0 && (
                  <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-current opacity-60" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-black/40">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Спокойствие</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span>Тревога</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span>Паника</span>
          </div>
        </div>
      </div>

      {/* Day Details */}
      {selectedDay && (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-black/5 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold">
              {new Date(selectedDay).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' })}
            </h4>
            <button onClick={() => setSelectedDay(null)} className="text-black/40 hover:text-black transition-colors">
              Закрыть
            </button>
          </div>

          {!selectedDayInfo ? (
            <p className="text-center py-12 text-black/40 italic">В этот день не было зафиксировано событий или сделок.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h5 className="text-xs font-bold uppercase tracking-widest text-black/40">События и состояние</h5>
                {selectedDayInfo.logs.map(log => (
                  <div key={log.id} className="p-4 bg-[#F5F5F0] rounded-2xl border-l-4 border-[#5A5A40] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Уровень: {log.level}/10</span>
                      <span className="text-[10px] text-black/40">{new Date(log.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm font-medium">{log.event}</p>
                  </div>
                ))}
                {selectedDayInfo.logs.length === 0 && <p className="text-sm text-black/40 italic">Нет записей о состоянии.</p>}
              </div>

              <div className="space-y-6">
                <h5 className="text-xs font-bold uppercase tracking-widest text-black/40">Сделки</h5>
                {selectedDayInfo.trades.map(trade => (
                  <div key={trade.id} className="p-4 bg-white border border-black/5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{trade.symbol}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${trade.type === 'buy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {trade.type === 'buy' ? 'Покупка' : 'Продажа'}
                        </span>
                      </div>
                      <span className="font-mono font-bold">₽{(trade.quantity * trade.price).toLocaleString()}</span>
                    </div>
                    {trade.note && (
                      <div className="flex gap-2 text-xs text-black/60 italic">
                        <MessageSquare size={14} className="shrink-0" />
                        <p>{trade.note}</p>
                      </div>
                    )}
                  </div>
                ))}
                {selectedDayInfo.trades.length === 0 && <p className="text-sm text-black/40 italic">Сделок не было.</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  function getWormColor(dateStr: string) {
    const dayInfo = monthData.data[dateStr];
    if (!dayInfo) return 'bg-white';
    if (dayInfo.anxiety >= 7) return 'bg-rose-500 text-white';
    if (dayInfo.anxiety >= 4) return 'bg-amber-400 text-black';
    if (dayInfo.anxiety > 0) return 'bg-emerald-500 text-white';
    return 'bg-white';
  }
}
