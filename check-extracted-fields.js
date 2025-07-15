const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ipovokidhyhojjqhanwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwb3Zva2lkaHlob2pqcWhhbndqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2OTE3MywiZXhwIjoyMDY4MDQ1MTczfQ.RyEKSSsLjip0TQht-Flu4fox0jIUaizsEK1ew9oH7Kk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExtractedFields() {
  try {
    console.log('=== Checking Extracted Fields ===');
    
    const { data: cfos, error } = await supabase
      .from('cfo_profiles')
      .select('cfo_name, cfo_raw_profile, cfo_possible_tasks, cfo_working_areas, cfo_compensation')
      .in('cfo_name', ['佐藤大悟', '奥田豊']);

    if (error) {
      console.error('Error fetching data:', error);
      return;
    }

    for (const cfo of cfos) {
      console.log('\n' + '='.repeat(50));
      console.log('CFO:', cfo.cfo_name);
      
      console.log('\n--- Raw Profile (Career Only) ---');
      console.log(cfo.cfo_raw_profile || 'No data');
      
      console.log('\n--- Possible Tasks ---');
      console.log(cfo.cfo_possible_tasks || 'No data');
      
      console.log('\n--- Working Areas ---');
      console.log(cfo.cfo_working_areas || 'No data');
      
      console.log('\n--- Compensation ---');
      console.log(cfo.cfo_compensation || 'No data');
    }
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkExtractedFields();