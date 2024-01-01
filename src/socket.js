const { getRoomMessageHistory, storeRoomMessage } = require("./messageHistory");

module.exports = (io) => {
  const activeUsers = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room event
    socket.on("joinRoom", (room, username) => {
      console.log(`User ${username} joined room ${room}`);
      socket.join(room);

      activeUsers[socket.id] = { username, room };

      io.to(room).emit("userJoined", username);

      // Send message history to the user who joined
      const messageHistory = getRoomMessageHistory(room);
      socket.emit("messageHistory", messageHistory);
    });

    // private messages
    socket.on("privateMessage", (targetUsername, message) => {
      const sender = activeUsers[socket.id];

      const targetSocketId = Object.keys(activeUsers).find(
        (socketId) => activeUsers[socketId].username === targetUsername
      );

      if (targetSocketId) {
        io.to(targetSocketId).emit("privateMessage", sender.username, message);
        console.log(`Private message sent to ${targetUsername}: ${message}`);
      } else {
        console.log(`User ${targetUsername} not found.`);
      }
    });

    // typing indicator
    socket.on("typing", () => {
      const sender = activeUsers[socket.id];
      socket.to(sender.room).emit("typing", sender.username);
    });

    //  messages
    socket.on("sendMessage", (message) => {
      const sender = activeUsers[socket.id];
      const timestamp = new Date().toLocaleTimeString();
      const formattedMessage = {
        username: sender.username,
        message,
        timestamp,
        isPrivate: false,
      };
      console.log("Received sendMessage:", formattedMessage);
      io.to(sender.room).emit("newMessage", formattedMessage);

      // Store message in history
      storeRoomMessage(sender.room, formattedMessage);
    });

    //  disconnect
    socket.on("disconnect", () => {
      const sender = activeUsers[socket.id];
      if (sender) {
        io.to(sender.room).emit("userLeft", sender.username);
        delete activeUsers[socket.id];
      }
    });
  });
};
