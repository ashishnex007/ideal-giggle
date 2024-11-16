// importing modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// importing routes
const userRouters = require('./routes/userRoutes');
const chatRouters = require('./routes/chatRoutes');
const messageRouters = require('./routes/messageRoutes');
const projectRouters = require('./routes/projectRoutes');
const creditRouters = require('./routes/creditRoutes');
const priceRoutes = require('./routes/priceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// API services routes
const pexelsRouter = require('./routes/api_routers/pexelsRouter');
const unsplashRouter = require('./routes/api_routers/unsplashRouter');
const pixabayRouter = require('./routes/api_routers/pixabayRouter');
const freesoundRouter = require('./routes/api_routers/freesoundRouter');
const removebgRouter = require('./routes/api_routers/removebgRouter');

const imagesRouter = require('./routes/api_routers/imagesRouter');
const audioRouter = require('./routes/api_routers/audioRouter');
const videosRouter = require('./routes/api_routers/videosRouter');

const connectDB = require('./config/connectDB');
require('dotenv').config();

const Chat = require("./models/chatModel");

// middleware
app.use(bodyParser.json());
app.use(cors());

// connecting to database
connectDB();

// server home route
app.get('/api', (req, res) => {
    res.send('Server is running');
})

app.use('/api/users', userRouters);
app.use('/api/chat', chatRouters);
app.use('/api/message', messageRouters);
app.use('/api/project', projectRouters);
app.use('/api/credits', creditRouters);
app.use('/api/prices', priceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// services routes
app.use('/api/pexels', pexelsRouter);
app.use('/api/unsplash', unsplashRouter);
app.use('/api/pixabay', pixabayRouter);
app.use('/api/removebg', removebgRouter);
app.use('/api/freesound', freesoundRouter);

// Main Router
app.use('/api/images', imagesRouter);
app.use('/api/videos', videosRouter);
app.use('/api/audios', audioRouter);

const port = process.env.PORT || 3000;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout:60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("Connection established with socket: " + socket);

  socket.on("setup", (userData) => { // room for the particular user
    socket.join(userData._id);
    console.log("User "+userData._id+" connected");
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined chat room: "+room);
  });

  socket.on("new message", async (newMessageReceived) => {
    try {
      let chat = await Chat.findById(newMessageReceived.chat).populate("users");

      if (!chat || !chat.users) {
        console.log("Chat not found or chat.users not defined");
        return;
      }

      chat.users.forEach((user) => {
        if (user._id.toString() === newMessageReceived.sender._id.toString()) return;
        socket.in(user._id.toString()).emit("message received", newMessageReceived);
      });
    } catch (error) {
      console.error("Error in new message event:", error);
    }
  });
});