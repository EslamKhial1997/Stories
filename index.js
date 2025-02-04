const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const RoutesVideo = require("./Routes/RoutesVideo");
const RoutesAuth = require("./Routes/RoutesAuth");
const dotenv = require("dotenv");

const cors = require("cors");
const path = require("path");
const dbCollection = require("./config/config");
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
dotenv.config({ path: "config.env" });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
dbCollection();
app.use("/api/v1/auth", RoutesAuth);
app.use("/api/v1/video", RoutesVideo);
app.use("/api/v1/video", RoutesVideo);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
  path: "/socket.io/",
  serveClient: false,
  connectTimeout: 45000,
  pingTimeout: 30000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e8,
});

io.use((socket, next) => {
  next();
});

const users = new Map();
io.on("connection", (socket) => {
  // إرسال رسالة ترحيب
  socket.emit("welcome", {
    message: "مرحباً بك!",
    id: socket.id,
  });
  users.set(socket.id, {
    id: socket.id,
    lastActive: new Date(),
  });
  io.emit("users", {
    count: users.size,
    users: Array.from(users.keys()),
  });

  // تتبع كل الأحداث
  socket.onAny((event, ...args) => {
    console.log(`\nEvent "${event}" received from ${socket.id}`);
    console.log("Arguments:", JSON.stringify(args, null, 2));
  });

  socket.on("msg", (data) => {
    try {
      const { to, text } = data.data;

      if (!to || !text) {
        throw new Error("يجب تحديد المستلم ونص الرسالة");
      }

      // Update last active
      const user = users.get(socket.id);
      if (user) {
        user.lastActive = new Date();
      }
      if (users.has(to)) {
        io.to(to).emit("msg", {
          from: socket.id,
          text: text,
          time: new Date(),
        });

        // Confirm to sender
        socket.emit("sent", {
          status: "success",
          to: to,
          text: text,
          time: new Date(),
        });
      } else {
        throw new Error("المستلم غير متصل");
      }
    } catch (error) {
      socket.emit("error", {
        status: "error",
        message: error.message,
      });
    }
  });

  // الحصول على المستخدمين
  socket.on("users", () => {
    const usersList = Array.from(users.keys());

    socket.emit("users", {
      count: usersList.length,
      users: usersList,
    });
  });

  // معالجة قطع الاتصال
  socket.on("disconnect", (reason) => {
    users.delete(socket.id);
    io.emit("users", {
      count: users.size,
      users: Array.from(users.keys()),
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
