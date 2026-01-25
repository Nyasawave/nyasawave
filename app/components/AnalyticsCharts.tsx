'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface EarningsChartProps {
    data: Array<{ month: string; earnings: { MWK: number; USD: number }; streams: number }>;
}

export function EarningsChart({ data }: EarningsChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => `MWK ${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="earnings.MWK"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    name="Earnings (MWK)"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

interface StreamsChartProps {
    data: Array<{ month: string; streams: number; earnings?: { MWK: number } }>;
}

export function StreamsChart({ data }: StreamsChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => value.toLocaleString()}
                />
                <Legend />
                <Bar dataKey="streams" fill="#3b82f6" name="Total Streams" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

interface DistrictChartProps {
    data: Array<{ district: string; streams: number; percentage: number }>;
}

export function DistrictChart({ data }: DistrictChartProps) {
    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ district, percentage }) => `${district} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="streams"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => value.toLocaleString()}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

interface AgeChartProps {
    data: Array<{ range: string; listeners: number; percentage: number }>;
}

export function AgeGroupChart({ data }: AgeChartProps) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="range" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="listeners" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
