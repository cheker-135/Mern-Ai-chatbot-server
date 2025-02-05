import User from "../models/user.js";
import Chat from "../models/chat.js";
import ChatHistory from "../models/chatHistory.js";
import { genAI } from "../config/gemini-config.js";

export const generateChatCompletion = async (req, res, next) => {
  const message = String(req.body.message); // Assuming message is a string
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not registered or token malfunctioned" });
    }

    let geminiResponse;
    // Check for greeting queries
   if (message.toLowerCase().includes("hi") || message.toLowerCase().includes("hello") || message.toLowerCase().includes("who are you")|| message.toLowerCase().includes("bonjour")|| message.toLowerCase().includes("salut")) {
     geminiResponse = "Hello, I'm Swiver chatbot, how can I help you today?";
    // Check for Swiver-specific queries
     } else if (message.toLowerCase().includes("gestion commerciale")) {
      geminiResponse = "Swiver offre des fonctionnalités avancées de gestion commerciale pour les TPE et PME en Tunisie. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else if (message.toLowerCase().includes("facturation")) {
      geminiResponse = "Swiver simplifie la facturation pour les petites entreprises en Tunisie. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else if (message.toLowerCase().includes("stock")) {
      geminiResponse = "Swiver propose un suivi précis du stock pour optimiser la gestion des produits. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else if (message.toLowerCase().includes("client")) {
      geminiResponse = "Swiver permet de gérer facilement la base de clients et de suivre les interactions. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else if (message.toLowerCase().includes("paiement")) {
      geminiResponse = "Swiver offre des solutions de paiement sécurisées pour les transactions commerciales. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else if (message.toLowerCase().includes("rapports")) {
      geminiResponse = "Swiver génère des rapports détaillés pour analyser les performances de l'entreprise. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else if (message.toLowerCase().includes("gestion des projets")) {
      geminiResponse = "Swiver propose des outils de gestion des projets pour suivre l'avancement des tâches. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else if (message.toLowerCase().includes("collaboration")) {
      geminiResponse = "Swiver facilite la collaboration entre les membres de l'équipe grâce à des outils de communication intégrés. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else if (message.toLowerCase().includes("marketing")) {
      geminiResponse = "Swiver propose des outils de marketing pour promouvoir les produits et services de l'entreprise. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else if (message.toLowerCase().includes("support client")) {
      geminiResponse = "Swiver assure un support client réactif pour répondre aux besoins des utilisateurs. Pour en savoir plus, visitez notre site web : [Swiver](https://swiver.io/centre-de-support/)";
    } else {
      // Send user message to Gemini API
      const gemini = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = await gemini.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Hello," }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10000,
        },
      });
      const result1 = await chat.sendMessage(message);
      geminiResponse = result1.response.candidates;
    }

    const newChatHistory = new ChatHistory({
      user: user._id,
      title: message,
    });

    await newChatHistory.save(); // Save the new ChatHistory document

    // Create an array to store messages
    const messages = [];

    // Create message object
    const messageObj = {
      sender: user._id,
      message: {
        user: message,
        gemini: geminiResponse,
      },
    };

    // Push the message object into the messages array
    messages.push(messageObj);

    // Create newChat with the messages array
    const newChat = new Chat({
      chatHistory: newChatHistory._id,
      messages: messages,
    });

    // Save the newChat object
    await newChat.save();

    // Push newChatHistory._id into the chatHistory array of the user
    user.chatHistory.push(newChatHistory._id);
    await user.save();

  return res.status(200).json({ message: "OK", chatHistory: newChat, geminiResponse: geminiResponse });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};









export const sendChatsToUser = async (req, res, next) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      const error = new Error("User Not Found");
      error.statusCode = 403;
      throw error;
    }

    // Fetch all chats where user is the sender
    const chatHistory = await Chat.find({
      "messages.sender": user._id
    });

    // Sort chat history by timestamp (assuming timestamp is present in chat history)
    chatHistory.sort((a, b) => b.timestamp - a.timestamp);

    // Extract relevant data from each chat
    const extractedChats = await Promise.all(chatHistory.map(async chat => {
      const senderId = chat.messages[0].sender;
      const userMessage = chat.messages[0].message.user;
      const geminiResponse =  chat.messages[0]?.message?.gemini[0]?.content?.parts[0]?.text || "No response found";

      const modelRole = chat.messages[0].message.gemini[0].content?.role || "No role found";;
      const userRole = 'user';

      // Fetch user details using senderId
      const senderUser = await User.findById(senderId);
      const sender = senderUser ? senderUser.name : "Unknown"; // Use user's name as sender if user exists, otherwise set to "Unknown"

      return { user: { sender, message: userMessage ,  userRole}, model: { text: geminiResponse, modelRole } };
    }));

    return res.status(200).json({ message: "OK", chatHistory: extractedChats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error", cause: error.message });
  }
};





export const deleteChats = async (
  req,
  res,
  next
  ) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if(!user){
      return res.status(401).send("User Not Registered or Token malfunctioned");
    }

    if(user._id.toString() !== res.locals.jwtData.id){
      return res.status(401).send("Permission didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({message: "OK"});
  } catch (error) {
    console.log(error);
    return res.status(200).json({message: "Error", cause: error.message});
  }
};
