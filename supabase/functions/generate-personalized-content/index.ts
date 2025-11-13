import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, contentType = 'expenses' } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get lesson details
    const { data: lesson } = await supabase
      .from('lessons')
      .select('title, category, content')
      .eq('id', lessonId)
      .single();

    if (!lesson || !profile) {
      return new Response(JSON.stringify({ error: 'Lesson or profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create context hash to detect when regeneration is needed
    const contextHash = `${profile.industry}_${profile.business_structure}_${profile.pain_point}_${profile.annual_turnover}`;

    // Check if we have valid cached content
    const { data: existingContent } = await supabase
      .from('user_personalized_content')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .eq('content_type', contentType)
      .eq('context_hash', contextHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingContent) {
      console.log('Returning cached personalized content');
      return new Response(JSON.stringify({ content: existingContent.generated_content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build personalized prompt based on content type
    let systemPrompt = `You are a personalized learning assistant for UK tax and accounting education. Generate highly specific, actionable content tailored to the user's exact business situation.`;
    
    let userPrompt = '';
    
    if (contentType === 'expenses') {
      userPrompt = `Generate a detailed list of 8-12 common business expenses specifically for:
- Industry: ${profile.industry || 'general business'}
- Business Structure: ${profile.business_structure || 'unknown'}
- Annual Turnover: ${profile.annual_turnover || 'unknown'}
- Pain Point: ${profile.pain_point || 'general accounting'}

For the lesson: "${lesson.title}" (Category: ${lesson.category})

Format each expense with:
1. Expense name
2. Realistic UK price range or typical amounts
3. Brief note on tax deductibility or VAT treatment (if relevant)

Make it ultra-specific to their industry. Use real brand names, actual UK prices, and practical examples they'd encounter. Return as JSON array:
[
  {
    "name": "Expense name",
    "amount": "£X-Y per month/year",
    "note": "Tax treatment note"
  }
]`;
    } else if (contentType === 'action_steps') {
      userPrompt = `Generate 5-7 personalized action steps for:
- Industry: ${profile.industry || 'general business'}
- Business Structure: ${profile.business_structure || 'unknown'}
- Experience Level: ${profile.experience_level || 'beginner'}
- Pain Point: ${profile.pain_point || 'general accounting'}

For the lesson: "${lesson.title}"

Make steps specific, actionable, and include:
- Actual software/tools they should use (with UK alternatives)
- Specific deadlines or timeframes relevant to UK tax calendar
- Industry-specific considerations

Return as JSON array:
[
  {
    "step": "Action description",
    "timeline": "When to do it",
    "tools": "Recommended tools/software"
  }
]`;
    } else if (contentType === 'examples') {
      userPrompt = `Generate 3-5 realistic scenario examples for:
- Industry: ${profile.industry || 'general business'}
- Business Structure: ${profile.business_structure || 'unknown'}

For the lesson: "${lesson.title}"

Each example should:
- Use realistic UK amounts and scenarios
- Be directly relevant to their industry
- Show the practical application of the lesson content
- Include specific numbers and outcomes

Return as JSON array:
[
  {
    "scenario": "Scenario description",
    "context": "Business context",
    "outcome": "What happens / lesson learned"
  }
]`;
    }

    // Call Lovable AI
    console.log('Generating personalized content with AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices[0].message.content;
    
    // Parse JSON from response
    let generatedContent;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || generatedText.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : generatedText;
      generatedContent = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', generatedText);
      // Fallback: return raw text wrapped in array
      generatedContent = [{ content: generatedText }];
    }

    // Save to database
    await supabase
      .from('user_personalized_content')
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        content_type: contentType,
        generated_content: generatedContent,
        context_hash: contextHash,
      });

    console.log('Personalized content generated and cached successfully');

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-personalized-content:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});