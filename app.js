async function send() {
  const text = document.getElementById("msg").value;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();
  document.getElementById("reply").textContent = data.reply || "No reply";
}
