const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");

let messages = [];

sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  messages.push({ role: "user", content: text });
  responseBox.textContent = "Thinking…";

  try {
    const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();

    if (data.reply) {
      messages.push({ role: "assistant", content: data.reply });
      responseBox.textContent = data.reply;
    } else {
      responseBox.textContent = "No reply";
    }

    input.value = "";
  } catch (err) {
    responseBox.textContent = "Error connecting to ZEAL.AI";
  }
};
