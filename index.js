const express = require("express");
const RoutesAuth = require("./Routes/RoutesAuth");
const RoutesUser = require("./Routes/RoutesUser");
const RoutesChat = require("./Routes/RoutesChat");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dbCollection = require("./Config/config");
const path = require("path");
const logger = require('./Config/logger');

const app = express();
const Theserver = http.createServer(app);
const io = new Server(Theserver, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});
dotenv.config({ path: "config.env" });
const uploadsPath = path.join(__dirname, "uploads");
app.use(express.static(uploadsPath));
app.use(express.json({ limit: "20kb" }));
dbCollection();

// allow connections from all local hosts and their ports
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    credentials: false, 
  })
);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

app.use("/api/v1/auth", RoutesAuth);
app.use("/api/v1/user", RoutesUser);
io.on("connection", (socket) => {
  io.socketsJoin("room1");
  socket.on("user-name", (username) => {
    logger.info(`User connected: ${username}`);
  });

  socket.on("sendMessage", async (data) => {
    const { token, message, receiverId } = data;

    if (token) {
      jwt.verify(token, "secret_key", async (err, decoded) => {
        if (err) {
          logger.error('Invalid token error', { error: err });
          socket.emit("error", "Invalid token");
        } else {
          try {
            const newMessage = new Message({
              senderId: decoded.userId,
              receiverId,
              message,
            });
            await newMessage.save();
            logger.debug('New message saved', { messageId: newMessage._id });

            io.emit("receiveMessage", {
              message,
              senderId: decoded.userId,
              receiverId,
              username: decoded.username,
            });
          } catch (error) {
            logger.error('Error saving message', { error });
            socket.emit("error", "Failed to save message");
          }
        }
      });
    } else {
      logger.warn('Message attempt without token');
      socket.emit("error", "No token provided");
    }
  });

  socket.on("disconnect", () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

Theserver.listen(3000, () => {
  logger.info("Server is running on port 3000");
});
