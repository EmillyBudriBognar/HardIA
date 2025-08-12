document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Exibe a mensagem do usuário no chat
    addMessage("user", userMessage);

    // Envia a mensagem para o backend
    try {
      const modelResponse = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await modelResponse.json();
      if (data && data.response) {
        addMessage("model", data.response);
      } else {
        addMessage("model", "Erro: Resposta inválida do modelo.");
      }
    } catch (err) {
      console.error(err);
      addMessage("model", "Erro: Não foi possível processar sua mensagem.");
    }

    userInput.value = "";
  });

    function addMessage(role, text) {
    const messageDiv = document.getElementById("response");
    messageDiv.textContent = text;
  }

});
