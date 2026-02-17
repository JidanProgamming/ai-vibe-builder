import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMAGE_INSTRUCTIONS = `
CRITICAL IMAGE RULES - READ CAREFULLY:
1. ONLY use images that are DIRECTLY relevant to the user's prompt/request. Do NOT add random decorative images.
2. Every <img> tag MUST have a working src URL. NEVER leave placeholder or empty src.
3. Use ONLY these reliable image sources:
   a. Unsplash (PREFERRED): https://images.unsplash.com/photo-{EXACT_ID}?w={width}&h={height}&fit=crop
   b. Pravatar for avatars: https://i.pravatar.cc/150?img={1-70}
   c. Picsum for generic photos: https://picsum.photos/{width}/{height}?random={number}
4. VERIFIED Unsplash photo IDs (use ONLY these, do NOT invent IDs):
   - Business/Office: photo-1460925895917-afdab827c52f, photo-1519389950473-47ba0277781c, photo-1551434678-e076c223a692
   - Food/Restaurant: photo-1504674900247-0877df9cc836, photo-1565299624946-b28f40a0ae38, photo-1414235077428-338989a2e8c0
   - Nature/Landscape: photo-1470071459604-3b5ec3a7fe05, photo-1441974231531-c6227db76b6e, photo-1506744038136-46273834b3fb
   - People/Team: photo-1522071820081-009f0129c71c, photo-1600880292203-757bb62b4baf, photo-1573496359142-b8d87734a5a2
   - Health/Fitness: photo-1571019614242-c5c5dee9f50b, photo-1576091160399-112ba8d25d1d
   - Education: photo-1503676260728-1c00da094a0b, photo-1523050854058-8df90110c9f1
   - Real Estate: photo-1560518883-ce09059eeffa, photo-1582407947092-89c3a1a82144
   - Fashion: photo-1445205170230-053b83016050, photo-1558618666-fcd25c85f82e
   - Technology: photo-1518770660439-4636190af475, photo-1550751827-4bd374c3f58b
   - Travel: photo-1488646953014-85cb44e25828, photo-1507525428034-b723cf961d3e
   - E-commerce/Shopping: photo-1441986300917-64674bd600d8, photo-1472851294608-062f824d29cc
   - Medical: photo-1579684385127-1ef15d508118, photo-1631217868264-e5b90bb7e133
   - Automotive: photo-1494976388531-d1058494cdd8, photo-1583121274602-3e2820c69888
   - Pet/Animal: photo-1543466835-00a7907e9de1, photo-1548199973-03cce0bbc87b
5. ALL images must have: alt text, object-fit: cover, rounded corners, responsive width
6. For hero sections use large images (w=1200&h=600), for cards use medium (w=600&h=400), for thumbnails use small (w=300&h=200)
7. If the prompt is about a SPECIFIC topic, choose images that match that topic. For example:
   - Restaurant website → use food images
   - Tech startup → use technology/office images  
   - Portfolio → use relevant work images
8. If no verified Unsplash ID matches the topic, use Picsum: https://picsum.photos/800/400?random=1
9. NEVER use broken URLs, placeholder.com, via.placeholder.com, or made-up image URLs
`;

const systemPrompts = {
  frontend: {
    landing: `You are an expert frontend developer specializing in modern web development.
Generate beautiful, modern, and responsive landing page code.
${IMAGE_INSTRUCTIONS}

IMPORTANT: Always provide BOTH formats:
1. First, provide a complete standalone HTML file with inline CSS and Tailwind CDN that can be previewed immediately
2. Then, provide the React/TypeScript component version

For the HTML version:
- Include <!DOCTYPE html> with full structure
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Make it fully responsive and beautiful with real images from Unsplash
- Use modern design patterns with gradients, shadows, and animations

For the React version:
- Use TypeScript and proper component structure
- Include all necessary imports
- Add helpful comments`,

    dashboard: `You are an expert frontend developer specializing in admin dashboards.
Generate clean, professional dashboard UI.
${IMAGE_INSTRUCTIONS}

IMPORTANT: Always provide BOTH formats:
1. First, a complete standalone HTML file with Tailwind CDN for immediate preview
2. Then, the React/TypeScript component version

Include charts placeholders, tables, stats cards, navigation, and avatar images.`,

    component: `You are an expert React component developer.
Generate reusable, well-structured components.
${IMAGE_INSTRUCTIONS}

IMPORTANT: Always provide BOTH formats:
1. First, a complete standalone HTML file with Tailwind CDN showing the component with images
2. Then, the React/TypeScript version with proper props interfaces`,
  },
  fullstack: {
    app: `You are a fullstack developer expert in building business applications.
Generate complete application code.
${IMAGE_INSTRUCTIONS}

IMPORTANT: Always provide:
1. First, a complete standalone HTML file with Tailwind CDN for UI preview with real images
2. Then, React frontend components
3. Finally, backend API structure and database schema suggestions`,

    website: `You are a fullstack web developer specializing in business websites.
Generate SEO-optimized business landing pages.
${IMAGE_INSTRUCTIONS}

IMPORTANT: Always provide:
1. First, a complete standalone HTML file with Tailwind CDN - this is the main deliverable
2. Include compelling copywriting, CTAs, modern design, and high-quality images from Unsplash
3. Then optionally provide React component versions`,

    game: `You are a creative developer specializing in promotional mini-games.
Generate interactive game code.

IMPORTANT: Always provide:
1. First, a complete standalone HTML file with the game working - include JavaScript for interactivity
2. Make sure the game is fully functional in the preview
3. Include scoring, animations, and engaging UI with themed images
4. Optionally provide React version`,

    aiapps: `You are a fullstack developer expert in building AI-powered applications and AI tools.
Generate complete AI application code with REAL AI functionality.
${IMAGE_INSTRUCTIONS}

The generated AI app should be a MULTI-MODAL AI TOOL that can:
- Generate TEXT (articles, copywriting, code, translations, summaries, etc.)
- Generate IMAGES (using the AI image generation endpoint)
- Process and analyze content
- Provide chat/assistant functionality

CRITICAL: The AI functionality MUST be real and working. Use these patterns:

For TEXT generation - use the chat completions endpoint:
\`\`\`javascript
const response = await fetch('https://qubwfxzldgzieectpulm.supabase.co/functions/v1/ai-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userPrompt, type: 'text' })
});
const data = await response.json();
// data.response contains the generated text
\`\`\`

For IMAGE generation - use the image generation endpoint:
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
1. A complete standalone HTML file with tabs/sections for different AI capabilities:
   - Text Generator (articles, copywriting, code, etc.)
   - Image Generator (create images from text descriptions)
   - Chat Assistant (conversational AI)
2. Modern, polished UI with proper loading states, error handling
3. Results display area that properly renders text and images
4. History/gallery of generated content
5. Clean design with Tailwind CSS

Then provide the backend edge function code that handles both text and image generation.

Make sure the generated app includes:
- Clean, modern UI with Tailwind CSS and real images
- Real AI integration using the API endpoints above
- Tabs or sections for Text, Image, and Chat modes
- Proper error handling for rate limits (429) and payment errors (402)
- Loading states with animations
- Gallery/history of generated content`,
  },
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
    const { prompt, model, category } = await req.json();
    
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
    
    // Sanitize input - remove control characters
    const sanitizedPrompt = prompt.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    console.log('Received validated request:', { prompt: sanitizedPrompt.substring(0, 100), model, category });
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('Service configuration error');
    }

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
- Provide complete, runnable code in code blocks with proper language tags
- Use proper file comments like: \`\`\`html\n// index.html\n...\`\`\`
- Include file structure suggestions
- End with setup instructions

Always respond in the same language as the user's prompt.`
          },
          { 
            role: 'user', 
            content: `Generate code for the following request:\n\n${sanitizedPrompt}` 
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
