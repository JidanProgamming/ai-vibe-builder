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
    const { prompt, imageRequests } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Service configuration error');
    }

    // Step 1: Determine what images are needed based on prompt
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are an expert at analyzing website requirements and determining what images are needed.
Analyze the user's website prompt and return a JSON array of image generation prompts needed.
Return ONLY valid JSON, no markdown, no explanation.

Return format:
{
  "images": [
    {
      "id": "hero",
      "purpose": "Hero section background",
      "prompt": "Professional high-quality image description for AI generation"
    },
    {
      "id": "logo",
      "purpose": "Company logo",
      "prompt": "Modern minimalist logo design description"
    }
  ]
}

Rules:
- Maximum 5 images
- Only include images DIRECTLY needed by the website
- Make prompts detailed and professional for AI image generation
- Always include a logo if it's a business/brand website
- Include hero image for landing pages
- Include product/service images if relevant
- Prompts must be in English for best image quality`
          },
          {
            role: 'user',
            content: `Website prompt: ${prompt}\n\nWhat images does this website need? Return JSON only.`
          }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const err = await analysisResponse.text();
      console.error('Analysis error:', analysisResponse.status, err);
      if (analysisResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (analysisResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error('Failed to analyze image requirements');
    }

    const analysisData = await analysisResponse.json();
    const analysisText = analysisData.choices?.[0]?.message?.content || '{"images":[]}';
    
    let imageList: Array<{ id: string; purpose: string; prompt: string }> = [];
    try {
      const cleanedJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedJson);
      imageList = parsed.images || [];
    } catch (e) {
      console.error('Failed to parse image list:', e);
      imageList = [];
    }

    // Limit to 4 images max
    imageList = imageList.slice(0, 4);

    console.log(`Generating ${imageList.length} images for prompt`);

    // Step 2: Generate each image in parallel
    const generatedImages: Record<string, string> = {};
    
    const imageGenerationPromises = imageList.map(async (imgReq) => {
      try {
        const imgResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image',
            messages: [
              {
                role: 'user',
                content: `${imgReq.prompt}. Ultra high resolution, professional quality, suitable for a website.`
              }
            ],
            modalities: ['image', 'text'],
          }),
        });

        if (!imgResponse.ok) {
          console.error(`Image generation failed for ${imgReq.id}:`, imgResponse.status);
          return;
        }

        const imgData = await imgResponse.json();
        const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (imageUrl) {
          generatedImages[imgReq.id] = imageUrl;
          console.log(`Generated image for: ${imgReq.id}`);
        }
      } catch (err) {
        console.error(`Error generating image for ${imgReq.id}:`, err);
      }
    });

    await Promise.all(imageGenerationPromises);

    return new Response(
      JSON.stringify({
        images: generatedImages,
        imageList: imageList,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-images function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
