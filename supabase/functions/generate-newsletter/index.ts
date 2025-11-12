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

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current month and season info
    const now = new Date();
    const monthName = now.toLocaleDateString('en-GB', { month: 'long' });
    const isQuarterEnd = [2, 5, 8, 11].includes(now.getMonth()); // March, June, Sept, Dec

    // Build personalized newsletter prompt
    const newsletterPrompt = `Generate a personalized monthly newsletter for a UK business owner with the following profile:

Business Profile:
- Business Structure: ${profile.business_structure}
- Industry: ${profile.industry}
- Experience Level: ${profile.experience_level}
- Annual Turnover: ${profile.annual_turnover || 'Not specified'}
- VAT Registered: ${profile.vat_registered ? 'Yes' : 'No'}
- Accounting Year-End: ${profile.accounting_year_end || 'Not specified'}

Current Context:
- Month: ${monthName} ${now.getFullYear()}
- Tax Year: ${now.getMonth() >= 3 ? `${now.getFullYear()}-${now.getFullYear() + 1}` : `${now.getFullYear() - 1}-${now.getFullYear()}`}
${isQuarterEnd ? '- Note: End of VAT quarter approaching' : ''}

Create a newsletter with these sections:

1. **This Month's Focus** (2-3 key actions for ${monthName})
2. **Important Deadlines** (UK tax/VAT deadlines relevant to them)
3. **Quick Tax Tips** (3-4 actionable tips specific to their business structure)
4. **Did You Know?** (1 interesting UK tax fact or recent change)
5. **Recommended Lessons** (2-3 lessons they should prioritize)

Style: Friendly, concise, UK-focused. Use their business structure and industry in examples.
Format: Use markdown with ## for sections.
Length: Keep under 500 words.`;

    // Call AI to generate newsletter
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a UK business finance expert creating personalized monthly newsletters. Always reference HMRC, use UK terminology, and provide specific dates for deadlines.' 
          },
          { role: 'user', content: newsletterPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status, await response.text());
      return new Response(JSON.stringify({ error: 'Failed to generate newsletter' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const newsletterContent = data.choices?.[0]?.message?.content;

    if (!newsletterContent) {
      throw new Error('No content generated');
    }

    return new Response(
      JSON.stringify({ 
        content: newsletterContent,
        profile: {
          business_structure: profile.business_structure,
          industry: profile.industry,
        },
        generated_at: new Date().toISOString()
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Newsletter generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
