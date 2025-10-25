import { addAppointment } from "./agenda.js";

// ==============================
//  BOT DE WHATSAPP - ASISTENTE PERSONAL
//  Con IA real (Gemini 1.5 Flash - gratuita)
// ==============================

import { makeWASocket, useMultiFileAuthState, DisconnectReason, WASocket } from "baileys";
import P from "pino";
import express from "express";
import dotenv from "dotenv";
import qrcode from "qrcode";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ==============================
// CONFIGURACIÓN DE GEMINI IA
// ==============================
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the .env file");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

async function listAvailableModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("Modelos de Gemini Disponibles:");
    for (const model of data.models) {
      console.log(`- ${model.name}`);
    }
  } catch (error) {
    console.error("Error al listar modelos:", error);
  }
}

// Función para generar respuesta IA
async function generarRespuesta(prompt: any) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("❌ Error al comunicarse con Gemini:", error);
    return "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo más tarde.";
  }
}

class BotManager {
  private sock: WASocket | null = null;
  private conversationHistories = new Map<string, any[]>();

  async start() {
    if (this.sock) {
      console.log("El bot ya está encendido.");
      return;
    }

    await listAvailableModels();
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    this.sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      logger: P({ level: "silent" }) as any,
    });

    this.sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        console.log("QR generado. Escanéalo con WhatsApp.");
        qrcode.toFile("qr.png", qr, (err) => {
          if (!err) console.log("QR guardado como qr.png");
        });
      }
      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== 
          DisconnectReason.loggedOut;
        console.log("Conexión cerrada. Reintentando:", shouldReconnect);
        if (shouldReconnect) this.start();
      } else if (connection === "open") {
        console.log("✅ Conexión abierta exitosamente!");
      }
    });

    this.sock.ev.on("messages.upsert", async (m: any) => {
      const msg = m.messages[0];
      if (!msg.message?.conversation) return;
      // if (msg.key.fromMe) return; // Ignorar mensajes propios

      const remoteJid = msg.key.remoteJid;
      const texto = msg.message.conversation.trim();
      console.log(`📩 Mensaje recibido de ${msg.pushName} (${remoteJid}): ${texto}`);

      // Get conversation history
      let history = this.conversationHistories.get(remoteJid) || [];
      let prompt;

      if (history.length === 0) {
        // First message
        const persona = "Eres Pedro Sánchez, el asistente personal de Ladislao (Ladis). Estás atendiendo sus mensajes de WhatsApp. Ladis no está disponible. Preséntate y ofrece tu ayuda de forma profesional pero con un toque de humor. Sé conciso y no ofrezcas opciones de respuesta. También puedes agendar citas para Ladis. Si alguien quiere una cita, pídele la fecha, hora y el motivo. Cuando tengas toda la información, responde únicamente con un JSON con la siguiente estructura: { \"tool\": \"addAppointment\", \"date\": \"YYYY-MM-DDTHH:mm:ss\", \"description\": \"Motivo de la cita\" }";
        prompt = `${persona}\n\nuser: ${texto}\nassistant:`
      } else {
        // Ongoing conversation
        const historyText = history.map(h => `${h.role}: ${h.content}`).join("\n");
        prompt = `Eres Pedro Sánchez, el asistente de Ladis. Continúa la conversación de forma natural, con un tono profesional pero con un toque de humor. Sé conciso. No ofrezcas opciones de respuesta. Recuerda que puedes agendar citas. Cuando tengas toda la información para una cita, responde únicamente con un JSON con la siguiente estructura: { \"tool\": \"addAppointment\", \"date\": \"YYYY-MM-DDTHH:mm:ss\", \"description\": \"Motivo de la cita\" }\n\n${historyText}\nuser: ${texto}\nassistant:`
      }


      let respuesta = await generarRespuesta(prompt);

      try {
        const jsonMatch = respuesta.match(/```json\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : respuesta;
        const parsedResponse = JSON.parse(jsonString);
        if (parsedResponse.tool === "addAppointment") {
          const { date, description } = parsedResponse;
          const newDate = new Date(date);
          if (isNaN(newDate.getTime())) {
            respuesta = "La fecha proporcionada no es válida. Por favor, utiliza el formato YYYY-MM-DDTHH:mm:ss.";
          } else {
            addAppointment(newDate, description);
            respuesta = `¡De acuerdo! Cita agendada para el ${newDate.toLocaleString()}: ${description}`;
          }
        }
      } catch (error) {
        // Not a JSON response, so it's a regular text response.
      }

      // Update history
      history.push({ role: "user", content: texto });
      history.push({ role: "assistant", content: respuesta });

      // Limit history to the last 10 messages (5 pairs of user/assistant)
      if (history.length > 10) {
          history = history.slice(-10);
      }
      this.conversationHistories.set(remoteJid, history);


      if (this.sock) {
        await this.sock.sendMessage(remoteJid, { text: respuesta });
        console.log(`💬 Respuesta enviada a ${remoteJid}: ${respuesta}`);
      }
    });

    this.sock.ev.on("creds.update", saveCreds);
  }

  stop() {
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
      console.log("Bot apagado.");
    } else {
      console.log("El bot ya está apagado.");
    }
  }
}

const botManager = new BotManager();

// ==============================
// CONFIGURACIÓN DEL SERVIDOR WEB
// ==============================
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/start-bot', (req, res) => {
  botManager.start();
  res.send('Bot encendido.');
});

app.get('/stop-bot', (req, res) => {
  botManager.stop();
  res.send('Bot apagado.');
});

app.listen(PORT, () => {
  console.log(`API Server ON: http://localhost:${PORT}`);
});
