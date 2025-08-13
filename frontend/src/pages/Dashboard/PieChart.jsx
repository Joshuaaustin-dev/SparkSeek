import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  getComputedStyle(document.documentElement).getPropertyValue('--color-tertiary')?.trim() || '#5fa8d3',
  getComputedStyle(document.documentElement).getPropertyValue('--color-accent')?.trim() || '#e4572e',
  getComputedStyle(document.documentElement).getPropertyValue('--color-secondary')?.trim() || '#c6dff1',
  '#7cb6d9',
  '#a8d1ea',
  '#4f96c0',
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  payload,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      fontWeight="bold"
    >
      {payload.count}
    </text>
  );
};

const PieChartComponent = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="stage"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={renderCustomizedLabel}
          labelLine={false} // hides the line connecting label to slice
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} applications`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
