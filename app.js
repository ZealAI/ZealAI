export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("ZEAL.AI Worker Running", { status: 200 });
    }

    try {
      const body = await request.json();
      const userMessage = body.message;

      const mistralResponse = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.MISTRAL_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "mistral-small",
            messages: [
              {
                role: "system",
                content: "You are ZEAL.AI, a Bible-based assistant."
              },
              {
                role: "user",
                content: userMessage
              }
            ]
          })
        }
      );

      const data = await mistralResponse.json();

      return new Response(
        JSON.stringify({
          reply: data.choices[0].message.content
        }),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.toString() }),
        { status: 500 }
      );
    }
  }
};
