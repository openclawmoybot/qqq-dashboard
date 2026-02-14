'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StockChart({ data }: { data: any[] }) {
  return (
    <div className="h-[400px] w-full bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF" 
            tickFormatter={(str) => {
              const date = new Date(str);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#9CA3AF" 
            tickFormatter={(number) => `$${number}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#60A5FA" 
            strokeWidth={2} 
            dot={false} 
            name="QQQ Price"
          />
          <Line 
            type="monotone" 
            dataKey="sma" 
            stroke="#F59E0B" 
            strokeWidth={2} 
            dot={false} 
            strokeDasharray="5 5" 
            name="30-Week SMA"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
