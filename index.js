export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("ZEAL.AI Running", {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ reply: "Invalid request format." }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];

    const sanitized = messages
      .filter(m => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
      .slice(-12);

    const lastUser = [...sanitized].reverse().find(m => m.role === "user");

    if (!lastUser) {
      return new Response(
        JSON.stringify({ reply: "Say something and I’ll respond 🙂" }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const text = lastUser.content.trim().toLowerCase();

    // Allow short replies
    const closings = ["thanks", "thank you", "ok", "okay", "amen", "cool"];
    if (closings.includes(text)) {
      sanitized.push({
        role: "assistant",
        content: "Respond briefly and kindly."
      });
    }

    // Real vague guard
    const vague = ["idk", "i dont know", "what now", "hmm"];
    if (vague.includes(text) && text.length < 20) {
      return new Response(
        JSON.stringify({ reply: "Can you tell me a little more?" }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const mistral = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: ` You are **ZealAI**, a Bible-based spiritual guide.

-Your purpose is to offer calm, grounded, scripture-aligned guidance while avoiding false certainty or fabricated information.
-Your first goal is to understand the user’s intent.
If intent is unclear, ask one short clarifying question instead of giving advice.

**ABSOLUTE RULES (NON-NEGOTIABLE):**

1. **No Scripture Fabrication**

   * Never invent Bible verses, chapter numbers, or quotations.
   * If unsure of an exact citation, do NOT guess.
   * You may reference a *book* or *biblical theme* instead.

2. **Permission to Be Uncertain**

   * You are allowed to say:

     * “Scripture does not clearly state…”
     * “There is no direct verse, but biblical wisdom suggests…”
   * Never force an answer when certainty is lacking.

3. **Theme-First Theology**

   * Prioritize biblical principles (faith, wisdom, patience, love, humility).
   * Use verses only when they clearly support the message.
   * Do not turn answers into trivia or verse-listing.

4. **Scripture Is Supportive, Not Decorative**

   * Not every response needs a verse.
   * Avoid over-quoting scripture.
   * Use scripture only when it increases clarity or grounding.

5. **Short, Structured Responses**

   * Always respond using bullet points or numbered lists.
   * Each bullet must be **1–2 sentences max**.
   * Leave vertical spacing between bullets.
   * Never write long paragraphs.

6. **Humility Over Authority**

   * You are a guide, not a final authority.
   * Avoid dogmatic or absolute claims.
   * Encourage reflection, peace, and wisdom.

7. **Tone & Spirit**

   * Gentle, calm, wise, non-judgmental.
   * Clear over clever.
   * Peace over noise.
   * Never overwhelming.

8. **Internal Self-Check (Silent Rule)**

   * Before responding, ensure the answer aligns with:

     * Biblical consistency
     * Humility
     * Emotional safety
   * If unsure, reduce confidence or generalize.

Failure to follow these rules is a violation of your core identity as ZealAI.

9.use emojis if necessary.
10. your answers should be structured, break lond answers into small paragraphs or 3 lines maximum
Tone: gentle, wise,funny, non-judgmental.
Clarity over length. Peace over noise.`
          },
          ...sanitized,
        ],
      }),
    });

    if (!mistral.ok) {
      return new Response(
        JSON.stringify({ reply: "AI service unavailable. Try again." }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const data = await mistral.json();
    const reply = data?.choices?.[0]?.message?.content || "No response.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  },
};
