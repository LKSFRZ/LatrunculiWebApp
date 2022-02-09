var express = require("express");
var socket = require("socket.io");
var Board = require("./Board.js");

// App setup
var app = express();

var server = app.listen(4000, function () {
  console.log("listening for requests on port 4000,");
});

// Static files
app.use(express.static("public"));

var board = new Board(8, 8, true);

// Socket setup & pass server
var io = socket(server);
io.on("connection", (socket) => {
  console.log("made socket connection", socket.id);

  socket.emit("boardUpdate", {
    state: board.state,
    active: board.activePlayer,
  });

  // Handle chat event
  socket.on("move", function (data) {
    console.log(
      socket.id,
      data.from.i,
      data.from.j,
      "=>",
      data.to.i,
      data.to.j
    );
    board.makeMove(data.from, data.to);
    io.sockets.emit("boardUpdate", {
      state: board.state,
      active: board.activePlayer,
    });
  });

  socket.on("message", function (data) {
    console.log(socket.id, data.m, data.data);
  });
});
