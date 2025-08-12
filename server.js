const express = require("express");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Configurar o Express para servir arquivos estáticos da pasta "public"
app.use(express.static("public"));

// Middleware para processar JSON no body das requisições
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensagem não pode estar vazia." });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "Responda sempre em portugês brasileiro. Você é um assistente de diagnóstico de hardware. O usuário fornecerá detalhes sobre a configuração do seu PC, incluindo o processador, memória RAM, placa de vídeo e outros componentes do sistema. Sua tarefa é analisar as informações fornecidas e compará-las com os requisitos mínimos e recomendados de diversos softwares e jogos que você deverá buscar na internet. Com base nessa comparação, você deve retornar uma resposta indicando se o PC do usuário é capaz de rodar o software ou jogo solicitado. Responda sempre de forma clara e concisa, oferecendo um feedback sobre se o sistema atende ou não aos requisitos e sugerindo melhorias, se necessário.  Incie sua resposta com 'Seu PC está apto! *emoji feliz*' ou 'Seu PC não está apto *emoji triste*' dependendo da resposta. ",
    });

    const chat = model.startChat({
      history: [],
      generationConfig: { maxOutputTokens: 100 },
    });

    const result = await chat.sendMessage(message);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao processar mensagem." });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
