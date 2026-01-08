export default {
  async fetch(request, env) {

    // ---------- CORS ----------
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // ---------- HEALTH ----------
    if (request.method !== "POST") {
      return new Response("ZEAL.AI Worker Running 🚀", {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      const { messages } = await request.json();

      if (!Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: "Invalid message format" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // ---------- SANITIZE (KEEP CONTEXT) ----------
      const sanitizedMessages = messages
        .filter(
          m =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
        .slice(-16);

      // ---------- LAST USER MESSAGE (IMPORTANT) ----------
      const lastUserMessage = [...sanitizedMessages]
        .reverse()
        .find(m => m.role === "user");

      if (!lastUserMessage) {
        return new Response(JSON.stringify({ reply: "Please send a message." }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const text = lastUserMessage.content.trim();
      const normalized = text.toLowerCase();

      // ---------- GRATITUDE / CLOSING ----------
      const gratitude = ["thanks", "thank you", "ok", "okay", "amen", "cool", "got it"];
      if (gratitude.includes(normalized)) {
        sanitizedMessages.push({
          role: "assistant",
          content: "Respond briefly, kindly, and warmly to the user’s message."
        });
      }

      // ---------- TRUE VAGUE INPUT GUARD ----------
      const vaguePhrases = ["idk", "i dont know", "what now", "any advice", "hmm", "??", "..."];
      const onlySymbols = /^[^a-zA-Z0-9]+$/.test(normalized);

      if ((vaguePhrases.includes(normalized) || onlySymbols) && text.length < 20) {
        return new Response(
          JSON.stringify({
            reply: "Can you share a little more about what you’re facing right now?"
          }),
          { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      // ---------- SIZE LIMIT ----------
      const totalChars = sanitizedMessages.reduce((s, m) => s + m.content.length, 0);
      if (totalChars > 4000) {
        return new Response(JSON.stringify({ error: "Message too long." }), {
          status: 413,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // ---------- MISTRAL ----------
      const mistralResponse = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistral-small-latest",
            temperature: 0.3,
            top_p: 0.9,
            messages: [
              {
                role: "system",
                content: 


` You are **ZealAI**, a Bible-based spiritual guide.

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
              ...sanitizedMessages,
            ],
          }),
        }
      );

      if (!mistralResponse.ok) {
        const err = await mistralResponse.text();
        return new Response(JSON.stringify({ error: err }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const data = await mistralResponse.json();
      const reply = data.choices?.[0]?.message?.content || "Please try again.";

      return new Response(JSON.stringify({ reply }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
