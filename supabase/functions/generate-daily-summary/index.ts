import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailyRecord {
  id: string;
  user_id: string;
  child_id: string;
  record_date: string;
  sleep_data: any;
  mood_data: any;
  nutrition_data: any;
  medication_data: any;
  activity_data: any;
  crisis_data: any;
  hyperfocus_data: any;
  incident_data: any;
  extra_notes: string;
}

// Calculate score based on all data fields
function calculateDayScore(record: DailyRecord): number {
  let totalScore = 0;
  let maxScore = 0;

  // Sleep score (0-20 points)
  if (record.sleep_data?.quality) {
    const sleepQuality = record.sleep_data.quality;
    const sleepScore = sleepQuality === 'excellent' ? 20 : 
                       sleepQuality === 'good' ? 16 :
                       sleepQuality === 'fair' ? 12 :
                       sleepQuality === 'poor' ? 8 : 4;
    totalScore += sleepScore;
  }
  maxScore += 20;

  // Mood score (0-20 points) - average across times of day
  if (record.mood_data) {
    const moods = [record.mood_data.morning, record.mood_data.afternoon, record.mood_data.evening].filter(Boolean);
    if (moods.length > 0) {
      const positiveMoods = ['happy', 'excited', 'calm', 'focused'];
      const positiveCount = moods.filter(m => positiveMoods.includes(m)).length;
      totalScore += (positiveCount / moods.length) * 20;
    }
  }
  maxScore += 20;

  // Nutrition score (0-15 points)
  if (record.nutrition_data?.meals) {
    const meals = Object.values(record.nutrition_data.meals);
    const goodMeals = meals.filter((m: any) => m?.quality === 'good' || m?.quality === 'excellent').length;
    totalScore += (goodMeals / meals.length) * 15;
  }
  maxScore += 15;

  // Medication adherence (0-15 points)
  if (record.medication_data?.medications && Array.isArray(record.medication_data.medications)) {
    const meds = record.medication_data.medications;
    const takenCount = meds.filter((m: any) => m?.taken).length;
    if (meds.length > 0) {
      totalScore += (takenCount / meds.length) * 15;
    }
  }
  maxScore += 15;

  // Crisis impact (0-15 points) - fewer crises = better score
  if (record.crisis_data) {
    const crises = [record.crisis_data.morning, record.crisis_data.afternoon, record.crisis_data.evening].filter(Boolean);
    const crisisCount = crises.filter(c => c?.occurred).length;
    totalScore += (1 - (crisisCount / 3)) * 15;
  }
  maxScore += 15;

  // Activities participation (0-15 points)
  if (record.activity_data) {
    const activities = [record.activity_data.morning, record.activity_data.afternoon, record.activity_data.evening].filter(Boolean);
    const participated = activities.filter(a => a?.activities && a.activities.length > 0).length;
    if (activities.length > 0) {
      totalScore += (participated / activities.length) * 15;
    }
  }
  maxScore += 15;

  return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
}

// Generate insights based on today vs yesterday
function generateInsights(todayRecord: DailyRecord, yesterdayRecord: DailyRecord | null): string[] {
  const insights: string[] = [];

  if (!yesterdayRecord) {
    insights.push("Primeiro dia de registro - continue monitorando para gerar comparações.");
    return insights;
  }

  // Sleep comparison
  if (todayRecord.sleep_data?.quality && yesterdayRecord.sleep_data?.quality) {
    const qualityOrder = ['terrible', 'poor', 'fair', 'good', 'excellent'];
    const todayIndex = qualityOrder.indexOf(todayRecord.sleep_data.quality);
    const yesterdayIndex = qualityOrder.indexOf(yesterdayRecord.sleep_data.quality);
    
    if (todayIndex > yesterdayIndex) {
      insights.push("✅ Qualidade do sono melhorou em relação a ontem");
    } else if (todayIndex < yesterdayIndex) {
      insights.push("⚠️ Qualidade do sono piorou em relação a ontem");
    }
  }

  // Mood comparison
  const getTodayMoodPositivity = () => {
    const moods = [todayRecord.mood_data?.morning, todayRecord.mood_data?.afternoon, todayRecord.mood_data?.evening].filter(Boolean);
    const positive = ['happy', 'excited', 'calm', 'focused'];
    return moods.filter(m => positive.includes(m)).length / (moods.length || 1);
  };

  const getYesterdayMoodPositivity = () => {
    const moods = [yesterdayRecord.mood_data?.morning, yesterdayRecord.mood_data?.afternoon, yesterdayRecord.mood_data?.evening].filter(Boolean);
    const positive = ['happy', 'excited', 'calm', 'focused'];
    return moods.filter(m => positive.includes(m)).length / (moods.length || 1);
  };

  const todayMoodScore = getTodayMoodPositivity();
  const yesterdayMoodScore = getYesterdayMoodPositivity();

  if (todayMoodScore > yesterdayMoodScore) {
    insights.push("✅ Humor geral melhorou hoje");
  } else if (todayMoodScore < yesterdayMoodScore) {
    insights.push("⚠️ Humor geral está mais instável hoje");
  }

  // Crisis comparison
  const getTodayCrisisCount = () => {
    const crises = [todayRecord.crisis_data?.morning, todayRecord.crisis_data?.afternoon, todayRecord.crisis_data?.evening].filter(Boolean);
    return crises.filter(c => c?.occurred).length;
  };

  const getYesterdayCrisisCount = () => {
    const crises = [yesterdayRecord.crisis_data?.morning, yesterdayRecord.crisis_data?.afternoon, yesterdayRecord.crisis_data?.evening].filter(Boolean);
    return crises.filter(c => c?.occurred).length;
  };

  const todayCrises = getTodayCrisisCount();
  const yesterdayCrises = getYesterdayCrisisCount();

  if (todayCrises < yesterdayCrises) {
    insights.push("✅ Menos crises registradas hoje");
  } else if (todayCrises > yesterdayCrises) {
    insights.push("⚠️ Aumento no número de crises");
  }

  return insights;
}

// Generate alerts based on concerning patterns
function generateAlerts(record: DailyRecord, score: number): string[] {
  const alerts: string[] = [];

  // Low overall score
  if (score < 50) {
    alerts.push("🚨 Score do dia está abaixo de 50% - atenção necessária");
  }

  // Sleep quality issues
  if (record.sleep_data?.quality === 'poor' || record.sleep_data?.quality === 'terrible') {
    alerts.push("😴 Qualidade do sono está ruim - considere ajustar rotina noturna");
  }

  // Multiple crises
  const crises = [record.crisis_data?.morning, record.crisis_data?.afternoon, record.crisis_data?.evening].filter(Boolean);
  const crisisCount = crises.filter(c => c?.occurred).length;
  if (crisisCount >= 2) {
    alerts.push("⚠️ Múltiplas crises registradas hoje - revisar gatilhos e estratégias");
  }

  // High intensity crisis
  const highIntensityCrisis = crises.some(c => c?.occurred && c?.intensity >= 4);
  if (highIntensityCrisis) {
    alerts.push("🔴 Crise de alta intensidade registrada - acompanhamento recomendado");
  }

  // Medication non-adherence
  if (record.medication_data?.medications && Array.isArray(record.medication_data.medications)) {
    const meds = record.medication_data.medications;
    const missedMeds = meds.filter((m: any) => !m?.taken).length;
    if (missedMeds > 0) {
      alerts.push(`💊 ${missedMeds} medicação(ões) não tomada(s) - verificar motivo`);
    }
  }

  return alerts;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get yesterday's date in YYYY-MM-DD format
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    console.log(`Generating summaries for date: ${yesterdayStr}`);

    // Get all records from yesterday
    const { data: records, error: recordsError } = await supabase
      .from('daily_records')
      .select('*')
      .eq('record_date', yesterdayStr);

    if (recordsError) {
      console.error('Error fetching records:', recordsError);
      throw recordsError;
    }

    if (!records || records.length === 0) {
      console.log('No records found for yesterday');
      return new Response(
        JSON.stringify({ message: 'No records to process', date: yesterdayStr }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const summaries = [];

    // Group records by child_id
    const recordsByChild = records.reduce((acc: any, record: DailyRecord) => {
      if (!acc[record.child_id]) {
        acc[record.child_id] = [];
      }
      acc[record.child_id].push(record);
      return acc;
    }, {});

    // Generate summary for each child
    for (const [childId, childRecords] of Object.entries(recordsByChild)) {
      const todayRecord = (childRecords as DailyRecord[])[0]; // Should be only one record per child per day
      
      // Get previous day record for comparison
      const { data: prevRecord } = await supabase
        .from('daily_records')
        .select('*')
        .eq('child_id', childId)
        .eq('record_date', twoDaysAgoStr)
        .single();

      // Calculate score
      const score = calculateDayScore(todayRecord);

      // Determine evolution status
      let evolutionStatus = 'neutral';
      if (prevRecord) {
        const prevScore = calculateDayScore(prevRecord);
        if (score > prevScore + 5) evolutionStatus = 'improved';
        else if (score < prevScore - 5) evolutionStatus = 'regressed';
      }

      // Generate insights and alerts
      const insights = generateInsights(todayRecord, prevRecord);
      const alerts = generateAlerts(todayRecord, score);

      // Prepare comparison data
      const comparisonData = {
        previous_score: prevRecord ? calculateDayScore(prevRecord) : null,
        score_difference: prevRecord ? score - calculateDayScore(prevRecord) : null,
      };

      // Insert or update summary
      const { error: insertError } = await supabase
        .from('daily_summary')
        .upsert({
          user_id: todayRecord.user_id,
          child_id: todayRecord.child_id,
          summary_date: yesterdayStr,
          score: score,
          evolution_status: evolutionStatus,
          insights: insights,
          alerts: alerts,
          comparison_data: comparisonData,
        }, {
          onConflict: 'child_id,summary_date'
        });

      if (insertError) {
        console.error('Error inserting summary:', insertError);
        continue;
      }

      summaries.push({
        child_id: childId,
        score,
        evolution_status: evolutionStatus,
        insights_count: insights.length,
        alerts_count: alerts.length,
      });
    }

    console.log(`Generated ${summaries.length} summaries for ${yesterdayStr}`);

    return new Response(
      JSON.stringify({ 
        message: 'Summaries generated successfully',
        date: yesterdayStr,
        summaries 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in generate-daily-summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
