import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface BarChartProps {
  data: { name: string; receitas: number; despesas: number }[];
}

export function BarChart({ data }: BarChartProps) {
  const textColor = '#9ca3af'; // Cor de text-gray-400 para os eixos

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
          <YAxis stroke={textColor} tick={{ fill: textColor }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#2d3748', 
              border: '1px solid #4a5568',
              borderRadius: '0.5rem'
            }} 
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />
          <Bar dataKey="receitas" fill="#82ca9d" name="Receitas" />
          <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
