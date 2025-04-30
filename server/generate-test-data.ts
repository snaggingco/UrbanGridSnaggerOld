import { generateTestProject } from './test-data-generator';
import { storage } from './storage';
import fs from 'fs';
import path from 'path';

// Placeholder test images for defects - these would normally be uploaded by the user
const testImages = [
  'wall-crack.jpg',
  'ceiling-stain.jpg',
  'floor-damage.jpg',
  'door-alignment.jpg',
  'plumbing-leak.jpg',
  'electrical-issue.jpg',
  'paint-issue.jpg',
  'window-seal.jpg',
];

// Create test uploads folder if it doesn't exist
function createUploadsFolder() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadsDir}`);
  }
}

// Create random test images in the uploads folder
function createTestImages() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const sampleImagesDir = path.join(process.cwd(), 'server', 'sample-images');
  
  // Create simple placeholder images
  for (let i = 0; i < testImages.length; i++) {
    const imageName = testImages[i];
    const imagePath = path.join(uploadsDir, imageName);
    
    // Create a simple placeholder image
    const imageContent = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" />
        <text x="50%" y="50%" font-family="Arial" font-size="30" text-anchor="middle">${imageName}</text>
        <text x="50%" y="58%" font-family="Arial" font-size="20" text-anchor="middle">Sample defect image</text>
      </svg>
    `;
    
    fs.writeFileSync(imagePath, imageContent);
    console.log(`Created placeholder image: ${imagePath}`);
  }
}

// Associate images with defects
async function associateImagesWithDefects(projectId: number, defects: any[]) {
  for (let i = 0; i < defects.length; i++) {
    const defect = defects[i];
    
    // Add 1-3 random images to each defect
    const numImages = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numImages; j++) {
      const imageIndex = Math.floor(Math.random() * testImages.length);
      const imageName = testImages[imageIndex];
      
      await storage.uploadImage({
        projectId,
        defectId: defect.id,
        url: `/uploads/${imageName}`,
        filename: imageName,
        description: `Test image for ${defect.title}`,
        isAnnotated: Math.random() > 0.7, // 30% chance of being annotated
        annotations: Math.random() > 0.7 ? JSON.stringify([
          {
            type: 'circle',
            x: 400,
            y: 300,
            width: 100,
            height: 100,
            color: '#FF0000'
          }
        ]) : null
      });
      
      console.log(`Added image ${j+1}/${numImages} to defect ${i+1}/${defects.length}`);
    }
  }
}

// Generate test data
async function generateTestData() {
  try {
    console.log('Creating test uploads folder...');
    createUploadsFolder();
    
    console.log('Creating test images...');
    createTestImages();
    
    console.log('Generating test project with defects...');
    const { project, defects, locationObjects } = await generateTestProject(50);
    
    console.log('Associating images with defects...');
    await associateImagesWithDefects(project.id, defects);
    
    console.log('Generating report...');
    const report = await storage.generateReport(project.id);
    
    console.log('Test data generation complete!');
    console.log(`Project ID: ${project.id}`);
    console.log(`Number of rooms: ${locationObjects.length}`);
    console.log(`Number of defects: ${defects.length}`);
    console.log(`Report status: ${report.status}`);
    
    return { project, locationObjects, defects, report };
  } catch (error) {
    console.error('Error generating test data:', error);
    throw error;
  }
}

// For direct CLI execution
export async function runGenerateTestData() {
  try {
    const result = await generateTestData();
    console.log('Successfully generated test data');
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Self-executing function when imported directly
runGenerateTestData().catch(err => {
  console.error('Failed to generate test data:', err);
});