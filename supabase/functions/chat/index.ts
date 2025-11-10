import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lessonContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get user from auth header
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Check AI usage limits for unpaid users
    if (!profile?.has_purchased) {
      const { data: usage } = await supabase
        .from('ai_usage')
        .select('messages_count')
        .eq('user_id', user.id)
        .single();

      if (usage && usage.messages_count >= 10) {
        return new Response(JSON.stringify({ 
          error: 'Free question limit reached. Upgrade to continue using AI Study Buddy.',
          upgrade_required: true 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Build personalized system prompt
    const systemPrompt = `You are a friendly AI Study Buddy for UK business owners learning about finances, tax, and bookkeeping.

User Context:
- Business Structure: ${profile?.business_structure || 'Unknown'}
- Industry: ${profile?.industry || 'General'}
- Experience Level: ${profile?.experience_level || 'Beginner'}
- Main Pain Point: ${profile?.pain_point || 'General business finances'}
- Learning Goal: ${profile?.learning_goal || 'Improve financial management'}

${lessonContext ? `Current Lesson: ${lessonContext.title}\nLesson Focus: ${lessonContext.category}` : ''}

CRITICAL INSTRUCTIONS:
- Always provide UK-specific advice (HMRC, MTD, VAT, CIS, etc.)
- Use examples relevant to their ${profile?.industry || 'general'} industry
- Keep answers practical, clear, and actionable
- For expense questions, mention what's allowable for UK ${profile?.business_structure || 'businesses'}
- Reference specific HMRC guidance when relevant
- Suggest related lessons they should take
- Use simple language - they're learning
- Be encouraging and supportive

Style: Friendly, professional, encouraging. Like a knowledgeable colleague helping out.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'AI service rate limit reached. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.error('AI gateway error:', response.status, await response.text());
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update usage count for unpaid users
    if (!profile?.has_purchased) {
      const { data: existingUsage } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingUsage) {
        await supabase
          .from('ai_usage')
          .update({ 
            messages_count: existingUsage.messages_count + 1,
            last_question_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('ai_usage')
          .insert({ 
            user_id: user.id, 
            messages_count: 1 
          });
      }
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
