import { GoogleGenerativeAI } from "@google/generative-ai";


export  const genAI = new GoogleGenerativeAI("AIzaSyBDFnxz9xGuw2CnnZtWjI2GkwTIv3xBkD0");
//process.env.GEMINI_API_KEY


export const displayChatTokenCount = async (gemini, chat, message) => {
  if (!message || !message.parts) {
    console.error('Invalid message format:', message);
    return;
  }

  const history = await chat.getHistory();
  const historyTexts = history.map((item) => item.parts.map((part) => part.text).join(''));
  const messageText = message.parts.map((part) => part.text).join('');

  await displayTokenCount(gemini, { contents: [...historyTexts, messageText] });
};
