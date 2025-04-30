const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to the Excel file
const filePath = path.join(process.cwd(), 'attached_assets', 'Service Charge Budge Line Items.xlsx');

try {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  // Read the Excel file
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // First sheet
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log(`Read ${data.length} rows from the RERA budget items spreadsheet`);

  // Show first 2 items as sample
  console.log('\nSample data (first 2 rows):');
  console.log(JSON.stringify(data.slice(0, 2), null, 2));

  // List all available column headers
  if (data.length > 0) {
    console.log('\nAvailable columns:');
    console.log(Object.keys(data[0]));
  }
  
} catch (error) {
  console.error('Error processing Excel file:', error);
  process.exit(1);
}