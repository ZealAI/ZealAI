export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("ZEAL.AI Worker Running", { status: 200 });
    }

    const body = await request.json();

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: "You are ZEAL.AI, a Bible-based assistant." },
          { role: "user", content: body.message }
        ]
      })
    });

    const data = await response.json();

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
