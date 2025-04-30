import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, PercentSquare } from 'lucide-react';

interface Entity {
  id: number;
  name: string;
  type: string;
  suitArea: string;
  balconyArea?: string;
  sellableArea?: string;
  applicableArea?: string;
  dedicatedCommonArea?: string;
  parkingBayArea?: string;
  totalComponentArea?: string;
  proportionalShare?: string;
  color?: string;
}

interface SharedArea {
  id: number;
  name: string;
  type: "principal_common" | "common_element";
  area: string;
  description?: string;
  beneficiaries?: EntityBeneficiary[];
}

interface EntityBeneficiary {
  id: number;
  entityId: number;
  sharedAreaId: number;
  allocationPercentage: string;
}

interface CoreRatiosDisplayProps {
  entities: Entity[];
  sharedAreas: SharedArea[];
  unitType?: 'sqm' | 'sqft';
}

const CoreRatiosDisplay: React.FC<CoreRatiosDisplayProps> = ({
  entities,
  sharedAreas,
  unitType = 'sqm'
}) => {
  // Calculate core ratios
  const calculateRatios = () => {
    // Ensure we have entities to work with
    if (!entities.length) return [];
    
    // Calculate sellable area totals and ratios
    const totalSellableArea = entities.reduce((sum, entity) => {
      const sellableArea = entity.sellableArea || 
        (parseFloat(entity.suitArea) + parseFloat(entity.balconyArea || '0')).toString();
      return sum + parseFloat(sellableArea);
    }, 0);
    
    // Calculate parking bay area totals and ratios
    const totalParkingBayArea = entities.reduce((sum, entity) => {
      return sum + parseFloat(entity.parkingBayArea || '0');
    }, 0);
    
    // Calculate dedicated common area totals and ratios
    const totalDedicatedCommonArea = entities.reduce((sum, entity) => {
      return sum + parseFloat(entity.dedicatedCommonArea || '0');
    }, 0);
    
    // Find Principal Common Areas
    const principalCommonAreas = sharedAreas.filter(area => area.type === 'principal_common');
    const totalPrincipalCommonArea = principalCommonAreas.reduce((sum, area) => {
      return sum + parseFloat(area.area);
    }, 0);
    
    // Find Common Element Common Areas (CECA)
    const commonElementAreas = sharedAreas.filter(area => area.type === 'common_element');
    const totalCommonElementArea = commonElementAreas.reduce((sum, area) => {
      return sum + parseFloat(area.area);
    }, 0);
    
    // Calculate principal common area allocation based on sellable area ratios
    const principalCommonAllocations = entities.map(entity => {
      const sellableArea = parseFloat(entity.sellableArea || 
        (parseFloat(entity.suitArea) + parseFloat(entity.balconyArea || '0')).toString());
      const ratio = totalSellableArea > 0 ? sellableArea / totalSellableArea : 0;
      return {
        entityId: entity.id,
        allocation: totalPrincipalCommonArea * ratio
      };
    });
    
    // Calculate common element area allocations based on beneficiaries
    const commonElementAllocations = entities.map(entity => {
      let totalAllocation = 0;
      
      // Process each Common Element Area separately
      commonElementAreas.forEach(commonElementArea => {
        // Check if this area has beneficiaries defined
        if (commonElementArea.beneficiaries && commonElementArea.beneficiaries.length > 0) {
          // Check if this entity is a beneficiary of this area
          const beneficiary = commonElementArea.beneficiaries.find(b => b.entityId === entity.id);
          
          if (beneficiary) {
            // If entity is explicitly defined as a beneficiary, use its allocation percentage
            const allocationPercentage = parseFloat(beneficiary.allocationPercentage || '0') / 100;
            totalAllocation += parseFloat(commonElementArea.area) * allocationPercentage;
          }
        } else {
          // If no beneficiaries are defined, distribute to all entities based on sellable area
          const sellableArea = parseFloat(entity.sellableArea || 
            (parseFloat(entity.suitArea) + parseFloat(entity.balconyArea || '0')).toString());
          
          const totalSellableAreaForThisElement = entities.reduce((sum, e) => {
            return sum + parseFloat(e.sellableArea || 
              (parseFloat(e.suitArea) + parseFloat(e.balconyArea || '0')).toString());
          }, 0);
          
          const ratio = totalSellableAreaForThisElement > 0 ? sellableArea / totalSellableAreaForThisElement : 0;
          totalAllocation += parseFloat(commonElementArea.area) * ratio;
        }
      });
      
      return {
        entityId: entity.id,
        allocation: totalAllocation
      };
    });
    
    // Calculate core ratios for each entity
    return entities.map(entity => {
      // STEP 1: Get the basic areas
      // Sellable Area calculation
      const sellableArea = parseFloat(entity.sellableArea || 
        (parseFloat(entity.suitArea) + parseFloat(entity.balconyArea || '0')).toString());
      
      // Parking Bay Area 
      const parkingBayArea = parseFloat(entity.parkingBayArea || '0');
      
      // Dedicated Common Area
      const dedicatedCommonArea = parseFloat(entity.dedicatedCommonArea || '0');
      
      // STEP 2: Get entity's principal common area and common element area allocations
      // Get this entity's principal common allocation
      const entityPCA = principalCommonAllocations.find(a => a.entityId === entity.id)?.allocation || 0;
      
      // Get this entity's common element allocation
      const entityCEA = commonElementAllocations.find(a => a.entityId === entity.id)?.allocation || 0;
      
      // STEP 3: Calculate all derived areas
      // Applicable Area = suit area + (25% of balcony area)
      const suitArea = parseFloat(entity.suitArea || '0');
      const balconyArea = parseFloat(entity.balconyArea || '0');
      const applicableArea = parseFloat(entity.applicableArea || 
        (suitArea + (balconyArea * 0.25)).toString());
        
      // Total Component Area = sellable + parking + dedicated common + PCA share + CEA share
      // Calculate it directly rather than using the entity's stored value which might be outdated
      const calculatedTotalComponentArea = sellableArea + parkingBayArea + dedicatedCommonArea + entityPCA + entityCEA;
      const totalComponentArea = calculatedTotalComponentArea;
      
      // Total Common Area = dedicated common + PCA share + CEA share
      const totalCommonArea = dedicatedCommonArea + entityPCA + entityCEA;
      
      // STEP 4: Calculate total areas for ratio denominators
      // For most areas, we can use the pre-calculated totals
      const sellableAreaRatio = totalSellableArea > 0 ? sellableArea / totalSellableArea : 0;
      const parkingBayAreaRatio = totalParkingBayArea > 0 ? parkingBayArea / totalParkingBayArea : 0;
      const dedicatedCommonAreaRatio = totalDedicatedCommonArea > 0 ? dedicatedCommonArea / totalDedicatedCommonArea : 0;
      
      // Calculate total applicable area across all entities
      const totalApplicableArea = entities.reduce((sum, e) => {
        const eSuitArea = parseFloat(e.suitArea || '0');
        const eBalconyArea = parseFloat(e.balconyArea || '0');
        const eApplicableArea = parseFloat(e.applicableArea || 
          (eSuitArea + (eBalconyArea * 0.25)).toString());
        return sum + eApplicableArea;
      }, 0);
      const applicableAreaRatio = totalApplicableArea > 0 ? applicableArea / totalApplicableArea : 0;
      
      // For principal common area ratio
      const totalPrincipalAllocation = principalCommonAllocations.reduce((sum, a) => sum + a.allocation, 0);
      const principalCommonAreaRatio = totalPrincipalAllocation > 0 ? entityPCA / totalPrincipalAllocation : 0;
      
      // For common element area ratio
      const totalCommonElementAllocation = commonElementAllocations.reduce((sum, a) => sum + a.allocation, 0);
      const commonElementAreaRatio = totalCommonElementAllocation > 0 ? entityCEA / totalCommonElementAllocation : 0;
      
      // For total component area, calculate the sum of all entities' component areas directly
      // Don't rely on stored totalComponentArea values which might be outdated
      const totalAllComponentsArea = entities.reduce((sum, e) => {
        const eSellable = parseFloat(e.sellableArea || 
          (parseFloat(e.suitArea) + parseFloat(e.balconyArea || '0')).toString());
        const eParking = parseFloat(e.parkingBayArea || '0');
        const eDedicated = parseFloat(e.dedicatedCommonArea || '0');
        const ePCA = principalCommonAllocations.find(a => a.entityId === e.id)?.allocation || 0;
        const eCEA = commonElementAllocations.find(a => a.entityId === e.id)?.allocation || 0;
        
        // Always calculate component area directly, don't use stored value
        const eComponent = eSellable + eParking + eDedicated + ePCA + eCEA;
        
        return sum + eComponent;
      }, 0);
      
      const totalComponentAreaRatio = totalAllComponentsArea > 0 ? totalComponentArea / totalAllComponentsArea : 0;
      
      // For total common area, calculate the sum of all entities' common areas
      const sumOfAllEntitiesCommonArea = entities.reduce((sum, e) => {
        const eDedicated = parseFloat(e.dedicatedCommonArea || '0');
        const ePCA = principalCommonAllocations.find(a => a.entityId === e.id)?.allocation || 0;
        const eCEA = commonElementAllocations.find(a => a.entityId === e.id)?.allocation || 0;
        return sum + eDedicated + ePCA + eCEA;
      }, 0);
      
      const totalCommonAreaRatio = sumOfAllEntitiesCommonArea > 0 ? totalCommonArea / sumOfAllEntitiesCommonArea : 0;
      
      // STEP 5: Return an object with all calculated values
      return {
        entity,
        sellableArea,
        sellableAreaRatio: sellableAreaRatio * 100,
        
        applicableArea,
        applicableAreaRatio: applicableAreaRatio * 100,
        
        parkingBayArea,
        parkingBayAreaRatio: parkingBayAreaRatio * 100,
        
        dedicatedCommonArea,
        dedicatedCommonAreaRatio: dedicatedCommonAreaRatio * 100,
        
        totalComponentArea,
        totalComponentAreaRatio: totalComponentAreaRatio * 100,
        
        principalCommonAllocation: entityPCA,
        principalCommonAreaRatio: principalCommonAreaRatio * 100,
        
        commonElementAllocation: entityCEA,
        commonElementAreaRatio: commonElementAreaRatio * 100,
        
        totalCommonArea,
        totalCommonAreaRatio: totalCommonAreaRatio * 100,
      };
    });
  };
  
  // Calculate core ratios whenever entities change
  const [coreRatios, setCoreRatios] = useState(calculateRatios());
  
  useEffect(() => {
    // Recalculate ratios when entities or sharedAreas change
    setCoreRatios(calculateRatios());
  }, [entities, sharedAreas]);
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  const formatArea = (value: number) => {
    return `${value.toFixed(2)} ${unitType}`;
  };

  return (
    <Card className="border rounded-lg shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <PercentSquare className="h-5 w-5 mr-2" />
          Core Allocation Ratios
        </CardTitle>
        <CardDescription>
          Automatically calculated core ratios for all entities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entities.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Ratio Name</TableHead>
                  {entities.map(entity => (
                    <TableHead key={entity.id} className="text-right">
                      {entity.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-black">
                    Sellable Area Ratio
                  </TableCell>
                  {coreRatios.map(ratio => (
                    <TableCell key={`sellable-${ratio.entity.id}`} className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">{formatArea(ratio.sellableArea)}</span>
                        <span>{formatPercent(ratio.sellableAreaRatio)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium text-black">
                    Applicable Area Ratio
                  </TableCell>
                  {coreRatios.map(ratio => (
                    <TableCell key={`applicable-${ratio.entity.id}`} className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">{formatArea(ratio.applicableArea)}</span>
                        <span>{formatPercent(ratio.applicableAreaRatio)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium text-black">
                    Dedicated Common Area Ratio
                  </TableCell>
                  {coreRatios.map(ratio => (
                    <TableCell key={`dedicated-${ratio.entity.id}`} className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">{formatArea(ratio.dedicatedCommonArea)}</span>
                        <span>{formatPercent(ratio.dedicatedCommonAreaRatio)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium text-black">
                    Parking Bay Area Ratio
                  </TableCell>
                  {coreRatios.map(ratio => (
                    <TableCell key={`parking-${ratio.entity.id}`} className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">{formatArea(ratio.parkingBayArea)}</span>
                        <span>{formatPercent(ratio.parkingBayAreaRatio)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium text-black">
                    Total Component Area Ratio
                  </TableCell>
                  {coreRatios.map(ratio => (
                    <TableCell key={`component-${ratio.entity.id}`} className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">{formatArea(ratio.totalComponentArea)}</span>
                        <span>{formatPercent(ratio.totalComponentAreaRatio)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium text-black">
                    Principal Common Area Ratio
                  </TableCell>
                  {coreRatios.map(ratio => (
                    <TableCell key={`principal-${ratio.entity.id}`} className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">{formatArea(ratio.principalCommonAllocation)}</span>
                        <span>{formatPercent(ratio.principalCommonAreaRatio)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium text-black">
                    Common Element Area Ratio
                  </TableCell>
                  {coreRatios.map(ratio => (
                    <TableCell key={`common-element-${ratio.entity.id}`} className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">{formatArea(ratio.commonElementAllocation)}</span>
                        <span>{formatPercent(ratio.commonElementAreaRatio)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium text-black">
                    Total Common Area Ratio
                  </TableCell>
                  {coreRatios.map(ratio => (
                    <TableCell key={`common-${ratio.entity.id}`} className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">{formatArea(ratio.totalCommonArea)}</span>
                        <span>{formatPercent(ratio.totalCommonAreaRatio)}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-md border border-dashed">
            <PercentSquare className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-500">No entities available</h3>
            <p className="mt-1 text-xs text-slate-500">
              Add entities to see core allocation ratios
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 border rounded-md bg-slate-50">
          <div className="flex">
            <InfoIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
            <div className="text-sm text-slate-600">
              <p className="mb-1"><strong>Ratio Explanations:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Sellable Area Ratio</strong>: Based on the proportion of each entity's sellable area to the total sellable area.</li>
                <li><strong>Applicable Area Ratio</strong>: Based on suit area and 25% of balcony area.</li>
                <li><strong>Dedicated Common Area Ratio</strong>: Proportion of each entity's dedicated common area to the total dedicated common area.</li>
                <li><strong>Parking Bay Area Ratio</strong>: Proportion of each entity's parking bay area to total parking bay area.</li>
                <li><strong>Total Component Area Ratio</strong>: Based on the sum of sellable area, parking bay area, dedicated common area, principal common area share, and common element area share.</li>
                <li><strong>Principal Common Area Ratio</strong>: Entity's share of principal common areas, distributed proportionally based on sellable area.</li>
                <li><strong>Common Element Area Ratio</strong>: Entity's share of common element areas, distributed proportionally based on sellable area.</li>
                <li><strong>Total Common Area Ratio</strong>: Sum of dedicated common area, proportional share from principal common areas, and proportional share from common element common areas.</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoreRatiosDisplay;