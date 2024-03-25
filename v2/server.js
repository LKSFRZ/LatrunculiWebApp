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

app.get("/mygames/", (req, res) => {
    res.render("ActiveGamesOverview", {}); // id is used in handshake
  }
);

app.get("/setname/", (req, res) => {
  res.render("PlayerSettings", {}); // id is used in handshake
}
);


app.post("/creategame/",  (req, res) => {
    var unique = Math.floor(Math.random() * 100000000);
    while (games[unique] != undefined) {
      unique = Math.floor(Math.random() * 100000000);
    }
    width = parseInt(req.body["width_field"]);
    height = parseInt(req.body["height_field"]);
    console.log("Game size ", width, "x", height);
    games[unique] = {
      board: new Board(width, height, true),
      players: [-1, -1],
      names: ["waiting for player", "waiting for player"],
      open: true,
      rules: req.body["rules"],
      wincon : req.body["WinCon_field"],
      gamename: "<b>" + req.body["name_field"] + "</b>" + ' (' + req.body["rules"] + ' ' + width + "x" + height + ' Win by: ' + req.body["WinCon_field"] + "|" + (width*height - req.body["WinCon_field"] + 1) + ")",
      setter: -1,
      settername: ""
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
    socket.emit("MetaData", {width : game.board.width, height: game.board.height})

    if (game.open && !(game.players[0] == data.playerID || game.players[1] == data.playerID)) {
      // Replace this with bidding
      if(false){
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
      if(true){
      if(game.setter == -1)// current socket is setter
      {
        game.setter = data.playerID;
        game.settername = data.name;
        game.names[0] = data.name;
      }
      else
      {
        if(data.playerID != game.setter)
        {
          socket.emit("ChooseYourColor", {whitewincon: game.wincon, blackwincon: (game.board.width * game.board.height) - game.wincon + 1});
        }
      }}
    }
    // End Replace
    var socketcolor = 0;
    if (game.players[0] == data.playerID) {
      socketcolor = 1;
      game.names[0] = data.name;
    }
    else if (game.players[1] == data.playerID) {
      socketcolor = 2;
      game.names[1] = data.name;
    }
    else
    {
      socketcolor = 1;
      game.names[0] = data.name;
    }

    socket.emit("setPlayer", {yourcolor: socketcolor});
    socket.emit("boardUpdate", {
      board: game.board,
      names: game.names,
      hist: game.board.history
    });
    console.log("Player are ", game.players);
    console.log("active player",game.board.activePlayer - 1)
    
  });

  socket.on("move", function (data) {
    var game = games[data.gameID];
    // console.log(data);
    // console.log(game);
    console.log(data.playerID, " = ",game.players[game.board.activePlayer - 1]);
    if (game.players[game.board.activePlayer - 1] == data.playerID  && game.board.isLegal(data.move.from, data.move.to)) {
      game.board.makeMove(data.move.from, data.move.to);
      console.log("making move:", data.move)
      socket.to(data.gameID).emit("boardUpdate", {
        board: game.board,
        names: game.names,
        hist: game.board.history
      });
      socket.emit("boardUpdate", {
        board: game.board,
        names: game.names,
        hist: game.board.history
      });
    }
    console.log(game.players);
    console.log(game.board.activePlayer - 1)
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

  socket.on("whichPlayer", (data) => {
    if(games[data.gameID].players[0] == data.playerID)
    {
      socket.emit("setPlayer", {yourcolor: 1});
    }
    else if(games[data.gameID].players[1] == data.playerID)
    {
      socket.emit("setPlayer", {yourcolor: 2});
    }
    else
    {
      socket.emit("setPlayer", {yourcolor: 0});
    }
  })

  socket.on("setPlayers", (data) => {
    let game = games[data.gameID];
    game.players[data.choice] = data.playerID;
    game.players[1 - data.choice] = game.setter;
    game.names[data.choice] = data.name;
    game.names[1 - data.choice] = game.settername;
    game.open = false;
    socket.emit("getYourColor", {});
    socket.to(data.gameID).emit("getYourColor", {});
    socket.emit("boardUpdate", {
      board: game.board,
      names: game.names,
      hist: game.board.history
    });
    socket.to(data.gameID).emit("boardUpdate", {
      board: game.board,
      names: game.names,
      hist: game.board.history
    });
  })

  socket.on("getmygames", (data) => {
    var gamelist = [];
    for(const  key in games)
    {
        console.log("Request from ", data.playerID)
        console.log("Game ", key, "Players" , games[key].players[0] , games[key].players[1], games[key].setter)
        if(games[key].players[0] == data.playerID || games[key].players[1] == data.playerID || games[key].setter == data.playerID )
        {
            gamelist.push({link: "/game/" + key, name: games[key].gamename});
        }
    }
    socket.emit("mygamelistupdate", {gamelist : gamelist})
  })

});

