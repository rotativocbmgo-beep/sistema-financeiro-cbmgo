import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

interface DonutChartProps {
  data: { name: string; value: number }[];
}

export function DonutChart({ data }: DonutChartProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#2d3748', // Cor de fundo escura
              border: '1px solid #4a5568', // Borda sutil
              borderRadius: '0.5rem'
            }} 
          />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
