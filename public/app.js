document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const username = prompt("Enter your username:");
  const room = prompt("Enter room name:");

  socket.emit("joinRoom", room, username);

  const userList = document.getElementById("user-list");
  const chatBox = document.getElementById("chat-box");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("input", sendTypingIndicator);
  const privateMessageInput = document.getElementById("private-message-input");
  const sendPrivateButton = document.getElementById("send-private-button");

  sendPrivateButton.addEventListener("click", sendPrivateMessage);

  // Socket.io events
  socket.on("userJoined", (user) => {
    appendMessage(`${user} joined the room`);
    displayNotification(`${user} joined the room`);
  });
  socket.on("userLeft", (user) => {
    appendMessage(`${user} left the room`);
    displayNotification(`${user} left the room`);
  });
  socket.on("messageHistory", (history) => displayMessageHistory(history));
  socket.on("typing", (user) => showTypingIndicator(user));

  socket.on("privateMessage", (sender, message) => {
    console.log(`Received private message from ${sender}: ${message}`);
    displayNotification(`Private message from ${sender}: ${message}`);
  });

  socket.on("newMessage", (message) => {
    console.log("Received newMessage:", message);

    appendMessage(formatMessage(message));
    // Check if the message is a private message
    if (message.isPrivate) {
      displayNotification(`Private message from ${message.username}`);
    }
  });

  socket.on("typing", (user) => {
    showTypingIndicator(user);
  });

  function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
      console.log(`Sending message: ${message}`);
      socket.emit("sendMessage", message);
      messageInput.value = "";
      hideTypingIndicator();
    }
  }

  function sendPrivateMessage() {
    const targetUser = prompt("Enter the username of the recipient:");
    const privateMessage = privateMessageInput.value.trim();
    if (privateMessage !== "") {
      console.log(
        `Sending private message to ${targetUser}: ${privateMessage}`
      );
      socket.emit("privateMessage", targetUser, privateMessage);
      privateMessageInput.value = "";
    }
  }

  function sendTypingIndicator() {
    socket.emit("typing");
  }

  function appendMessage(message) {
    console.log(`Appending message: ${message}`);
    const messageElement = document.createElement("div");
    messageElement.className = "message";
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function formatMessage(message) {
    return `${message.username} (${message.timestamp}): ${message.message}`;
  }

  function displayMessageHistory(history) {
    for (const message of history) {
      appendMessage(formatMessage(message));
    }
  }

  function hideTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.textContent = "";
    }
  }

  function showTypingIndicator(user) {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.textContent = `${user} is typing...`;
    }
  }

  function displayNotification(message) {
    const notificationElement = document.createElement("div");
    notificationElement.className = "notification";
    notificationElement.textContent = message;
    chatBox.appendChild(notificationElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Event listeners
  document.getElementById("send-button").addEventListener("click", sendMessage);
  document
    .getElementById("message-input")
    .addEventListener("input", sendTypingIndicator);
  document
    .getElementById("send-private-button")
    .addEventListener("click", sendPrivateMessage);
});
