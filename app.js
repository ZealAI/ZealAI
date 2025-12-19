async function send() {
  const message = document.getElementById("input").value;

  const res = await fetch("https://zeal-ai.zeal-ai-app.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  document.getElementById("reply").innerText = data.reply;
}

