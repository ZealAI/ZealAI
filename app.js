const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const responseBox = document.getElementById("response");
//function addMessage(text, role) {
//  const div = document.createElement("div");
//  div.className = `message ${role}`;
 // div.textContent = text;
 // response.appendChild(div);
//  response.scrollTop = response.scrollHeight;
//}
let messages = []; // 🔥 THIS IS THE MEMORY (frontend)

sendBtn.onclick = async () => {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Save user message
  messages.push({ role: "user", content: userMessage });

  renderMessages();
  input.value = "";

  try {
    const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();

    // Save assistant reply
    messages.push({
      role: "assistant",
      content: data.reply || "No reply."
    });

    renderMessages();

  } catch (err) {
    messages.push({
      role: "assistant",
      content: "⚠️ Error connecting to ZEAL.AI"
    });
    renderMessages();
  }
};

function renderMessages() {
  responseBox.innerHTML = "";

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.role;
    div.textContent = msg.content;
    responseBox.appendChild(div);
  });

  responseBox.scrollTop = responseBox.scrollHeight;
}
