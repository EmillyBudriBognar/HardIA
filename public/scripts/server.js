const express = require("express");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Configuração inicial
const app = express();
const PORT = process.env.PORT || 3000;
const API_REQUEST_LIMIT = 100; // Limite de requisições por hora

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Middlewares de segurança
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: API_REQUEST_LIMIT,
  message: "Muitas requisições deste IP. Tente novamente mais tarde."
});
app.use("/chat", limiter);

// Servir arquivos estáticos
app.use(express.static("public", { 
  maxAge: "1d",
  setHeaders: (res, path) => {
    if (path.endsWith(".css") || path.endsWith(".js")) {
      res.setHeader("Cache-Control", "public, max-age=31536000");
    }
  }
}));

// Rota de chat
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    // Validação
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Mensagem inválida. Por favor, forneça um texto válido."
      });
    }

    // Configuração do modelo
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `
        Responda sempre em português brasileiro. Você é um assistente de diagnóstico de hardware. 
        O usuário fornecerá detalhes sobre a configuração do seu PC. Sua tarefa é analisar as 
        informações e compará-las com os requisitos de softwares e jogos.
        
        Formato de resposta:
        - Inicie com "✅ Seu PC está apto!" ou "❌ Seu PC não está apto!"
        - Liste os requisitos vs sua configuração
        - Dê uma avaliação detalhada
        - Sugira melhorias quando aplicável
        
        Seja claro e conciso, com formatação fácil de ler.
      `,
    });

    const chat = model.startChat({
      history: [],
      generationConfig: { 
        maxOutputTokens: 500,
        temperature: 0.7
      },
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();
    
    res.status(200).json({ 
      success: true,
      data: {
        response: responseText,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Erro no endpoint /chat:", error);
    res.status(500).json({ 
      success: false,
      error: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente."
    });
  }
});

// Rota de health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: "Erro interno do servidor" 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});