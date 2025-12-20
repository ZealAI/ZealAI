export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("ZEAL.AI Worker Running 🚀", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    try {
      const body = await request.json();

      return new Response(
        JSON.stringify({
          reply: "ZEAL.AI is alive and received your message ✅",
          input: body
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (err) {
      return new Response("Invalid JSON ❌", { status: 400 });
    }
  }
};
