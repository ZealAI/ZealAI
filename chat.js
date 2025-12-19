export async function onRequestPost({ request, env }) {
  try {
    const { message } = await request.json();

    const response = await fetch(
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
            { role: "system", content: "You are ZEAL.AI, a Bible-based assistant." },
            { role: "user", content: message }
          ]
        })
      }
    );

    const data = await response.json();

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
