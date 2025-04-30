import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  PercentSquare,
  ArrowDownRight,
  Settings
} from "lucide-react";
import { Entity, Ratio, SharedArea, SpecialAreaModification, isDerivedRatio } from '@shared/ratio-types';
import { RatioTable, RatioTableColumn } from './ratio-manager/RatioTable';
import { getRatioTypeDisplayName } from './ratio-utils';

export interface UnifiedRatioManagerProps {
  entities: Entity[];
  allRatios: Ratio[];
  sharedAreas: SharedArea[];
  entityModifications: SpecialAreaModification[];
  onCreateRatio?: () => void;
  onEditRatio?: (ratio: Ratio) => void;
  onDeleteRatio?: (ratio: Ratio) => void;
  onEditSpecialAreaMod?: (mod: SpecialAreaModification) => void;
  isLoading?: boolean;
}

/**
 * UnifiedRatioManager - A component for managing all types of ratios in a unified interface
 * 
 * This component presents a tabbed interface for managing different types of ratios:
 * 1. Core Ratios - Basic ratios like Sellable Area, Common Area, etc.
 * 2. Derived Ratios - Ratios derived from core ratios
 * 3. Special Area Modifications - Adjustments to ratio values based on shared area allocations
 */
export function UnifiedRatioManager({
  entities,
  allRatios,
  sharedAreas,
  entityModifications,
  onCreateRatio,
  onEditRatio,
  onDeleteRatio,
  onEditSpecialAreaMod,
  isLoading = false,
}: UnifiedRatioManagerProps) {
  const [activeTab, setActiveTab] = useState("core");
  
  // Filter ratios by type
  const coreRatios = allRatios.filter(r => !isDerivedRatio(r));
  const derivedRatios = allRatios.filter(r => isDerivedRatio(r));
  
  // Columns definition for Core Ratios
  const coreRatioColumns: RatioTableColumn[] = [
    { 
      name: "Ratio Name", 
      key: "name", 
      width: "300px" 
    },
    { 
      name: "Type", 
      key: "type", 
      width: "150px",
      renderCell: (ratio) => (
        <Badge variant="outline">
          {getRatioTypeDisplayName(ratio.ratioType)}
        </Badge>
      )
    },
    {
      name: "Distribution",
      key: "distribution",
      width: "180px"
    }
  ];
  
  // Columns definition for Derived Ratios
  const derivedRatioColumns: RatioTableColumn[] = [
    { 
      name: "Ratio Name", 
      key: "name", 
      width: "250px" 
    },
    { 
      name: "Source Ratio", 
      key: "source", 
      width: "180px" 
    },
    {
      name: "Distribution",
      key: "distribution",
      width: "180px"
    }
  ];
  
  // Columns definition for Special Area Modifications
  const specialAreaColumns: RatioTableColumn[] = [
    { 
      name: "Ratio Name", 
      key: "name", 
      width: "250px",
      renderCell: (ratio, entities) => {
        // Find the associated modification for this ratio
        const mod = entityModifications.find(m => m.ratioId === ratio.id);
        if (!mod) return ratio.name;
        
        return (
          <div>
            <div className="font-medium">{ratio.name}</div>
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <Badge variant="outline" className="mr-1">Modified</Badge>
              {mod.excludedSpecialAreas && mod.excludedSpecialAreas.length > 0 && (
                <span className="text-red-500 text-xs mr-1">
                  -{mod.excludedSpecialAreas.length} areas
                </span>
              )}
              {mod.addedSpecialAreas && mod.addedSpecialAreas.length > 0 && (
                <span className="text-green-500 text-xs">
                  +{mod.addedSpecialAreas.length} areas
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    { 
      name: "Type", 
      key: "type", 
      width: "150px" 
    },
    {
      name: "Modifications",
      key: "modifications",
      width: "280px",
      renderCell: (ratio) => {
        // Find the associated modification for this ratio
        const mod = entityModifications.find(m => m.ratioId === ratio.id);
        if (!mod) return "No modifications";
        
        const excludedCount = mod.excludedSpecialAreas?.length || 0;
        const addedCount = mod.addedSpecialAreas?.length || 0;
        
        // If no modifications, show default message
        if (excludedCount === 0 && addedCount === 0) {
          return "No modifications";
        }
        
        // Collect area names for tooltip
        const excludedAreas = mod.excludedSpecialAreas?.map((areaId: number) => {
          const area = sharedAreas.find(a => a.id === areaId);
          return area?.name || `Area #${areaId}`;
        }) || [];
        
        const addedAreas = mod.addedSpecialAreas?.map((areaId: number) => {
          const area = sharedAreas.find(a => a.id === areaId);
          return area?.name || `Area #${areaId}`;
        }) || [];
        
        return (
          <div className="text-sm">
            {excludedCount > 0 && (
              <div className="flex items-center text-red-600 mb-1">
                <span className="mr-1">Excluded:</span>
                {excludedAreas.slice(0, 2).join(", ")}
                {excludedCount > 2 && ` +${excludedCount - 2} more`}
              </div>
            )}
            {addedCount > 0 && (
              <div className="flex items-center text-green-600">
                <span className="mr-1">Added:</span>
                {addedAreas.slice(0, 2).join(", ")}
                {addedCount > 2 && ` +${addedCount - 2} more`}
              </div>
            )}
          </div>
        );
      }
    }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Ratio Management</CardTitle>
            <CardDescription>
              Manage allocation ratios for entities and special areas
            </CardDescription>
          </div>
          {onCreateRatio && (
            <Button onClick={onCreateRatio}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Ratio
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 w-[450px]">
            <TabsTrigger value="core" className="flex items-center">
              <PercentSquare className="h-4 w-4 mr-2" />
              Core Ratios
            </TabsTrigger>
            <TabsTrigger value="derived" className="flex items-center">
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Derived Ratios
            </TabsTrigger>
            <TabsTrigger value="special" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Special Areas
            </TabsTrigger>
          </TabsList>
          
          {/* Core Ratios Tab */}
          <TabsContent value="core" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Core ratios define the basic distribution of costs between entities based on different metrics.
            </div>
            
            <RatioTable
              ratios={coreRatios}
              entities={entities}
              columns={coreRatioColumns}
              onEdit={onEditRatio}
              onDelete={onDeleteRatio}
              emptyMessage="No core ratios defined. Create a new ratio to get started."
              isLoading={isLoading}
              showPercentages={true}
              showActualValues={false}
            />
          </TabsContent>
          
          {/* Derived Ratios Tab */}
          <TabsContent value="derived" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Derived ratios are calculated from existing core ratios using various formulas and adjustments.
            </div>
            
            <RatioTable
              ratios={derivedRatios}
              entities={entities}
              columns={derivedRatioColumns}
              onEdit={onEditRatio}
              onDelete={onDeleteRatio}
              emptyMessage="No derived ratios defined. Create a derived ratio from existing core ratios."
              isLoading={isLoading}
              showPercentages={true}
              showActualValues={false}
            />
          </TabsContent>
          
          {/* Special Area Modifications Tab */}
          <TabsContent value="special" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Special area modifications allow you to adjust how shared areas are included or excluded from ratio calculations.
            </div>
            
            <RatioTable
              ratios={allRatios}
              entities={entities}
              columns={specialAreaColumns}
              onEdit={(ratio) => {
                const mod = entityModifications.find(m => m.ratioId === ratio.id);
                if (mod && onEditSpecialAreaMod) {
                  onEditSpecialAreaMod(mod);
                } else if (onEditRatio) {
                  onEditRatio(ratio);
                }
              }}
              emptyMessage="No ratios available for special area modifications."
              isLoading={isLoading}
              showPercentages={true}
              showActualValues={false}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}