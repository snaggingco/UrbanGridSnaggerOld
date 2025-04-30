import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye, 
  Info,
  AlertCircle,
  PercentSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Entity, Ratio } from '@shared/ratio-types';
import { getRatioTypeDisplayName } from '../ratio-utils';

export interface RatioTableColumn {
  name: string;
  key: string;
  width?: string;
  renderHeader?: () => React.ReactNode;
  renderCell?: (ratio: Ratio, entities: Entity[]) => React.ReactNode;
}

export interface RatioTableProps {
  ratios: Ratio[];
  entities: Entity[];
  columns: RatioTableColumn[];
  onEdit?: (ratio: Ratio) => void;
  onDelete?: (ratio: Ratio) => void;
  onView?: (ratio: Ratio) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  showPercentages?: boolean;
  showActualValues?: boolean;
}

/**
 * RatioTable - A reusable component for displaying ratio information
 * 
 * This component is designed to display any type of ratio data (core ratios,
 * derived ratios, or special area modifications) in a consistent table format.
 */
export function RatioTable({
  ratios,
  entities,
  columns,
  onEdit,
  onDelete,
  onView,
  emptyMessage = "No ratios found",
  isLoading = false,
  showPercentages = true,
  showActualValues = false,
}: RatioTableProps) {
  // Calculate ratio distribution for percentage display
  const calculateDistribution = (ratio: Ratio) => {
    if (!ratio.entityValues) return {};
    
    const totalValue = Object.values(ratio.entityValues).reduce(
      (sum, value) => sum + (value as number), 
      0
    );
    
    const distribution: Record<number, number> = {};
    
    entities.forEach(entity => {
      const value = ratio.entityValues?.[entity.id] || 0;
      distribution[entity.id] = totalValue > 0 ? (value * 100) / totalValue : 0;
    });
    
    return distribution;
  };
  
  // Render cell content for entity columns
  const renderEntityCell = (ratio: Ratio, entityId: number) => {
    if (!ratio.entityValues) return "-";
    
    const entityValue = ratio.entityValues[entityId] || 0;
    const distribution = calculateDistribution(ratio);
    const percentage = distribution[entityId] || 0;
    
    return (
      <div className="flex flex-col">
        {showActualValues && (
          <span className="font-medium">{entityValue.toLocaleString()}</span>
        )}
        {showPercentages && (
          <span className={`text-xs ${showActualValues ? 'text-muted-foreground' : 'font-medium'}`}>
            {percentage.toFixed(2)}%
          </span>
        )}
      </div>
    );
  };
  
  // Render actions column
  const renderActionsCell = (ratio: Ratio) => {
    return (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(ratio)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(ratio)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Ratio
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(ratio)}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Ratio
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  
  // Default renderers for common columns
  const defaultRenderers = {
    name: (ratio: Ratio) => (
      <div>
        <div className="font-medium">{ratio.name}</div>
        <div className="text-xs text-muted-foreground">{ratio.description}</div>
      </div>
    ),
    type: (ratio: Ratio) => (
      <Badge variant="outline">
        {getRatioTypeDisplayName(ratio.ratioType)}
      </Badge>
    ),
    source: (ratio: Ratio) => {
      if (!('sourceRatioId' in ratio) || !ratio.sourceRatioId) return "Base Ratio";
      
      const sourceName = ratios.find(r => r.id === ratio.sourceRatioId)?.name || "Unknown";
      return (
        <div className="flex items-center">
          <span>{sourceName}</span>
        </div>
      );
    },
    distribution: (ratio: Ratio) => {
      const distribution = calculateDistribution(ratio);
      
      // Find min and max values for visual indicators
      const values = entities.map(e => distribution[e.id] || 0);
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      return (
        <div className="flex items-center space-x-1">
          {entities.map(entity => {
            const value = distribution[entity.id] || 0;
            // Calculate color based on value (max is green, min is blue, others are neutral)
            let color = "bg-gray-200";
            if (value === max && max > min) color = "bg-green-200";
            if (value === min && max > min) color = "bg-blue-200";
            
            return (
              <Tooltip key={entity.id}>
                <TooltipTrigger asChild>
                  <div 
                    className={`h-6 rounded-sm ${color}`}
                    style={{ 
                      width: `${Math.max(value, 1)}%`,
                      minWidth: '4px'
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{entity.name}: {value.toFixed(2)}%</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      );
    },
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead 
                key={column.key} 
                className={column.width ? `w-[${column.width}]` : undefined}
              >
                {column.renderHeader ? column.renderHeader() : column.name}
              </TableHead>
            ))}
            
            {/* Entity headers */}
            {entities.map(entity => (
              <TableHead key={entity.id} className="text-center">
                {entity.name}
              </TableHead>
            ))}
            
            {/* Actions column */}
            {(onEdit || onDelete || onView) && (
              <TableHead className="w-[60px]"></TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + entities.length + 1} 
                className="text-center h-24"
              >
                Loading ratios...
              </TableCell>
            </TableRow>
          ) : ratios.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + entities.length + 1} 
                className="text-center h-24 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            ratios.map(ratio => (
              <TableRow key={ratio.id}>
                {/* Custom columns */}
                {columns.map(column => (
                  <TableCell key={column.key}>
                    {column.renderCell 
                      ? column.renderCell(ratio, entities)
                      : defaultRenderers[column.key as keyof typeof defaultRenderers]
                        ? defaultRenderers[column.key as keyof typeof defaultRenderers](ratio)
                        : ratio[column.key as keyof Ratio]?.toString() || '-'
                    }
                  </TableCell>
                ))}
                
                {/* Entity values */}
                {entities.map(entity => (
                  <TableCell key={entity.id} className="text-center">
                    {renderEntityCell(ratio, entity.id)}
                  </TableCell>
                ))}
                
                {/* Actions */}
                {(onEdit || onDelete || onView) && (
                  <TableCell>
                    {renderActionsCell(ratio)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}