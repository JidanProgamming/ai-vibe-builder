import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const buildImageInstructions = (aiImages: Record<string, string> = {}) => {
  const hasAiImages = Object.keys(aiImages).length > 0;
  
  const aiImageSection = hasAiImages ? `
AI-GENERATED IMAGES AVAILABLE (USE THESE FIRST - these are custom generated for this website):
${Object.entries(aiImages).map(([id, url]) => `- ${id}: src="${url}" (use this as <img src="${url}" ...>)`).join('\n')}

CRITICAL: You MUST use ALL of the AI-generated images listed above in the website. Place them in the most appropriate sections.
- "logo" image → use in header/navbar as the brand logo
- "hero" image → use in the hero/banner section as the main visual
- "product" or "service" images → use in features/about sections
- "team" or "about" images → use in team/about sections
` : '';

  return `
CRITICAL IMAGE RULES:
${aiImageSection}
${hasAiImages ? 'For any ADDITIONAL images not covered by AI-generated ones:' : ''}
1. Use ONLY images DIRECTLY relevant to the user's prompt. Do NOT add random decorative images.
2. Every <img> tag MUST have a working src URL. NEVER leave placeholder or empty src.
3. For fallback images use ONLY these reliable sources:
   a. Unsplash: https://images.unsplash.com/photo-{EXACT_ID}?w={width}&h={height}&fit=crop
   b. Pravatar for avatars: https://i.pravatar.cc/150?img={1-70}
   c. Picsum: https://picsum.photos/{width}/{height}?random={number}
4. VERIFIED Unsplash IDs by category:
   - Business/Office: photo-1460925895917-afdab827c52f, photo-1519389950473-47ba0277781c
   - Food/Restaurant: photo-1504674900247-0877df9cc836, photo-1565299624946-b28f40a0ae38
   - Nature: photo-1470071459604-3b5ec3a7fe05, photo-1441974231531-c6227db76b6e
   - People/Team: photo-1522071820081-009f0129c71c, photo-1600880292203-757bb62b4baf
   - Technology: photo-1518770660439-4636190af475, photo-1550751827-4bd374c3f58b
   - Fashion: photo-1445205170230-053b83016050, photo-1558618666-fcd25c85f82e
   - Medical: photo-1579684385127-1ef15d508118, photo-1631217868264-e5b90bb7e133
   - Real Estate: photo-1560518883-ce09059eeffa, photo-1582407947092-89c3a1a82144
5. ALL images must have: descriptive alt text, object-fit: cover, responsive width
6. For hero sections: w=1200&h=600, cards: w=600&h=400, thumbnails: w=300&h=200
7. NEVER use broken URLs, placeholder.com, or made-up image IDs
`;};

const buildSystemPrompts = (aiImages: Record<string, string> = {}) => {
  const imageInstructions = buildImageInstructions(aiImages);
  
  return {
    frontend: {
      landing: `You are an expert frontend developer specializing in modern web development.
Generate beautiful, modern, PROFESSIONAL and responsive landing page code.
${imageInstructions}

IMPORTANT: Always provide BOTH formats:
1. First, a COMPLETE standalone HTML file with Tailwind CDN that can be previewed immediately
2. Then, the React/TypeScript component version

For the HTML version:
- Include <!DOCTYPE html> with full structure
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Make it fully responsive and beautiful with high-quality professional design
- Use modern design patterns with gradients, shadows, and animations
- MUST include all AI-generated images provided above in appropriate sections

For the React version:
- Use TypeScript and proper component structure
- Include all necessary imports
- Add helpful comments`,

      dashboard: `You are an expert frontend developer specializing in admin dashboards.
Generate clean, professional dashboard UI.
${imageInstructions}

IMPORTANT: Always provide BOTH formats:
1. First, a complete standalone HTML file with Tailwind CDN for immediate preview
2. Then, the React/TypeScript component version

Include charts placeholders, tables, stats cards, navigation, and use AI-generated images for avatars/branding.`,

      component: `You are an expert React component developer.
Generate reusable, well-structured components.
${imageInstructions}

IMPORTANT: Always provide BOTH formats:
1. First, a complete standalone HTML file with Tailwind CDN showing the component
2. Then, the React/TypeScript version with proper props interfaces`,
    },
    fullstack: {
      app: `You are a fullstack developer expert in building business applications.
Generate complete application code.
${imageInstructions}

IMPORTANT: Always provide:
1. First, a complete standalone HTML file with Tailwind CDN for UI preview
2. Then, React frontend components
3. Finally, backend API structure and database schema suggestions`,

      website: `You are a fullstack web developer specializing in business websites.
Generate SEO-optimized, PROFESSIONAL business landing pages.
${imageInstructions}

IMPORTANT: Always provide:
1. First, a complete standalone HTML file with Tailwind CDN - this is the main deliverable
2. Include compelling copywriting, CTAs, modern design, and use ALL provided AI-generated images
3. Then optionally provide React component versions`,

      game: `You are a creative developer specializing in promotional mini-games.
Generate interactive game code.

IMPORTANT: Always provide:
1. First, a complete standalone HTML file with the game working - include JavaScript for interactivity
2. Make sure the game is fully functional in the preview
3. Include scoring, animations, and engaging UI
4. Optionally provide React version`,

      aiapps: `You are a fullstack developer expert in building AI-powered applications and AI tools.
Generate complete AI application code with REAL AI functionality.
${imageInstructions}

The generated AI app should be a MULTI-MODAL AI TOOL that can:
- Generate TEXT (articles, copywriting, code, translations, summaries, etc.)
- Generate IMAGES (using the AI image generation endpoint)
- Generate VIDEO descriptions
- Process and analyze content
- Provide chat/assistant functionality

CRITICAL: The AI functionality MUST be real and working. Use these patterns:

For TEXT generation:
\`\`\`javascript
const response = await fetch('https://qubwfxzldgzieectpulm.supabase.co/functions/v1/ai-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userPrompt, type: 'text' })
});
const data = await response.json();
// data.response contains the generated text
\`\`\`

For IMAGE generation:
\`\`\`javascript
const response = await fetch('https://qubwfxzldgzieectpulm.supabase.co/functions/v1/ai-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: imagePrompt, type: 'image' })
});
const data = await response.json();
// data.image contains base64 image data URL
// Display with: <img src={data.image} />
\`\`\`

Generate a COMPLETE, BEAUTIFUL AI tool app with:
1. A complete standalone HTML file with tabs for:
   - Text Generator (articles, copywriting, code, etc.)
   - Image Generator (create images from text descriptions)
   - Chat Assistant (conversational AI)
2. Modern, polished UI with proper loading states, error handling
3. Results display area that properly renders text and images
4. History/gallery of generated content
5. Clean design with Tailwind CSS and use provided AI-generated images for branding`,
    },
  };
};

// Valid model and category options
const validModels = ['frontend', 'fullstack'];
const validFrontendCategories = ['landing', 'dashboard', 'component'];
const validFullstackCategories = ['app', 'website', 'game', 'aiapps'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model, category, aiImages } = await req.json();
    
    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt: must be a non-empty string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (prompt.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long: maximum 5000 characters allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!model || typeof model !== 'string' || !validModels.includes(model)) {
      return new Response(
        JSON.stringify({ error: 'Invalid model: must be "frontend" or "fullstack"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const validCategories = model === 'frontend' ? validFrontendCategories : validFullstackCategories;
    if (!category || typeof category !== 'string' || !validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: `Invalid category for ${model} model` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Sanitize input
    const sanitizedPrompt = prompt.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Use AI-generated images if provided
    const imageMap: Record<string, string> = (aiImages && typeof aiImages === 'object') ? aiImages : {};
    const hasAiImages = Object.keys(imageMap).length > 0;
    console.log(`Request with ${Object.keys(imageMap).length} AI images:`, Object.keys(imageMap));
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('Service configuration error');
    }

    const modelType = model as 'frontend' | 'fullstack';
    const prompts = buildSystemPrompts(imageMap);
    
    type FrontendCat = keyof typeof prompts.frontend;
    type FullstackCat = keyof typeof prompts.fullstack;
    
    let systemPrompt = prompts.frontend.landing;
    if (modelType === 'frontend' && category in prompts.frontend) {
      systemPrompt = prompts.frontend[category as FrontendCat];
    } else if (modelType === 'fullstack' && category in prompts.fullstack) {
      systemPrompt = prompts.fullstack[category as FullstackCat];
    }

    console.log('Using prompt for:', modelType, category, hasAiImages ? '(with AI images)' : '');

    const userContent = `Generate code for the following request:\n\n${sanitizedPrompt}${hasAiImages ? `\n\nIMPORTANT: Use ALL of these AI-generated images in the website:\n${Object.entries(imageMap).map(([id, url]) => `- ${id}: "${url}"`).join('\n')}` : ''}`;

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
- Provide complete, runnable code in code blocks with proper language tags
- Use proper file comments like: \`\`\`html\n// index.html\n...\`\`\`
- Include file structure suggestions
- End with setup instructions

Always respond in the same language as the user's prompt.`
          },
          { role: 'user', content: userContent }
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

