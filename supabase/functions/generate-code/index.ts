import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompts = {
  frontend: {
    landing: `You are an expert frontend developer specializing in React, TypeScript, and Tailwind CSS. 
Generate beautiful, modern, and responsive landing page code. 
Include proper component structure, semantic HTML, and modern design patterns.
Always include complete, runnable code with all necessary imports.
Use modern React patterns with hooks.
Add helpful comments explaining key sections.`,
    dashboard: `You are an expert frontend developer specializing in admin dashboards.
Generate clean, professional dashboard UI components using React, TypeScript, and Tailwind CSS.
Include charts, tables, and interactive elements where appropriate.
Focus on data visualization and user experience.`,
    component: `You are an expert React component developer.
Generate reusable, well-structured React components with TypeScript.
Include proper props interfaces, default values, and examples of usage.
Follow best practices for component composition and styling.`,
  },
  fullstack: {
    app: `You are a fullstack developer expert in building business applications.
Generate complete application code including React frontend, API structure, and database schema suggestions.
Include authentication considerations, CRUD operations, and proper error handling.
Provide code for both frontend components and backend logic.`,
    website: `You are a fullstack web developer specializing in business websites.
Generate SEO-optimized landing pages with CMS-ready structure.
Include copywriting suggestions, call-to-action elements, and lead capture forms.
Provide both frontend code and backend API endpoints if needed.`,
    game: `You are a creative developer specializing in promotional mini-games.
Generate interactive game code using React and Canvas/CSS animations.
Include gamification elements like scores, rewards, and social sharing.
Focus on engagement and fun user experience for marketing purposes.`,
  },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model, category } = await req.json();
    
    console.log('Received request:', { prompt: prompt?.substring(0, 100), model, category });
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get appropriate system prompt
    const modelType = model as 'frontend' | 'fullstack';
    const categoryType = category as keyof typeof systemPrompts.frontend | keyof typeof systemPrompts.fullstack;
    
    let systemPrompt = systemPrompts.frontend.landing;
    if (modelType === 'frontend' && categoryType in systemPrompts.frontend) {
      systemPrompt = systemPrompts.frontend[categoryType as keyof typeof systemPrompts.frontend];
    } else if (modelType === 'fullstack' && categoryType in systemPrompts.fullstack) {
      systemPrompt = systemPrompts.fullstack[categoryType as keyof typeof systemPrompts.fullstack];
    }

    console.log('Using system prompt for:', modelType, categoryType);

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
            content: `${systemPrompt}

Output format:
- Start with a brief explanation of what you're building
- Provide complete, runnable code
- Use proper file structure suggestions
- End with setup instructions

Always respond in the same language as the user's prompt.`
          },
          { 
            role: 'user', 
            content: `Generate code for the following request:\n\n${prompt}` 
          }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Streaming response from AI gateway');

    // Return the streaming response
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in generate-code function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
