
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  color?: string;
}

export function ChartCard({ title, data, color = "#10B981" }: ChartCardProps) {
  return (
    <Card className="p-6">
      <h3 className="font-medium text-gray-800 mb-4">{title}</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#gradient-${title})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
