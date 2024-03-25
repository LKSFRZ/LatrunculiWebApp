"use_strict";

let board = new Board(8,8, true);
let amplayer = -1;



function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function pickcolor(color){
  socket.emit("setPlayers", {gameID : gameID, playerID: getCookie("playerID"), name: getCookie("playerName"), choice: color});
  document.getElementById("colorpicker").innerHTML = "";
}

socket.on("MetaData", (data) => {
  board = new Board(data.width, data.height, true);
});

socket.emit("handshake", { gameID: gameID, playerID: getCookie("playerID"), name: getCookie("playerName")});

socket.on("signin", (data) => {
  document.cookie = "playerID=" + data.playerID + ";path=/";
});

socket.on("getYourColor", (data) => {
  console.log("Prompted to ask for my color")
  socket.emit("whichPlayer", {gameID: gameID, playerID: getCookie("playerID")})
})

socket.on("ChooseYourColor", (data) => {
  document.getElementById("colorpicker").innerHTML = "Pick your Color\n<input type=\"button\" value=\"White(" + data.whitewincon + ")\" onclick=\"pickcolor(0);\" /><input type=\"button\" value=\"Black(" + data.blackwincon + ")\" onclick=\"pickcolor(1);\" />";
})

socket.on("setPlayer", (data) => {
  amplayer = data.yourcolor;
  updateScoreBoard();
  console.log(amplayer)
});

// socket.on("boardUpdate", (data) => {
//   board.makeMove(data.move.from, date.move.to)
//   console.log(board);
// });

