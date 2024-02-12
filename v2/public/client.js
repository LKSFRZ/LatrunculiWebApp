"use_strict";

let board = new Board(8, 8, true);

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

socket.emit("handshake", { gameID: gameID, playerID: getCookie("playerID") });

socket.on("signin", (data) => {
  document.cookie = "playerID=" + data.playerID;
});

socket.on("boardUpdate", (data) => {
  board.state = data.board.state;
  board.territory = data.board.territory;
  console.log(board);
});

