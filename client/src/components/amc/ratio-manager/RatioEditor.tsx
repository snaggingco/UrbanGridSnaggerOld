import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRatioManager, Ratio, EntityValue } from './RatioManagerProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RatioCombiner } from './index';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface RatioEditorProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  ratio: Ratio | null;
  contractId: string;
  entities: any[];
}

export const RatioEditor: React.FC<RatioEditorProps> = ({
  isOpen,
  setIsOpen,
  ratio,
  contractId,
  entities
}) => {
  const { createRatio, updateRatio, ratios } = useRatioManager();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ratioType, setRatioType] = useState<'derived' | 'combined' | 'exclusive'>('derived');
  const [combinationType, setCombinationType] = useState<string>('');
  const [sourceRatioIds, setSourceRatioIds] = useState<string[]>([]);
  const [entityValues, setEntityValues] = useState<EntityValue>({});
  const [includeEntityIds, setIncludeEntityIds] = useState<string[]>([]);
  const [excludeEntityIds, setExcludeEntityIds] = useState<string[]>([]);
  const [editorTab, setEditorTab] = useState('basic');
  
  // Initialize form with existing ratio data
  useEffect(() => {
    if (ratio) {
      setName(ratio.name || '');
      setDescription(ratio.description || '');
      setRatioType(ratio.ratioType as any || 'derived');
      setCombinationType(ratio.combinationType || '');
      setSourceRatioIds(ratio.sourceRatioIds || []);
      setEntityValues(ratio.entityValues || {});
      
      if (ratio.metadata) {
        setIncludeEntityIds(ratio.metadata.includeEntityIds || []);
        setExcludeEntityIds(ratio.metadata.excludeEntityIds || []);
      }
    } else {
      // Default values for new ratio
      setName('');
      setDescription('');
      setRatioType('derived');
      setCombinationType('');
      setSourceRatioIds([]);
      
      // Initialize entity values to 0 for all entities
      const defaultEntityValues: EntityValue = {};
      entities.forEach(entity => {
        defaultEntityValues[entity.id] = 0;
      });
      setEntityValues(defaultEntityValues);
      
      setIncludeEntityIds([]);
      setExcludeEntityIds([]);
    }
  }, [ratio, entities]);

  const handleSubmit = async () => {
    try {
      // Prepare ratio data
      const ratioData: Omit<Ratio, 'id'> = {
        name,
        description,
        isCore: false,
        ratioType,
        entityValues,
        sourceRatioIds: ratioType !== 'derived' ? sourceRatioIds : undefined,
        combinationType: ratioType !== 'derived' ? combinationType as any : undefined,
        metadata: {
          includeEntityIds: includeEntityIds.length > 0 ? includeEntityIds : undefined,
          excludeEntityIds: excludeEntityIds.length > 0 ? excludeEntityIds : undefined
        }
      };
      
      if (ratio) {
        // Update existing ratio
        await updateRatio(ratio.id, ratioData);
        toast({
          title: "Ratio updated",
          description: `Successfully updated "${name}" ratio.`
        });
      } else {
        // Create new ratio
        await createRatio(ratioData);
        toast({
          title: "Ratio created",
          description: `Successfully created "${name}" ratio.`
        });
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving ratio:', error);
      toast({
        variant: "destructive",
        title: "Failed to save ratio",
        description: "There was an error saving the ratio. Please try again."
      });
    }
  };

  // Handle entity value changes
  const handleEntityValueChange = (entityId: string, value: number) => {
    setEntityValues(prev => ({
      ...prev,
      [entityId]: value
    }));
  };

  // Handle entity inclusion/exclusion for custom ratios
  const handleEntityInclusionChange = (entityId: string, included: boolean) => {
    if (included) {
      setIncludeEntityIds(prev => [...prev, entityId]);
      setExcludeEntityIds(prev => prev.filter(id => id !== entityId));
    } else {
      setIncludeEntityIds(prev => prev.filter(id => id !== entityId));
      setExcludeEntityIds(prev => [...prev, entityId]);
    }
  };

  // Handle ratio combination
  const handleCombineRatios = (result: EntityValue) => {
    setEntityValues(result);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{ratio ? 'Edit Ratio' : 'Create New Ratio'}</DialogTitle>
          <DialogDescription>
            {ratio 
              ? 'Update the properties of this ratio' 
              : 'Create a new ratio to use in allocations'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={editorTab} onValueChange={setEditorTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="values">Ratio Values</TabsTrigger>
            {ratioType !== 'derived' && (
              <TabsTrigger value="combination">Ratio Combination</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ratio Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Residential Area Ratio"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ratioType">Ratio Type</Label>
                <Select 
                  value={ratioType} 
                  onValueChange={(value: any) => setRatioType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="derived">Derived Ratio</SelectItem>
                    <SelectItem value="combined">Combined Ratio</SelectItem>
                    <SelectItem value="exclusive">Exclusive Ratio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this ratio"
                rows={3}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="values" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Entity Values</h3>
              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {entities.map(entity => (
                  <Card key={entity.id} className="p-2">
                    <CardContent className="p-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`entity-${entity.id}`}
                          checked={!excludeEntityIds.includes(entity.id)}
                          onCheckedChange={(checked) => 
                            handleEntityInclusionChange(entity.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`entity-${entity.id}`}>{entity.name}</Label>
                      </div>
                      <div className="w-[100px]">
                        <Input
                          type="number"
                          min="0"
                          value={entityValues[entity.id] || 0}
                          onChange={(e) => 
                            handleEntityValueChange(entity.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-full"
                          disabled={excludeEntityIds.includes(entity.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {ratioType !== 'derived' && (
            <TabsContent value="combination" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="combinationType">Combination Type</Label>
                <Select 
                  value={combinationType} 
                  onValueChange={setCombinationType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Addition</SelectItem>
                    <SelectItem value="subtract">Subtraction</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="weighted">Weighted Average</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <RatioCombiner
                sourceRatioIds={sourceRatioIds}
                setSourceRatioIds={setSourceRatioIds}
                combinationType={combinationType}
                availableRatios={ratios.filter(r => r.id !== ratio?.id)}
                onCombineRatios={handleCombineRatios}
                includeEntityIds={includeEntityIds}
                excludeEntityIds={excludeEntityIds}
              />
            </TabsContent>
          )}
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {ratio ? 'Update Ratio' : 'Create Ratio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatioEditor;