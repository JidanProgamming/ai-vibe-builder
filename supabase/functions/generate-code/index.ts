import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompts = {
  frontend: {
    landing: `You are an expert frontend developer specializing in modern web development.
Generate beautiful, modern, and responsive landing page code.

IMPORTANT: Always provide BOTH formats:
1. First, provide a complete standalone HTML file with inline CSS and Tailwind CDN that can be previewed immediately
2. Then, provide the React/TypeScript component version

For the HTML version:
- Include <!DOCTYPE html> with full structure
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Make it fully responsive and beautiful
- Use modern design patterns with gradients, shadows, and animations

For the React version:
- Use TypeScript and proper component structure
- Include all necessary imports
- Add helpful comments`,

    dashboard: `You are an expert frontend developer specializing in admin dashboards.
Generate clean, professional dashboard UI.

IMPORTANT: Always provide BOTH formats:
1. First, a complete standalone HTML file with Tailwind CDN for immediate preview
2. Then, the React/TypeScript component version

Include charts placeholders, tables, stats cards, and navigation.`,

    component: `You are an expert React component developer.
Generate reusable, well-structured components.

IMPORTANT: Always provide BOTH formats:
1. First, a complete standalone HTML file with Tailwind CDN showing the component
2. Then, the React/TypeScript version with proper props interfaces`,
  },
  fullstack: {
    app: `You are a fullstack developer expert in building business applications.
Generate complete application code.

IMPORTANT: Always provide:
1. First, a complete standalone HTML file with Tailwind CDN for UI preview
2. Then, React frontend components
3. Finally, backend API structure and database schema suggestions`,

    website: `You are a fullstack web developer specializing in business websites.
Generate SEO-optimized business landing pages.

IMPORTANT: Always provide:
1. First, a complete standalone HTML file with Tailwind CDN - this is the main deliverable
2. Include compelling copywriting, CTAs, and modern design
3. Then optionally provide React component versions`,

    game: `You are a creative developer specializing in promotional mini-games.
Generate interactive game code.

IMPORTANT: Always provide:
1. First, a complete standalone HTML file with the game working - include JavaScript for interactivity
2. Make sure the game is fully functional in the preview
3. Include scoring, animations, and engaging UI
4. Optionally provide React version`,

    aiapps: `You are a fullstack developer expert in building AI-powered applications.
Generate complete AI application code with REAL AI functionality.

CRITICAL: The AI functionality MUST be real and working. Use this pattern:

1. First, provide a complete standalone HTML file with working AI chat/functionality:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen">
  <div id="app" class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-3xl font-bold text-center mb-8">AI Assistant</h1>
    <div id="chat-container" class="bg-gray-800 rounded-lg p-4 mb-4 h-96 overflow-y-auto"></div>
    <div class="flex gap-2">
      <input type="text" id="user-input" placeholder="Ask me anything..." class="flex-1 bg-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500">
      <button onclick="sendMessage()" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium">Send</button>
    </div>
  </div>
  
  <script>
    const API_URL = 'https://qubwfxzldgzieectpulm.supabase.co/functions/v1/ai-chat';
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    
    async function sendMessage() {
      const message = userInput.value.trim();
      if (!message) return;
      
      // Add user message
      addMessage(message, 'user');
      userInput.value = '';
      
      // Show loading
      const loadingId = 'loading-' + Date.now();
      addMessage('Thinking...', 'assistant', loadingId);
      
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove loading and add response
        document.getElementById(loadingId)?.remove();
        addMessage(data.response || data.error || 'No response', 'assistant');
      } catch (error) {
        document.getElementById(loadingId)?.remove();
        addMessage('Error: Could not get response', 'assistant');
      }
    }
    
    function addMessage(text, role, id) {
      const div = document.createElement('div');
      if (id) div.id = id;
      div.className = \`mb-3 p-3 rounded-lg \${role === 'user' ? 'bg-blue-600 ml-12' : 'bg-gray-700 mr-12'}\`;
      div.textContent = text;
      chatContainer.appendChild(div);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  </script>
</body>
</html>
\`\`\`

2. Then provide the Supabase Edge Function code:

\`\`\`typescript
// supabase/functions/ai-chat/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${LOVABLE_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant.' },
          { role: 'user', content: message }
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No response';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
\`\`\`

3. Then provide React components if needed.

Make sure the generated app includes:
- Clean, modern UI with Tailwind CSS
- Real AI integration using the Lovable AI Gateway
- Proper error handling
- Loading states`,
  },
};

serve(async (req) => {
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
