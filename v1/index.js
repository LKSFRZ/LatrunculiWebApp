var express = require("express");
var socket = require("socket.io");
var Board = require("./Board.js");

// App setup
var app = express();

var server = app.listen(4000, function () {
  console.log("listening for requests on port 4000,");
});
var games = {};
var ids = [];
// Static files
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("mainpage", { ids: ids });
});

app.get("/game/:id", (req, res) => {
  if (games[req.params.id] == undefined) {
    games[req.params.id] = new Board(8, 8, true);
    ids.push(req.params.id);
    console.log("created game ", req.params.id);
  }
  res.render("gamepage", { id: req.params.id });
});

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
      data.roomid,
      data.playerid,
      data.from.i,
      data.from.j,
      "=>",
      data.to.i,
      data.to.j
    );
    console.log(games[data.roomid].playerIds);
    if (
      data.playerid ==
      games[data.roomid].playerIds[games[data.roomid].activePlayer - 1]
    ) {
      games[data.roomid].makeMove(data.from, data.to);
      io.to(data.roomid).emit("boardUpdate", {
        state: games[data.roomid].state,
        active: games[data.roomid].activePlayer,
        history: games[data.roomid].history,
      });
    }
  });

  socket.on("message", function (data) {
    console.log(socket.id, data.m, data.data);
  });

  socket.on("handshake", function (data) {
    console.log(socket.id, data.roomid, games["" + data.roomid]);
    socket.join(data.roomid);
    socket.emit("boardUpdate", {
      state: games["" + data.roomid].state,
      active: games["" + data.roomid].activePlayer,
    });
    if (data.sessionID == "") {
      var rand = Math.floor(Math.random() * 1000000000);
      socket.emit("signin", { sessionID: rand });
      data.sessionID = rand;
    }
    var mod = Math.floor(Math.random() * 2);
    if (games["" + data.roomid].playerIds[mod] == -1) {
      games["" + data.roomid].playerIds[mod] = data.sessionID;
    } else if (games["" + data.roomid].playerIds[1 - mod] == -1) {
      games["" + data.roomid].playerIds[1 - mod] = data.sessionID;
    }
  });

  socket.on("create", function (data) {
    console.log("Requested to make a new game with id ");
    let unique = Math.floor(Math.random() * 100000000);
    while (games[unique] != undefined) {
      unique = Math.floor(Math.random() * 100000000);
    }
    games["" + unique] = new Board(8, 8, true);
    games[unique].setPlayer(data.id , Math.floor(Math.random() * 2));
    ids.push(unique);
    socket.emit("goto", { url: "/game/" + unique });
    socket.join(unique);
  });
});
