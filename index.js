export default {
  async fetch(request,env) {
    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    


    // Health check
    if (request.method !== "POST") {
      return new Response("ZEAL.AI Worker Running 🚀", {
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      const { messages } = await request.json();

      if (!Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: "messages must be an array" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      const apiKey = env.MISTRAL_API_KEY;

      const mistralResponse = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [
  {
    role: "system",
    content: `
  You are ZealAI — a Bible-based spiritual guide.
   
IMPORTANT RESPONSE RULES:
1. Always respond in bullet points or numbered lists when giving advice.
2. The bullet points or short paragraphs must be STACKED VERTICALLY with space between them,
3. Keep each bullet/paragraph **1–2 sentences max**.
4. Do NOT write long paragraphs.
5. Keep it clear, calm, and readable.
6. Include scripture references when relevant.
7. Use this exact format for all responses:

Tone: gentle, wise, non-judgmental.
 
- You are calm, fun, funny, insightful, non-judgmental, and faith-centered.
Avoid overwhelming the user.
Clarity over length. Peace over noise.
  
  `
  },
  ...messages.slice(-12)  // 🔥 PREVENT TOKEN BLOWUPS
],

          }),
        }
      );
       if (!mistralResponse.ok) {
        const errText = await mistralResponse.text();
        return new Response(
          JSON.stringify({ error: "Mistral error", details: errText }),
          { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }
      const data = await mistralResponse.json();

      return new Response(
        JSON.stringify({
          reply: data.choices?.[0]?.message?.content || "No reply",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
}; 

