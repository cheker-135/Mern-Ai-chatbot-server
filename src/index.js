import { connectionToDatabase } from "./db/connection.js";
import { app, httpServer } from "./app.js";

const PORT = 5000;

async function startServer() {
  try {
    await connectionToDatabase();
    httpServer.listen(PORT, () => {
      console.log("Server is running and connected to the database!");
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // Exit with error code
  }
}

startServer();
