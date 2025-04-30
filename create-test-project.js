// This script creates a complete test project with budget item allocations
// Run with: node create-test-project.js

import fs from 'fs';
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000/api';

// Test project data
const projectData = {
  name: "Palm Towers Complex",
  description: "Mixed-use development with residential, commercial and retail components for allocation testing"
};

// Sample entities
const entities = [
  { name: 'Residential Tower A', type: 'residential', suitArea: '15000', balconyArea: '3000', sellableArea: '12000', applicableArea: '15000', dedicatedCommonArea: '2500', parkingBayArea: '2000' },
  { name: 'Residential Tower B', type: 'residential', suitArea: '12000', balconyArea: '2400', sellableArea: '10000', applicableArea: '12000', dedicatedCommonArea: '1800', parkingBayArea: '1800' },
  { name: 'Commercial Offices', type: 'commercial', suitArea: '10000', balconyArea: '0', sellableArea: '8500', applicableArea: '10000', dedicatedCommonArea: '1500', parkingBayArea: '1500' },
  { name: 'Retail Spaces', type: 'retail', suitArea: '5000', balconyArea: '0', sellableArea: '4000', applicableArea: '5000', dedicatedCommonArea: '1000', parkingBayArea: '500' }
];

// Sample common areas
const commonAreas = [
  { name: 'Main Lobby', area: '1000', beneficiaries: [0, 1, 2, 3] }, // All entities
  { name: 'Residential Amenities', area: '3000', beneficiaries: [0, 1] }, // Only residential
  { name: 'Commercial Reception', area: '500', beneficiaries: [2] }, // Only commercial
  { name: 'Loading Bay', area: '800', beneficiaries: [2, 3] } // Commercial & retail
];

// Budget items to test (10 items with different allocation types)
const budgetItems = [
  { code: 'SEC001', description: 'Security Services', category: 'Services', subCategory: 'Security', budgetValue: '400000' },
  { code: 'MAINT001', description: 'General Maintenance', category: 'Maintenance', subCategory: 'General', budgetValue: '250000' },
  { code: 'CLEAN001', description: 'Cleaning Services', category: 'Services', subCategory: 'Cleaning', budgetValue: '300000' },
  { code: 'LAND001', description: 'Landscaping', category: 'Maintenance', subCategory: 'External', budgetValue: '120000' },
  { code: 'MEP001', description: 'MEP Maintenance', category: 'Maintenance', subCategory: 'MEP', budgetValue: '180000' },
  { code: 'ELEV001', description: 'Elevator Maintenance', category: 'Maintenance', subCategory: 'Elevator', budgetValue: '150000' },
  { code: 'ADMIN001', description: 'Management Fees', category: 'Administration', subCategory: 'Management', budgetValue: '200000' },
  { code: 'UTIL001', description: 'Utilities - Common Areas', category: 'Utilities', subCategory: 'Electricity', budgetValue: '280000' },
  { code: 'INS001', description: 'Building Insurance', category: 'Insurance', subCategory: 'Building', budgetValue: '350000' },
  { code: 'WASTE001', description: 'Waste Management', category: 'Services', subCategory: 'Waste', budgetValue: '90000' }
];

// Function to create a new contract
async function createContract() {
  try {
    const response = await axios.post(`${API_URL}/amc/contracts`, projectData);
    console.log('Contract created with ID:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error creating contract:', error.response?.data || error.message);
    throw error;
  }
}

// Function to add entities to contract
async function addEntitiesToContract(contractId) {
  const addedEntities = [];
  for (const entity of entities) {
    try {
      const response = await axios.post(`${API_URL}/amc/contracts/${contractId}/entities`, entity);
      console.log(`Added entity: ${entity.name} with ID: ${response.data.id}`);
      addedEntities.push(response.data);
    } catch (error) {
      console.error(`Error adding entity ${entity.name}:`, error.response?.data || error.message);
    }
  }
  return addedEntities;
}

// Function to add shared areas
async function addSharedAreasToContract(contractId, entityIds) {
  const addedAreas = [];
  for (const area of commonAreas) {
    try {
      // Map beneficiary indices to actual entity IDs
      const beneficiaryIds = area.beneficiaries.map(index => entityIds[index]);
      
      const areaData = {
        name: area.name,
        area: area.area,
        beneficiaries: beneficiaryIds
      };
      
      const response = await axios.post(`${API_URL}/amc/contracts/${contractId}/shared-areas`, areaData);
      console.log(`Added shared area: ${area.name} with ID: ${response.data.id}`);
      addedAreas.push(response.data);
    } catch (error) {
      console.error(`Error adding shared area ${area.name}:`, error.response?.data || error.message);
    }
  }
  return addedAreas;
}

// Function to create core and derived ratios
async function createRatios(contractId, entityIds, areaIds) {
  // First create core ratios based on entity properties
  const coreRatios = [
    { name: 'Suit Area', description: 'Based on the suite area of each entity', isCore: true, ratioType: 'core', propertyName: 'suitArea' },
    { name: 'Sellable Area', description: 'Based on the sellable area of each entity', isCore: true, ratioType: 'core', propertyName: 'sellableArea' },
    { name: 'Applicable Area', description: 'Based on the applicable area of each entity', isCore: true, ratioType: 'core', propertyName: 'applicableArea' },
    { name: 'Entity Count', description: 'Equal distribution (1 per entity)', isCore: true, ratioType: 'core', propertyName: null }
  ];
  
  // Now derive ratios for each entity (single-entity ratios)
  const singleEntityRatios = entityIds.map((entityId, index) => ({
    name: `${entities[index].name} - Applicable Area`,
    description: `Applicable area specifically for ${entities[index].name}`,
    isCore: false,
    ratioType: 'derived',
    singleEntityId: entityId
  }));
  
  // Derived ratios for each common area
  const commonAreaRatios = areaIds.map((areaId, index) => ({
    name: `${commonAreas[index].name} Ratio`,
    description: `Distribution for ${commonAreas[index].name}`,
    isCore: false,
    ratioType: 'derived',
    commonAreaId: areaId
  }));
  
  // Special combined ratios
  const combinedRatios = [
    { name: 'Residential Only', description: 'Combined ratio for residential entities', isCore: false, ratioType: 'derived', entityIndices: [0, 1] },
    { name: 'Commercial Only', description: 'Ratio for commercial entity', isCore: false, ratioType: 'derived', entityIndices: [2] },
    { name: 'Retail Only', description: 'Ratio for retail entity', isCore: false, ratioType: 'derived', entityIndices: [3] },
    { name: 'Commercial & Retail', description: 'Combined ratio for commercial and retail', isCore: false, ratioType: 'derived', entityIndices: [2, 3] }
  ];
  
  // Combine all ratio definitions
  const allRatios = [...coreRatios, ...singleEntityRatios, ...commonAreaRatios, ...combinedRatios];
  
  // Create the ratios and build their entity values
  const createdRatios = [];
  for (const ratio of allRatios) {
    try {
      // Create entity values based on ratio type
      const entityValues = {};
      
      if (ratio.isCore) {
        // Core ratio based on entity property
        if (ratio.propertyName) {
          entities.forEach((entity, index) => {
            entityValues[entityIds[index]] = parseFloat(entity[ratio.propertyName] || '0');
          });
        } else {
          // Entity count - each gets 1
          entities.forEach((_, index) => {
            entityValues[entityIds[index]] = 1;
          });
        }
      } else if (ratio.singleEntityId) {
        // Single entity ratio - only one entity gets a value
        entityIds.forEach(id => {
          entityValues[id] = id === ratio.singleEntityId ? 100 : 0;
        });
      } else if (ratio.commonAreaId) {
        // Common area based ratio - use the beneficiaries
        const areaIndex = areaIds.indexOf(ratio.commonAreaId);
        if (areaIndex >= 0) {
          const area = commonAreas[areaIndex];
          // First set all to zero
          entityIds.forEach(id => {
            entityValues[id] = 0;
          });
          // Then set values for beneficiaries
          area.beneficiaries.forEach(benefIndex => {
            // For simplicity, distribute evenly among beneficiaries
            entityValues[entityIds[benefIndex]] = 100 / area.beneficiaries.length;
          });
        }
      } else if (ratio.entityIndices) {
        // Combined ratio for specific entities
        entityIds.forEach((id, index) => {
          if (ratio.entityIndices.includes(index)) {
            // For simplicity, distribute evenly
            entityValues[id] = 100 / ratio.entityIndices.length;
          } else {
            entityValues[id] = 0;
          }
        });
      }
      
      // Create the ratio
      const ratioData = {
        name: ratio.name,
        description: ratio.description,
        isCore: ratio.isCore,
        ratioType: ratio.ratioType,
        entityValues
      };
      
      const response = await axios.post(`${API_URL}/amc/contracts/${contractId}/ratios`, ratioData);
      console.log(`Created ratio: ${ratio.name} with ID: ${response.data.id}`);
      createdRatios.push({...response.data, entityValues});
    } catch (error) {
      console.error(`Error creating ratio ${ratio.name}:`, error.response?.data || error.message);
    }
  }
  
  return createdRatios;
}

// Function to create budget item allocations
async function createAllocations(contractId, budgetItems, ratios, entityIds) {
  const allocations = [];
  
  for (const item of budgetItems) {
    try {
      // Create 2-3 inputs for each budget item using different ratios
      const inputs = [];
      
      // Select at least 3 random ratios
      const shuffledRatios = [...ratios].sort(() => 0.5 - Math.random());
      const selectedRatios = shuffledRatios.slice(0, Math.min(3, shuffledRatios.length));
      
      // Determine allocation percentages for inputs
      const percentages = [];
      switch (selectedRatios.length) {
        case 1:
          percentages.push(100);
          break;
        case 2:
          percentages.push(60, 40);
          break;
        case 3:
          percentages.push(50, 30, 20);
          break;
        default:
          const perRatio = 100 / selectedRatios.length;
          for (let i = 0; i < selectedRatios.length; i++) {
            percentages.push(perRatio);
          }
      }
      
      // Calculate input values based on budget value
      const budgetValue = parseFloat(item.budgetValue);
      
      // Create inputs for each selected ratio
      selectedRatios.forEach((ratio, index) => {
        const inputValue = (percentages[index] / 100) * budgetValue;
        
        // Calculate entity values based on ratio
        const entityValues = {};
        entityIds.forEach(id => {
          const ratioValue = ratio.entityValues[id] || 0;
          const totalRatioValue = Object.values(ratio.entityValues).reduce((sum, val) => sum + val, 0);
          
          if (totalRatioValue > 0) {
            entityValues[id] = ((ratioValue / totalRatioValue) * inputValue).toFixed(2);
          } else {
            entityValues[id] = "0.00";
          }
        });
        
        inputs.push({
          id: Date.now() + index,
          name: `${item.subCategory} - ${ratio.name}`,
          unit: 'AED',
          value: inputValue.toFixed(2),
          description: `Allocation based on ${ratio.name}`,
          ratioId: ratio.id,
          ratioName: ratio.name,
          entityValues
        });
      });
      
      // Create the allocation
      const allocation = {
        budgetItemId: item.id || Date.now(),
        budgetValue: item.budgetValue,
        allocationInputs: inputs,
        notes: `Test allocation for ${item.description}`
      };
      
      // Save the allocation
      const response = await axios.post(`${API_URL}/amc/contracts/${contractId}/allocations`, {
        budgetItem: item,
        allocation
      });
      
      console.log(`Created allocation for budget item: ${item.code} - ${item.description}`);
      allocations.push(response.data);
    } catch (error) {
      console.error(`Error creating allocation for ${item.code}:`, error.response?.data || error.message);
    }
  }
  
  return allocations;
}

// Main function to create the test project
async function createTestProject() {
  try {
    console.log('Creating test project for allocation validation...');
    
    // Create contract
    const contractId = await createContract();
    
    // Add entities
    const addedEntities = await addEntitiesToContract(contractId);
    const entityIds = addedEntities.map(e => e.id);
    
    // Add shared areas
    const addedAreas = await addSharedAreasToContract(contractId, entityIds);
    const areaIds = addedAreas.map(a => a.id);
    
    // Create ratios
    const ratios = await createRatios(contractId, entityIds, areaIds);
    
    // Create budget allocations
    const allocations = await createAllocations(contractId, budgetItems, ratios, entityIds);
    
    console.log('\n✅ Test project created successfully!');
    console.log(`Contract ID: ${contractId}`);
    console.log(`Entities: ${entityIds.join(', ')}`);
    console.log(`Created ${ratios.length} ratios`);
    console.log(`Created ${allocations.length} budget item allocations\n`);
    
    // Save the test project data for reference
    fs.writeFileSync('test-project-data.json', JSON.stringify({
      contractId,
      entities: addedEntities,
      areas: addedAreas,
      ratios,
      allocations
    }, null, 2));
    
    console.log('Test project data saved to test-project-data.json');
    
    return {
      contractId,
      entities: addedEntities,
      areas: addedAreas,
      ratios,
      allocations
    };
  } catch (error) {
    console.error('Failed to create test project:', error);
  }
}

// Run the script
createTestProject();