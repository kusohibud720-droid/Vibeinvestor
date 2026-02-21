import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Asset } from '../types';

const COLORS = ['#5A5A40', '#8E8E60', '#B2B280', '#D4D4A0', '#1A1A1A', '#4A4A4A'];

export default function Portfolio() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAsset, setNewAsset] = useState({
    type: 'stock',
    symbol: '',
    name: '',
    quantity: 0,
    avg_price: 0,
    sector: 'Finance'
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    const res = await fetch('/api/portfolio');
    const data = await res.json();
    setAssets(data);
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/portfolio/asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAsset)
    });
    setIsAdding(false);
    fetchAssets();
  };

  const sectorData = assets.reduce((acc: any[], asset) => {
    const existing = acc.find(a => a.name === asset.sector);
    const value = asset.quantity * asset.avg_price;
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: asset.sector, value });
    }
    return acc;
  }, []);

  const totalValue = assets.reduce((sum, a) => sum + (a.quantity * a.avg_price), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Мой портфель</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white rounded-xl text-sm font-medium"
        >
          <Plus size={18} />
          Добавить актив
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-1 bg-white dark:bg-[#151619] p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-center">Распределение по секторам</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {sectorData.map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-black/60 dark:text-white/60">{s.name}</span>
                </div>
                <span className="font-medium">{((s.value / totalValue) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assets Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151619] rounded-3xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 text-xs uppercase tracking-wider text-black/40 dark:text-white/40">
                  <th className="px-6 py-4 font-semibold">Актив</th>
                  <th className="px-6 py-4 font-semibold">Сектор</th>
                  <th className="px-6 py-4 font-semibold">Кол-во</th>
                  <th className="px-6 py-4 font-semibold">Цена (ср.)</th>
                  <th className="px-6 py-4 font-semibold">Всего</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-xs text-black/40 dark:text-white/40">{asset.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-black/60 dark:text-white/60">{asset.sector}</td>
                    <td className="px-6 py-4 text-sm font-mono">{asset.quantity}</td>
                    <td className="px-6 py-4 text-sm font-mono">₽{asset.avg_price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-mono font-semibold">₽{(asset.quantity * asset.avg_price).toLocaleString()}</td>
                  </tr>
                ))}
                {assets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-black/40 dark:text-white/40 italic">
                      Портфель пока пуст. Добавьте свой первый актив.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Balance Constructor Placeholder */}
      <div className="bg-[#5A5A40] text-white p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Конструктор баланса</h3>
          <p className="text-white/70 max-w-md">
            Визуальная подсказка: у вас перекос в сектор {sectorData[0]?.name || '...'}. 
            Рекомендуем добавить активы из финансового сектора для диверсификации.
          </p>
        </div>
        <button className="px-8 py-4 bg-white text-[#5A5A40] rounded-2xl font-bold hover:bg-white/90 transition-colors">
          Оптимизировать
        </button>
      </div>

      {/* Add Asset Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151619] w-full max-w-md rounded-[32px] p-8 shadow-2xl text-black dark:text-white">
            <h3 className="text-2xl font-bold mb-6">Новый актив</h3>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Тип</label>
                <select 
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                  value={newAsset.type}
                  onChange={e => setNewAsset({...newAsset, type: e.target.value})}
                >
                  <option value="stock">Акция</option>
                  <option value="bond">Облигация</option>
                  <option value="fund">Фонд</option>
                  <option value="crypto">Крипто</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Тикер</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                    placeholder="GAZP"
                    required
                    value={newAsset.symbol}
                    onChange={e => setNewAsset({...newAsset, symbol: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Сектор</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                    placeholder="Энергетика"
                    required
                    value={newAsset.sector}
                    onChange={e => setNewAsset({...newAsset, sector: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Название</label>
                <input 
                  type="text" 
                  className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                  placeholder="Газпром"
                  required
                  value={newAsset.name}
                  onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Количество</label>
                  <input 
                    type="number" 
                    className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                    required
                    value={newAsset.quantity}
                    onChange={e => setNewAsset({...newAsset, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">Цена (ср.)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-[#F5F5F0] dark:bg-white/5"
                    required
                    value={newAsset.avg_price}
                    onChange={e => setNewAsset({...newAsset, avg_price: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#5A5A40] text-white font-medium hover:bg-[#4A4A30] transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
