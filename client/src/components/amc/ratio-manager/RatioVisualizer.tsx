import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ratio } from './RatioManagerProvider';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

interface RatioVisualizerProps {
  ratio: Ratio;
  entities: any[];
}

export const RatioVisualizer: React.FC<RatioVisualizerProps> = ({
  ratio,
  entities
}) => {
  // Calculate percentage of each entity in the ratio
  const entityData = useMemo(() => {
    const totalValue = Object.values(ratio.entityValues).reduce((sum, val) => sum + val, 0);
    
    return entities.map(entity => {
      const value = ratio.entityValues[entity.id] || 0;
      const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
      
      return {
        id: entity.id,
        name: entity.name,
        value,
        percentage,
        color: generateEntityColor(entity.id)
      };
    }).filter(entity => entity.value > 0);
  }, [ratio, entities]);

  // Generate a color based on entity ID (for visualization)
  function generateEntityColor(id: string) {
    // Simple hash function to convert entity ID to a color
    const hash = String(id).split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Convert to HSL color with good saturation and lightness
    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  // Format for chart tooltips
  const formatTooltip = (value: number, name: string, props: any) => {
    return [`${value.toFixed(2)} (${props.payload.percentage.toFixed(2)}%)`, name];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{ratio.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{ratio.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pie chart visualization */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={entityData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                >
                  {entityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar visualization */}
          <div className="space-y-4">
            {entityData.map(entity => (
              <div key={entity.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{entity.name}</span>
                  <span>{entity.value.toFixed(2)} ({entity.percentage.toFixed(2)}%)</span>
                </div>
                <Progress 
                  value={entity.percentage} 
                  className="h-2" 
                  style={{ 
                    backgroundColor: `${entity.color}40`
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed data table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Raw Value</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entityData.map(entity => (
              <TableRow key={entity.id}>
                <TableCell className="font-medium">{entity.name}</TableCell>
                <TableCell>{entity.value.toFixed(2)}</TableCell>
                <TableCell className="text-right">{entity.percentage.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RatioVisualizer;