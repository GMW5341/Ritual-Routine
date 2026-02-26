'use client';

import { PeriodStats } from '@/lib/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  data: PeriodStats[];
  height?: number;
}

export default function TrendChart({ data, height = 120 }: Props) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30,35,48,0.95)',
            border: '1px solid rgba(52,211,153,0.12)',
            borderRadius: '8px',
            color: '#d0cdc8',
            fontSize: '12px',
          }}
          formatter={(value: number | undefined) => [`${value ?? 0}%`, '달성률']}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#colorRate)"
          dot={{ fill: '#34d399', r: 2 }}
          activeDot={{ r: 4, fill: '#34d399' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
