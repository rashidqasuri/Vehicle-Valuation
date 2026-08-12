export type CarPanelState = 'clean' | 'touchup' | 'repaint' | 'replaced' | 'damaged';

export interface BodyPanel {
  id: string;
  name: string;
  category: 'exterior' | 'structure';
  state: CarPanelState;
}

export type DocumentBookStatus = 'original_smartcard' | 'original_book' | 'duplicate_book' | 'duplicate_card';
export type DocumentFileStatus = 'original_complete' | 'duplicate_file' | 'missing_file';
export type BiometricStatus = 'instant_available' | 'delayed_available' | 'deceased_owner' | 'uncontactable';
export type TokenTaxStatus = 'up_to_date' | 'unpaid';

export interface VehiclePhotoSlot {
  id: string; // e.g. 'front_view', 'rear_view', ...
  title: string;
  shortLabel: string;
  category: 'exterior' | 'interior' | 'engine_frame' | 'documents';
  description: string;
}

export type BackupSchedule = 'manual' | 'auto_instant' | 'weekly' | 'monthly' | 'yearly';

export interface GoogleSheetsSyncStatus {
  lastSyncTime?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  autoSyncEnabled: boolean;
  backupSchedule: BackupSchedule;
  totalSyncedCount: number;
}

export interface InspectionInput {
  // Section 1: Basic Info
  make: string;
  model: string;
  variant: string;
  year: number;
  vehicleCategory?: string; // Sedan, SUV, Hatchback, Pickup, Bus/Van, Motorcycle, Custom
  registrationCity: string;
  mileageKm: number;
  color: string;
  fuelType: string;

  // Condition Ratings (1-10)
  ratingExterior: number;
  ratingInterior: number;
  ratingEngine: number;
  ratingSuspension: number;

  // Body Panels
  panels: Record<string, CarPanelState>;

  // Mechanical & Electrical Faults
  defects: string[];
  customDefectsText?: string;

  // Documents & Legal Status
  bookStatus: DocumentBookStatus;
  fileStatus: DocumentFileStatus;
  biometricStatus: BiometricStatus;
  tokenTaxStatus: TokenTaxStatus;
  unpaidTokenAmountPkr: number;
  numberPlateType: 'original_oem' | 'duplicate' | 'custom_fancy';

  // Market Baseline
  baselineAskingPkr?: number;
  region: string; // e.g. Lahore / Punjab, Islamabad, Karachi

  // 12 Vehicle Photos (slotId -> base64 dataUrl)
  vehiclePhotos?: Record<string, string>;
}

export interface DeductionItem {
  category: 'Mileage' | 'Body & Paint' | 'Mechanical & Interior' | 'Document & Legal';
  description: string;
  amountPkr: number; // Negative for deduction, positive for addition
  type: 'deduction' | 'addition' | 'neutral';
}

export interface ValuationMatrix {
  distressPricePkr: number;
  fairMarketValuePkr: number;
  askingPriceRecommendationPkr: number;
}

export interface MarketSentiment {
  demandLevel: 'Very High / Hot Item' | 'High Demand' | 'Moderate Demand' | 'Low / Niche Demand';
  onlineListingVolume: number;
  avgDaysToSell: number;
  buyerInterestScore: number;
  priceTrend: 'Appreciating / Strong' | 'Stable / Steady' | 'Softening / High Supply';
  demandSummary: string;
  regionalHotspots: string[];
  listingPriceRangesPkr: {
    lowPkr: number;
    avgPkr: number;
    highPkr: number;
  };
}

export interface InspectionReport {
  id: string;
  timestamp: string;
  input: InspectionInput;
  
  // Structured Results
  baselineMarketValuePkr: number;
  mileageAdjustmentPkr: number;
  deductions: DeductionItem[];
  matrix: ValuationMatrix;
  
  // Section 4 Insights
  inspectorComments: string[];
  resaleLiquidity: 'High Liquidity / Fast Resale' | 'Moderate Resale' | 'Slow Seller / Niche Market';
  criticalVerificationChecklist: string[];

  // Section 5 Market Sentiment (AI Grounded)
  marketSentiment?: MarketSentiment;

  // Markdown format for exact requirement compliance
  fullMarkdownReport: string;
}

export interface PresetVehicle {
  id: string;
  title: string;
  description: string;
  input: InspectionInput;
}
