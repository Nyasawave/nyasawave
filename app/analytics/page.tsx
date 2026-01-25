"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useMemo } from "react";
import styles from "./analytics.module.css";

const generateMockStats = () => ({
  totalStreams: Math.floor(Math.random() * 1000000),
  monthlyListeners: Math.floor(Math.random() * 100000),
  followers: Math.floor(Math.random() * 50000),
  revenue: Math.floor(Math.random() * 50000),
  topSong: "Malawi Dreams",
  engagementRate: (Math.random() * 8 + 2).toFixed(2),
});

const generateChartData = () => [
  { day: "Mon", streams: Math.floor(Math.random() * 5000) },
  { day: "Tue", streams: Math.floor(Math.random() * 5000) },
  { day: "Wed", streams: Math.floor(Math.random() * 5000) },
  { day: "Thu", streams: Math.floor(Math.random() * 5000) },
  { day: "Fri", streams: Math.floor(Math.random() * 5000) },
  { day: "Sat", streams: Math.floor(Math.random() * 5000) },
  { day: "Sun", streams: Math.floor(Math.random() * 5000) },
];

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");

  const mockStats = useMemo(() => generateMockStats(), []);
  const chartData = useMemo(() => generateChartData(), []);

  if (!user || !user.roles?.includes("ARTIST")) {
    return (
      <main className="min-h-screen p-6 pt-32 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Artist Analytics</h1>
        <p className="text-zinc-400 mt-3">Only artists can view analytics. Please sign in with an artist account.</p>
        <Link href="/signin" className="mt-6 inline-block bg-emerald-400 text-black px-4 py-2 rounded">Sign in</Link>
      </main>
    );
  }

  const demographics = [
    { region: "Malawi", percentage: 45 },
    { region: "South Africa", percentage: 25 },
    { region: "Tanzania", percentage: 15 },
    { region: "Kenya", percentage: 10 },
    { region: "Other Africa", percentage: 5 },
  ];

  return (
    <main className="min-h-screen p-6 pt-32 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Analytics</h1>
          <p className="text-zinc-400">Track your performance and grow your audience.</p>
        </div>
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded capitalize ${timeframe === period ? "bg-emerald-400 text-black" : "bg-zinc-800 text-zinc-300"}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KEY METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-zinc-400 text-sm mb-2">Total Streams</p>
          <p className="text-3xl font-bold text-emerald-400">{mockStats.totalStreams.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-1">+12% vs last period</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-zinc-400 text-sm mb-2">Monthly Listeners</p>
          <p className="text-3xl font-bold">{mockStats.monthlyListeners.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-1">+8% vs last period</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-zinc-400 text-sm mb-2">Followers</p>
          <p className="text-3xl font-bold">{mockStats.followers.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-1">+5% vs last period</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-zinc-400 text-sm mb-2">Revenue</p>
          <p className="text-3xl font-bold text-amber-400">MWK {mockStats.revenue.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-1">+15% vs last period</p>
        </div>
      </section>

      {/* STREAMS CHART */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Streams Over Time</h2>
        <div className="flex items-end justify-around h-40 gap-2">
          {chartData.map((data) => {
            const maxStreams = Math.max(...chartData.map((d) => d.streams));
            const heightPx = Math.round((data.streams / maxStreams) * 300);
            // Map computed height to nearest defined CSS class (50,100,...,300)
            let nearest = Math.round(heightPx / 50) * 50;
            nearest = Math.min(300, Math.max(50, nearest));
            const barClass = `${styles.bar} ${styles[`bar${nearest}`]}`;
            return (
              <div key={data.day} className="flex flex-col items-center">
                <div className={barClass}></div>
                <p className="text-xs text-zinc-400 mt-2">{data.day}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LISTENER DEMOGRAPHICS */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Listener Demographics</h2>
          <div className="space-y-3">
            {demographics.map((demo) => {
              // demographics percentages correspond to available progress classes (5,10,...,100)
              const pctStep = Math.round(demo.percentage / 5) * 5;
              const progressClassName = `${styles.progress} ${styles[`progress${pctStep}`]}`;
              return (
                <div key={demo.region}>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm">{demo.region}</p>
                    <p className="text-sm text-zinc-400">{demo.percentage}%</p>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={progressClassName}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TOP PERFORMERS */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Highlights</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Top Track</p>
              <p className="font-semibold">{mockStats.topSong}</p>
              <p className="text-xs text-zinc-500">42,500 streams</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-1">Engagement Rate</p>
              <p className="font-semibold">{mockStats.engagementRate}%</p>
              <p className="text-xs text-zinc-500">Likes + shares per stream</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-1">Avg. Listeners Per Track</p>
              <p className="font-semibold">{Math.floor(mockStats.totalStreams / 8).toLocaleString()}</p>
              <p className="text-xs text-zinc-500">Across your catalog</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
