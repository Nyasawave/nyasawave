import { Zap, Target, BarChart3 } from "lucide-react";

interface FeatureCardProps {
  icon: "zap" | "target" | "chart";
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const icons = {
    zap: <Zap size={24} />,
    target: <Target size={24} />,
    chart: <BarChart3 size={24} />,
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center hover:border-emerald-400 transition">
      <div className="inline-block p-3 rounded-full bg-emerald-400/10 text-emerald-400 mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}
