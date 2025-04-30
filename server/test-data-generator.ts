import { storage } from './storage';
import { InsertProject, InsertDefect } from '../shared/schema';

// Rooms/areas within the property
const rooms = [
  'Living Room',
  'Kitchen',
  'Master Bedroom',
  'Bedroom 2',
  'Bedroom 3', 
  'Master Bathroom',
  'Bathroom 2',
  'Hallway',
  'Entrance',
  'Balcony'
];

// Categories for defects - must match schema enum values
const categories = [
  'Flooring',
  'Walls',
  'Ceiling',
  'Electrical',
  'Plumbing',
  'Doors',
  'HVAC',
  'Appliances',
  'Exterior',
  'Structural',
  'Other'
] as const;

// Severity levels - must match schema enum values
const severities = ['minor', 'major', 'critical', 'cosmetic'] as const;

// Status options - must match schema enum values
const statuses = ['open', 'in_progress', 'resolved'] as const;

// Common defect titles by category aligned with our schema
const defectTitlesByCategory: Record<string, string[]> = {
  'Flooring': [
    'Cracked floor tile',
    'Scratched hardwood flooring',
    'Loose floor tile',
    'Gap between flooring and wall',
    'Uneven floor surface'
  ],
  'Walls': [
    'Wall crack',
    'Paint bubbling',
    'Uneven paint finish',
    'Visible patch work',
    'Wall dent/damage'
  ],
  'Ceiling': [
    'Ceiling crack',
    'Water stain on ceiling',
    'Paint peeling',
    'Uneven ceiling texture',
    'Ceiling light fixture issue'
  ],
  'Electrical': [
    'Loose electrical socket',
    'Light switch not working properly',
    'Exposed wiring',
    'Light fixture issue',
    'Circuit breaker problem'
  ],
  'Plumbing': [
    'Leaking faucet',
    'Slow draining sink',
    'Toilet not flushing properly',
    'Pipe leak',
    'Water pressure issue'
  ],
  'Doors': [
    'Door not closing properly',
    'Squeaky door hinge',
    'Door handle loose',
    'Misaligned door frame',
    'Door scraping floor'
  ],
  'HVAC': [
    'AC not cooling properly',
    'Heating system issue',
    'Thermostat malfunction',
    'Poor air flow',
    'Vent cover damage'
  ],
  'Appliances': [
    'Refrigerator not cooling properly',
    'Dishwasher not draining',
    'Oven temperature inaccurate',
    'Washing machine vibration',
    'Air conditioning unit issue'
  ],
  'Exterior': [
    'Cracked exterior wall',
    'Damaged facade',
    'Loose roof tile',
    'Degraded exterior paint',
    'Balcony railing issue'
  ],
  'Structural': [
    'Beam deflection',
    'Column damage',
    'Foundation crack',
    'Structural settlement',
    'Support wall issue'
  ],
  'Other': [
    'Unspecified defect',
    'Multiple issues',
    'Misc. construction defect',
    'Quality concern',
    'General workmanship issue'
  ]
};

// Description templates
const descriptionTemplates = [
  '{issue} observed in the {location}. Requires {action}.',
  'Customer reported {issue} in the {location}. {action} needed.',
  '{issue} detected during inspection. Recommend to {action}.',
  '{location} has {issue} that requires attention. {action}.',
  'Inspection revealed {issue} in {location}. {action} required.'
];

const issues = [
  'visible damage',
  'material defect',
  'installation error',
  'poor workmanship',
  'finish issue',
  'alignment problem',
  'functionality issue',
  'cosmetic damage',
  'water damage',
  'structural concern'
];

const actions = [
  'replace damaged component',
  'repair and repaint',
  'adjust alignment',
  'clean and reseal',
  'complete proper installation',
  'tighten and secure',
  'address with contractor',
  'fill and finish properly',
  'remove and reinstall',
  'sand and refinish'
];

// Generate a random description
function generateDescription(category: typeof categories[number], location: string): string {
  const template = descriptionTemplates[Math.floor(Math.random() * descriptionTemplates.length)];
  const issue = issues[Math.floor(Math.random() * issues.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  
  return template
    .replace('{issue}', issue)
    .replace('{location}', location)
    .replace('{action}', action);
}

// Generate a random title for a defect based on category
function generateDefectTitle(category: typeof categories[number]): string {
  const titles = defectTitlesByCategory[category] || ['Defect'];
  return titles[Math.floor(Math.random() * titles.length)];
}

// Generate a random status with weights (more open than resolved)
function generateStatus(): typeof statuses[number] {
  const rand = Math.random();
  if (rand < 0.6) return 'open';
  if (rand < 0.8) return 'in_progress';
  return 'resolved';
}

// Generate a random severity with weights (more minor than critical)
function generateSeverity(): typeof severities[number] {
  const rand = Math.random();
  if (rand < 0.5) return 'minor';
  if (rand < 0.7) return 'major';
  if (rand < 0.9) return 'critical';
  return 'cosmetic';
}

// Generate a test project with multiple defects
export async function generateTestProject(numDefects = 50): Promise<{ project: any, defects: any[], locationObjects: any[] }> {
  // Create test project
  const projectData: InsertProject = {
    name: "Dubai Marina Apartment Handover",
    clientName: "Mohammed Al Mansouri",
    location: "Marina Promenade, Dubai Marina",
    date: new Date(),
    propertyType: "Apartment",
    propertySize: "3-bedroom",
    status: "in_progress",
    userId: 1,
    projectType: "snagging", // Set default project type
  };

  const project = await storage.createProject(projectData);
  console.log(`Created test project: ${project.name} (ID: ${project.id})`);
  
  // Create location objects for rooms first
  console.log(`Creating ${rooms.length} rooms for the project...`);
  const locationObjects = [];
  const locationMap: Record<string, number> = {}; // Map room names to their IDs

  for (const roomName of rooms) {
    const locationData = {
      projectId: project.id,
      name: roomName,
      type: "room" as const, // Use 'as const' to specify literal type
      parentId: null
    };
    
    try {
      const locationObj = await storage.createLocation(locationData);
      locationObjects.push(locationObj);
      locationMap[roomName] = locationObj.id; // Store mapping of name to ID
      console.log(`Created room: ${roomName} (ID: ${locationObj.id})`);
    } catch (error) {
      console.error(`Failed to create room ${roomName}:`, error);
    }
  }

  // Create defects with proper locationId references
  const defects = [];
  for (let i = 0; i < numDefects; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const roomName = rooms[Math.floor(Math.random() * rooms.length)];
    const locationId = locationMap[roomName];
    const status = generateStatus();
    const severity = generateSeverity();
    
    const defectData: InsertDefect = {
      projectId: project.id,
      title: generateDefectTitle(category),
      description: generateDescription(category, roomName),
      location: roomName,
      locationId: locationId, // Use the actual locationId from our created locations
      category,
      severity,
      status,
      // Add assigned person for some defects
      assignedTo: Math.random() > 0.6 ? 'Contractor' : undefined,
      // Empty photo URLs array
      photoUrls: []
    };
    
    const defect = await storage.createDefect(defectData);
    defects.push(defect);
    
    console.log(`Created defect ${i+1}/${numDefects}: ${defect.title} in ${roomName} (Room ID: ${locationId})`);
  }

  return { project, defects, locationObjects };
}

// Execute this when imported directly from command line
export async function runGenerateTestProject() {
  try {
    const result = await generateTestProject();
    console.log(`Successfully created test project with ${result.defects.length} defects`);
    return result;
  } catch (error) {
    console.error('Error generating test data:', error);
    throw error;
  }
}

// NRM3 building components and systems for reserve fund studies
const reserveFundAssets = [
  // Structure
  { group: "Structure", subGroup: "Foundations", element: "Concrete footings", unit: "m²", lifeExpectancy: 75, replacementCostPerUnit: 1200, quantity: "325" },
  { group: "Structure", subGroup: "Substructure", element: "Basement walls", unit: "m²", lifeExpectancy: 60, replacementCostPerUnit: 850, quantity: "480" },
  { group: "Structure", subGroup: "Frame", element: "Concrete columns", unit: "each", lifeExpectancy: 75, replacementCostPerUnit: 5500, quantity: "24" },
  { group: "Structure", subGroup: "Frame", element: "Steel beams", unit: "m", lifeExpectancy: 70, replacementCostPerUnit: 750, quantity: "560" },
  { group: "Structure", subGroup: "Upper floors", element: "Reinforced concrete slabs", unit: "m²", lifeExpectancy: 75, replacementCostPerUnit: 320, quantity: "2800" },
  
  // Exterior envelope
  { group: "Envelope", subGroup: "Roof", element: "Roof membrane", unit: "m²", lifeExpectancy: 25, replacementCostPerUnit: 280, quantity: "920" },
  { group: "Envelope", subGroup: "Roof", element: "Roof insulation", unit: "m²", lifeExpectancy: 30, replacementCostPerUnit: 85, quantity: "920" },
  { group: "Envelope", subGroup: "Roof", element: "Roof drainage system", unit: "m", lifeExpectancy: 20, replacementCostPerUnit: 120, quantity: "240" },
  { group: "Envelope", subGroup: "External walls", element: "Curtain wall system", unit: "m²", lifeExpectancy: 35, replacementCostPerUnit: 1600, quantity: "1650" },
  { group: "Envelope", subGroup: "External walls", element: "Exterior paint", unit: "m²", lifeExpectancy: 8, replacementCostPerUnit: 35, quantity: "2200" },
  { group: "Envelope", subGroup: "Windows", element: "Aluminum windows", unit: "m²", lifeExpectancy: 25, replacementCostPerUnit: 850, quantity: "320" },
  { group: "Envelope", subGroup: "External doors", element: "Main entrance doors", unit: "each", lifeExpectancy: 15, replacementCostPerUnit: 12000, quantity: "2" },
  
  // Internal finishes
  { group: "Finishes", subGroup: "Floor finishes", element: "Marble flooring", unit: "m²", lifeExpectancy: 40, replacementCostPerUnit: 450, quantity: "780" },
  { group: "Finishes", subGroup: "Floor finishes", element: "Carpet", unit: "m²", lifeExpectancy: 10, replacementCostPerUnit: 95, quantity: "1200" },
  { group: "Finishes", subGroup: "Ceiling finishes", element: "Suspended ceiling", unit: "m²", lifeExpectancy: 20, replacementCostPerUnit: 120, quantity: "2200" },
  { group: "Finishes", subGroup: "Wall finishes", element: "Interior paint", unit: "m²", lifeExpectancy: 7, replacementCostPerUnit: 28, quantity: "4500" },
  
  // MEP systems
  { group: "Building Services", subGroup: "HVAC", element: "Chillers", unit: "each", lifeExpectancy: 20, replacementCostPerUnit: 230000, quantity: "2" },
  { group: "Building Services", subGroup: "HVAC", element: "Air handling units", unit: "each", lifeExpectancy: 25, replacementCostPerUnit: 45000, quantity: "6" },
  { group: "Building Services", subGroup: "HVAC", element: "Cooling towers", unit: "each", lifeExpectancy: 25, replacementCostPerUnit: 85000, quantity: "2" },
  { group: "Building Services", subGroup: "HVAC", element: "FCU units", unit: "each", lifeExpectancy: 15, replacementCostPerUnit: 4500, quantity: "86" },
  { group: "Building Services", subGroup: "Electrical", element: "Main switchgear", unit: "each", lifeExpectancy: 30, replacementCostPerUnit: 180000, quantity: "1" },
  { group: "Building Services", subGroup: "Electrical", element: "Emergency generator", unit: "each", lifeExpectancy: 25, replacementCostPerUnit: 250000, quantity: "1" },
  { group: "Building Services", subGroup: "Electrical", element: "Distribution boards", unit: "each", lifeExpectancy: 25, replacementCostPerUnit: 15000, quantity: "20" },
  { group: "Building Services", subGroup: "Plumbing", element: "Water storage tanks", unit: "each", lifeExpectancy: 30, replacementCostPerUnit: 65000, quantity: "2" },
  { group: "Building Services", subGroup: "Plumbing", element: "Booster pump sets", unit: "set", lifeExpectancy: 15, replacementCostPerUnit: 35000, quantity: "2" },
  { group: "Building Services", subGroup: "Plumbing", element: "Water heaters", unit: "each", lifeExpectancy: 12, replacementCostPerUnit: 3800, quantity: "4" },
  { group: "Building Services", subGroup: "Fire", element: "Fire alarm system", unit: "each", lifeExpectancy: 15, replacementCostPerUnit: 120000, quantity: "1" },
  { group: "Building Services", subGroup: "Fire", element: "Sprinkler system", unit: "m²", lifeExpectancy: 25, replacementCostPerUnit: 75, quantity: "3500" },
  { group: "Building Services", subGroup: "Transport", element: "Elevators", unit: "each", lifeExpectancy: 25, replacementCostPerUnit: 320000, quantity: "4" },
  
  // Site and amenities
  { group: "Site", subGroup: "Parking", element: "Asphalt parking area", unit: "m²", lifeExpectancy: 20, replacementCostPerUnit: 120, quantity: "950" },
  { group: "Site", subGroup: "Landscape", element: "Irrigation system", unit: "m²", lifeExpectancy: 15, replacementCostPerUnit: 45, quantity: "750" },
  { group: "Site", subGroup: "Amenities", element: "Swimming pool", unit: "each", lifeExpectancy: 25, replacementCostPerUnit: 180000, quantity: "1" },
  { group: "Site", subGroup: "Amenities", element: "Gym equipment", unit: "lot", lifeExpectancy: 8, replacementCostPerUnit: 65000, quantity: "1" }
];

// Condition ratings for assets
const conditionRatings = ['A', 'B', 'C', 'D', 'E'];
const priorityRatings = ['1', '2', '3', '4', '5'];

// Generate a random condition rating with weights (more common to find Bs and Cs than As or Es)
function generateConditionRating(): string {
  const rand = Math.random();
  if (rand < 0.1) return 'A'; // 10% new condition
  if (rand < 0.35) return 'B'; // 25% good condition
  if (rand < 0.75) return 'C'; // 40% moderate condition
  if (rand < 0.95) return 'D'; // 20% poor condition
  return 'E'; // 5% very poor condition
}

// Generate a random priority rating with weights (more common to have medium priority)
function generatePriorityRating(): string {
  const rand = Math.random();
  if (rand < 0.05) return '1'; // 5% urgent (immediate attention)
  if (rand < 0.20) return '2'; // 15% high priority
  if (rand < 0.70) return '3'; // 50% medium priority
  if (rand < 0.90) return '4'; // 20% lower priority
  return '5'; // 10% lowest priority
}

// Generate a random year between startYear and endYear
function generateRandomYear(startYear: number, endYear: number): number {
  return Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
}

// Generate a test project for reserve fund study
export async function generateReserveFundProject(projectName: string, propertyType: "Apartment" | "Villa" | "Townhouse" | "Penthouse" | "Commercial" | "Office" | "Retail" | "Other", propertyAge: number): Promise<any> {
  const currentYear = new Date().getFullYear();
  const constructionYear = currentYear - propertyAge;
  
  // Create test project with RERA audit type
  const projectData = {
    name: projectName,
    clientName: propertyType === "Commercial" ? "Dubai Properties Investment LLC" : "Marina Heights Owners Association",
    location: propertyType === "Commercial" ? "Business Bay, Dubai" : "Dubai Marina, Dubai",
    date: new Date(),
    propertyType: propertyType,
    propertySize: propertyType === "Commercial" ? "35,000 sqm" : "22,500 sqm",
    status: "in_progress" as const,
    userId: 1,
    projectType: "rera_audit" as const,
    reraAuditType: "reserve_fund_study" as const,
    yearOfConstruction: constructionYear,
    constructionYear: constructionYear, // Duplicate field for compatibility
    lastMajorRenovation: generateRandomYear(constructionYear + 5, currentYear - 1),
    buildingType: propertyType === "Commercial" ? "commercial" : "residential",
    areaPerUnit: propertyType === "Commercial" ? "150" : "120",
    numberOfUnits: propertyType === "Commercial" ? "160" : "120",
    numberOfFloors: propertyType === "Commercial" ? 12 : 30,
    totalArea: propertyType === "Commercial" ? 35000 : 22500,
    commonAreaPercentage: propertyType === "Commercial" ? "35" : "25",
    constructionType: propertyType === "Commercial" ? "Steel and concrete" : "Reinforced concrete",
    reserveItems: propertyType === "Commercial" ? "33" : "33"
  };

  const project = await storage.createProject(projectData);
  console.log(`Created reserve fund project: ${project.name} (ID: ${project.id})`);
  
  // Create location objects
  console.log(`Creating locations for the project...`);
  const locations = [];
  
  // Main locations based on property type
  const mainLocations = propertyType === "Commercial" 
    ? ["Ground Floor", "Typical Floors (1-10)", "Mechanical Floors", "Roof", "Basement Parking", "External Areas"]
    : ["Ground Floor Common Areas", "Residential Floors (1-30)", "Podium Level", "Roof", "Basement Parking", "Swimming Pool & Amenities"];
  
  for (const locationName of mainLocations) {
    const locationData = {
      projectId: project.id,
      name: locationName,
      type: "area" as const, // Use 'as const' to specify literal type
      parentId: null
    };
    
    try {
      const location = await storage.createLocation(locationData);
      locations.push(location);
      console.log(`Created location: ${locationName} (ID: ${location.id})`);
    } catch (error) {
      console.error(`Failed to create location ${locationName}:`, error);
    }
  }
  
  // Create NRM3 Classifications for building components
  console.log(`Creating NRM3 Classifications for the project...`);
  const classifications = [];
  
  for (const asset of reserveFundAssets) {
    const classificationData = {
      projectId: project.id,
      nrmGroup: asset.group,
      nrmSubGroup: asset.subGroup,
      nrmElement: asset.element,
      description: asset.element,
      unit: asset.unit,
      quantity: asset.quantity,
      lifeExpectancy: asset.lifeExpectancy,
      costPerUnit: asset.replacementCostPerUnit,
      locationId: locations[Math.floor(Math.random() * locations.length)].id
    };
    
    try {
      const classification = await storage.createNrm3Classification(classificationData);
      classifications.push(classification);
      console.log(`Created classification: ${asset.element} (ID: ${classification.id})`);
    } catch (error) {
      console.error(`Failed to create classification ${asset.element}:`, error);
    }
  }
  
  // Create condition assessments for each classification
  console.log(`Creating condition assessments for the project...`);
  const assessments = [];
  
  for (const classification of classifications) {
    const conditionRating = generateConditionRating();
    const priorityRating = generatePriorityRating();
    
    const assessmentData = {
      projectId: project.id,
      classificationId: classification.id,
      conditionRating,
      priorityRating,
      observations: getObservationText(classification.description, conditionRating),
      recommendations: getRecommendationText(classification.description, conditionRating, priorityRating)
    };
    
    try {
      const assessment = await storage.createConditionAssessment(assessmentData);
      assessments.push(assessment);
      console.log(`Created assessment for ${classification.description} (ID: ${assessment.id})`);
    } catch (error) {
      console.error(`Failed to create assessment for ${classification.description}:`, error);
    }
  }
  
  // Create reserve fund settings
  const settingsData = {
    projectId: project.id,
    startBalance: 2500000, // 2.5 million AED starting balance
    interestRate: "0.02",  // 2% interest rate
    inflationRate: "0.025", // 2.5% inflation rate
    studyPeriod: 30,
    baseYear: currentYear,
    annualContribution: 1800000, // 1.8 million AED annual contribution
    contributionStrategy: "escalating",
    escalationRate: "0.03", // 3% annual escalation
    currentContribution: 1500000 // Current 1.5 million AED annual contribution
  };
  
  try {
    const settings = await storage.createReserveFundSettings(settingsData);
    console.log(`Created reserve fund settings (ID: ${settings.id})`);
  } catch (error) {
    console.error(`Failed to create reserve fund settings:`, error);
  }
  
  return {
    project,
    locations,
    classifications,
    assessments
  };
}

// Helper functions for generating realistic assessment text
function getObservationText(element: string, conditionRating: string): string {
  const observations = {
    'A': [
      `The ${element} is in excellent condition with no visible signs of deterioration.`,
      `${element} appears new or recently replaced with no operational issues noted.`,
      `No defects observed in the ${element}. System is functioning as designed.`
    ],
    'B': [
      `The ${element} is in good condition with minor signs of wear consistent with age.`,
      `${element} shows normal aging but remains fully functional with no significant issues.`,
      `Minor wear observed in the ${element}, but no immediate concerns regarding functionality.`
    ],
    'C': [
      `The ${element} shows moderate deterioration consistent with its age.`,
      `${element} is functioning adequately but with visible signs of aging and wear.`,
      `Some components of the ${element} may require maintenance in the near future.`
    ],
    'D': [
      `The ${element} exhibits significant deterioration and reduced efficiency.`,
      `${element} is showing signs of failure in some areas and requires attention.`,
      `Multiple issues identified with the ${element} that impact performance and reliability.`
    ],
    'E': [
      `The ${element} is in very poor condition and at risk of imminent failure.`,
      `${element} has reached the end of its useful life and requires replacement.`,
      `Critical deterioration observed in the ${element}, posing potential safety concerns.`
    ]
  };
  
  // Type assertion to fix the indexing issue
  const rating = conditionRating as keyof typeof observations;
  const fallbackRating = 'C' as keyof typeof observations;
  const options = observations[rating] || observations[fallbackRating];
  return options[Math.floor(Math.random() * options.length)];
}

function getRecommendationText(element: string, conditionRating: string, priorityRating: string): string {
  // Base recommendations on condition and priority
  if (conditionRating === 'A') {
    return `Continue routine maintenance of the ${element}. Schedule regular inspections to maintain current condition.`;
  }
  
  if (conditionRating === 'B') {
    return `Implement preventative maintenance for the ${element}. Budget for potential repairs within 3-5 years.`;
  }
  
  if (conditionRating === 'C') {
    if (priorityRating === '3' || priorityRating === '4' || priorityRating === '5') {
      return `Plan for partial replacement or major maintenance of the ${element} within the next 3-7 years.`;
    } else {
      return `Schedule maintenance for the ${element} within the next 1-2 years to prevent further deterioration.`;
    }
  }
  
  if (conditionRating === 'D') {
    if (priorityRating === '1' || priorityRating === '2') {
      return `Prioritize replacement of the ${element} within the next 1-2 years to prevent potential failure.`;
    } else {
      return `Budget for replacement of the ${element} within the next 2-4 years. Increase monitoring frequency.`;
    }
  }
  
  if (conditionRating === 'E') {
    if (priorityRating === '1') {
      return `Immediate replacement of the ${element} is required due to critical condition and safety concerns.`;
    } else {
      return `Replace the ${element} within the next year. Consider temporary measures to mitigate risks in the meantime.`;
    }
  }
  
  return `Evaluate the ${element} further and develop a specific maintenance or replacement strategy.`;
}

// Function to create two sample reserve fund projects
export async function generateSampleReserveFundProjects() {
  try {
    // Create commercial office building project
    const commercialProject = await generateReserveFundProject(
      "Business Bay Office Tower Reserve Fund Study",
      "Commercial",
      12 // 12 years old
    );
    
    // Create residential tower project
    const residentialProject = await generateReserveFundProject(
      "Marina Heights Residences Reserve Fund Study",
      "Apartment",
      8 // 8 years old
    );
    
    console.log("Successfully created two sample reserve fund projects");
    return { commercialProject, residentialProject };
  } catch (error) {
    console.error('Error generating reserve fund projects:', error);
    throw error;
  }
}