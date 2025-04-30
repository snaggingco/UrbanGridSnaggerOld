import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AllocationInputManager } from './AllocationInputManager';
import { Entity, Ratio } from '@shared/ratio-types';
import { Shield, Users, Building, Home, Store, Clock, Warehouse } from 'lucide-react';

interface SecurityServicesAllocationProps {
  entities: Entity[];
  ratios: Ratio[];
  onAllocationChange?: (allocation: any) => void;
}

// Interface for allocation input
interface AllocationInput {
  id: number;
  name: string;
  value: string; 
  unit: string;
  ratioId: number | null;
  ratioName: string | null;
  entityId: number | null; // For exclusive entity allocation
  entityValues: Record<number, string>; // Calculated values per entity
  percentages: Record<number, number>; // Calculated percentages per entity
}

export function SecurityServicesAllocation({ 
  entities, 
  ratios,
  onAllocationChange 
}: SecurityServicesAllocationProps) {
  const [inputs, setInputs] = useState<AllocationInput[]>([]);
  const [isDemo, setIsDemo] = useState(true);
  
  // Sample data for the Security Services allocation scenario
  const createDemoInputs = (): AllocationInput[] => {
    // Find entities by name for the demo
    const residenceEntity = entities.find(e => e.name.toLowerCase().includes('residen'))?.id || 1;
    const retailEntity = entities.find(e => e.name.toLowerCase().includes('retail'))?.id || 2;
    const officeEntity = entities.find(e => e.name.toLowerCase().includes('office'))?.id || 3;
    
    // Find or create demo ratios
    const commonAreaRatio = ratios.find(r => 
      r.name.toLowerCase().includes('common area') && 
      !r.name.toLowerCase().includes('parking')
    )?.id || null;
    
    const parkingRatio = ratios.find(r => 
      r.name.toLowerCase().includes('parking') || 
      r.name.toLowerCase().includes('bay')
    )?.id || null;
    
    // Common Area Ratio (Exclude Parking) display values
    const commonAreaRatioName = commonAreaRatio ? 
      ratios.find(r => r.id === commonAreaRatio)?.name || 'Total Common Area Ratio (Excl. Parking)' : 
      'Total Common Area Ratio (Excl. Parking)';
    
    // Parking Bay Ratio display values
    const parkingRatioName = parkingRatio ? 
      ratios.find(r => r.id === parkingRatio)?.name || 'Parking Bay Ratio' : 
      'Parking Bay Ratio';
    
    // Create demo inputs based on the scenario description
    return [
      {
        id: 1,
        name: 'Input 1',
        value: '2',
        unit: 'Staffs',
        ratioId: null,
        ratioName: `Exclusive to Residence`,
        entityId: residenceEntity,
        entityValues: {
          [residenceEntity]: '2',
          [retailEntity]: '0',
          [officeEntity]: '0'
        },
        percentages: {
          [residenceEntity]: 100,
          [retailEntity]: 0,
          [officeEntity]: 0
        }
      },
      {
        id: 2,
        name: 'Input 2',
        value: '2',
        unit: 'Staffs',
        ratioId: null,
        ratioName: `Exclusive to Retail`,
        entityId: retailEntity,
        entityValues: {
          [residenceEntity]: '0',
          [retailEntity]: '2',
          [officeEntity]: '0'
        },
        percentages: {
          [residenceEntity]: 0,
          [retailEntity]: 100,
          [officeEntity]: 0
        }
      },
      {
        id: 3,
        name: 'Input 3',
        value: '2',
        unit: 'Staffs',
        ratioId: null,
        ratioName: `Exclusive to Office`,
        entityId: officeEntity,
        entityValues: {
          [residenceEntity]: '0',
          [retailEntity]: '0',
          [officeEntity]: '2'
        },
        percentages: {
          [residenceEntity]: 0,
          [retailEntity]: 0,
          [officeEntity]: 100
        }
      },
      {
        id: 4,
        name: 'Input 4',
        value: '2',
        unit: 'Staffs',
        ratioId: commonAreaRatio,
        ratioName: commonAreaRatioName,
        entityId: null,
        entityValues: {
          [residenceEntity]: '0.6',
          [retailEntity]: '0.6',
          [officeEntity]: '0.8'
        },
        percentages: {
          [residenceEntity]: 30,
          [retailEntity]: 30,
          [officeEntity]: 40
        }
      },
      {
        id: 5,
        name: 'Input 5',
        value: '2',
        unit: 'Staffs',
        ratioId: parkingRatio,
        ratioName: parkingRatioName,
        entityId: null,
        entityValues: {
          [residenceEntity]: '0.8',
          [retailEntity]: '0.8',
          [officeEntity]: '0.4'
        },
        percentages: {
          [residenceEntity]: 40,
          [retailEntity]: 40,
          [officeEntity]: 20
        }
      }
    ];
  };
  
  // Initialize with demo data or empty state
  useEffect(() => {
    if (isDemo && entities.length > 0 && ratios.length > 0) {
      const demoInputs = createDemoInputs();
      setInputs(demoInputs);
      
      // Notify parent component about the allocation change
      if (onAllocationChange) {
        onAllocationChange(demoInputs);
      }
    }
  }, [isDemo, entities, ratios, onAllocationChange]);
  
  // Handle inputs change
  const handleInputsChange = (updatedInputs: AllocationInput[]) => {
    setInputs(updatedInputs);
    
    // Notify parent component about the allocation change
    if (onAllocationChange) {
      onAllocationChange(updatedInputs);
    }
  };
  
  // Clear demo and start fresh
  const handleClearDemo = () => {
    setIsDemo(false);
    setInputs([]);
    
    // Notify parent component about the allocation change
    if (onAllocationChange) {
      onAllocationChange([]);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b bg-slate-50/70">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle>Security Services Allocation</CardTitle>
            </div>
            {isDemo && (
              <Button 
                variant="outline" 
                onClick={handleClearDemo}
                className="text-sm"
              >
                Reset Example
              </Button>
            )}
          </div>
          <CardDescription>
            Distributing security staff across building entities based on deployment zones
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-w-4xl mx-auto">
            <AllocationInputManager
              entities={entities}
              ratios={ratios}
              budgetItemName="Security Services"
              budgetItemCode="1.1.2"
              budgetValue="300000"
              onInputsChange={handleInputsChange}
              initialInputs={inputs}
            />
            
            {!isDemo && inputs.length === 0 && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 my-6">
                <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Allocation Scenario: Security Services
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  Create inputs for distributing 10 security staff members:
                </p>
                <ul className="text-sm space-y-1 text-blue-600">
                  <li className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Input 1: 2 staff exclusively for Residence
                  </li>
                  <li className="flex items-center gap-1">
                    <Store className="h-3 w-3" />
                    Input 2: 2 staff exclusively for Retail
                  </li>
                  <li className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Input 3: 2 staff exclusively for Office
                  </li>
                  <li className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Input 4: 2 staff for common areas excluding parking (30/30/40 split)
                  </li>
                  <li className="flex items-center gap-1">
                    <Warehouse className="h-3 w-3" />
                    Input 5: 2 staff for parking bay areas (40/40/20 split)
                  </li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}