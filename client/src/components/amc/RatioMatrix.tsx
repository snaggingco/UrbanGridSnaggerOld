import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Filter,
  Search,
  AlertCircle,
  PercentSquare,
  ArrowDownRight,
  Settings,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Entity,
  Ratio,
  DerivedRatio,
  CombinationRatio,
  EntityModification,
  SpecialAreaModification,
  isDerivedRatio
} from '@shared/ratio-types';
import { RatioTable, RatioTableColumn } from './ratio-manager/RatioTable';
import { formatRatioType } from './ratio-utils';


interface RatioMatrixProps {
  entities: Entity[];
  ratios: Ratio[];
  specialAreas?: any[];
  unitType: 'sqm' | 'sqft';
  onSaveRatio?: (ratio: Ratio) => void;
  onDeleteRatio?: (ratioId: number) => void;
}

// Helper type guard for checking entityModifications
const hasEntityModifications = (ratio: Ratio): ratio is DerivedRatio => {
  return 'entityModifications' in ratio && Array.isArray((ratio as any).entityModifications);
};

export function RatioMatrix({
  entities,
  ratios,
  specialAreas = [],
  unitType,
  onSaveRatio,
  onDeleteRatio
}: RatioMatrixProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRatioType, setSelectedRatioType] = useState<string | null>(null);
  const [viewCalculationRatioId, setViewCalculationRatioId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("core");
  
  // Filter ratios based on search term and ratio type
  const filteredRatios = ratios.filter(ratio => {
    const matchesSearch = searchTerm === '' || 
      ratio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ratio.description && ratio.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !selectedRatioType || (ratio.ratioType && ratio.ratioType === selectedRatioType);
    
    return matchesSearch && matchesType;
  });

  // Get all available ratio types (filter out undefined)
  const ratioTypes = Array.from(new Set(ratios.map(r => r.ratioType).filter(Boolean) as string[]));
  
  // Determine if a ratio is a special area modification
  const isSpecialAreaModification = (ratio: Ratio): boolean => {
    if (!hasEntityModifications(ratio)) return false;
    
    return ratio.entityModifications.some(
      (mod) => 
        (mod.excludedSpecialAreas && mod.excludedSpecialAreas.length > 0) || 
        (mod.addedSpecialAreas && mod.addedSpecialAreas.length > 0)
    );
  };



  // Filter ratios by type
  const coreRatios = filteredRatios.filter(r => !isDerivedRatio(r) && !isSpecialAreaModification(r));
  const derivedRatios = filteredRatios.filter(r => isDerivedRatio(r) && !isSpecialAreaModification(r));
  const specialAreaRatios = filteredRatios.filter(r => isSpecialAreaModification(r));
  
  // Create fake entity modifications for display (since we don't have actual modification tracking yet)
  const entityModifications: SpecialAreaModification[] = specialAreaRatios
    .map(ratio => {
      if (!hasEntityModifications(ratio)) return null;
      
      const mods = ratio.entityModifications.flatMap(mod => {
        return {
          id: Math.random() * 1000, // Temporary ID
          ratioId: ratio.id,
          ratioName: ratio.name,
          excludedSpecialAreas: mod.excludedSpecialAreas || [],
          addedSpecialAreas: mod.addedSpecialAreas || []
        };
      });
      
      return mods[0] || null;
    })
    .filter(Boolean) as SpecialAreaModification[];
  
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
          {formatRatioType(ratio.ratioType)}
        </Badge>
      )
    },
    {
      name: "Distribution",
      key: "distribution",
      width: "180px",
      renderCell: (ratio) => (
        <Badge className="bg-blue-100 text-blue-800">
          {Object.values(ratio.entityValues || {}).reduce(
            (sum: number, val: any) => sum + (Number(val) || 0), 0
          ).toLocaleString()} {unitType}
        </Badge>
      )
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
      name: "Type", 
      key: "type", 
      width: "180px",
      renderCell: (ratio) => (
        <Badge variant="outline">
          {formatRatioType(ratio.ratioType)}
        </Badge>
      )
    },
    {
      name: "Distribution",
      key: "distribution",
      width: "180px",
      renderCell: (ratio) => (
        <Badge className="bg-blue-100 text-blue-800">
          {Object.values(ratio.entityValues || {}).reduce(
            (sum: number, val: any) => sum + (Number(val) || 0), 0
          ).toLocaleString()} {unitType}
        </Badge>
      )
    }
  ];
  
  // Columns definition for Special Area Modifications
  const specialAreaColumns: RatioTableColumn[] = [
    { 
      name: "Ratio Name", 
      key: "name", 
      width: "250px",
      renderCell: (ratio) => {
        return (
          <div>
            <div className="font-medium">{ratio.name}</div>
            {ratio.description && ratio.description !== ratio.name && (
              <div className="text-xs text-muted-foreground">{ratio.description}</div>
            )}
            <div className="flex gap-1 mt-1">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                Special Areas
              </Badge>
            </div>
          </div>
        );
      }
    },
    { 
      name: "Type", 
      key: "type", 
      width: "150px",
      renderCell: (ratio) => (
        <Badge variant="outline">
          {formatRatioType(ratio.ratioType)}
        </Badge>
      )
    },
    {
      name: "Modifications",
      key: "modifications",
      width: "280px",
      renderCell: (ratio) => {
        if (!hasEntityModifications(ratio)) return "No modifications";
        
        const entityMods = ratio.entityModifications;
        const excludedCount = entityMods.reduce((count, mod) => 
          count + (mod.excludedSpecialAreas?.length || 0), 0);
        const addedCount = entityMods.reduce((count, mod) => 
          count + (mod.addedSpecialAreas?.length || 0), 0);
        
        if (excludedCount === 0 && addedCount === 0) {
          return "No modifications";
        }
        
        return (
          <div>
            {excludedCount > 0 && (
              <div className="text-red-600 text-sm">
                {excludedCount} excluded area{excludedCount > 1 ? 's' : ''}
              </div>
            )}
            {addedCount > 0 && (
              <div className="text-green-600 text-sm">
                {addedCount} added area{addedCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ratio Management</CardTitle>
              <CardDescription>Manage allocation ratios for entities and special areas</CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ratios..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filter Ratios</DialogTitle>
                    <DialogDescription>
                      Select criteria to filter the ratio list
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label className="mb-2 block">Ratio Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ratioTypes.map(type => (
                        <Button
                          key={type}
                          variant={selectedRatioType === type ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setSelectedRatioType(selectedRatioType === type ? null : type)}
                        >
                          {formatRatioType(type)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedRatioType(null)}>Reset</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
                onEdit={(ratio) => onSaveRatio && onSaveRatio(ratio)}
                onDelete={(ratio) => onDeleteRatio && onDeleteRatio(ratio.id as number)}
                onView={(ratio) => setViewCalculationRatioId(ratio.id as number)}
                emptyMessage="No core ratios found. Create a new ratio to get started."
                isLoading={false}
                showPercentages={true}
                showActualValues={true}
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
                onEdit={(ratio) => onSaveRatio && onSaveRatio(ratio)}
                onDelete={(ratio) => onDeleteRatio && onDeleteRatio(ratio.id as number)}
                onView={(ratio) => setViewCalculationRatioId(ratio.id as number)}
                emptyMessage="No derived ratios found. Create a derived ratio from existing core ratios."
                isLoading={false}
                showPercentages={true}
                showActualValues={true}
              />
            </TabsContent>
            
            {/* Special Area Modifications Tab */}
            <TabsContent value="special" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Special area modifications allow you to adjust how shared areas are included or excluded from ratio calculations.
              </div>
              
              <RatioTable
                ratios={specialAreaRatios}
                entities={entities}
                columns={specialAreaColumns}
                onEdit={(ratio) => onSaveRatio && onSaveRatio(ratio)}
                onDelete={(ratio) => onDeleteRatio && onDeleteRatio(ratio.id as number)}
                onView={(ratio) => setViewCalculationRatioId(ratio.id as number)}
                emptyMessage="No special area modifications found."
                isLoading={false}
                showPercentages={true}
                showActualValues={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Calculation Dialog */}
      {viewCalculationRatioId && (
        <Dialog open={!!viewCalculationRatioId} onOpenChange={() => setViewCalculationRatioId(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ratio Calculation Details</DialogTitle>
              <DialogDescription>
                View how this ratio is calculated and distributed across entities
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {(() => {
                const ratio = ratios.find(r => r.id === viewCalculationRatioId);
                if (!ratio) return <p>Ratio not found</p>;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{ratio.name}</h3>
                      <p className="text-sm text-muted-foreground">{ratio.description}</p>
                      <Badge className="mt-2" variant="outline">
                        {formatRatioType(ratio.ratioType)}
                      </Badge>
                    </div>
                    
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2 text-left">Entity</th>
                            <th className="p-2 text-right">Value ({unitType})</th>
                            <th className="p-2 text-right">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entities.map(entity => {
                            const value = ratio.entityValues?.[entity.id] || 0;
                            const totalValue = Object.values(ratio.entityValues || {}).reduce(
                              (sum: number, val: any) => sum + (Number(val) || 0), 0
                            );
                            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                            
                            return (
                              <tr key={entity.id} className="border-b">
                                <td className="p-2">{entity.name}</td>
                                <td className="p-2 text-right">{value.toLocaleString()}</td>
                                <td className="p-2 text-right">{percentage.toFixed(2)}%</td>
                              </tr>
                            );
                          })}
                          <tr className="font-medium">
                            <td className="p-2">Total</td>
                            <td className="p-2 text-right">
                              {Object.values(ratio.entityValues || {}).reduce(
                                (sum: number, val: any) => sum + (Number(val) || 0), 0
                              ).toLocaleString()}
                            </td>
                            <td className="p-2 text-right">100.00%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {isDerivedRatio(ratio) && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Derived From</h4>
                        <div className="border rounded-md p-3 bg-muted/30">
                          <p>
                            Base Ratio: <span className="font-medium">{ratio.sourceRatioName}</span>
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {ratio.entityModifications.length > 0 
                              ? `${ratio.entityModifications.length} modifications applied`
                              : 'No modifications applied'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <DialogFooter>
              <Button onClick={() => setViewCalculationRatioId(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}