import express from "express";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import User from "./models/user.js";
import ChatHistory from "./models/chatHistory.js";
import { genAI } from "./config/gemini-config.js";
import { connectionToDatabase } from "./db/connection.js";

config();
const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use("/api/v1", appRouter);

io.on("connection", (socket) => {
  console.log("WebSocket connected");

  socket.on("message", async (message) => {
    console.log("Received message:", message);

    try {
      const user = await User.findById(socket.userId);
      if (!user) {
        return socket.send(JSON.stringify({ error: "User not found" }));
      }

      // Send user message to Gemini API
      const gemini = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = await gemini.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: message }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 100,
        },
      });

      const result = await chat.sendMessage(message);

      const newChatHistory = new ChatHistory({
        user: user._id,
        title: message,
      });

      await newChatHistory.save();

      const messageObj = {
        sender: user._id,
        message: {
          user: message,
          gemini: result.response.candidates,
        },
      };

      const newChat = new Chat({
        chatHistory: newChatHistory._id,
        messages: [messageObj],
      });

      await newChat.save();

      user.chatHistory.push(newChatHistory._id);
      await user.save();

      socket.emit("response", { message: "OK", chatHistory: newChat });

    } catch (error) {
      console.log(error);
      socket.send(JSON.stringify({ error: "Something went wrong" }));
    }
  });

  socket.on("disconnect", () => {
    console.log("WebSocket disconnected");
  });
});

export { app, httpServer };
