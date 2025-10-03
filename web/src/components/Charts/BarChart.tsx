import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BarChartProps {
  data: {
    name: string; // "YYYY-MM"
    Créditos: number;
    Débitos: number;
  }[];
}

export function BarChart({ data }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[250px] bg-gray-800 rounded-lg">
        <p className="text-gray-500">Sem dados para exibir o gráfico mensal.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis
          dataKey="name"
          tickFormatter={(tick) => format(new Date(`${tick}-02`), 'MMM/yy', { locale: ptBR })}
          stroke="#A0AEC0"
        />
        <YAxis
          stroke="#A0AEC0"
          tickFormatter={(value) =>
            new Intl.NumberFormat('pt-BR', {
              notation: 'compact',
              compactDisplay: 'short',
            }).format(value)
          }
        />
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
          labelFormatter={(label) => format(new Date(`${label}-02`), 'MMMM yyyy', { locale: ptBR })}
        />
        <Legend wrapperStyle={{ bottom: -5 }} />
        <Bar dataKey="Créditos" fill="#00C49F" />
        <Bar dataKey="Débitos" fill="#FF8042" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
