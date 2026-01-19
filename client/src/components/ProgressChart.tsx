import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import type { WorkoutLog } from '@shared/schema';

interface ProgressChartProps {
  logs: WorkoutLog[];
}

export function ProgressChart({ logs }: ProgressChartProps) {
  const data = useMemo(() => {
    // Generate last 7 days empty structure
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        date: format(d, 'MMM dd'),
        fullDate: format(d, 'yyyy-MM-dd'),
        duration: 0
      };
    });

    // Fill in real data
    logs.forEach(log => {
      const day = last7Days.find(d => d.fullDate === log.date);
      if (day) {
        day.duration += log.duration;
      }
    });

    return last7Days;
  }, [logs]);

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--hero))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--hero))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="duration" 
            stroke="hsl(var(--hero))" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorDuration)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
