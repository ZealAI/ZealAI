export default {
  async fetch(request, env) {

    // ---------- CORS PREFLIGHT ----------
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // ---------- HEALTH CHECK ----------
    if (request.method !== "POST") {
      return new Response("ZEAL.AI Worker Running 🚀", {
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      const body = await request.json();
      const messages = body?.messages;

      // ---------- INPUT GUARDS ----------
      if (!Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      // Sanitize messages
     const sanitizedMessages = messages
  .filter(m =>
    m &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string"
  )
  .slice(-16);


      const totalChars = sanitizedMessages.reduce((s, m) => s + m.content.length, 0);
      if (totalChars > 4000) {
        return new Response(
          JSON.stringify({ error: "Message too long. Please shorten your input." }),
          { status: 413, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      // ---------- VAGUE INPUT GUARD ----------
      const lastUserMessage = sanitizedMessages.at(-1)?.content?.trim() || "";
      const normalized = lastUserMessage.toLowerCase();

      const vaguePhrases = [
        "help", "idk", "i dont know", "what now",
        "what should i do", "any advice", "hmm", "??", "..."
      ];

      const tooShort = normalized.length < 12;
      const isVague = vaguePhrases.includes(normalized);
      const onlySymbols = /^[^a-zA-Z0-9]+$/.test(normalized);

      if (tooShort || isVague || onlySymbols) {
        return new Response(
          JSON.stringify({
            reply: "Can you tell me a bit more about what you’re facing right now? Faith, stress, school, or direction?"
          }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      if (sanitizedMessages.length === 1 && sanitizedMessages[0].content.length < 5) {
  sanitizedMessages.unshift({
    role: "assistant",
    content: "The user is closing or expressing gratitude. Respond briefly and kindly."
  });
}


      // ---------- MISTRAL CALL ----------
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
                content:` You are **ZealAI**, a Bible-based spiritual guide.

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
        const errText = await mistralResponse.text();
        return new Response(
          JSON.stringify({ error: "Mistral error", details: errText }),
          { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      const data = await mistralResponse.json();
      const reply =
        typeof data.choices?.[0]?.message?.content === "string"
          ? data.choices[0].message.content.slice(0, 2000)
          : "I couldn’t generate a clear response. Please try again.";

      return new Response(
        JSON.stringify({ reply }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff",
          },
        }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }
  },
};
