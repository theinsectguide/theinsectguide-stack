import { GoogleGenAI } from '@google/genai';
import { ScanResult } from './types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export interface RawVisionIdentification {
  common_name?: string;
  latin_name?: string;
  taxonomic_group?: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  is_uncertain?: boolean;
  visual_evidence?: string[];
  possible_lookalikes?: string[];
  identification_notes?: string;
  status?: 'safe' | 'dangerous' | 'venomous' | 'pest' | 'protected' | 'uncertain';
  danger_level?: number | null;
  threat_index_display?: string;
  threat_explanation?: string;
  can_sting?: boolean;
  can_bite?: boolean;
  stinger_type?: 'barbed' | 'smooth' | 'none';
  can_sting_repeatedly?: boolean;
  dangerous_to_children?: boolean;
  dangerous_to_pets?: boolean;
  pet_child_hazard?: 'Low' | 'Moderate' | 'High';
  pet_child_explanation?: string;
  conservation_status?: string;
  legal_protection_status?: string;
  description?: string;
  habitat?: string;
  active_season?: string;
  geographic_regions?: string[];
  look_alikes?: string[];
  first_aid?: string;
  when_to_call_emergency?: string;
  pest_control?: any;
  interesting_facts?: string;
  error?: string;
}

const TAXONOMIC_VISION_PROMPT = `You are a world-renowned senior entomologist, invertebrate taxonomist, and venom safety specialist.
Your mission is to perform rigorous, step-by-step morphological identification of the specimen in the photograph.

================================================================================
CRITICAL PROTOCOL — MANDATORY TAXONOMIC REASONING
================================================================================

STEP 1: INSECT / ARTHROPOD PRESENCE CHECK
- If NO insect, spider, arachnid, larva, caterpillar, or arthropod is visible, return exactly:
  {"error": "no_insect_detected"}

STEP 2: INDEPENDENT MORPHOLOGICAL IDENTIFICATION
Carefully inspect the visual evidence:
- Body Shape & Proportions: scale, length (e.g. 25-35mm large hornet vs 12-15mm bee vs 10mm hoverfly), robust vs slender.
- Head & Facial Morphology: vertex width, clypeus, mandibles, compound eyes (separated kidney-shaped in Hymenoptera vs huge contiguous eyes in Diptera).
- Antennae: long multi-segmented (wasps/hornets/bees) vs short 3-segmented with arista (hoverflies/flies).
- Thorax & Pronotum: reddish-brown collar (European Hornet) vs dense golden fuzz (Honeybee) vs black/yellow shiny hairless plates (Yellowjacket).
- Abdomen & Color Pattern:
  * European Hornet (Vespa crabro): Reddish-brown anterior metasoma, yellow posterior with distinct brown/black teardrop-shaped spots or dots on yellow bands.
  * Honeybee (Apis mellifera): Subdued golden-brown / amber with dark fuzzy stripes, very hairy abdomen.
  * Yellowjacket (Vespula spp.): Intense bright yellow and black anchor/chevron markings, smooth hairless metasoma.
  * Hoverfly (Syrphidae): Mimic stripes on flat abdomen, only 2 wings, no waist.
  * Bumblebee (Bombus spp.): Heavy dense fur, black/yellow/white bands, plump round body.
  * Asian Hornet (Vespa velutina): Dark velvety thorax, yellow-tipped legs, 4th abdominal segment almost fully orange.
- Wings: 4 wings folded longitudinally (Vespidae) vs 4 wings flat (Apidae) vs 2 wings with halteres (Diptera).
- Legs: Pollen baskets/corbiculae vs smooth legs.

STEP 3: TAXONOMIC PRECISION & SPECIFICITY PRINCIPLE
- Strong visual evidence (clear diagnostic markers) → Specific species-level identification (e.g. Vespa crabro, Apis mellifera, Coccinella septempunctata).
- Limited evidence (clear genus/group traits, but species-specific fine markers obscured) → Genus or group level (e.g. Vespula spp., Bombus spp., Syrphidae). Do NOT force an unconfirmed species name (e.g. do not guess Vespula vulgaris if it could be another yellowjacket).
- Insufficient evidence (blurry, distant, low resolution, obstructed) → Identification Uncertain (confidence: "LOW", is_uncertain: true).

STEP 4: CONFIDENCE ASSESSMENT
- HIGH: Strong diagnostic anatomical evidence clearly visible.
- MEDIUM: Likely identification, but some diagnostic features are partially obscured.
- LOW: Insufficient visual clarity or ambiguous angles. Provide possible lookalike candidates.

STEP 5: SPECIES-SPECIFIC SAFETY & THREAT LOGIC
- Derive all medical, safety, and behavioral data strictly from the confirmed species/group identity.
- Honeybee (Apis mellifera): Barbed stinger; first aid: scrape stinger promptly with a card without pinching the venom sac.
- Hornets & Wasps (Vespa crabro, Vespula spp.): Smooth stinger (can sting repeatedly); first aid: wash with soap/water, cold compress, do not scrape unless stinger is visible.
- Hoverflies / Harmless species: No stinger, non-venomous.
- UNCERTAINTY RULE: When confidence is LOW or identification is uncertain, DO NOT provide a numerical threat score; the system will assign Threat Index: N/A.

================================================================================
JSON RESPONSE SCHEMA (Strict JSON format only)
================================================================================
{
  "common_name": "European Hornet",
  "latin_name": "Vespa crabro",
  "taxonomic_group": "Vespidae / Hornet",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "is_uncertain": false,
  "visual_evidence": [
    "Large hornet body (typically around 25–35 mm for workers, with queens larger)",
    "Distinctive reddish-brown head and anterior thorax",
    "Yellow abdomen with dark teardrop-shaped spots along the lateral margin",
    "Smooth hairless metasoma and longitudinally folded wings"
  ],
  "possible_lookalikes": [
    "Apis mellifera (Honeybee - ruled out by lack of dense thoracic fuzz and much larger size)",
    "Vespula vulgaris (Common Wasp - ruled out by reddish-brown coloration and larger scale)",
    "Vespa velutina (Asian Hornet - ruled out by reddish thorax vs dark velvety thorax)"
  ],
  "identification_notes": "Morphological diagnostics are entirely consistent with Vespa crabro.",
  "status": "dangerous" | "safe" | "venomous" | "pest" | "protected" | "uncertain",
  "can_sting": true,
  "can_bite": true,
  "stinger_type": "smooth",
  "can_sting_repeatedly": true,
  "dangerous_to_children": true,
  "dangerous_to_pets": true,
  "pet_child_hazard": "Moderate",
  "pet_child_explanation": "Possesses a potent sting with repeat stinging capability. Keep curious pets and children at a safe distance.",
  "conservation_status": "Least Concern (IUCN)",
  "legal_protection_status": "Location dependent — Specially protected under national law in Germany (§44 BNatSchG), but not protected in the UK or North America.",
  "description": "European hornets are a large native social wasp species found across parts of Europe and established in eastern North America. Workers typically measure around 25–35 mm in length, with queens noticeably larger. They are characterized by a reddish-brown head and anterior thorax, paired with a yellow abdomen patterned with dark lateral spots. European hornets are effective natural predators of various insect species and nest primarily in sheltered tree hollows, cavities, and outbuildings.",
  "habitat": "Woodlands, hollow trees, attics, eaves, and garden outbuildings.",
  "active_season": "Spring to Autumn (Peak activity: Late spring through summer. Seasonal timing varies by region and climate.)",
  "geographic_regions": ["UK", "EU", "US"],
  "look_alikes": ["Asian Hornet (Vespa velutina)", "Common Yellowjacket (Vespula vulgaris)", "Cicada Killer"],
  "first_aid": "Wash sting site thoroughly with soap and water. Apply a cold ice compress for 15 minutes. Take oral antihistamine if needed. Do NOT scrape unless a stinger is visibly present.",
  "when_to_call_emergency": "Call 999/911/112 immediately if experiencing difficulty breathing, swelling of throat/lips/face, dizziness, or widespread hives (anaphylaxis).",
  "pest_control": {
    "is_pest": true,
    "urgency": "High",
    "diy_possible": false,
    "treatment_method": "Do not spray high or enclosed nests without protective gear. Professional exterminators use pressurized permethrin dust at dusk.",
    "natural_solutions": "Hang decoy fake nests in early spring to deter queen territory establishment.",
    "prevention": "Seal attic eaves and chimney soffit fissures.",
    "estimated_exterminator_cost": "$180 - $350"
  },
  "interesting_facts": "European hornets are effective predators of flies, caterpillars, grasshoppers and other insects. Unlike honeybees, they possess a smooth stinger that can be used repeatedly without dying."
}

Return ONLY the raw JSON object without markdown code fences or conversational commentary.`;

/**
 * DETERMINISTIC THREAT ENGINE
 * Computes the exact Threat Index (0-10) deterministically from verified species attributes.
 * When confidence is LOW or identification is uncertain, returns null (Threat Index: N/A).
 */
export function calculateDeterministicThreatScore(attrs: {
  latin_name: string;
  common_name: string;
  can_sting: boolean;
  can_bite: boolean;
  stinger_type: 'barbed' | 'smooth' | 'none';
  can_sting_repeatedly: boolean;
  status: 'safe' | 'dangerous' | 'venomous' | 'pest' | 'protected' | 'uncertain';
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  is_uncertain?: boolean;
}): number | null {
  const lowerLatin = (attrs.latin_name || '').toLowerCase();
  const lowerCommon = (attrs.common_name || '').toLowerCase();

  // If identification is uncertain or low confidence, never invent a threat score
  if (
    attrs.is_uncertain ||
    attrs.confidence === 'LOW' ||
    attrs.status === 'uncertain' ||
    lowerCommon.includes('uncertain') ||
    lowerLatin.includes('incertae sedis')
  ) {
    return null;
  }

  // Tier 1: Medically critical neurotoxins & necrotic venoms (9 - 10)
  if (lowerLatin.includes('latrodectus') || lowerCommon.includes('black widow')) return 9;
  if (lowerLatin.includes('loxosceles') || lowerCommon.includes('brown recluse')) return 9;
  if (lowerLatin.includes('atrax') || lowerCommon.includes('funnel-web')) return 10;
  if (lowerLatin.includes('phoneutria') || lowerCommon.includes('wandering spider')) return 10;

  // Tier 2: Vector of severe systemic pathogens / high toxicity (7 - 8)
  if (lowerLatin.includes('ixodes') || lowerCommon.includes('tick')) return 8;
  if (lowerLatin.includes('vespa velutina') || lowerCommon.includes('asian hornet')) return 7;
  if (lowerLatin.includes('scolopendra') || lowerCommon.includes('giant centipede')) return 7;
  if (lowerLatin.includes('paraponera') || lowerCommon.includes('bullet ant')) return 8;

  // Tier 3: Potent stingers with repeat attack capacity & defensive radius (5 - 6)
  if (lowerLatin.includes('vespa crabro') || lowerCommon.includes('european hornet')) return 6;
  if (lowerLatin.includes('vespula') || lowerLatin.includes('dolichovespula') || lowerCommon.includes('yellowjacket') || lowerCommon.includes('common wasp') || lowerCommon.includes('wasp')) return 6;
  if (lowerLatin.includes('polistes') || lowerCommon.includes('paper wasp')) return 5;
  if (lowerLatin.includes('mutillidae') || lowerCommon.includes('velvet ant')) return 6;
  if (lowerLatin.includes('solenopsis') || lowerCommon.includes('fire ant')) return 5;

  // Tier 4: Structural / Household pest vectors (3 - 4)
  if (lowerLatin.includes('cimex') || lowerCommon.includes('bed bug')) return 4;
  if (lowerLatin.includes('culicidae') || lowerCommon.includes('mosquito')) return 3;
  if (lowerLatin.includes('tabanidae') || lowerCommon.includes('horsefly') || lowerCommon.includes('horse fly')) return 4;
  if (lowerLatin.includes('blattodea') || lowerCommon.includes('cockroach')) return 3;
  if (lowerLatin.includes('isoptera') || lowerCommon.includes('termite')) return 4;

  // Tier 5: Mild single defensive sting / docile pollinator (2)
  if (lowerLatin.includes('apis mellifera') || lowerCommon.includes('honeybee') || lowerCommon.includes('honey bee')) return 2;
  if (lowerLatin.includes('bombus') || lowerCommon.includes('bumblebee') || lowerCommon.includes('bumble bee')) return 2;
  if (lowerLatin.includes('xylocopa') || lowerCommon.includes('carpenter bee')) return 2;

  // Tier 6: Harmless / Zero Threat / Beneficial (0 - 1)
  if (lowerLatin.includes('syrph') || lowerCommon.includes('hoverfly') || lowerCommon.includes('hover fly')) return 0;
  if (lowerLatin.includes('coccinellidae') || lowerCommon.includes('ladybird') || lowerCommon.includes('ladybug')) return 0;
  if (lowerLatin.includes('chrysopidae') || lowerCommon.includes('lacewing')) return 0;
  if (lowerLatin.includes('lepidoptera') || lowerCommon.includes('butterfly')) return 0;

  // Default deterministic calculation from mechanical features
  let score = 0;
  if (attrs.can_sting) {
    score += attrs.stinger_type === 'smooth' || attrs.can_sting_repeatedly ? 5 : 2;
  }
  if (attrs.can_bite) {
    score += 1;
  }
  if (attrs.status === 'venomous') {
    score = Math.max(score, 7);
  } else if (attrs.status === 'dangerous') {
    score = Math.max(score, 5);
  } else if (attrs.status === 'safe') {
    score = Math.min(score, 2);
  }

  return Math.max(0, Math.min(10, score));
}

/**
 * PRIMARY VISION ENGINE:
 * 1. Claude Sonnet 4.5 Vision: claude-sonnet-4-5-20250929 (Anthropic API) - PRIMARY
 * 2. Fallback: Gemini 3.7 Flash Vision (Google GenAI) ONLY if Claude has a technical failure.
 * 3. Never call Gemini if Claude succeeds with legitimate LOW confidence / taxonomic uncertainty.
 */
export async function identifyInsectWithClaude(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  userRegion?: string
): Promise<ScanResult> {
  const cleanBase64 = (imageBase64 || '').replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '').trim();

  if (!cleanBase64) {
    console.warn('[Vision Engine] Missing or empty image payload.');
    return generateTechnicalErrorResult('No image payload was received for analysis.');
  }

  let result: RawVisionIdentification | null = null;
  let modelUsed: string | null = null;
  let providerUsed: string | null = null;
  let fallbackUsed = false;
  let fallbackReason: string | null = null;

  // ---------------------------------------------------------------------------
  // STEP 1: PRIMARY VISION MODEL — CLAUDE SONNET 4.5 VISION (claude-sonnet-4-5-20250929)
  // ---------------------------------------------------------------------------
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const primaryClaudeModel = 'claude-sonnet-4-5-20250929';
  let claudeTechnicalFailure = false;
  let claudeFailureDetails = '';

  if (anthropicApiKey && anthropicApiKey.trim().length > 5 && !anthropicApiKey.includes('...')) {
    try {
      console.log(`[Vision Engine] Direct image transmission to Primary Model: ${primaryClaudeModel}`);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: primaryClaudeModel,
          max_tokens: 2000,
          system: TAXONOMIC_VISION_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mimeType || 'image/jpeg',
                    data: cleanBase64,
                  },
                },
                {
                  type: 'text',
                  text: `Analyze this insect/arthropod specimen directly with complete taxonomic rigor. User location: ${userRegion || 'Unknown'}. Follow all morphological checks and lookalike distinctions. Return JSON strictly.`,
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const contentText = data.content?.[0]?.text || '';
        const parsed = extractAndValidateJson(contentText);
        if (parsed) {
          if (parsed.error === 'no_insect_detected') {
            throw new Error('no_insect_detected');
          }
          // Claude successfully analyzed the image
          result = parsed;
          modelUsed = primaryClaudeModel;
          providerUsed = 'anthropic';
          fallbackUsed = false;
          fallbackReason = null;
        } else {
          claudeTechnicalFailure = true;
          claudeFailureDetails = 'Failed to parse JSON from Claude response';
        }
      } else {
        const errText = await response.text();
        claudeTechnicalFailure = true;
        claudeFailureDetails = `HTTP ${response.status}: ${errText}`;
        console.warn(`[Vision Engine] Claude Sonnet 4.5 API response ${response.status}:`, errText);
      }
    } catch (err: any) {
      if (err.message === 'no_insect_detected') throw err;
      claudeTechnicalFailure = true;
      claudeFailureDetails = err.message || 'Network/runtime exception';
      console.warn(`[Vision Engine] Primary Claude Sonnet 4.5 attempt failed:`, err.message);
    }
  } else {
    claudeTechnicalFailure = true;
    claudeFailureDetails = 'ANTHROPIC_API_KEY is not configured or invalid';
    console.log('[Vision Engine] Claude API key absent or unconfigured.');
  }

  // ---------------------------------------------------------------------------
  // STEP 2: FALLBACK TO GEMINI 3.7 FLASH (ONLY ON CLAUDE TECHNICAL FAILURE)
  // ---------------------------------------------------------------------------
  if (!result && claudeTechnicalFailure) {
    fallbackReason = 'claude_technical_failure';
    console.log(`[Vision Engine] Invoking Gemini 3.7 Flash fallback due to Claude technical failure (${claudeFailureDetails})`);

    const ai = getGenAI();
    if (ai) {
      const fallbackModel = 'gemini-3.7-flash';
      try {
        const response = await ai.models.generateContent({
          model: fallbackModel,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: `${TAXONOMIC_VISION_PROMPT}\n\nUser location: ${userRegion || 'Unknown'}. Analyze this specimen strictly following the multi-step taxonomic protocol.`,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = extractAndValidateJson(text);
          if (parsed) {
            if (parsed.error === 'no_insect_detected') {
              throw new Error('no_insect_detected');
            }
            result = parsed;
            modelUsed = fallbackModel;
            providerUsed = 'google';
            fallbackUsed = true;
            fallbackReason = 'claude_technical_failure';
          }
        }
      } catch (err: any) {
        if (err.message === 'no_insect_detected') throw err;
        console.warn(`[Vision Engine] Gemini vision fallback error:`, err.message);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 3: IF BOTH CLAUDE AND GEMINI ENCOUNTER TECHNICAL FAILURE
  // ---------------------------------------------------------------------------
  if (!result) {
    console.warn('[Vision Engine] Both primary (Claude) and fallback (Gemini) vision models technically failed.');
    return generateTechnicalErrorResult('Image analysis failed due to technical processing unavailability.');
  }

  // Explicit log entry per audit specifications
  console.log(
    `[Vision Engine Audit Log] vision_model_used: ${modelUsed} | provider_used: ${providerUsed} | confidence: ${result.confidence || 'MEDIUM'} | fallback_used: ${fallbackUsed} | fallback_reason: ${fallbackReason} | identified_species: ${result.common_name} (${result.latin_name}) | timestamp: ${new Date().toISOString()}`
  );

  return sanitizeAndNormalizeResult(result, modelUsed, providerUsed, fallbackUsed, fallbackReason, userRegion);
}

/**
 * PEST-SPECIFIC ANALYSIS WITH CLAUDE VISION
 */
export async function analyzePestWithClaude(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  pestDetails?: { location_found?: string; damage_observed?: string }
): Promise<ScanResult> {
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
  let result: RawVisionIdentification | null = null;
  let modelUsed = '';
  let providerUsed = '';
  let fallbackUsed = false;
  let fallbackReason: string | null = null;

  const PEST_PROMPT = `${TAXONOMIC_VISION_PROMPT}\n\nSPECIALIZED PEST CONTEXT:
Location found: ${pestDetails?.location_found || 'Structure / Household'}.
Signs observed: ${pestDetails?.damage_observed || 'General inspection'}.
Prioritize structural damage evaluation, DIY vs exterminator feasibility, and chemical/biological control steps.`;

  // 1. Primary: Claude Sonnet 4.5
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicApiKey && anthropicApiKey.trim().length > 5 && !anthropicApiKey.includes('...')) {
    const primaryClaudeModel = 'claude-sonnet-4-5-20250929';
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: primaryClaudeModel,
          max_tokens: 2000,
          system: PEST_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mimeType || 'image/jpeg',
                    data: cleanBase64,
                  },
                },
                {
                  type: 'text',
                  text: 'Diagnose this pest specimen and infestation risk according to the structural entomology protocol.',
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const contentText = data.content?.[0]?.text || '';
        const parsed = extractAndValidateJson(contentText);
        if (parsed) {
          result = parsed;
          modelUsed = primaryClaudeModel;
          providerUsed = 'anthropic';
          fallbackUsed = false;
          fallbackReason = null;
        }
      }
    } catch (err: any) {
      console.warn('[Vision Engine] Claude Pest API error:', err.message);
    }
  }

  // 2. Fallback: Gemini 3.7 Flash ONLY if Claude fails technically
  if (!result) {
    fallbackReason = 'claude_technical_failure';
    const ai = getGenAI();
    if (ai) {
      try {
        const fallbackModel = 'gemini-3.7-flash';
        const response = await ai.models.generateContent({
          model: fallbackModel,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: PEST_PROMPT,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = extractAndValidateJson(response.text);
          if (parsed) {
            result = parsed;
            modelUsed = fallbackModel;
            providerUsed = 'google';
            fallbackUsed = true;
            fallbackReason = 'claude_technical_failure';
          }
        }
      } catch (err: any) {
        console.warn('[Vision Engine] Gemini Pest fallback error:', err.message);
      }
    }
  }

  if (!result) {
    return generateTechnicalErrorResult('Pest analysis could not be determined due to technical service unavailability.');
  }

  return sanitizeAndNormalizeResult(result, modelUsed, providerUsed, fallbackUsed, fallbackReason);
}

function extractAndValidateJson(text: string): RawVisionIdentification | null {
  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error('[Vision Engine] JSON parse error:', e, text.slice(0, 200));
  }
  return null;
}

/**
 * SPECIES-FIRST SAFETY SEPARATION & SANITIZATION PIPELINE
 */
export function sanitizeAndNormalizeResult(
  raw: RawVisionIdentification,
  modelUsed: string | null = 'claude-sonnet-4-5-20250929',
  providerUsed: string | null = 'anthropic',
  fallbackUsed: boolean = false,
  fallbackReason: string | null = null,
  userRegion?: string
): ScanResult {
  const commonName = (raw.common_name || 'Unidentified Specimen').trim();
  const latinName = (raw.latin_name || 'Insecta incertae sedis').trim();
  const lowerCommon = commonName.toLowerCase();
  const lowerLatin = latinName.toLowerCase();

  // 1. Determine Confidence Level & Uncertainty Flag
  const confidence: 'HIGH' | 'MEDIUM' | 'LOW' =
    raw.confidence === 'HIGH' || raw.confidence === 'MEDIUM' || raw.confidence === 'LOW'
      ? raw.confidence
      : raw.is_uncertain
      ? 'LOW'
      : 'HIGH';

  const isUncertain =
    confidence === 'LOW' ||
    Boolean(raw.is_uncertain) ||
    lowerCommon.includes('uncertain') ||
    lowerLatin.includes('incertae sedis') ||
    lowerCommon.includes('unidentified');

  // 2. Extract Base Structural Properties
  let status: 'safe' | 'dangerous' | 'venomous' | 'pest' | 'protected' | 'uncertain' = isUncertain ? 'uncertain' : 'safe';
  // UNCERTAIN SPECIES SAFETY RULE: If uncertain, can_sting and can_bite MUST BE NULL (Never assume harmless)
  let canSting: boolean | null = isUncertain ? null : Boolean(raw.can_sting);
  let canBite: boolean | null = isUncertain ? null : Boolean(raw.can_bite);
  let stingerType: 'barbed' | 'smooth' | 'none' | null = isUncertain ? null : raw.stinger_type || (canSting ? 'smooth' : 'none');
  let canStingRepeatedly: boolean | null = isUncertain ? null : Boolean(raw.can_sting_repeatedly);
  let petChildHazard: 'Low' | 'Moderate' | 'High' = raw.pet_child_hazard || (isUncertain ? 'Moderate' : 'Low');
  let petChildExplanation = raw.pet_child_explanation || (isUncertain ? 'Species identification is uncertain. Exercise caution and do not handle unknown specimens.' : '');
  let firstAid = raw.first_aid || 'Wash area thoroughly with clean cold water and soap. Apply a cold compress.';
  let emergencyGuidance =
    raw.when_to_call_emergency ||
    'Seek immediate medical assistance if experiencing difficulty breathing, face/throat swelling, or dizziness (anaphylaxis).';
  let legalProtection = raw.legal_protection_status || 'Location dependent (check regional wildlife regulations).';
  let conservationStatus = raw.conservation_status || 'Not evaluated';

  if (!isUncertain) {
    // ---------------------------------------------------------------------------
    // SPECIES SAFETY PROFILE LOOKUP: European Hornet (Vespa crabro)
    // ---------------------------------------------------------------------------
    if (lowerLatin.includes('vespa crabro') || lowerCommon.includes('european hornet')) {
      status = 'dangerous';
      canSting = true;
      canBite = true;
      stingerType = 'smooth';
      canStingRepeatedly = true;
      petChildHazard = 'Moderate';
      petChildExplanation =
        'Hornets deliver a painful sting with repeat attack capability. Keep children and curious pets away from flying corridors and nests.';
      firstAid =
        'Wash sting site immediately with soap and water. Apply an ice pack wrapped in a cloth for 15 minutes. Take an over-the-counter antihistamine if swelling occurs. Do NOT attempt to scrape out a stinger unless visibly left behind.';
      emergencyGuidance =
        'Call emergency services (999/911/112) immediately if stung in the mouth or throat, or if signs of anaphylaxis develop (wheezing, lip/tongue swelling, severe dizziness, full-body hives).';
      legalProtection =
        'Location dependent — Specially protected under nature conservation law in Germany (§44 BNatSchG; nests cannot be destroyed without permit), but not legally protected in the UK or North America.';
      conservationStatus = 'Least Concern (IUCN)';
    }

    // ---------------------------------------------------------------------------
    // SPECIES SAFETY PROFILE LOOKUP: Asian Hornet (Vespa velutina)
    // ---------------------------------------------------------------------------
    else if (lowerLatin.includes('vespa velutina') || lowerCommon.includes('asian hornet') || lowerCommon.includes('yellow-legged hornet')) {
      status = 'dangerous';
      canSting = true;
      canBite = true;
      stingerType = 'smooth';
      canStingRepeatedly = true;
      petChildHazard = 'High';
      petChildExplanation =
        'Aggressive defensive swarming behavior near nests. Invasive apex predator of honeybees.';
      firstAid =
        'Wash the sting site immediately. Apply cold packs. If stung in the face/neck or multiple times, seek medical assessment. Report sighting to local environmental authorities (DEFRA in UK).';
      legalProtection =
        'Invasive species of high concern across the UK and EU. Mandatory reporting required.';
    }

    // ---------------------------------------------------------------------------
    // SPECIES SAFETY PROFILE LOOKUP: Honeybee (Apis mellifera)
    // ---------------------------------------------------------------------------
    else if (lowerLatin.includes('apis mellifera') || (lowerCommon.includes('honey') && lowerCommon.includes('bee'))) {
      status = 'safe';
      canSting = true;
      canBite = false;
      stingerType = 'barbed';
      canStingRepeatedly = false;
      petChildHazard = 'Low';
      petChildExplanation =
        'Docile keystone pollinator. Stings primarily in defense of the hive or when physically compressed, stepped on, or trapped. Stings can trigger allergic reactions in sensitive individuals.';
      firstAid =
        'Promptly scrape off the barbed stinger using a fingernail or flat plastic card without squeezing the venom sac. Wash area with cold water and soap, and apply an ice pack for 10-15 minutes.';
      emergencyGuidance =
        'Seek urgent emergency medical care if the victim experiences difficulty breathing, swelling of the lips, tongue, face or throat, widespread hives, dizziness, or stings involving the mouth or airway (anaphylaxis).';
      legalProtection =
        'Domesticated and semi-wild agricultural pollinator. Protected through beekeeping husbandry and regional biodiversity initiatives.';
      conservationStatus = 'Data Deficient / Managed (IUCN)';
    }

    // ---------------------------------------------------------------------------
    // SPECIES SAFETY PROFILE LOOKUP: Hoverflies (Syrphidae)
    // ---------------------------------------------------------------------------
    else if (lowerLatin.includes('syrph') || lowerCommon.includes('hoverfly') || lowerCommon.includes('hover fly')) {
      status = 'safe';
      canSting = false;
      canBite = false;
      stingerType = 'none';
      canStingRepeatedly = false;
      petChildHazard = 'Low';
      petChildExplanation =
        'Non-venomous pollinator lacking a stinger and venom-delivery apparatus. Hoverflies do not pose a stinging threat to humans or pets.';
      firstAid = 'Non-venomous species. No specific medical first aid required.';
      emergencyGuidance = 'Hoverflies lack a venomous stinger or biting apparatus and pose no envenomation risk.';
      legalProtection = 'Beneficial garden pollinator. No special commercial restrictions.';
      conservationStatus = 'Least Concern (IUCN)';
    }

    // ---------------------------------------------------------------------------
    // SPECIES SAFETY PROFILE LOOKUP: Yellowjackets (Vespula spp. / Dolichovespula)
    // ---------------------------------------------------------------------------
    else if (lowerLatin.includes('vespula') || lowerLatin.includes('dolichovespula') || lowerCommon.includes('yellowjacket') || lowerCommon.includes('common wasp') || lowerCommon.includes('wasp')) {
      status = 'dangerous';
      canSting = true;
      canBite = true;
      stingerType = 'smooth';
      canStingRepeatedly = true;
      petChildHazard = 'Moderate';
      petChildExplanation =
        'Can sting repeatedly and aggressively defend underground or wall void nests. Scavenges sugary foods around picnic areas.';
      firstAid =
        'Wash sting site with soap and water. Apply an ice pack wrapped in a towel for 15 minutes. Take oral antihistamine or apply hydrocortisone cream for itching.';
      emergencyGuidance =
        'Emergency medical attention required if stung in the mouth/throat, or if systemic symptoms appear (respiratory distress, widespread rash, dizziness).';
    }

    // ---------------------------------------------------------------------------
    // SPECIES SAFETY PROFILE LOOKUP: Bumblebees (Bombus spp.)
    // ---------------------------------------------------------------------------
    else if (lowerLatin.includes('bombus') || lowerCommon.includes('bumblebee') || lowerCommon.includes('bumble bee')) {
      status = 'safe';
      canSting = true;
      canBite = false;
      stingerType = 'smooth';
      canStingRepeatedly = true;
      petChildHazard = 'Low';
      petChildExplanation =
        'Gentle, non-aggressive pollinator. Only stings if severely crushed, stepped on, or nest is directly disturbed.';
      firstAid =
        'Wash sting site with soap and water. Apply a cool compress to soothe localized pain.';
      emergencyGuidance =
        'Seek urgent emergency medical care if systemic allergic symptoms, breathing difficulties, or swelling of the airway develop.';
    }

    // ---------------------------------------------------------------------------
    // SPECIES SAFETY PROFILE LOOKUP: Spiders & Ticks
    // ---------------------------------------------------------------------------
    else if (lowerLatin.includes('latrodectus') || lowerCommon.includes('black widow')) {
      status = 'venomous';
      canSting = false;
      canBite = true;
      stingerType = 'none';
      petChildHazard = 'High';
      petChildExplanation =
        'Possesses potent alpha-latrotoxin venom. High medical risk for young children, elderly, and small pets.';
      firstAid =
        'Wash bite with antiseptic soap. Keep limb elevated and immobilized. Apply a cool pack. Seek prompt medical care; do NOT cut the wound or attempt venom suction.';
      emergencyGuidance =
        'Go to nearest Emergency Department immediately. Symptoms include severe abdominal cramping, muscle rigidity, sweating, and rapid heart rate.';
    } else if (lowerLatin.includes('loxosceles') || lowerCommon.includes('brown recluse')) {
      status = 'venomous';
      canSting = false;
      canBite = true;
      stingerType = 'none';
      petChildHazard = 'High';
      petChildExplanation =
        'Possesses cytotoxic sphingomyelinase D venom capable of causing necrotic skin lesions. High hazard.';
      firstAid =
        'Clean bite site thoroughly. Apply ice compress to slow enzymatic tissue breakdown. Immobilize area and seek medical physician evaluation.';
      emergencyGuidance =
        'Seek emergency medical attention if bite shows spreading dark necrosis, ulceration, fever, or systemic chills.';
    } else if (lowerLatin.includes('ixodes') || lowerCommon.includes('tick')) {
      status = 'dangerous';
      canSting = false;
      canBite = true;
      stingerType = 'none';
      petChildHazard = 'High';
      petChildExplanation =
        'Vector for Lyme disease, Babesiosis, and Anaplasmosis in humans and domestic dogs.';
      firstAid =
        'Use fine-tipped tweezers to grasp tick directly at skin level. Pull steadily upward without twisting or crushing the abdomen. Disinfect bite with alcohol. Save tick in a sealed container for medical identification.';
      emergencyGuidance =
        'Consult a physician if expanding target/bullseye rash (Erythema migrans), fever, joint fatigue, or facial palsy develops within 3 to 30 days.';
    }
  }

  // 3. DETERMINISTIC THREAT ENGINE: Calculate Threat Index (0-10) or return null for uncertain
  let dangerLevel: number | null = null;
  let threatIndexDisplay = 'N/A';
  let threatExplanation = 'Threat level cannot be determined because the species could not be identified with sufficient confidence.';

  if (!isUncertain) {
    dangerLevel = calculateDeterministicThreatScore({
      latin_name: latinName,
      common_name: commonName,
      can_sting: Boolean(canSting),
      can_bite: Boolean(canBite),
      stinger_type: (stingerType as 'barbed' | 'smooth' | 'none') || 'none',
      can_sting_repeatedly: Boolean(canStingRepeatedly),
      status: status,
      confidence: confidence,
      is_uncertain: false,
    });

    if (typeof dangerLevel === 'number') {
      threatIndexDisplay = `${dangerLevel} / 10`;
      threatExplanation = `Deterministic safety index (${dangerLevel}/10) derived strictly from confirmed ${commonName} taxonomic safety attributes.`;
    }
  }

  return {
    common_name: commonName,
    latin_name: latinName,
    status: isUncertain ? 'uncertain' : status,
    danger_level: dangerLevel,
    threat_index_display: threatIndexDisplay,
    threat_explanation: threatExplanation,
    can_sting: canSting,
    can_bite: canBite,
    stinger_type: stingerType,
    can_sting_repeatedly: canStingRepeatedly,
    dangerous_to_children: petChildHazard === 'High' || petChildHazard === 'Moderate',
    dangerous_to_pets: petChildHazard === 'High' || petChildHazard === 'Moderate',
    pet_child_hazard: petChildHazard,
    pet_child_explanation: petChildExplanation,
    confidence: confidence,
    analysis_status: 'success',
    identification_status: isUncertain ? 'uncertain' : 'confirmed',
    vision_model_used: modelUsed,
    provider_used: providerUsed,
    fallback_used: fallbackUsed,
    fallback_reason: fallbackReason,
    visual_evidence: Array.isArray(raw.visual_evidence) ? raw.visual_evidence : [],
    possible_lookalikes: Array.isArray(raw.possible_lookalikes) ? raw.possible_lookalikes : [],
    identification_notes: raw.identification_notes || '',
    conservation_status: conservationStatus,
    legal_protection_status: legalProtection,
    description: raw.description || 'Specimen morphology evaluated via multi-stage neural vision classifier.',
    habitat: raw.habitat || 'Temperate gardens, woodlands, and residential environments.',
    active_season: raw.active_season || 'Spring through Autumn',
    geographic_regions: Array.isArray(raw.geographic_regions) && raw.geographic_regions.length > 0
      ? raw.geographic_regions
      : ['UK', 'US', 'EU', 'CA', 'AU'],
    look_alikes: Array.isArray(raw.look_alikes) ? raw.look_alikes : [],
    first_aid: firstAid,
    when_to_call_emergency: emergencyGuidance,
    pest_control: raw.pest_control
      ? {
          is_pest: Boolean(raw.pest_control.is_pest),
          urgency: ['Low', 'Medium', 'High', 'Critical'].includes(raw.pest_control.urgency)
            ? raw.pest_control.urgency
            : 'Medium',
          diy_possible: Boolean(raw.pest_control.diy_possible),
          treatment_method: raw.pest_control.treatment_method || 'Inspect nesting sites and consult licensed pest control.',
          natural_solutions: raw.pest_control.natural_solutions || 'Use eco-friendly barriers and perimeter sanitation.',
          prevention: raw.pest_control.prevention || 'Seal structural crevices and entry voids.',
          estimated_exterminator_cost: raw.pest_control.estimated_exterminator_cost || '$150 - $350',
        }
      : null,
    interesting_facts: raw.interesting_facts || 'Insects are essential components of global biodiversity, pollination, and soil aeration.',
    is_uncertain: isUncertain,
  };
}

export function generateTechnicalErrorResult(message: string): ScanResult {
  return {
    common_name: 'Image Analysis Failed',
    latin_name: '',
    status: 'uncertain',
    danger_level: null,
    threat_index_display: 'N/A',
    threat_explanation: 'Threat level cannot be determined due to a technical analysis error.',
    can_sting: null,
    can_bite: null,
    stinger_type: null,
    can_sting_repeatedly: null,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Moderate',
    pet_child_explanation: 'Image processing could not complete. Do not handle unknown specimens directly.',
    confidence: null,
    analysis_status: 'technical_error',
    identification_status: null,
    vision_model_used: null,
    provider_used: null,
    fallback_used: true,
    fallback_reason: 'claude_and_gemini_technical_failure',
    visual_evidence: ['Technical failure: Both primary (Claude) and secondary (Gemini) neural vision services were unable to process this image.'],
    possible_lookalikes: [],
    identification_notes: message,
    conservation_status: 'Not evaluated',
    legal_protection_status: 'Not evaluated',
    description: "We couldn't analyze this image. Please try again or upload another photo.",
    habitat: 'Unknown without valid image analysis.',
    active_season: 'Unknown',
    geographic_regions: ['UK', 'US', 'CA', 'AU', 'EU'],
    look_alikes: ['Please provide a sharp, well-lit macro photograph.'],
    first_aid: 'If bitten or stung, wash the area thoroughly with soap and water. Apply a cold compress. Seek immediate emergency care (999/911/112) if experiencing respiratory distress or facial swelling.',
    when_to_call_emergency: 'Call emergency services (999/911/112) immediately if you experience breathing difficulty, facial swelling, or dizziness.',
    pest_control: null,
    interesting_facts: 'Clear macro photos showing head, antennae, and abdomen patterns ensure highest classification precision.',
    is_uncertain: true,
  };
}

function generateUncertaintyResult(message: string): ScanResult {
  return {
    common_name: 'Identification Uncertain',
    latin_name: 'Specimen incertae sedis',
    status: 'uncertain',
    danger_level: null,
    threat_index_display: 'N/A',
    threat_explanation: 'Threat level cannot be determined because the species could not be identified with sufficient confidence.',
    can_sting: null,
    can_bite: null,
    stinger_type: null,
    can_sting_repeatedly: null,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Moderate',
    pet_child_explanation: 'Species could not be confirmed with high confidence. Exercise general caution and do not handle unknown insects with bare hands.',
    confidence: 'LOW',
    analysis_status: 'success',
    identification_status: 'uncertain',
    vision_model_used: 'claude-sonnet-4-5-20250929',
    provider_used: 'anthropic',
    fallback_used: false,
    fallback_reason: null,
    visual_evidence: ['Visual features are ambiguous or lighting was insufficient for confident diagnostic confirmation.'],
    possible_lookalikes: ['Vespidae (Wasps/Hornets)', 'Apidae (Bees)', 'Syrphidae (Hoverflies)'],
    identification_notes: message,
    conservation_status: 'Location dependent',
    legal_protection_status: 'Location dependent',
    description: message,
    habitat: 'Unknown without confirmed identification.',
    active_season: 'Spring - Autumn',
    geographic_regions: ['UK', 'US', 'CA', 'AU', 'EU'],
    look_alikes: ['Please upload a closer macro photograph showing head, thorax, and wing details.'],
    first_aid: 'If stung or bitten by an unconfirmed insect, wash area with cold water and soap. Apply ice compress. Seek medical guidance if severe pain or allergic reaction occurs.',
    when_to_call_emergency: 'Call emergency services (999/911/112) immediately if you experience breathing difficulty, facial swelling, or dizziness.',
    pest_control: null,
    interesting_facts: 'Clear macro photos showing the head, antennae, and abdomen patterns ensure 99%+ species precision.',
    is_uncertain: true,
  };
}
