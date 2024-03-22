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

socket.on("MetaData", (data) => {
  board = new Board(data.width, data.height, true);
});

socket.emit("handshake", { gameID: gameID, playerID: getCookie("playerID") });

socket.on("signin", (data) => {
  document.cookie = "playerID=" + data.playerID;
});


socket.on("setPlayer", (data) => {
  amplayer = data.yourcolor;
  console.log(amplayer)
});

// socket.on("boardUpdate", (data) => {
//   board.makeMove(data.move.from, date.move.to)
//   console.log(board);
// });

