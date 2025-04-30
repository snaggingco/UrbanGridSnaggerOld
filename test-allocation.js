// Test data to validate allocation calculations
console.log('===== BASIC DISTRIBUTION TEST =====');

// Sample entities
const entities = [
  { id: 1, name: 'Entity A', suitArea: '100' },
  { id: 2, name: 'Entity B', suitArea: '200' },
  { id: 3, name: 'Entity C', suitArea: '300' }
];

// Sample ratio with entity values
const ratio = {
  id: 1,
  name: 'Test Ratio',
  description: 'For calculation validation',
  entityValues: {
    1: 25,  // Entity A gets 25% 
    2: 25,  // Entity B gets 25%
    3: 50   // Entity C gets 50%
  }
};

// Input value to distribute
const inputValue = 1000;

// Calculate distribution based on ratio
function calculateDistribution(entities, ratio, inputValue) {
  const distribution = {};
  const totalRatioValue = Object.values(ratio.entityValues).reduce((sum, value) => sum + value, 0);
  
  // Log key values for verification
  console.log('Total ratio value:', totalRatioValue);
  console.log('Input value to distribute:', inputValue);
  
  entities.forEach(entity => {
    // Get entity's ratio value
    const entityRatioValue = ratio.entityValues[entity.id] || 0;
    
    // Calculate percentage this entity has in the ratio
    const percentage = totalRatioValue > 0 ? (entityRatioValue / totalRatioValue) * 100 : 0;
    
    // Calculate allocated value based on percentage
    const value = (percentage / 100) * inputValue;
    
    // Store calculated value
    distribution[entity.id] = value;
    
    console.log(`Entity ${entity.name} (ID: ${entity.id}): ratio value = ${entityRatioValue}, percentage = ${percentage.toFixed(2)}%, allocated = ${value.toFixed(2)}`);
  });
  
  // Verify total allocation equals input value
  const totalAllocated = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  console.log('Total allocated:', totalAllocated.toFixed(2));
  console.log('Matches input value:', Math.abs(totalAllocated - inputValue) < 0.01);
  
  return distribution;
}

// Run the basic test
const result = calculateDistribution(entities, ratio, inputValue);
console.log('Distribution result:', result);

// Test 2: Area-based distribution
console.log('\n===== AREA-BASED DISTRIBUTION TEST =====');

// Core ratios based on area
const areaRatio = {
  id: 2,
  name: 'Sellable Area Ratio',
  description: 'Distribution based on sellable area',
  isCore: true,
  entityValues: {
    1: 100,  // Entity A has 100 sq.m 
    2: 200,  // Entity B has 200 sq.m
    3: 300   // Entity C has 300 sq.m
  }
};

// Distribute maintenance contract cost
const maintenanceValue = 2400; // AED

// Run the area-based test
const areaResult = calculateDistribution(entities, areaRatio, maintenanceValue);
console.log('Area-based distribution result:', areaResult);

// Test 3: Multiple inputs with same ratio
console.log('\n===== MULTIPLE INPUTS TEST =====');

const inputs = [
  { name: 'Security Guards', value: 1000, ratioId: 1 },
  { name: 'Maintenance', value: 2400, ratioId: 2 }
];

// Calculate total allocation for each entity across all inputs
function calculateTotalEntityAllocation(entityId, inputs, entities, ratios) {
  let totalAmount = 0;
  
  inputs.forEach(input => {
    const ratio = ratios.find(r => r.id === input.ratioId);
    if (!ratio) {
      console.warn(`Ratio with ID ${input.ratioId} not found for input ${input.name}`);
      return;
    }
    
    const totalRatioValue = Object.values(ratio.entityValues).reduce((sum, value) => sum + value, 0);
    const entityRatioValue = ratio.entityValues[entityId] || 0;
    const percentage = totalRatioValue > 0 ? (entityRatioValue / totalRatioValue) * 100 : 0;
    const value = (percentage / 100) * parseFloat(input.value);
    
    totalAmount += value;
    console.log(`Input "${input.name}": Entity ${entityId} gets ${value.toFixed(2)} (${percentage.toFixed(2)}%)`);
  });
  
  return totalAmount;
}

// Calculate totals for each entity
const ratios = [ratio, areaRatio];
entities.forEach(entity => {
  const total = calculateTotalEntityAllocation(entity.id, inputs, entities, ratios);
  console.log(`Entity ${entity.name} total allocation: ${total.toFixed(2)}`);
});