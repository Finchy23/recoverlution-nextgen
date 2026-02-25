import { useEffect } from 'react';
import { useCommandCenterStore } from '@/app/stores/commandCenterStore';

/**
 * NaviCueDataLogger - Logs records 2-10 from the store for building
 */
export function NaviCueDataLogger() {
  const { navicueTypes } = useCommandCenterStore();

  useEffect(() => {
    if (navicueTypes.length >= 10) {
      const records2to10 = navicueTypes.slice(1, 10);
      
      console.log('='.repeat(80));
      console.log('📦 NAVICUE RECORDS 2-10 FOR BUILDING');
      console.log('='.repeat(80));
      
      records2to10.forEach((record, i) => {
        const recordNum = i + 2;
        console.log(`\n${'='.repeat(80)}`);
        console.log(`RECORD #${recordNum}`);
        console.log('='.repeat(80));
        console.log('navicue_type_name:', record.navicue_type_name);
        console.log('form:', record.form);
        console.log('intent:', record.intent);
        console.log('mechanism:', record.mechanism);
        console.log('kbe_layer:', record.kbe_layer);
        console.log('container_type:', record.container_type);
        console.log('magic_signature:', record.magic_signature);
        console.log('operator_sequence:', record.operator_sequence);
        console.log('primary_prompt:', record.primary_prompt);
        console.log('cta_primary:', record.cta_primary);
        console.log('cta_defer:', record.cta_defer);
        console.log('\nFULL RECORD:');
        console.log(JSON.stringify(record, null, 2));
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('END OF RECORDS 2-10');
      console.log('='.repeat(80) + '\n');
    }
  }, [navicueTypes]);

  return null; // This component doesn't render anything
}