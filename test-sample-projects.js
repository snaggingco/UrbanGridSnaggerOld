// This script tests allocation calculations with real-world property data
// to validate how the allocation system functions with realistic scenarios

// Sample project data
const project = {
  name: "Twin Towers Development",
  description: "Mixed-use development with residential, commercial and retail components"
};

// Sample entities in a mixed-use property
const entities = [
  { id: 1, name: 'Residential Tower A', type: 'residential', suitArea: '15000', sellableArea: '12500', dedicatedCommonArea: '2500', parkingBayArea: '2000' },
  { id: 2, name: 'Residential Tower B', type: 'residential', suitArea: '15000', sellableArea: '12500', dedicatedCommonArea: '2500', parkingBayArea: '2000' },
  { id: 3, name: 'Commercial Offices', type: 'commercial', suitArea: '10000', sellableArea: '8500', dedicatedCommonArea: '1500', parkingBayArea: '1500' },
  { id: 4, name: 'Retail Space', type: 'retail', suitArea: '5000', sellableArea: '4000', dedicatedCommonArea: '1000', parkingBayArea: '500' }
];

// Sample common elements
const commonElements = [
  { id: 1, name: 'Main Lobby', area: '1000', beneficiaries: [1, 2, 3, 4] }, // Benefits all entities
  { id: 2, name: 'Residential Amenities', area: '3000', beneficiaries: [1, 2] }, // Only benefits residential towers
  { id: 3, name: 'Commercial Reception', area: '500', beneficiaries: [3] }, // Only benefits commercial offices
  { id: 4, name: 'Loading Bay', area: '800', beneficiaries: [3, 4] }, // Benefits commercial & retail
  { id: 5, name: 'Parking Structure', area: '8000', beneficiaries: [1, 2, 3, 4] } // Benefits all entities
];

// Core ratios (directly from entity properties)
function generateCoreRatios() {
  // Create base ratio with empty entity values
  const createBaseRatio = (id, name, description, unitOfMeasurement = 'sq.m') => ({
    id,
    name,
    description,
    isCore: true,
    unitOfMeasurement,
    entityValues: {}
  });
  
  // Generate ratios
  const ratios = [
    createBaseRatio(1, 'Suit Area', 'Based on the total suit area of each entity', 'sq.m'),
    createBaseRatio(2, 'Sellable Area', 'Based on the sellable area of each entity', 'sq.m'),
    createBaseRatio(3, 'Dedicated Common Area', 'Based on entity-specific common areas', 'sq.m'),
    createBaseRatio(4, 'Parking Bay Area', 'Based on allocated parking areas', 'sq.m'),
    createBaseRatio(5, 'Entity Count', 'Equal distribution (1 per entity)', 'count')
  ];
  
  // Populate entity values for each ratio
  entities.forEach(entity => {
    // Suit Area
    ratios[0].entityValues[entity.id] = parseFloat(entity.suitArea);
    
    // Sellable Area
    ratios[1].entityValues[entity.id] = parseFloat(entity.sellableArea);
    
    // Dedicated Common Area
    ratios[2].entityValues[entity.id] = parseFloat(entity.dedicatedCommonArea);
    
    // Parking Bay Area
    ratios[3].entityValues[entity.id] = parseFloat(entity.parkingBayArea);
    
    // Entity Count (always 1 per entity)
    ratios[4].entityValues[entity.id] = 1;
  });
  
  return ratios;
}

// Generate derived ratios based on common element distributions
function generateDerivedRatios(coreRatios) {
  // Create a base derived ratio
  const createDerivedRatio = (id, name, description, commonElement) => ({
    id,
    name,
    description,
    isCore: false,
    ratioType: 'derived',
    unitOfMeasurement: 'sq.m',
    commonElementId: commonElement.id,
    entityValues: {}
  });

  const derivedRatios = [];
  let nextId = 100; // Start IDs from 100 to avoid conflicts with core ratios
  
  // Generate derived ratios for each common element
  commonElements.forEach(element => {
    // Get total sellable area of beneficiary entities
    const sellableAreaRatio = coreRatios.find(r => r.name === 'Sellable Area');
    
    // Calculate total sellable area of beneficiaries
    const totalBeneficiarySellableArea = element.beneficiaries.reduce((sum, entityId) => {
      return sum + (sellableAreaRatio.entityValues[entityId] || 0);
    }, 0);
    
    // Create ratio for this common element
    const ratio = createDerivedRatio(
      nextId++, 
      `${element.name} Ratio`,
      `Distribution based on share of ${element.name} (${element.area} sq.m)`,
      element
    );
    
    // Calculate each entity's share of this common element
    if (totalBeneficiarySellableArea > 0) {
      entities.forEach(entity => {
        // Only beneficiaries get a share
        if (element.beneficiaries.includes(entity.id)) {
          const entitySellableArea = sellableAreaRatio.entityValues[entity.id] || 0;
          const sharePercentage = entitySellableArea / totalBeneficiarySellableArea;
          const areaShare = sharePercentage * parseFloat(element.area);
          
          // Store the calculated share
          ratio.entityValues[entity.id] = areaShare;
        } else {
          ratio.entityValues[entity.id] = 0;
        }
      });
    }
    
    derivedRatios.push(ratio);
  });
  
  // Add a combined ratio for all common elements
  const totalCommonElementsRatio = {
    id: nextId++,
    name: 'Total Common Elements Ratio',
    description: 'Distribution based on proportional share of all common elements',
    isCore: false,
    ratioType: 'derived',
    unitOfMeasurement: 'sq.m',
    entityValues: {}
  };
  
  // Sum up all the entity values from the individual common element ratios
  entities.forEach(entity => {
    totalCommonElementsRatio.entityValues[entity.id] = derivedRatios.reduce(
      (sum, ratio) => sum + (ratio.entityValues[entity.id] || 0), 0
    );
  });
  
  derivedRatios.push(totalCommonElementsRatio);
  
  // Add a "Total Component Area" ratio
  const totalComponentAreaRatio = {
    id: nextId++,
    name: 'Total Component Area',
    description: 'Sum of Sellable Area, Parking Bay Area, Dedicated Common Area and Common Element Shares',
    isCore: false,
    ratioType: 'derived',
    unitOfMeasurement: 'sq.m',
    entityValues: {}
  };
  
  // Calculate total component area for each entity
  entities.forEach(entity => {
    const sellableArea = parseFloat(entity.sellableArea);
    const parkingBayArea = parseFloat(entity.parkingBayArea);
    const dedicatedCommonArea = parseFloat(entity.dedicatedCommonArea);
    const commonElementShares = totalCommonElementsRatio.entityValues[entity.id] || 0;
    
    totalComponentAreaRatio.entityValues[entity.id] = 
      sellableArea + parkingBayArea + dedicatedCommonArea + commonElementShares;
  });
  
  derivedRatios.push(totalComponentAreaRatio);
  
  return derivedRatios;
}

// Sample budget items for allocation
const budgetItems = [
  { id: 1, code: 'SEC-001', description: 'Security Services Contract', category: 'Security', subCategory: 'Guards', budgetValue: '400000' },
  { id: 2, code: 'MECH-001', description: 'HVAC Maintenance', category: 'MEP', subCategory: 'HVAC', budgetValue: '250000' },
  { id: 3, code: 'ELEC-001', description: 'Electrical System Maintenance', category: 'MEP', subCategory: 'Electrical', budgetValue: '150000' },
  { id: 4, code: 'CLEAN-001', description: 'Cleaning Services', category: 'Soft Services', subCategory: 'Cleaning', budgetValue: '300000' },
  { id: 5, code: 'ADMIN-001', description: 'Management Fees', category: 'Administration', subCategory: 'Management', budgetValue: '180000' }
];

// Function to calculate distribution based on a ratio
function calculateDistribution(entities, ratio, inputValue) {
  const distribution = {};
  let totalRatioValue = 0;
  
  // Calculate total using only values for existing entities
  entities.forEach(entity => {
    totalRatioValue += (ratio.entityValues?.[entity.id] || 0);
  });
  
  console.log(`Distributing ${inputValue} using ratio: ${ratio.name}`);
  console.log('Total ratio value:', totalRatioValue);
  
  // Two-pass calculation to handle rounding errors
  let totalDistributed = 0;
  
  // First pass - calculate values for all but the last entity
  for (let i = 0; i < entities.length - 1; i++) {
    const entity = entities[i];
    const entityRatioValue = ratio.entityValues?.[entity.id] || 0;
    const percentage = totalRatioValue > 0 ? (entityRatioValue / totalRatioValue) * 100 : 0;
    const value = Math.round(((percentage / 100) * inputValue) * 100) / 100;
    
    distribution[entity.id] = value;
    totalDistributed += value;
    
    console.log(`Entity ${entity.name}: ratio value = ${entityRatioValue.toFixed(2)}, percentage = ${percentage.toFixed(2)}%, allocated = ${value.toFixed(2)}`);
  }
  
  // Last entity gets the remainder to ensure total equals input value
  if (entities.length > 0) {
    const lastEntity = entities[entities.length - 1];
    const remainingValue = inputValue - totalDistributed;
    distribution[lastEntity.id] = Math.round(remainingValue * 100) / 100;
    
    // For logging
    const entityRatioValue = ratio.entityValues?.[lastEntity.id] || 0;
    const percentage = totalRatioValue > 0 ? (entityRatioValue / totalRatioValue) * 100 : 0;
    
    console.log(`Entity ${lastEntity.name}: ratio value = ${entityRatioValue.toFixed(2)}, percentage = ${percentage.toFixed(2)}%, allocated = ${distribution[lastEntity.id].toFixed(2)} (adjusted for rounding)`);
  }
  
  // Verify total allocation
  const totalAllocated = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  console.log(`Total allocated: ${totalAllocated.toFixed(2)}, Target: ${inputValue}`);
  console.log(`Allocation matches input: ${Math.abs(totalAllocated - inputValue) < 0.01 ? 'Yes' : 'No'}`);
  
  return distribution;
}

// Test allocation scenarios
async function run() {
  console.log('=== TESTING AMC COST ALLOCATION SYSTEM ===');
  console.log(`Project: ${project.name}`);
  console.log(`Entities: ${entities.map(e => e.name).join(', ')}`);
  console.log('');
  
  // Generate core and derived ratios
  const coreRatios = generateCoreRatios();
  console.log(`Generated ${coreRatios.length} core ratios`);
  
  const derivedRatios = generateDerivedRatios(coreRatios);
  console.log(`Generated ${derivedRatios.length} derived ratios`);
  
  // Combine all ratios
  const allRatios = [...coreRatios, ...derivedRatios];
  
  // Test scenarios
  console.log('\n=== SCENARIO 1: Security Services Allocation ===');
  console.log('Allocating security costs based on Total Component Area');
  const securityBudget = parseFloat(budgetItems[0].budgetValue);
  const totalComponentAreaRatio = allRatios.find(r => r.name === 'Total Component Area');
  calculateDistribution(entities, totalComponentAreaRatio, securityBudget);
  
  console.log('\n=== SCENARIO 2: HVAC Maintenance Allocation ===');
  console.log('Allocating HVAC costs based on Sellable Area');
  const hvacBudget = parseFloat(budgetItems[1].budgetValue);
  const sellableAreaRatio = allRatios.find(r => r.name === 'Sellable Area');
  calculateDistribution(entities, sellableAreaRatio, hvacBudget);
  
  console.log('\n=== SCENARIO 3: Management Fees Allocation ===');
  console.log('Allocating management fees based on Entity Count (equal distribution)');
  const managementBudget = parseFloat(budgetItems[4].budgetValue);
  const entityCountRatio = allRatios.find(r => r.name === 'Entity Count');
  calculateDistribution(entities, entityCountRatio, managementBudget);
  
  console.log('\n=== SCENARIO 4: Cleaning Services Allocation ===');
  console.log('Allocating cleaning costs based on total common elements ratio');
  const cleaningBudget = parseFloat(budgetItems[3].budgetValue);
  const commonElementsRatio = allRatios.find(r => r.name === 'Total Common Elements Ratio');
  calculateDistribution(entities, commonElementsRatio, cleaningBudget);
  
  console.log('\n=== SCENARIO 5: Multiple Allocation Inputs ===');
  // Example with multiple inputs for a single budget item
  const electricalBudget = parseFloat(budgetItems[2].budgetValue);
  console.log(`Breaking down electrical maintenance (${electricalBudget} AED) into multiple components:`);
  
  // Electrical maintenance components
  const electricalInputs = [
    { name: 'Common Areas Electrical', value: 80000, ratio: allRatios.find(r => r.name === 'Total Common Elements Ratio') },
    { name: 'Distribution Boards', value: 50000, ratio: allRatios.find(r => r.name === 'Suit Area') },
    { name: 'Emergency Systems', value: 20000, ratio: allRatios.find(r => r.name === 'Entity Count') }
  ];
  
  // Calculate total allocation for each entity across all inputs
  const electricalTotals = {};
  entities.forEach(entity => {
    electricalTotals[entity.id] = 0;
  });
  
  electricalInputs.forEach(input => {
    console.log(`\nInput: ${input.name} (${input.value} AED), Distribution: ${input.ratio.name}`);
    const distribution = calculateDistribution(entities, input.ratio, input.value);
    
    // Add to entity totals
    entities.forEach(entity => {
      electricalTotals[entity.id] += distribution[entity.id];
    });
  });
  
  // Display entity totals for all inputs
  console.log('\nEntity totals for all electrical inputs:');
  entities.forEach(entity => {
    const total = electricalTotals[entity.id];
    const percentage = (total / electricalBudget) * 100;
    console.log(`Entity ${entity.name}: ${total.toFixed(2)} AED (${percentage.toFixed(2)}% of total budget)`);
  });
  
  const totalElectricalAllocated = Object.values(electricalTotals).reduce((sum, value) => sum + value, 0);
  console.log(`\nTotal allocated: ${totalElectricalAllocated.toFixed(2)}, Target: ${electricalBudget}`);
  console.log(`Allocation matches budget: ${Math.abs(totalElectricalAllocated - electricalBudget) < 0.01 ? 'Yes' : 'No'}`);
}

// Run the tests
run();