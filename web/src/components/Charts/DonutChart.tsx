import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interface para definir o formato dos dados que o gráfico espera
interface DonutChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

// Cores para as fatias do gráfico
const COLORS = ['#00C49F', '#FF8042']; // Verde para Crédito, Laranja para Débito

export function DonutChart({ data }: DonutChartProps) {
  // Verifica se há dados com valor maior que zero para evitar renderizar um gráfico vazio
  const hasData = data.some(item => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[250px] bg-gray-800 rounded-lg">
        <p className="text-gray-500">Sem dados para exibir o gráfico.</p>
      </div>
    );
  }

  return (
    // ResponsiveContainer faz o gráfico se adaptar ao tamanho do contêiner pai
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60} // O raio interno cria o efeito "donut"
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
        >
        {data.map((_, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(value)
          }
          contentStyle={{
            background: '#2d3748',
            border: '1px solid #4a5568',
            borderRadius: '0.5rem',
          }}
        />
        <Legend wrapperStyle={{ bottom: 0 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
