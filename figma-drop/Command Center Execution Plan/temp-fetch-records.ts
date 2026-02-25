// Temporary script to fetch and display records 2-10
import { fetchNaviCueTypeMatrix } from './src/app/utils/fetchSupabaseData';

async function getRecords() {
  try {
    const allRecords = await fetchNaviCueTypeMatrix();
    const records2to10 = allRecords.slice(1, 10);
    
    console.log('Records 2-10:');
    records2to10.forEach((record: any, i: number) => {
      console.log(`\n=== RECORD ${i + 2} ===`);
      console.log(JSON.stringify(record, null, 2));
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

getRecords();
