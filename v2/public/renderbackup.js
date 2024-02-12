const cvs = document.getElementById("playingarea");
const c = cvs.getContext("2d");

cvs.width = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
cvs.height = cvs.width;

let scale = cvs.width / Math.max(board.width, board.height);

let selected = { i: undefined, j: undefined };

window.addEventListener("resize", function () {
  cvs.width = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
  cvs.height = cvs.width;
});

function draw() {
  c.beginPath();
  for (let i = 0; i <= board.width; i++) {
    c.moveTo(i * scale, 0);
    c.lineTo(i * scale, board.height * scale);
  }
  for (let j = 0; j <= board.height; j++) {
    c.moveTo(0, j * scale);
    c.lineTo(board.width * scale, j * scale);
  }
  c.stroke();
  c.closePath();
  let stone = 0;
  for (let i = 0; i < board.width; i++) {
    for (let j = 0; j < board.height; j++) {
      if (selected.i != i || selected.j != j) {
        stone = board.atPos({ i: i, j: j });
        if (stone == 1) {
          c.strokeStyle = "rgb(0, 0, 0)";
          c.fillStyle = "rgba(200, 200, 200, 1)";
          c.beginPath();
          c.arc(
            scale * (i + 0.5),
            scale * (j + 0.5),
            0.4 * scale,
            0,
            2 * Math.PI,
            false
          );
          c.fill();
          c.stroke();
          c.closePath();
        }
        if (stone == 2) {
          c.strokeStyle = "rgb(255, 255, 255)";
          c.fillStyle = "rgba(55, 55, 55, 1)";
          c.beginPath();
          c.arc(
            scale * (i + 0.5),
            scale * (j + 0.5),
            0.4 * scale,
            0,
            2 * Math.PI,
            false
          );
          c.fill();
          c.stroke();
          c.closePath();
        }
      }
    }
  }
}

cvs.addEventListener("mousedown", (e) => {
  let clicked = { i: Math.floor(e.offsetX/scale), j: Math.floor(e.offsetY/scale) };

  console.log(clicked);
  if (selected.i == undefined) {
    if (board.atPos(clicked) == board.activePlayer) {
      selected = clicked;
    }
  } else {
    if (board.isLegal(selected, clicked)) {
      socket.emit("move", {
        gameID: gameID,
        playerID: getCookie("playerID"),
        move: { from: selected, to: clicked },
      });
    }
    selected = { i: undefined, j: undefined };
  }
});

cvs.addEventListener("mouseup", (e) => {
  let clicked = {  i: Math.floor(e.offsetX/scale), j: Math.floor(e.offsetY/scale) };

  if (selected.i != undefined) {
    if (!(clicked.i == selected.i && clicked.j == selected.j)) {
      if (board.isLegal(selected, clicked)) {
        socket.emit("move", {
          gameID: gameID,
          playerID: getCookie("playerID"),
          move: { from: selected, to: clicked },
        });
        selected = { i: undefined, j: undefined };
      }
    }
  }
});

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  draw();
}

animate();
