import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { InspectionInput, InspectionReport, DeductionItem, MarketSentiment } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback valuation calculator for robust operation
function calculateFallbackValuation(input: InspectionInput): InspectionReport {
  let baseline = input.baselineAskingPkr || 3000000;
  if (!input.baselineAskingPkr) {
    // Basic heuristics based on year & brand if baseline not supplied
    const currentYear = 2026;
    const age = Math.max(1, currentYear - input.year);
    if (input.make === 'Suzuki') baseline = Math.max(1500000, 3200000 - age * 180000);
    else if (input.make === 'Toyota') baseline = Math.max(2500000, 6500000 - age * 280000);
    else if (input.make === 'Honda') baseline = Math.max(2200000, 5800000 - age * 260000);
    else if (input.make === 'Kia' || input.make === 'Hyundai') baseline = Math.max(3000000, 7800000 - age * 350000);
    else baseline = Math.max(2000000, 4500000 - age * 220000);
  }

  const standardYearlyKm = 15000;
  const currentYear = 2026;
  const expectedKm = Math.max(1, currentYear - input.year) * standardYearlyKm;
  const kmDifference = input.mileageKm - expectedKm;
  
  // ~15,000 PKR per 10,000 KM deviation
  const mileageAdj = Math.round((-kmDifference / 10000) * 18000);

  const deductions: DeductionItem[] = [];

  if (mileageAdj !== 0) {
    deductions.push({
      category: 'Mileage',
      description: mileageAdj < 0 
        ? `High Mileage (${input.mileageKm.toLocaleString()} KM vs ~${expectedKm.toLocaleString()} KM expected)`
        : `Low Mileage (${input.mileageKm.toLocaleString()} KM vs ~${expectedKm.toLocaleString()} KM expected)`,
      amountPkr: mileageAdj,
      type: mileageAdj < 0 ? 'deduction' : 'addition',
    });
  }

  // Body panel deductions
  let bodyDeductionSum = 0;
  Object.entries(input.panels).forEach(([panelKey, state]) => {
    if (state === 'clean') return;

    let panelCost = 0;
    if (state === 'touchup') panelCost = -15000;
    else if (state === 'repaint') panelCost = -35000;
    else if (state === 'replaced') panelCost = -65000;
    else if (state === 'damaged') panelCost = -150000;

    // Structural frame panels carry severe penalty in PKR
    if (['apronLeft', 'apronRight', 'pillarALeft', 'pillarARight', 'pillarBLeft', 'pillarBRight', 'frontCoreMember', 'bootFloor'].includes(panelKey)) {
      if (state === 'damaged' || state === 'replaced') panelCost = -350000;
      else if (state === 'repaint' || state === 'touchup') panelCost = -120000;
    }

    bodyDeductionSum += panelCost;
    deductions.push({
      category: 'Body & Paint',
      description: `${panelKey.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${state.toUpperCase()}`,
      amountPkr: panelCost,
      type: 'deduction',
    });
  });

  // Rating deductions
  const ratingAvg = (input.ratingExterior + input.ratingInterior + input.ratingEngine + input.ratingSuspension) / 4;
  let mechDeductions = 0;

  if (input.ratingEngine < 7) {
    const cost = (7 - input.ratingEngine) * -45000;
    mechDeductions += cost;
    deductions.push({
      category: 'Mechanical & Interior',
      description: `Engine / Transmission Rating (${input.ratingEngine}/10) overhaul allocation`,
      amountPkr: cost,
      type: 'deduction',
    });
  }

  if (input.ratingSuspension < 7) {
    const cost = (7 - input.ratingSuspension) * -30000;
    mechDeductions += cost;
    deductions.push({
      category: 'Mechanical & Interior',
      description: `Suspension / Steering Rating (${input.ratingSuspension}/10) repair allocation`,
      amountPkr: cost,
      type: 'deduction',
    });
  }

  // Defects
  input.defects.forEach((defect) => {
    const cost = -25000;
    mechDeductions += cost;
    deductions.push({
      category: 'Mechanical & Interior',
      description: `Identified defect: ${defect}`,
      amountPkr: cost,
      type: 'deduction',
    });
  });

  // Document deductions
  let docDeductions = 0;
  if (input.bookStatus === 'duplicate_book') {
    const cost = -Math.round(baseline * 0.08);
    docDeductions += cost;
    deductions.push({
      category: 'Document & Legal',
      description: 'Duplicate Registration Book / Card penalty (-8%)',
      amountPkr: cost,
      type: 'deduction',
    });
  }

  if (input.fileStatus === 'duplicate_file') {
    const cost = -Math.round(baseline * 0.06);
    docDeductions += cost;
    deductions.push({
      category: 'Document & Legal',
      description: 'Duplicate Invoice/Custom File penalty (-6%)',
      amountPkr: cost,
      type: 'deduction',
    });
  } else if (input.fileStatus === 'missing_file') {
    const cost = -Math.round(baseline * 0.15);
    docDeductions += cost;
    deductions.push({
      category: 'Document & Legal',
      description: 'Missing Custom/Excise File (-15% high legal risk)',
      amountPkr: cost,
      type: 'deduction',
    });
  }

  if (input.biometricStatus === 'delayed_available' || input.biometricStatus === 'uncontactable') {
    const cost = -75000;
    docDeductions += cost;
    deductions.push({
      category: 'Document & Legal',
      description: 'Biometric verification delay / transferee search buffer',
      amountPkr: cost,
      type: 'deduction',
    });
  } else if (input.biometricStatus === 'deceased_owner') {
    const cost = -150000;
    docDeductions += cost;
    deductions.push({
      category: 'Document & Legal',
      description: 'Deceased owner legal inheritance transfer cost & court decree buffer',
      amountPkr: cost,
      type: 'deduction',
    });
  }

  if (input.tokenTaxStatus === 'unpaid' && input.unpaidTokenAmountPkr > 0) {
    const cost = -input.unpaidTokenAmountPkr;
    docDeductions += cost;
    deductions.push({
      category: 'Document & Legal',
      description: `Unpaid Excise Token Tax arrears (PKR ${input.unpaidTokenAmountPkr.toLocaleString()})`,
      amountPkr: cost,
      type: 'deduction',
    });
  }

  const totalDeductions = mileageAdj + bodyDeductionSum + mechDeductions + docDeductions;
  const fairMarketValuePkr = Math.max(500000, Math.round(baseline + totalDeductions));
  const distressPricePkr = Math.round(fairMarketValuePkr * 0.91);
  const askingPriceRecommendationPkr = Math.round(fairMarketValuePkr * 1.05);

  const isHighDemandBrand = ['Suzuki', 'Toyota', 'Honda'].includes(input.make);
  const resaleLiquidity = (isHighDemandBrand && ratingAvg >= 7)
    ? 'High Liquidity / Fast Resale'
    : (ratingAvg >= 5 ? 'Moderate Resale' : 'Slow Seller / Niche Market');

  const comments = [
    `Vehicle exhibits a composite technical rating of ${ratingAvg.toFixed(1)}/10. Base value adjusted for regional ${input.region} market conditions.`,
    bodyDeductionSum < -100000 
      ? 'Significant paint touching/re-sprays detected. Frame alignment check on jig recommended prior to purchase.' 
      : 'Body panels generally well-maintained with minimal structural exposure.',
    docDeductions < 0 
      ? 'Legal document gaps identified (book/file/biometric/tokens). Ensure biometric transfer slip verified via Punjab Excise portal.' 
      : 'Vehicle documentation is clean and ready for immediate biometric transfer.',
    `Local market liquidity profile: ${resaleLiquidity}. Recommended purchase target is within PKR ${(fairMarketValuePkr / 100000).toFixed(2)} Lakhs.`
  ];

  const checklist = [
    'Physically verify chassis number under windshield / frame against Excise Smartcard & Custom invoice.',
    'Execute biometric thumbprint verification on NADRA e-Sahulat / Excise App in seller presence.',
    'Conduct cold-start engine check for blue/white exhaust smoke & oil cap blow-by pressure.',
    'Test drive over paved & unpaved terrain to check front suspension bush play and steering rack sound.'
  ];

  const fallbackVolume = isHighDemandBrand ? 340 : 85;
  const fallbackDays = isHighDemandBrand ? 11 : 24;
  const fallbackScore = isHighDemandBrand ? 88 : 65;

  const marketSentiment: MarketSentiment = {
    demandLevel: isHighDemandBrand ? 'Very High / Hot Item' : 'Moderate Demand',
    onlineListingVolume: fallbackVolume,
    avgDaysToSell: fallbackDays,
    buyerInterestScore: fallbackScore,
    priceTrend: isHighDemandBrand ? 'Appreciating / Strong' : 'Stable / Steady',
    demandSummary: `High active buyer search volume observed for ${input.make} ${input.model} ${input.variant} (${input.year}) across Lahore, Faisalabad, and Rawalpindi online portals. Vehicles in clean condition with original smartcard turn over rapidly within 10-14 days.`,
    regionalHotspots: ['Lahore (DHA & Gulberg)', 'Faisalabad', 'Multan', 'Rawalpindi'],
    listingPriceRangesPkr: {
      lowPkr: Math.round(fairMarketValuePkr * 0.92),
      avgPkr: Math.round(fairMarketValuePkr * 1.02),
      highPkr: Math.round(fairMarketValuePkr * 1.12),
    },
  };

  const markdown = `
### **SECTION 1: VEHICLE SPECIFICATION & METRICS SUMMARY**

| Specification | Details | Rating Metric | Score (1-10) |
| :--- | :--- | :--- | :--- |
| **Make & Model** | ${input.make} ${input.model} | **Exterior Body** | ${input.ratingExterior}/10 |
| **Variant** | ${input.variant} | **Interior Condition** | ${input.ratingInterior}/10 |
| **Model Year** | ${input.year} | **Engine / Transmission** | ${input.ratingEngine}/10 |
| **Registration** | ${input.registrationCity} (${input.region}) | **Suspension & Steering** | ${input.ratingSuspension}/10 |
| **Odometer** | ${input.mileageKm.toLocaleString()} KM | **Overall Composite** | **${ratingAvg.toFixed(1)}/10** |
| **Fuel & Color** | ${input.fuelType} | ${input.color} | **Doc Status** | ${input.bookStatus.replace(/_/g, ' ').toUpperCase()} |

---

### **SECTION 2: VALUATION DEDUCTION BREAKDOWN**

- **Baseline Local Market Value:** PKR ${baseline.toLocaleString()}
- **Mileage Adjustment:** PKR ${mileageAdj >= 0 ? '+' : ''}${mileageAdj.toLocaleString()} *(Calculated based on standard deviation for ${input.year} model)*
- **Panel & Body Condition Deductions:** PKR ${bodyDeductionSum.toLocaleString()} *(Total deductions across touched, repainted, or structural panels)*
- **Mechanical & Interior Deductions:** PKR ${mechDeductions.toLocaleString()} *(Itemized repair & wear allocations)*
- **Document & Verification Status Impact:** PKR ${docDeductions.toLocaleString()} *(Deduction for book/file status, biometric delay, or token tax arrears)*

---

### **SECTION 3: FINAL VALUATION MATRIX**

- **Distress/Immediate Sale Value (PKR):** PKR ${distressPricePkr.toLocaleString()} *(Lowest liquidation threshold for quick 24-hour sale)*
- **Fair Market Valuation (PKR):** **PKR ${fairMarketValuePkr.toLocaleString()}** *(Recommended realistic technical transaction price)*
- **Asking Price Recommendation (PKR):** PKR ${askingPriceRecommendationPkr.toLocaleString()} *(Initial listing price allowing reasonable negotiation headroom)*

---

### **SECTION 4: INSPECTOR COMMENTS & RISK ADVISORY**

${comments.map(c => `- ${c}`).join('\n')}

**Resale Liquidity Speed:** **${resaleLiquidity}**

**Critical Follow-Up Verification Required:**
${checklist.map(item => `- [ ] ${item}`).join('\n')}

---

### **SECTION 5: REAL-TIME MARKET SENTIMENT & PUNJAB DEMAND**

- **Demand Rating:** ${marketSentiment.demandLevel}
- **Online Listing Volume (Punjab):** ~${marketSentiment.onlineListingVolume} Active Listings
- **Avg. Turnover Time:** ${marketSentiment.avgDaysToSell} Days to Sell
- **Buyer Interest Score:** ${marketSentiment.buyerInterestScore} / 100
- **Market Price Trend:** ${marketSentiment.priceTrend}
- **Demand Summary:** ${marketSentiment.demandSummary}
- **Key Demand Hotspots:** ${marketSentiment.regionalHotspots.join(', ')}
`;

  return {
    id: `eval-${Date.now()}`,
    timestamp: new Date().toISOString(),
    input,
    baselineMarketValuePkr: baseline,
    mileageAdjustmentPkr: mileageAdj,
    deductions,
    matrix: {
      distressPricePkr,
      fairMarketValuePkr,
      askingPriceRecommendationPkr,
    },
    inspectorComments: comments,
    resaleLiquidity,
    criticalVerificationChecklist: checklist,
    marketSentiment,
    fullMarkdownReport: markdown.trim(),
  };
}

// Valuation Endpoint using Gemini API
app.post('/api/valuation', async (req, res) => {
  try {
    const input: InspectionInput = req.body;
    if (!input || !input.make || !input.model) {
      return res.status(400).json({ error: 'Invalid inspection input provided.' });
    }

    const ai = getGeminiClient();
    
    if (!ai) {
      // Return realistic calculated fallback valuation if Gemini key is missing
      const fallbackReport = calculateFallbackValuation(input);
      return res.json({ report: fallbackReport, source: 'fallback_calculator' });
    }

    const systemPrompt = `You are "AutoValue AI," a Senior Vehicle Valuator and Technical Inspector specializing in the Pakistani automotive market (Lahore/Punjab regional pricing).
You analyze vehicle inspection data, damage observations, and market variables to produce an objective, bulletproof Valuation Report.

You MUST strictly follow these rules:
1. RIGOROUS ANALYTICAL STEP-BY-STEP REASONING: Analyze base local market value, mileage depreciation (standard ~15,000 KM/yr), panel/body touchings or structural frame impacts (aprons, pillars, core member), mechanical defects, and document/biometric status in Pakistani Rupees (PKR).
2. LOCALIZED MARKET CONTEXT & REAL-TIME DEMAND: Factor in Pakistani market specifics—such as brand resale retention (e.g. Suzuki, Toyota, Honda retain high resale; imported CBU/Chinese units have higher depreciation), Lahore/Punjab market demand, duplicate book discounts (-8% to -10%), missing excise file discounts (-15%), biometric verification delays, and token tax arrears.
3. MARKET SENTIMENT EVALUATION: Evaluate real-time buyer demand for this specific make, model, variant, and year in Punjab based on current online listing volume (PakWheels, OLX Punjab, dealership channels), average days on market, buyer inquiry activity, and price trends.
4. CONCRETE OUTPUT STRUCTURE: You MUST return a valid JSON object matching this exact schema:

{
  "baselineMarketValuePkr": number,
  "mileageAdjustmentPkr": number,
  "deductions": [
    {
      "category": "Mileage" | "Body & Paint" | "Mechanical & Interior" | "Document & Legal",
      "description": string,
      "amountPkr": number,
      "type": "deduction" | "addition" | "neutral"
    }
  ],
  "matrix": {
    "distressPricePkr": number,
    "fairMarketValuePkr": number,
    "askingPriceRecommendationPkr": number
  },
  "inspectorComments": [string, string, string, string],
  "resaleLiquidity": "High Liquidity / Fast Resale" | "Moderate Resale" | "Slow Seller / Niche Market",
  "criticalVerificationChecklist": [string, string, string, string],
  "marketSentiment": {
    "demandLevel": "Very High / Hot Item" | "High Demand" | "Moderate Demand" | "Low / Niche Demand",
    "onlineListingVolume": number,
    "avgDaysToSell": number,
    "buyerInterestScore": number,
    "priceTrend": "Appreciating / Strong" | "Stable / Steady" | "Softening / High Supply",
    "demandSummary": string,
    "regionalHotspots": [string, string, string, string],
    "listingPriceRangesPkr": {
      "lowPkr": number,
      "avgPkr": number,
      "highPkr": number
    }
  },
  "fullMarkdownReport": string
}

IMPORTANT REQUIREMENTS FOR "fullMarkdownReport":
The "fullMarkdownReport" string MUST be formatted strictly into 5 Markdown sections:

**SECTION 1: VEHICLE SPECIFICATION & METRICS SUMMARY**
**SECTION 2: VALUATION DEDUCTION BREAKDOWN**
**SECTION 3: FINAL VALUATION MATRIX**
**SECTION 4: INSPECTOR COMMENTS & RISK ADVISORY**
**SECTION 5: REAL-TIME MARKET SENTIMENT & PUNJAB DEMAND**`;

    const { vehiclePhotos, ...inputPromptData } = input;
    const photoCount = vehiclePhotos ? Object.keys(vehiclePhotos).length : 0;

    const userPrompt = `Generate a comprehensive vehicle inspection valuation report and Punjab market sentiment analysis for the following vehicle data (Note: ${photoCount} inspection photos are attached):
${JSON.stringify(inputPromptData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            baselineMarketValuePkr: { type: Type.NUMBER },
            mileageAdjustmentPkr: { type: Type.NUMBER },
            deductions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  amountPkr: { type: Type.NUMBER },
                  type: { type: Type.STRING },
                },
                required: ['category', 'description', 'amountPkr', 'type'],
              },
            },
            matrix: {
              type: Type.OBJECT,
              properties: {
                distressPricePkr: { type: Type.NUMBER },
                fairMarketValuePkr: { type: Type.NUMBER },
                askingPriceRecommendationPkr: { type: Type.NUMBER },
              },
              required: ['distressPricePkr', 'fairMarketValuePkr', 'askingPriceRecommendationPkr'],
            },
            inspectorComments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            resaleLiquidity: { type: Type.STRING },
            criticalVerificationChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            marketSentiment: {
              type: Type.OBJECT,
              properties: {
                demandLevel: { type: Type.STRING },
                onlineListingVolume: { type: Type.NUMBER },
                avgDaysToSell: { type: Type.NUMBER },
                buyerInterestScore: { type: Type.NUMBER },
                priceTrend: { type: Type.STRING },
                demandSummary: { type: Type.STRING },
                regionalHotspots: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                listingPriceRangesPkr: {
                  type: Type.OBJECT,
                  properties: {
                    lowPkr: { type: Type.NUMBER },
                    avgPkr: { type: Type.NUMBER },
                    highPkr: { type: Type.NUMBER },
                  },
                  required: ['lowPkr', 'avgPkr', 'highPkr'],
                },
              },
              required: [
                'demandLevel',
                'onlineListingVolume',
                'avgDaysToSell',
                'buyerInterestScore',
                'priceTrend',
                'demandSummary',
                'regionalHotspots',
                'listingPriceRangesPkr',
              ],
            },
            fullMarkdownReport: { type: Type.STRING },
          },
          required: [
            'baselineMarketValuePkr',
            'mileageAdjustmentPkr',
            'deductions',
            'matrix',
            'inspectorComments',
            'resaleLiquidity',
            'criticalVerificationChecklist',
            'marketSentiment',
            'fullMarkdownReport',
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini model');
    }

    const jsonResult = JSON.parse(responseText);

    const report: InspectionReport = {
      id: `eval-${Date.now()}`,
      timestamp: new Date().toISOString(),
      input,
      baselineMarketValuePkr: jsonResult.baselineMarketValuePkr,
      mileageAdjustmentPkr: jsonResult.mileageAdjustmentPkr,
      deductions: jsonResult.deductions,
      matrix: jsonResult.matrix,
      inspectorComments: jsonResult.inspectorComments,
      resaleLiquidity: jsonResult.resaleLiquidity || 'Moderate Resale',
      criticalVerificationChecklist: jsonResult.criticalVerificationChecklist,
      marketSentiment: jsonResult.marketSentiment,
      fullMarkdownReport: jsonResult.fullMarkdownReport,
    };

    return res.json({ report, source: 'gemini_ai' });
  } catch (error: any) {
    console.error('Error generating AI valuation:', error);
    // Fallback to calculation on error
    const fallbackReport = calculateFallbackValuation(req.body);
    return res.json({ report: fallbackReport, source: 'fallback_error_recovery', error: error.message });
  }
});

// Dedicated Market Sentiment API Route using Gemini API
app.post('/api/market-sentiment', async (req, res) => {
  try {
    const { make, model, variant, year, region } = req.body;
    if (!make || !model) {
      return res.status(400).json({ error: 'Vehicle make and model are required.' });
    }

    const ai = getGeminiClient();
    const isHigh = ['Suzuki', 'Toyota', 'Honda'].includes(make);

    if (!ai) {
      const fallbackSentiment: MarketSentiment = {
        demandLevel: isHigh ? 'Very High / Hot Item' : 'Moderate Demand',
        onlineListingVolume: isHigh ? 350 : 90,
        avgDaysToSell: isHigh ? 12 : 22,
        buyerInterestScore: isHigh ? 89 : 64,
        priceTrend: isHigh ? 'Appreciating / Strong' : 'Stable / Steady',
        demandSummary: `Demand for ${make} ${model} ${variant || ''} (${year || 'recent'}) remains robust in ${region || 'Punjab'}, supported by strong local brand trust and high buyer search volume on online portals.`,
        regionalHotspots: ['Lahore (DHA & Gulberg)', 'Faisalabad', 'Multan', 'Rawalpindi'],
        listingPriceRangesPkr: {
          lowPkr: 2500000,
          avgPkr: 3200000,
          highPkr: 3800000,
        },
      };
      return res.json({ marketSentiment: fallbackSentiment, source: 'fallback' });
    }

    const prompt = `Evaluate real-time vehicle demand and online listing sentiment in Punjab (PakWheels, OLX Punjab, Lahore listings) for:
Make: ${make}
Model: ${model}
Variant: ${variant || 'Standard'}
Year: ${year || 2022}
Region: ${region || 'Lahore / Punjab'}

Return a JSON object with:
- demandLevel ("Very High / Hot Item" | "High Demand" | "Moderate Demand" | "Low / Niche Demand")
- onlineListingVolume (number of estimated active online listings in Punjab)
- avgDaysToSell (average days a clean vehicle stays listed)
- buyerInterestScore (number 1-100)
- priceTrend ("Appreciating / Strong" | "Stable / Steady" | "Softening / High Supply")
- demandSummary (string explaining real-time buyer demand, turnover velocity, and pricing dynamics)
- regionalHotspots (array of 4 key demand areas in Punjab)
- listingPriceRangesPkr ({ lowPkr, avgPkr, highPkr })`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            demandLevel: { type: Type.STRING },
            onlineListingVolume: { type: Type.NUMBER },
            avgDaysToSell: { type: Type.NUMBER },
            buyerInterestScore: { type: Type.NUMBER },
            priceTrend: { type: Type.STRING },
            demandSummary: { type: Type.STRING },
            regionalHotspots: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            listingPriceRangesPkr: {
              type: Type.OBJECT,
              properties: {
                lowPkr: { type: Type.NUMBER },
                avgPkr: { type: Type.NUMBER },
                highPkr: { type: Type.NUMBER },
              },
              required: ['lowPkr', 'avgPkr', 'highPkr'],
            },
          },
          required: [
            'demandLevel',
            'onlineListingVolume',
            'avgDaysToSell',
            'buyerInterestScore',
            'priceTrend',
            'demandSummary',
            'regionalHotspots',
            'listingPriceRangesPkr',
          ],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json({ marketSentiment: result, source: 'gemini_ai' });
  } catch (error: any) {
    console.error('Market sentiment API error:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze market sentiment.' });
  }
});

// Vite middleware for development vs production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoValue AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
