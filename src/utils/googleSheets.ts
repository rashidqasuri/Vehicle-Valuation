import { InspectionReport, GoogleSheetsSyncStatus, BackupSchedule } from '../types';

const SPREADSHEET_TITLE = 'Pak_Valuations_Punjab_Database';

export const getStoredSheetsStatus = (): GoogleSheetsSyncStatus => {
  try {
    const saved = localStorage.getItem('google_sheets_sync_status');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to read Google Sheets status from storage', e);
  }
  return {
    autoSyncEnabled: true,
    backupSchedule: 'weekly',
    totalSyncedCount: 0,
  };
};

export const saveStoredSheetsStatus = (status: GoogleSheetsSyncStatus) => {
  try {
    localStorage.setItem('google_sheets_sync_status', JSON.stringify(status));
  } catch (e) {
    console.error('Failed to save Google Sheets status to storage', e);
  }
};

/**
 * Searches Google Drive for an existing database spreadsheet or creates a new structured one.
 */
export const findOrCreateSpreadsheet = async (accessToken: string): Promise<{ id: string; url: string }> => {
  try {
    // 1. Search for existing file
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_TITLE}'+and+mimeType='application/vnd.google-apps.spreadsheet'+and+trashed=false&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const file = searchData.files[0];
        return {
          id: file.id,
          url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`,
        };
      }
    }

    // 2. Create a new Spreadsheet with Valuation_Records & Automated_Dashboard tabs
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: SPREADSHEET_TITLE,
        },
        sheets: [
          {
            properties: {
              title: 'Valuation_Records',
              gridProperties: { frozenRowCount: 1 },
            },
          },
          {
            properties: {
              title: 'Automated_Dashboard',
              gridProperties: { frozenRowCount: 3 },
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      throw new Error(`Failed to create spreadsheet: ${errorText}`);
    }

    const createdData = await createRes.json();
    const spreadsheetId = createdData.spreadsheetId;
    const spreadsheetUrl = createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    // 3. Write Headers for Valuation_Records
    const headers = [
      'Report ID',
      'Inspection Date',
      'Make',
      'Model',
      'Variant',
      'Year',
      'Registration City',
      'Mileage (KM)',
      'Category',
      'Baseline Market PKR',
      'Fair Market Value PKR',
      'Asking Price PKR',
      'Distress Liquidation PKR',
      'Net Deductions PKR',
      'Resale Liquidity',
      'Demand Level',
      'Buyer Interest Score',
      'Turnover (Days)',
      'Price Trend',
      'Smartcard / Book Status',
      'Excise File Status',
      'Biometric Status',
      'Inspector Remarks Summary',
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Valuation_Records!A1:W1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headers],
      }),
    });

    // 4. Initialize Automated_Dashboard Tab with Summary Formulas & Metrics
    const dashboardValues = [
      ['PAKISTAN VEHICLE VALUATION & DEMAND ANALYTICS DASHBOARD'],
      ['Automated Real-Time KPI Rollup (Powered by Google Sheets Formulas)'],
      [],
      ['Metric Overview', 'Formula / Calculated Value', 'Notes / Status'],
      ['Total Appraised Vehicles', '=COUNTA(Valuation_Records!A2:A1000)', 'Count of inspected vehicles'],
      ['Total Appraised Market Portfolio (PKR)', '=SUM(Valuation_Records!K2:K1000)', 'Cumulative Fair Market Value in PKR'],
      ['Average Fair Market Valuation (PKR)', '=IFERROR(AVERAGE(Valuation_Records!K2:K1000), 0)', 'Mean vehicle market price'],
      ['Average Asking Price Recommendation (PKR)', '=IFERROR(AVERAGE(Valuation_Records!L2:L1000), 0)', 'Recommended listing average'],
      ['Average Average Days to Sell', '=IFERROR(AVERAGE(Valuation_Records!R2:R1000), 0)', 'Average market turnover speed'],
      ['Average Buyer Interest Score', '=IFERROR(AVERAGE(Valuation_Records!Q2:Q1000), 0)', 'Mean score out of 100'],
      [],
      ['Demand Velocity Distribution'],
      ['Very High / Hot Items', '=COUNTIF(Valuation_Records!P2:P1000, "*Very High*")', 'High turnover models (e.g. Alto, Civic, Corolla)'],
      ['High Demand Items', '=COUNTIF(Valuation_Records!P2:P1000, "*High Demand*")', 'Steady market turnover'],
      ['Moderate / Niche Demand', '=COUNTIF(Valuation_Records!P2:P1000, "*Moderate*") + COUNTIF(Valuation_Records!P2:P1000, "*Low*")', 'Niche or imported models'],
      [],
      ['Document Verification Risk Summary'],
      ['Original Smartcard Verified', '=COUNTIF(Valuation_Records!T2:T1000, "*original_smartcard*")', 'Clean title vehicles'],
      ['Duplicate / Missing Documents', '=COUNTIF(Valuation_Records!T2:T1000, "*duplicate*") + COUNTIF(Valuation_Records!U2:U1000, "*missing*")', 'Title risk flagged'],
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Automated_Dashboard!A1:C18?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: dashboardValues,
      }),
    });

    return { id: spreadsheetId, url: spreadsheetUrl };
  } catch (err) {
    console.error('Error finding or creating Google Spreadsheet:', err);
    throw err;
  }
};

/**
 * Appends a single report row to the Valuation_Records tab.
 */
export const appendValuationToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  report: InspectionReport
): Promise<boolean> => {
  const { input, baselineMarketValuePkr, matrix, deductions, resaleLiquidity, inspectorComments, marketSentiment } = report;

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amountPkr, 0);
  const formattedDate = new Date(report.timestamp || Date.now()).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const row = [
    report.id,
    formattedDate,
    input.make,
    input.model,
    input.variant,
    input.year,
    input.registrationCity,
    input.mileageKm,
    input.vehicleCategory || 'Passenger Car',
    baselineMarketValuePkr,
    matrix.fairMarketValuePkr,
    matrix.askingPriceRecommendationPkr,
    matrix.distressPricePkr,
    totalDeductions,
    resaleLiquidity,
    marketSentiment?.demandLevel || 'Moderate Demand',
    marketSentiment?.buyerInterestScore || 70,
    marketSentiment?.avgDaysToSell || 15,
    marketSentiment?.priceTrend || 'Stable / Steady',
    input.bookStatus,
    input.fileStatus,
    input.biometricStatus,
    inspectorComments ? inspectorComments.slice(0, 2).join('; ') : 'Inspected',
  ];

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Valuation_Records!A:W:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    console.error('Failed appending to Google Sheet:', errText);
    return false;
  }

  return true;
};

/**
 * Batch syncs multiple reports to Google Sheets.
 */
export const syncBatchValuationsToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  reports: InspectionReport[]
): Promise<number> => {
  let count = 0;
  for (const report of reports) {
    const success = await appendValuationToSheet(accessToken, spreadsheetId, report);
    if (success) count++;
  }
  return count;
};
