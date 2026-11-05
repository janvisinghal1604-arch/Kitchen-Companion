import React from 'react';
import { useKitchen } from '../context/KitchenContext';
import { EmptyState } from '../components/common/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Award,
  Sparkles,
  BarChart3,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { consumptionLogs, stats } = useKitchen();

  const consumedLogs = consumptionLogs.filter((l: any) => l.action_type === 'consumed');
  const discardedLogs = consumptionLogs.filter((l: any) => l.action_type === 'discarded');

  const hasData = consumptionLogs.length > 0;

  // 1. Category-based Breakdown
  const categoryMap: Record<string, { consumed: number; discarded: number }> = {};
  for (const log of consumptionLogs) {
    const cat = log.category || 'Vegetables';
    if (!categoryMap[cat]) categoryMap[cat] = { consumed: 0, discarded: 0 };
    if (log.action_type === 'consumed') categoryMap[cat].consumed += 1;
    if (log.action_type === 'discarded') categoryMap[cat].discarded += 1;
  }

  const categoryChartData = Object.entries(categoryMap).map(([cat, data]) => ({
    name: cat,
    Consumed: data.consumed,
    Discarded: data.discarded
  }));

  // 2. Action distribution for Pie Chart
  const pieData = [
    { name: 'Consumed & Enjoyed', value: stats.totalConsumed, color: '#354637' }, // Deep Olive
    { name: 'Discarded (Learning)', value: stats.totalDiscarded, color: '#D96B4B' } // Tomato Accent
  ].filter((d) => d.value > 0);

  // 3. Weekly timeline
  const recentLogs = [...consumptionLogs].slice(0, 10);

  // 4. Frequent discarded items (for reflection)
  const discardFrequency: Record<string, number> = {};
  for (const log of discardedLogs) {
    discardFrequency[log.ingredient_name] = (discardFrequency[log.ingredient_name] || 0) + 1;
  }
  const topDiscarded = Object.entries(discardFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-editorial text-3xl md:text-4xl text-ink-primary font-normal leading-tight">
            Mindful Insights & Reflection
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cream-200 text-ink-primary border border-ink-border">
            Awareness
          </span>
        </div>
        <p className="text-xs md:text-sm text-ink-secondary mt-1 max-w-2xl leading-relaxed">
          Reflect on your household consumption patterns. No judgment, no guilt—just practical awareness
          to help your kitchen thrive.
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="Your kitchen is just getting started"
          description="Once you begin tracking ingredients and marking cooked meals, your consumption insights and financial savings will appear here."
        />
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-cream-300 shadow-soft">
              <span className="text-xs font-medium text-ink-secondary block">
                Food Value Saved
              </span>
              <div className="flex items-baseline gap-1 mt-1 text-sage-800">
                <span className="text-xl font-bold">₹</span>
                <span className="font-editorial text-3xl">{stats.foodValueSaved}</span>
              </div>
              <p className="text-[11px] text-sage-700 mt-2 font-medium">
                Saved by using food before expiration
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-cream-300 shadow-soft">
              <span className="text-xs font-medium text-ink-secondary block">
                Ingredients Consumed
              </span>
              <div className="flex items-baseline gap-1 mt-1 text-sage-900">
                <span className="font-editorial text-3xl">{stats.totalConsumed}</span>
                <span className="text-xs text-ink-secondary">items</span>
              </div>
              <p className="text-[11px] text-sage-700 mt-2 font-medium">
                {stats.totalConsumed > 0
                  ? `${Math.round((stats.totalConsumed / (stats.totalConsumed + stats.totalDiscarded || 1)) * 100)}% utilization rate`
                  : 'Starting out'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-cream-300 shadow-soft">
              <span className="text-xs font-medium text-ink-secondary block">
                Logged Discarded
              </span>
              <div className="flex items-baseline gap-1 mt-1 text-tomato-700">
                <span className="font-editorial text-3xl">{stats.totalDiscarded}</span>
                <span className="text-xs text-tomato-600">items</span>
              </div>
              <p className="text-[11px] text-ink-secondary mt-2">
                Valuable data points for better grocery planning
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-cream-300 shadow-soft">
              <span className="text-xs font-medium text-ink-secondary block">
                Mindful Kitchen Rhythm
              </span>
              <div className="flex items-baseline gap-1 mt-1 text-sage-800">
                <span className="font-editorial text-3xl">Active</span>
              </div>
              <p className="text-[11px] text-sage-700 mt-2 font-medium">
                Intentional meal cycles established
              </p>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Chart */}
            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft">
              <h3 className="font-editorial text-xl text-ink-primary font-normal mb-1">
                Category Consumption Breakdown
              </h3>
              <p className="text-xs text-ink-secondary mb-4">
                Comparison of consumed vs discarded ingredients by category.
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#77786F' }} interval={0} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#77786F' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E8E0D1',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="Consumed" fill="#354637" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Discarded" fill="#D96B4B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overall Ratio Pie Chart */}
            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft flex flex-col justify-between">
              <div>
                <h3 className="font-editorial text-xl text-ink-primary font-normal mb-1">
                  Consumption vs Discard Ratio
                </h3>
                <p className="text-xs text-ink-secondary mb-4">
                  Visual balance of kitchen food output.
                </p>

                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gentle Reflection Box */}
              <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 mt-2">
                <div className="flex items-start gap-2">
                  <HeartHandshake className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    <strong>Mindful Note:</strong> Food waste is never about blame. When an ingredient is
                    discarded, it gives you valuable signal on what not to overbuy during your next
                    grocery run.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Patterns & Frequent Discards Reflection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Items to Watch */}
            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft">
              <h3 className="font-editorial text-xl text-ink-primary font-normal mb-2">
                Produce Frequently Left Unused
              </h3>
              <p className="text-xs text-ink-secondary mb-4">
                Ingredients that struggled to be consumed before expiration:
              </p>

              {topDiscarded.length === 0 ? (
                <p className="text-xs text-sage-700 italic">No recurring discards logged. Great job!</p>
              ) : (
                <div className="space-y-2.5">
                  {topDiscarded.map(([name, count], idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-tomato-100 text-tomato-800 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-ink-primary">{name}</span>
                      </div>
                      <span className="text-ink-secondary">
                        Logged {count} {count === 1 ? 'time' : 'times'}
                      </span>
                    </div>
                  ))}
                  <p className="text-[11px] text-ink-secondary mt-2">
                    💡 Tip: Consider buying these in smaller portions or prioritizing them in recipes
                    on the day of purchase.
                  </p>
                </div>
              )}
            </div>

            {/* Recent History Stream */}
            <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft">
              <h3 className="font-editorial text-xl text-ink-primary font-normal mb-2">
                Recent Consumption Stream
              </h3>
              <p className="text-xs text-ink-secondary mb-4">
                Your latest kitchen actions and notes:
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {recentLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.action_type === 'consumed' ? 'bg-sage-600' : 'bg-tomato-500'
                          }`}
                        />
                        <span className="font-medium text-ink-primary">{log.ingredient_name}</span>
                        <span className="text-ink-secondary">
                          ({log.quantity} {log.unit})
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-ink-secondary italic mt-0.5 ml-3.5">
                          "{log.notes}"
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          log.action_type === 'consumed' ? 'text-sage-700' : 'text-tomato-600'
                        }`}
                      >
                        {log.action_type}
                      </span>
                      <span className="text-[10px] text-ink-muted block">{log.action_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
