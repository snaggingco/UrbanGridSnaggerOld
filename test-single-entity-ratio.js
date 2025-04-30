// Test script to debug allocation calculation specifically for single-entity ratios
console.log('===== SINGLE ENTITY RATIO TEST =====');

// Sample entities
const entities = [
  { id: 1, name: 'Residential Tower A', type: 'residential', suitArea: '15000' },
  { id: 2, name: 'Commercial Offices', type: 'commercial', suitArea: '10000' },
  { id: 3, name: 'Retail Space', type: 'retail', suitArea: '5000' }
];

// Create a ratio specifically for just Residential Tower
const residentialTowerRatio = {
  id: 101,
  name: 'Residential Tower A - Applicable Area',
  description: 'Applicable area for Residential Tower A only',
  isCore: false,
  ratioType: 'derived',
  entityValues: {
    1: 100, // Only Residential Tower A has a value
    2: 0,   // Other entities have zero
    3: 0
  }
};

// Create a ratio for just Commercial Offices
const commercialOfficesRatio = {
  id: 102,
  name: 'Commercial Offices - Applicable Area',
  description: 'Applicable area for Commercial Offices only',
  isCore: false,
  ratioType: 'derived',
  entityValues: {
    1: 0,
    2: 100, // Only Commercial Offices has a value
    3: 0
  }
};

// Create a general ratio that affects all entities
const generalRatio = {
  id: 103,
  name: 'General Distribution',
  description: 'Applies to all entities',
  isCore: false,
  ratioType: 'derived',
  entityValues: {
    1: 50, // 50%
    2: 30, // 30%
    3: 20  // 20%
  }
};

// Array of all ratios
const allRatios = [residentialTowerRatio, commercialOfficesRatio, generalRatio];

// Input value to distribute
const inputValue = 10000;

// Improved calculate distribution function
function calculateDistribution(entities, ratio, inputValue) {
  const distribution = {};
  
  console.log(`Testing distribution using ratio: "${ratio.name}"`);
  console.log('Entity values in ratio:', ratio.entityValues);
  
  // Find entities with non-zero ratio values
  const entitiesWithRatios = entities.filter(entity => 
    (ratio.entityValues?.[entity.id] || 0) > 0
  );
  
  console.log(`Found ${entitiesWithRatios.length} entities with non-zero ratios`);
  entitiesWithRatios.forEach(entity => {
    console.log(`- ${entity.name} (ID: ${entity.id}): ${ratio.entityValues?.[entity.id] || 0}`);
  });
  
  // Initialize all entities to zero in distribution
  entities.forEach(entity => {
    distribution[entity.id] = 0;
  });
  
  // Calculate total ratio value for JUST the entities with ratios
  const totalRatioValue = entitiesWithRatios.reduce(
    (sum, entity) => sum + (ratio.entityValues?.[entity.id] || 0), 
    0
  );
  
  console.log(`Total ratio value (sum of all participating entities): ${totalRatioValue}`);
  
  // For the case of a single entity ratio, we simply give 100% to that entity
  if (entitiesWithRatios.length === 1) {
    console.log(`SINGLE ENTITY RATIO DETECTED: ${entitiesWithRatios[0].name}`);
    
    const entity = entitiesWithRatios[0];
    distribution[entity.id] = inputValue;
    
    console.log(`Allocated ${inputValue} (100%) to ${entity.name}`);
  }
  // If we have multiple entities with values, distribute proportionally
  else if (totalRatioValue > 0) {
    console.log('MULTIPLE ENTITIES WITH VALUES - distributing proportionally');
    
    // Two-pass calculation to handle rounding errors
    let totalDistributed = 0;
    
    // First pass - calculate values for all but the last entity
    for (let i = 0; i < entitiesWithRatios.length - 1; i++) {
      const entity = entitiesWithRatios[i];
      const entityRatioValue = ratio.entityValues?.[entity.id] || 0;
      const percentage = entityRatioValue / totalRatioValue;
      const value = Math.round((percentage * inputValue) * 100) / 100;
      
      distribution[entity.id] = value;
      totalDistributed += value;
      
      console.log(`${entity.name}: ${entityRatioValue} / ${totalRatioValue} = ${(percentage * 100).toFixed(2)}% = ${value}`);
    }
    
    // Last entity gets remainder to ensure total matches input exactly
    if (entitiesWithRatios.length > 0) {
      const lastEntity = entitiesWithRatios[entitiesWithRatios.length - 1];
      const lastValue = Math.round((inputValue - totalDistributed) * 100) / 100;
      distribution[lastEntity.id] = lastValue;
      
      // For logging
      const entityRatioValue = ratio.entityValues?.[lastEntity.id] || 0;
      const percentage = entityRatioValue / totalRatioValue;
      
      console.log(`${lastEntity.name}: ${entityRatioValue} / ${totalRatioValue} = ${(percentage * 100).toFixed(2)}% = ${lastValue} (adjusted for rounding)`);
    }
  }
  // If no entities have ratio values, distribute evenly
  else {
    console.log('NO ENTITIES WITH VALUES - distributing evenly');
    const perEntityValue = inputValue / entities.length;
    entities.forEach(entity => {
      distribution[entity.id] = Math.round(perEntityValue * 100) / 100;
    });
  }
  
  // Verify total allocation
  const totalAllocated = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  console.log('Final distribution:', distribution);
  console.log(`Total allocated: ${totalAllocated}, Input value: ${inputValue}`);
  console.log(`Allocation matches input: ${Math.abs(totalAllocated - inputValue) < 0.01 ? 'Yes' : 'No'}`);
  
  return distribution;
}

// Test each ratio
console.log('\n--- TEST 1: Residential Tower Ratio ---');
const residentialResult = calculateDistribution(entities, residentialTowerRatio, inputValue);

console.log('\n--- TEST 2: Commercial Offices Ratio ---');
const commercialResult = calculateDistribution(entities, commercialOfficesRatio, inputValue);

console.log('\n--- TEST 3: General Ratio ---');
const generalResult = calculateDistribution(entities, generalRatio, inputValue);

// Compare approaches
console.log('\n===== COMPARISON WITH ALTERNATIVE APPROACH =====');
console.log('For single entity ratios, alternative approach with proportional calculation:');

function alternativeCalculation(entities, ratio, inputValue) {
  const distribution = {};
  
  // Initialize all entities to zero
  entities.forEach(entity => {
    distribution[entity.id] = 0;
  });
  
  // Calculate total ratio value directly, without filtering
  const totalRatioValue = Object.values(ratio.entityValues).reduce((sum, value) => sum + value, 0);
  
  console.log(`Alternative method total ratio value: ${totalRatioValue}`);
  
  // Distribute proportionally without special casing
  entities.forEach(entity => {
    const entityRatioValue = ratio.entityValues?.[entity.id] || 0;
    const percentage = totalRatioValue > 0 ? entityRatioValue / totalRatioValue : 0;
    const value = percentage * inputValue;
    
    distribution[entity.id] = Math.round(value * 100) / 100;
    console.log(`${entity.name}: ${entityRatioValue} / ${totalRatioValue} = ${(percentage * 100).toFixed(2)}% = ${distribution[entity.id]}`);
  });
  
  // Verify allocation
  const totalAllocated = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  console.log(`Alternative total allocated: ${totalAllocated}, Should be: ${inputValue}`);
  
  return distribution;
}

console.log('\nAlternative approach for Residential Tower Ratio:');
const altResidentialResult = alternativeCalculation(entities, residentialTowerRatio, inputValue);

console.log('\nAlternative approach for Commercial Offices Ratio:');
const altCommercialResult = alternativeCalculation(entities, commercialOfficesRatio, inputValue);