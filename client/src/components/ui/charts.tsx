import React, { ReactNode } from 'react';
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip as RTooltip, BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart as RLineChart, Line, AreaChart as RAreaChart, Area } from 'recharts';

const COLORS = [
  '#0088FE', // Blue
  '#00C49F', // Teal
  '#FFBB28', // Yellow
  '#FF8042', // Orange
  '#8884D8', // Purple
  '#FF6B6B', // Red
  '#4CAF50', // Green
  '#9C27B0', // Deep Purple
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

type ChartData = Array<{
  name: string;
  value: number;
  [key: string]: any;
}>;

type ChartContainerProps = {
  children: ReactNode;
  className?: string;
  height?: number | string;
};

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
  className = '', 
  height = 300 
}) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

type PieChartProps = {
  data: ChartData;
  dataKey?: string;
  nameKey?: string;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  colors?: string[];
  tooltip?: boolean;
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  dataKey = 'value',
  nameKey = 'name',
  innerRadius = 0,
  outerRadius = '80%',
  paddingAngle = 2,
  colors = COLORS,
  tooltip = true,
}) => {
  return (
    <RPieChart>
      {tooltip && <RTooltip formatter={(value, name) => [`${value}`, name]} />}
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        paddingAngle={paddingAngle}
        fill="#8884d8"
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
    </RPieChart>
  );
};

type BarChartProps = {
  data: ChartData;
  dataKey?: string;
  barSize?: number;
  colors?: string[];
  tooltip?: boolean;
  grid?: boolean;
  legend?: boolean;
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  dataKey = 'value',
  barSize = 20,
  colors = COLORS,
  tooltip = true,
  grid = true,
  legend = false,
}) => {
  return (
    <RBarChart
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      {grid && <CartesianGrid strokeDasharray="3 3" />}
      <XAxis dataKey="name" />
      <YAxis />
      {tooltip && <RTooltip formatter={(value) => [`${value}`, 'Value']} />}
      {legend && <Legend />}
      <Bar dataKey={dataKey} fill={colors[0]} barSize={barSize}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Bar>
    </RBarChart>
  );
};

type LineChartProps = {
  data: ChartData;
  dataKey?: string;
  colors?: string[];
  tooltip?: boolean;
  grid?: boolean;
  legend?: boolean;
};

export const LineChart: React.FC<LineChartProps> = ({
  data,
  dataKey = 'value',
  colors = COLORS,
  tooltip = true,
  grid = true,
  legend = false,
}) => {
  return (
    <RLineChart
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      {grid && <CartesianGrid strokeDasharray="3 3" />}
      <XAxis dataKey="name" />
      <YAxis />
      {tooltip && <RTooltip formatter={(value) => [`${value}`, 'Value']} />}
      {legend && <Legend />}
      <Line type="monotone" dataKey={dataKey} stroke={colors[0]} activeDot={{ r: 8 }} />
    </RLineChart>
  );
};

type AreaChartProps = {
  data: ChartData;
  dataKey?: string;
  colors?: string[];
  tooltip?: boolean;
  grid?: boolean;
  legend?: boolean;
};

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  dataKey = 'value',
  colors = COLORS,
  tooltip = true,
  grid = true,
  legend = false,
}) => {
  return (
    <RAreaChart
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      {grid && <CartesianGrid strokeDasharray="3 3" />}
      <XAxis dataKey="name" />
      <YAxis />
      {tooltip && <RTooltip formatter={(value) => [`${value}`, 'Value']} />}
      {legend && <Legend />}
      <Area type="monotone" dataKey={dataKey} stroke={colors[0]} fill={colors[0]} />
    </RAreaChart>
  );
};