const express = require("express");
const RoutesAuth = require("./Routes/RoutesAuth");
const RoutesUser = require("./Routes/RoutesUser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dbCollection = require("./Config/config");
const path = require("path");

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
app.use(cors());
app.use("/api/v1/auth", RoutesAuth);
app.use("/api/v1/user", RoutesUser);
io.on("connection", (socket) => {
  io.socketsJoin("room1");
  socket.on("user-name", (username) => {
    console.log(`${username} has logged in`); // طباعة رسالة عند تسجيل الدخول
  });
  socket.on("sendMessage", async (data) => {
    const { token, message, receiverId } = data;

    if (token) {
      jwt.verify(token, "secret_key", async (err, decoded) => {
        if (err) {
          socket.emit("error", "Invalid token");
        } else {
          const newMessage = new Message({
            senderId: decoded.userId,
            receiverId,
            message,
          });
          await newMessage.save();
          console.log(newMessage);

          io.emit("receiveMessage", {
            message,
            senderId: decoded.userId,
            receiverId,
            username: decoded.username,
          });
        }
      });
    } else {
      socket.emit("error", "No token provided");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
Theserver.listen(3000, () => {
  console.log("Server is running on port 3000");
});
