const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let connectedUsers = [];

const addUsers = (userId, socketId) => {
  !connectedUsers.some((user) => user.userId === userId) &&
    connectedUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  connectedUsers = connectedUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  let index = connectedUsers.findIndex((user) => user.userId === userId);
  return connectedUsers[index];
};

io.on("connection", (socket) => {
  // and new user
  socket.on("addUser", (userId) => {
    addUsers(userId, socket.id);
    // send all users online
    io.emit("getUsers", connectedUsers);
  });

  // send message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    let user = getUser(receiverId);
    // get message
    io.to(user.socketId).emit("getMessage", {
      senderId: senderId,
      text: text,
    });
  });

  // on user disconnect
  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", connectedUsers);
  });
});
