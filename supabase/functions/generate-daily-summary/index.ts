import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.info("🚀 generate-daily-summary function started");

Deno.serve(async (_req) => {
  const startTime = Date.now();
  console.info("📋 Starting daily summary generation process");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Busca todos os usuários (com timezone)
    console.info("👥 Fetching all users with timezone information");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, timezone");

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.warn("⚠️ No users found in database");
      return new Response("No users found.", {
        headers: { "Content-Type": "text/plain" }
      });
    }

    console.info(`✅ Found ${users.length} users to process`);

    let processedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const userStartTime = Date.now();
      console.info(`\n👤 Processing user: ${user.id}`);
      
      const tz = user.timezone || "UTC";
      console.info(`🌍 User timezone: ${tz}`);

      try {
        // Calcula a data correta no timezone do usuário
        const userDate = new Date().toLocaleString("en-US", {
          timeZone: tz
        });
        const formatted = new Date(userDate).toISOString().slice(0, 10);
        console.info(`📅 Calculated date for user in ${tz}: ${formatted}`);
        console.info(`🕐 User local time: ${userDate}`);

        // Busca crianças do usuário
        const { data: children, error: childrenError } = await supabase
          .from("children")
          .select("id")
          .eq("user_id", user.id);

        if (childrenError) {
          console.error(`❌ Error fetching children for user ${user.id}:`, childrenError);
          errorCount++;
          continue;
        }

        if (!children || children.length === 0) {
          console.info(`ℹ️ No children found for user ${user.id}`);
          continue;
        }

        console.info(`👶 Found ${children.length} children for user ${user.id}`);

        for (const child of children) {
          console.info(`  🔍 Processing child: ${child.id}`);

          // Busca registro diário da criança
          const { data: record, error: recordError } = await supabase
            .from("daily_records")
            .select("*")
            .eq("child_id", child.id)
            .eq("record_date", formatted)
            .maybeSingle();

          if (recordError) {
            console.error(`  ❌ Error fetching record for child ${child.id}:`, recordError);
            errorCount++;
            continue;
          }

          if (!record) {
            console.info(`  ℹ️ No daily record found for child ${child.id} on ${formatted}`);
            continue;
          }

          console.info(`  ✅ Found daily record for child ${child.id}`);

          // Calcula score (placeholder - substitua pela lógica real)
          const score = Math.floor(Math.random() * 100);
          console.info(`  📊 Calculated score: ${score}`);

          // Determina evolução
          const evolution = score > 70 ? "improved" : score < 40 ? "regressed" : "neutral";
          console.info(`  📈 Evolution status: ${evolution}`);

          // Gera insights
          const insights = [
            {
              title: "Daily Insight",
              text: "Automatically generated."
            }
          ];
          console.info(`  💡 Generated ${insights.length} insights`);

          // Gera alertas
          const alerts = score < 40 ? [
            {
              title: "Alert",
              text: "Low score detected."
            }
          ] : [];
          console.info(`  ⚠️ Generated ${alerts.length} alerts`);

          // Insere ou atualiza resumo
          const { error: upsertError } = await supabase
            .from("daily_summary")
            .upsert({
              user_id: user.id,
              child_id: child.id,
              summary_date: formatted,
              score,
              evolution_status: evolution,
              insights,
              alerts
            });

          if (upsertError) {
            console.error(`  ❌ Error upserting summary for child ${child.id}:`, upsertError);
            errorCount++;
          } else {
            console.info(`  ✅ Successfully saved summary for child ${child.id}`);
            processedCount++;
          }
        }

        const userDuration = Date.now() - userStartTime;
        console.info(`⏱️ User ${user.id} processed in ${userDuration}ms`);

      } catch (userError) {
        console.error(`❌ Error processing user ${user.id}:`, userError);
        errorCount++;
      }
    }

    const totalDuration = Date.now() - startTime;
    console.info(`\n✅ Summary generation complete`);
    console.info(`📊 Total processed: ${processedCount} summaries`);
    console.info(`❌ Total errors: ${errorCount}`);
    console.info(`⏱️ Total duration: ${totalDuration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errorCount,
        duration: totalDuration
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("❌ Fatal error in generate-daily-summary:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
