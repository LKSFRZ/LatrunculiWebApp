var express = require("express");
var socket = require("socket.io");
var Board = require("./Board.js");
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var app = express();
const { body,validationResult } = require('express-validator');


PORT = 4000;

var server = app.listen(PORT, function () {
  console.log("listening for requests on port ", PORT);
});

var io = socket(server);

const games = {};

// game =  {board: board
//, players: []
//, open: false, ongoing: true}

app.use(express.static("public"));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array()); 

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("mainpage", {});
});

app.get("/game/:id", (req, res) => {
  if (games[req.params.id] != undefined) {
    res.render("ingame", { id: req.params.id }); // id is used in handshake
  }
});



app.post("/creategame/",  (req, res) => {
    var unique = Math.floor(Math.random() * 100000000);
    while (games[unique] != undefined) {
      unique = Math.floor(Math.random() * 100000000);
    }
    games[unique] = {
      board: new Board(8, 8, true),
      players: [-1, -1],
      names: ["waiting for player", "waiting for player"],
      open: true,
      gamename: req.body["name_field"]
    };
    // res.render("gamepage", { id: unique });
    let opengames = [];
    for(const  key in games)
    {
        if(games[key].open)
        {
            opengames.push({link: "/game/" + key, name: games[key].gamename});
        }
    }
    console.log(opengames);
    io.emit("gamelistupdate", {gamelist: opengames});
    console.log(req.body);
    res.redirect("/game/"+unique);
  });


io.on("connection", (socket) => {
  console.log("made socket connection", socket.id);

  // handshake gets triggered from the game page
  socket.on("handshake", function (data) {
    // put socket into room
    socket.join(data.gameID);

    if (data.playerID == "") {
      data.playerID = Math.floor(Math.random() * 1000000000);
      socket.emit("signin", { playerID: data.playerID });
    }

    var game = games[data.gameID];

    if (game.open && !(game.players[0] == data.playerID || game.players[1] == data.playerID)) {
      var mod = Math.floor(Math.random() * 2);
      if (game.players[mod] == -1) {
        game.players[mod] = data.playerID;
        game.names[mod] = data.name;
      } else if (game.players[1 - mod] == -1) {
        game.players[1 - mod] = data.playerID;
        game.names[1 - mod] = data.name;
      }

      if (game.players[0] != -1 && game.players[1] != -1) {
        game.open = false;
      }
    }

    var socketcolor = 0;
    if (game.players[0] == data.playerID) {
      socketcolor = 1;
    }
    if (game.players[1] == data.playerID) {
      socketcolor = 2;
    }

    socket.emit("setPlayer", {yourcolor: socketcolor});
    socket.emit("boardUpdate", {
      board: game.board,
      names: game.names
    });
    console.log(game);
  });

  socket.on("move", function (data) {
    var game = games[data.gameID];
    console.log(data);
    console.log(game);
    console.log(game.players[game.board.activePlayer - 1]);
    if (game.players[game.board.activePlayer - 1] == data.playerID) {
      game.board.makeMove(data.move.from, data.move.to);
      socket.emit("boardUpdate", {
        board: game.board,
        names: game.names
      });
    }
  });

  socket.on("getupdate", (data) => {
    let opengames = [];
    for(const  key in games)
    {
        if(games[key].open)
        {
            opengames.push({link: "/game/" + key, name: games[key].gamename});
        }
    }
    console.log(opengames);
    socket.emit("gamelistupdate", {gamelist: opengames});
  })

});

