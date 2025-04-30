// NRM3 Classification structure from the extracted data
export interface NRM3Asset {
  code: string;
  name: string;
  lifespan?: number;        // Expected lifecycle in years
  replacementCost?: number; // Estimated replacement cost
  maintenanceCost?: number; // Annual maintenance cost
}

export interface NRM3SubCategory {
  code: string;
  name: string;
  assets: NRM3Asset[];
}

export interface NRM3Category {
  code: string;
  name: string;
  subCategories: NRM3SubCategory[];
}

export async function loadNRM3ClassificationData(): Promise<NRM3Category[]> {
  try {
    const response = await fetch('/nrm3-classification.json');
    if (!response.ok) {
      throw new Error(`Failed to load NRM3 classification data: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error loading NRM3 classification data:', error);
    return [];
  }
}