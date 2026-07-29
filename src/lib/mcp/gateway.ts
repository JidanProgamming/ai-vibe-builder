const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

function apiKey() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI service is not configured");
  return key;
}

async function post(body: unknown) {
  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    if (response.status === 402) throw new Error("AI credits exhausted for this workspace.");
    throw new Error(`AI gateway error (${response.status})`);
  }

  return await response.json();
}

export async function callGateway({ system, user }: { system: string; user: string }) {
  const data = await post({
    model: "google/gemini-3.6-flash",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return data.choices?.[0]?.message?.content ?? "No response generated";
}

export async function generateImage(prompt: string) {
  const data = await post({
    model: "google/gemini-2.5-flash-image",
    messages: [{ role: "user", content: prompt }],
    modalities: ["image", "text"],
  });
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    image: data.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null,
  };
}
