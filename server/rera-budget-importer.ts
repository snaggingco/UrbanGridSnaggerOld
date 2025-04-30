import { storage } from './storage';
import { InsertReraBudgetItem } from '@shared/schema';
import XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Utility to import RERA Budget Line Items from the standardized Excel file
 * 
 * This script reads the provided XLSX file with the standardized RERA budget
 * line items as per RERA Audit guidelines and imports them into the database.
 */
export async function importReraBudgetItems(filePath?: string): Promise<number> {
  try {
    // Default file path if not provided
    const defaultPath = path.join(process.cwd(), 'attached_assets', 'Service Charge Budge Line Items.xlsx');
    const fileToUse = filePath || defaultPath;
    
    if (!fs.existsSync(fileToUse)) {
      throw new Error(`File not found: ${fileToUse}`);
    }
    
    // Read the Excel file
    const workbook = XLSX.readFile(fileToUse);
    const sheetName = workbook.SheetNames[0]; // Assuming data is in first sheet
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`Read ${data.length} rows from the RERA budget items spreadsheet`);
    
    if (data.length === 0) {
      throw new Error('No data found in the RERA budget items spreadsheet');
    }
    
    // Format data according to our schema
    const budgetItems: InsertReraBudgetItem[] = data.map((row: any) => {
      // Map the Excel columns to our schema fields
      // We need to handle potentially different column names based on the file structure
      const item: InsertReraBudgetItem = {
        code: row['Code'] || row['code'] || String(row['Item No']) || String(row['Item Number']) || '',
        description: row['Description'] || row['description'] || row['Item Description'] || row['Name'] || '',
        category: row['Category'] || row['category'] || row['Main Category'] || '',
        subCategory: row['Sub Category'] || row['sub_category'] || row['SubCategory'] || null,
        isExcludable: row['Excludable'] === 'Yes' || row['Can Exclude'] === 'Yes' || row['is_excludable'] === true || false,
        notes: row['Notes'] || row['notes'] || row['Additional Details'] || null,
        order: typeof row['Order'] === 'number' ? row['Order'] : 
               typeof row['order'] === 'number' ? row['order'] : 
               typeof row['Display Order'] === 'number' ? row['Display Order'] : null,
      };
      
      // Ensure the required fields are present
      if (!item.code || !item.description || !item.category) {
        console.warn(`Skipping row due to missing required fields: ${JSON.stringify(row)}`);
        return null;
      }
      
      return item;
    }).filter(Boolean) as InsertReraBudgetItem[];
    
    // Import the formatted data
    const importedItems = await storage.importReraBudgetItems(budgetItems);
    console.log(`Successfully imported ${importedItems.length} RERA budget items`);
    
    return importedItems.length;
  } catch (error) {
    console.error('Error importing RERA budget items:', error);
    throw error;
  }
}

// Direct execution from command line is now handled in a separate script
// This module is only meant to be imported in ESM context