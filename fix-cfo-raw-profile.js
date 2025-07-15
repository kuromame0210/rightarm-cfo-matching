const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ipovokidhyhojjqhanwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwb3Zva2lkaHlob2pqcWhhbndqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2OTE3MywiZXhwIjoyMDY4MDQ1MTczfQ.RyEKSSsLjip0TQht-Flu4fox0jIUaizsEK1ew9oH7Kk';

const supabase = createClient(supabaseUrl, supabaseKey);

function extractCareerOnly(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'string') {
    return null;
  }
  
  // 【経歴】セクションを見つける
  const careerStartMatch = rawProfile.match(/【経歴】/);
  if (!careerStartMatch) {
    return null;
  }
  
  const careerStart = careerStartMatch.index + careerStartMatch[0].length;
  
  // 【経歴】セクションの終わりを見つける（次の【】セクションまで）
  const afterCareerText = rawProfile.substring(careerStart);
  const nextSectionMatch = afterCareerText.match(/【[^】]+】/);
  
  let careerEnd;
  if (nextSectionMatch) {
    careerEnd = careerStart + nextSectionMatch.index;
  } else {
    careerEnd = rawProfile.length;
  }
  
  // 【経歴】セクションの内容を抽出
  let careerContent = rawProfile.substring(careerStart, careerEnd).trim();
  
  // 改行を正規化
  careerContent = careerContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 空行を削除し、必要な改行を保持
  careerContent = careerContent.split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
  
  return careerContent;
}

function extractPossibleTasks(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'string') {
    return null;
  }
  
  const tasksStartMatch = rawProfile.match(/【可能な業務】/);
  if (!tasksStartMatch) {
    return null;
  }
  
  const tasksStart = tasksStartMatch.index + tasksStartMatch[0].length;
  const afterTasksText = rawProfile.substring(tasksStart);
  const nextSectionMatch = afterTasksText.match(/【[^】]+】/);
  
  let tasksEnd;
  if (nextSectionMatch) {
    tasksEnd = tasksStart + nextSectionMatch.index;
  } else {
    tasksEnd = rawProfile.length;
  }
  
  let tasksContent = rawProfile.substring(tasksStart, tasksEnd).trim();
  tasksContent = tasksContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  tasksContent = tasksContent.split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
  
  return tasksContent;
}

function extractWorkingAreas(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'string') {
    return null;
  }
  
  const areasStartMatch = rawProfile.match(/【対応可能エリア】/);
  if (!areasStartMatch) {
    return null;
  }
  
  const areasStart = areasStartMatch.index + areasStartMatch[0].length;
  const afterAreasText = rawProfile.substring(areasStart);
  const nextSectionMatch = afterAreasText.match(/【[^】]+】/);
  
  let areasEnd;
  if (nextSectionMatch) {
    areasEnd = areasStart + nextSectionMatch.index;
  } else {
    areasEnd = rawProfile.length;
  }
  
  let areasContent = rawProfile.substring(areasStart, areasEnd).trim();
  areasContent = areasContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  areasContent = areasContent.split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
  
  return areasContent;
}

function extractCompensation(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'string') {
    return null;
  }
  
  const compensationStartMatch = rawProfile.match(/【想定月額報酬】/);
  if (!compensationStartMatch) {
    return null;
  }
  
  const compensationStart = compensationStartMatch.index + compensationStartMatch[0].length;
  const afterCompensationText = rawProfile.substring(compensationStart);
  const nextSectionMatch = afterCompensationText.match(/【[^】]+】/);
  
  let compensationEnd;
  if (nextSectionMatch) {
    compensationEnd = compensationStart + nextSectionMatch.index;
  } else {
    compensationEnd = rawProfile.length;
  }
  
  let compensationContent = rawProfile.substring(compensationStart, compensationEnd).trim();
  compensationContent = compensationContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  compensationContent = compensationContent.split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
  
  return compensationContent;
}

async function fixCFORawProfiles() {
  try {
    console.log('=== CFO Raw Profile Fix Process ===');
    
    // 佐藤大悟さんと奥田豊さんのデータを取得
    const { data: cfos, error } = await supabase
      .from('cfo_profiles')
      .select('*');

    if (error) {
      console.error('Error fetching CFO profiles:', error);
      return;
    }

    const targetCfos = cfos.filter(cfo => 
      cfo.cfo_name && (
        cfo.cfo_name.includes('佐藤') || 
        cfo.cfo_name.includes('大悟') ||
        cfo.cfo_name.includes('奥田') ||
        cfo.cfo_name.includes('豊')
      )
    );

    console.log(`Found ${targetCfos.length} target CFOs to fix`);

    for (const cfo of targetCfos) {
      console.log(`\n--- Processing ${cfo.cfo_name} ---`);
      
      if (!cfo.cfo_raw_profile) {
        console.log('No raw profile data found, skipping...');
        continue;
      }

      console.log('Original raw profile length:', cfo.cfo_raw_profile.length);
      
      // 経歴部分のみを抽出
      const careerOnly = extractCareerOnly(cfo.cfo_raw_profile);
      const possibleTasks = extractPossibleTasks(cfo.cfo_raw_profile);
      const workingAreas = extractWorkingAreas(cfo.cfo_raw_profile);
      const compensation = extractCompensation(cfo.cfo_raw_profile);
      
      console.log('Extracted career content:', careerOnly ? careerOnly.length : 'null');
      console.log('Extracted possible tasks:', possibleTasks ? possibleTasks.length : 'null');
      console.log('Extracted working areas:', workingAreas ? workingAreas.length : 'null');
      console.log('Extracted compensation:', compensation ? compensation.length : 'null');

      if (careerOnly) {
        console.log('Career content preview:');
        console.log(careerOnly.substring(0, 200) + '...');
      }

      // データベースを更新
      const updateData = {
        cfo_raw_profile: careerOnly || cfo.cfo_raw_profile, // 抽出できない場合は元データを保持
        cfo_possible_tasks: possibleTasks || cfo.cfo_possible_tasks,
        cfo_working_areas: workingAreas || cfo.cfo_working_areas,
        cfo_compensation: compensation || cfo.cfo_compensation
      };

      const { error: updateError } = await supabase
        .from('cfo_profiles')
        .update(updateData)
        .eq('cfo_user_id', cfo.cfo_user_id);

      if (updateError) {
        console.error(`Error updating ${cfo.cfo_name}:`, updateError);
      } else {
        console.log(`✅ Successfully updated ${cfo.cfo_name}`);
      }
    }

    console.log('\n=== Fix process completed ===');
  } catch (error) {
    console.error('Script error:', error);
  }
}

fixCFORawProfiles();