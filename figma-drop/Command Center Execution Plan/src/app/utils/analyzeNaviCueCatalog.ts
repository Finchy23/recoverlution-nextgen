/**
 * NAVICUE CATALOG ANALYZER
 * 
 * Comprehensive analysis tool to assess if our 300 mechanisms
 * can beautifully map to all 1400+ NaviCue types
 */

import { projectId, publicAnonKey } from '@/utils/supabaseInfo';

interface NaviCueType {
  id: string;
  family: string;
  form: string;
  form_name: string;
  operator_sequence: string[] | null;
  operators: string | null;
  kbe_layer: string | null;
  intent: string | null;
  mechanism: string | null;
  lens_defaults: any;
  voice_defaults: any;
  magic_defaults: any;
  constraints: any;
  proof_mode_default: string | null;
  proof_type_default: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface AnalysisReport {
  totalNaviCues: number;
  
  // Breakdown by key dimensions
  byFamily: Record<string, number>;
  byForm: Record<string, number>;
  byKBELayer: Record<string, number>;
  byIntent: Record<string, number>;
  byMechanism: Record<string, number>;
  
  // Current mechanism coverage
  navicuesWithMechanism: number;
  navicuesWithoutMechanism: number;
  uniqueMechanisms: string[];
  
  // Gaps and recommendations
  unmappedNaviCues: NaviCueType[];
  mechanismGaps: string[];
  coveragePercentage: number;
  
  // Deep dive insights
  formIntentCombinations: Record<string, number>;
  kbeLayerIntentCombinations: Record<string, number>;
  familyKBECombinations: Record<string, number>;
  
  // Recommendations
  recommendations: string[];
}

export async function analyzeNaviCueCatalog(): Promise<AnalysisReport> {
  try {
    // Fetch ALL NaviCues from database
    let response;
    try {
      response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-83873f76/navicues/type-catalog`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
    } catch (fetchError) {
      console.warn('Network unavailable:', fetchError);
      throw new Error('Network unavailable');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch NaviCues: ${response.statusText}`);
    }
    
    const { catalog } = await response.json();
    const navicues: NaviCueType[] = catalog;
    
    // Initialize analysis
    const report: AnalysisReport = {
      totalNaviCues: navicues.length,
      byFamily: {},
      byForm: {},
      byKBELayer: {},
      byIntent: {},
      byMechanism: {},
      navicuesWithMechanism: 0,
      navicuesWithoutMechanism: 0,
      uniqueMechanisms: [],
      unmappedNaviCues: [],
      mechanismGaps: [],
      coveragePercentage: 0,
      formIntentCombinations: {},
      kbeLayerIntentCombinations: {},
      familyKBECombinations: {},
      recommendations: [],
    };
    
    // Track mechanism usage
    const mechanismSet = new Set<string>();
    
    // Analyze each NaviCue
    navicues.forEach(navicue => {
      // Count by family
      report.byFamily[navicue.family] = (report.byFamily[navicue.family] || 0) + 1;
      
      // Count by form
      report.byForm[navicue.form] = (report.byForm[navicue.form] || 0) + 1;
      
      // Count by KBE layer
      if (navicue.kbe_layer) {
        report.byKBELayer[navicue.kbe_layer] = (report.byKBELayer[navicue.kbe_layer] || 0) + 1;
      }
      
      // Count by intent
      if (navicue.intent) {
        report.byIntent[navicue.intent] = (report.byIntent[navicue.intent] || 0) + 1;
      }
      
      // Count by mechanism
      if (navicue.mechanism) {
        report.byMechanism[navicue.mechanism] = (report.byMechanism[navicue.mechanism] || 0) + 1;
        mechanismSet.add(navicue.mechanism);
        report.navicuesWithMechanism++;
      } else {
        report.navicuesWithoutMechanism++;
        report.unmappedNaviCues.push(navicue);
      }
      
      // Track form + intent combinations
      if (navicue.intent) {
        const formIntentKey = `${navicue.form} + ${navicue.intent}`;
        report.formIntentCombinations[formIntentKey] = 
          (report.formIntentCombinations[formIntentKey] || 0) + 1;
      }
      
      // Track KBE layer + intent combinations
      if (navicue.kbe_layer && navicue.intent) {
        const kbeIntentKey = `${navicue.kbe_layer} + ${navicue.intent}`;
        report.kbeLayerIntentCombinations[kbeIntentKey] = 
          (report.kbeLayerIntentCombinations[kbeIntentKey] || 0) + 1;
      }
      
      // Track family + KBE combinations
      if (navicue.kbe_layer) {
        const familyKBEKey = `${navicue.family} + ${navicue.kbe_layer}`;
        report.familyKBECombinations[familyKBEKey] = 
          (report.familyKBECombinations[familyKBEKey] || 0) + 1;
      }
    });
    
    report.uniqueMechanisms = Array.from(mechanismSet).sort();
    report.coveragePercentage = (report.navicuesWithMechanism / report.totalNaviCues) * 100;
    
    // Generate recommendations
    generateRecommendations(report);
    
    return report;
    
  } catch (error) {
    console.error('Error analyzing NaviCue catalog:', error);
    throw error;
  }
}

function generateRecommendations(report: AnalysisReport): void {
  // Recommendation 1: Coverage assessment
  if (report.coveragePercentage < 50) {
    report.recommendations.push(
      `🚨 CRITICAL: Only ${report.coveragePercentage.toFixed(1)}% of NaviCues have mechanisms assigned. Need comprehensive mapping.`
    );
  } else if (report.coveragePercentage < 80) {
    report.recommendations.push(
      `⚠️ WARNING: ${report.coveragePercentage.toFixed(1)}% coverage. ${report.navicuesWithoutMechanism} NaviCues still need mechanism assignment.`
    );
  } else {
    report.recommendations.push(
      `✅ GOOD: ${report.coveragePercentage.toFixed(1)}% coverage. ${report.navicuesWithoutMechanism} NaviCues remaining to map.`
    );
  }
  
  // Recommendation 2: Check if we have enough mechanisms
  const mechanismCount = report.uniqueMechanisms.length;
  if (mechanismCount < 100) {
    report.recommendations.push(
      `🔨 Need more mechanisms! Currently only ${mechanismCount} unique mechanisms in use. Target: 300+ mechanisms available.`
    );
  }
  
  // Recommendation 3: Identify most common unmapped patterns
  const unmappedIntents = new Set<string>();
  const unmappedKBELayers = new Set<string>();
  const unmappedForms = new Set<string>();
  
  report.unmappedNaviCues.forEach(navicue => {
    if (navicue.intent) unmappedIntents.add(navicue.intent);
    if (navicue.kbe_layer) unmappedKBELayers.add(navicue.kbe_layer);
    unmappedForms.add(navicue.form);
  });
  
  if (unmappedIntents.size > 0) {
    report.recommendations.push(
      `🎯 Unmapped Intents (${unmappedIntents.size}): ${Array.from(unmappedIntents).join(', ')}`
    );
  }
  
  if (unmappedKBELayers.size > 0) {
    report.recommendations.push(
      `🧠 Unmapped KBE Layers (${unmappedKBELayers.size}): ${Array.from(unmappedKBELayers).join(', ')}`
    );
  }
  
  if (unmappedForms.size > 0) {
    report.recommendations.push(
      `📝 Unmapped Forms (${unmappedForms.size}): ${Array.from(unmappedForms).join(', ')}`
    );
  }
  
  // Recommendation 4: Most common combinations
  const topFormIntent = Object.entries(report.formIntentCombinations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([combo, count]) => `${combo} (${count})`)
    .join(', ');
  
  report.recommendations.push(
    `🔥 Top Form+Intent combos: ${topFormIntent}`
  );
  
  const topKBEIntent = Object.entries(report.kbeLayerIntentCombinations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([combo, count]) => `${combo} (${count})`)
    .join(', ');
  
  report.recommendations.push(
    `🧬 Top KBE+Intent combos: ${topKBEIntent}`
  );
}

export function printAnalysisReport(report: AnalysisReport): void {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         NAVICUE CATALOG ANALYSIS - THE ACID TEST            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Total NaviCues: ${report.totalNaviCues}`);
  console.log(`✅ With Mechanism: ${report.navicuesWithMechanism}`);
  console.log(`❌ Without Mechanism: ${report.navicuesWithoutMechanism}`);
  console.log(`📈 Coverage: ${report.coveragePercentage.toFixed(1)}%`);
  console.log(`🔨 Unique Mechanisms: ${report.uniqueMechanisms.length}\n`);
  
  console.log('─────────────────────────────────────────────────────────────');
  console.log('BY FAMILY:');
  Object.entries(report.byFamily)
    .sort((a, b) => b[1] - a[1])
    .forEach(([family, count]) => {
      console.log(`  ${family}: ${count}`);
    });
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('BY FORM:');
  Object.entries(report.byForm)
    .sort((a, b) => b[1] - a[1])
    .forEach(([form, count]) => {
      console.log(`  ${form}: ${count}`);
    });
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('BY KBE LAYER:');
  Object.entries(report.byKBELayer)
    .sort((a, b) => b[1] - a[1])
    .forEach(([layer, count]) => {
      console.log(`  ${layer}: ${count}`);
    });
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('BY INTENT:');
  Object.entries(report.byIntent)
    .sort((a, b) => b[1] - a[1])
    .forEach(([intent, count]) => {
      console.log(`  ${intent}: ${count}`);
    });
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('TOP FORM + INTENT COMBINATIONS:');
  Object.entries(report.formIntentCombinations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([combo, count]) => {
      console.log(`  ${combo}: ${count}`);
    });
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('TOP KBE + INTENT COMBINATIONS:');
  Object.entries(report.kbeLayerIntentCombinations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([combo, count]) => {
      console.log(`  ${combo}: ${count}`);
    });
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('RECOMMENDATIONS:');
  report.recommendations.forEach(rec => {
    console.log(`  ${rec}`);
  });
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('MECHANISMS CURRENTLY IN USE:');
  console.log(`  ${report.uniqueMechanisms.join(', ')}`);
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      END OF REPORT                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

// Export for use in Command Center or standalone analysis
export default analyzeNaviCueCatalog;