const messageHistory = {};

function getRoomMessageHistory(room) {
  if (!messageHistory[room]) {
    messageHistory[room] = [];
  }

  return messageHistory[room].slice(-10);
}

function storeRoomMessage(room, message) {
  if (!messageHistory[room]) {
    messageHistory[room] = [];
  }

  messageHistory[room].push(message);

  if (messageHistory[room].length > 10) {
    messageHistory[room] = messageHistory[room].slice(-10);
  }
}

module.exports = {
  getRoomMessageHistory,
  storeRoomMessage,
};
