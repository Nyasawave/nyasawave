'use client';

import styles from './ArtistStats.module.css';

export default function ArtistStats() {
  const chartValues = [45, 52, 38, 61, 55, 48, 72];

  // Phase 7.1: AI-Generated Insights
  const insights = [
    {
      type: 'recommendation',
      title: 'Best Release Day',
      message: 'Your tracks perform 23% better when released on Fridays',
      icon: '📅',
    },
    {
      type: 'opportunity',
      title: 'Emerging Trend',
      message: 'Afrobeats + Hip-Hop blend is trending. Your sound matches this perfectly',
      icon: '🎯',
    },
    {
      type: 'growth',
      title: 'Growth Prediction',
      message: 'At current growth rate, you\'ll reach 10K listeners in 6 weeks',
      icon: '📈',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h3 className="text-xl font-bold mb-6">Your Analytics</h3>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-800/50 rounded p-4">
            <p className="text-zinc-400 text-sm">Total Streams</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">2,142</p>
            <p className="text-xs text-emerald-300 mt-2">↑ 12% from last month</p>
          </div>

          <div className="bg-zinc-800/50 rounded p-4">
            <p className="text-zinc-400 text-sm">Most Played</p>
            <p className="font-semibold mt-2">Nyasa Vibes</p>
            <p className="text-xs text-zinc-400 mt-1">1,250 streams</p>
          </div>

          <div className="bg-zinc-800/50 rounded p-4">
            <p className="text-zinc-400 text-sm">Growth</p>
            <p className="text-3xl font-bold text-pink-400 mt-2">↑ 24%</p>
            <p className="text-xs text-pink-300 mt-2">Monthly growth</p>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="bg-zinc-800/30 rounded p-4">
          <p className="text-sm text-zinc-400 mb-3">Last 7 Days</p>
          <div className="flex items-end gap-2 h-20">
            {chartValues.map((value, idx) => {
              const barClassName = `${styles.bar} ${styles[`bar${value}`]}`;
              return (
                <div
                  key={idx}
                  className={barClassName}
                  aria-label={`${value} plays on day ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase 7.1: AI Insights Section */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-900/10 rounded-lg p-6 border border-emerald-600/30">
        <h3 className="text-xl font-bold mb-4 text-emerald-300">🤖 AI Insights</h3>
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-emerald-900/20 rounded p-4 border border-emerald-600/20">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{insight.title}</p>
                  <p className="text-xs text-zinc-300 mt-1">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Breakdown (Phase 7.2) */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h3 className="text-xl font-bold mb-4">Revenue Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
            <span className="text-sm">Streams</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-zinc-700 rounded h-2">
                <div className="bg-emerald-500 h-2 rounded w-[45%]"></div>
              </div>
              <span className="text-sm font-semibold">MWK 15,200</span>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
            <span className="text-sm">Subscriptions</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-zinc-700 rounded h-2">
                <div className="bg-blue-500 h-2 rounded w-[35%]"></div>
              </div>
              <span className="text-sm font-semibold">MWK 8,500</span>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
            <span className="text-sm">Licensing</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-zinc-700 rounded h-2">
                <div className="bg-purple-500 h-2 rounded w-[20%]"></div>
              </div>
              <span className="text-sm font-semibold">MWK 2,300</span>
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-700 flex justify-between items-center">
            <span className="font-semibold">Total This Month</span>
            <span className="text-emerald-400 font-bold">MWK 26,000</span>
          </div>
        </div>
      </div>

      {/* Recommendations for Growth (Phase 6.1) */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h3 className="text-xl font-bold mb-4">Recommendations</h3>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">✓</span>
            <span>Post consistently on Fridays - your best performing day</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">✓</span>
            <span>Collaborate with artists in Hip-Hop genre (growing audience segment)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">✓</span>
            <span>Boost your "Nyasa Vibes" track - it has highest engagement potential</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">✓</span>
            <span>South Africa is your second largest market - create region-specific content</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
