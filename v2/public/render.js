

// const board = new Board(8, 8, true);

const columnnames = "ABCDEFGH";

const cvs = document.getElementById("playingarea");
const c = cvs.getContext("2d");

cvs.width = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.95);
cvs.height = cvs.width;

let scale = cvs.width / 8;

let selected = { i: undefined, j: undefined };

let legalmoves = [];


const showterritory = document.querySelector("#showterritory");

let mouse = {
  x: undefined,
  y: undefined,
  dragging: false,
};

cvs.addEventListener("mousemove", function (e) {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
});

window.addEventListener("resize", function () {
  cvs.width = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.95);
  cvs.height = cvs.width;
  scale = cvs.width / Math.max(board.width, board.height);
});

function drawStone(x, y, stone) {
  if (stone == 1) {
    c.strokeStyle = "rgb(0, 0, 0)";
    c.fillStyle = "rgba(220, 220, 220, 1)";
  }
  if (stone == 2) {
    c.strokeStyle = "rgb(255, 255, 255)";
    c.fillStyle = "rgba(35, 35, 35, 1)";
  }
  if (stone == 1 || stone == 2) {
    c.beginPath();
    c.arc(x, y, 0.4 * scale, 0, 2 * Math.PI, false);
    c.fill();
    c.stroke();
    c.closePath();
  }
}

function moveNotation(move) {
  let str = "";
  if (move.from.i == move.to.i) {
    str += columnnames[move.from.i] + (move.from.j + 1) + "" + (move.to.j + 1);
  } else if (move.from.j == move.to.j) {
    str +=
      columnnames[move.from.i] +
      (move.from.j + 1) +
      "" +
      columnnames[move.to.i];
  } else if (move.from == -1){
    str = columnnames[move.to.i] + (move.to.j + 1);
  }
  else
  {
    str = "???";
  }
  return str;
}

function drawMarker(i, j) {
  c.strokeStyle = "rgb(255, 255, 255)";
  c.fillStyle = "rgba(55, 55, 55, 0.5)";
  c.beginPath();
  c.arc(
    scale * (i + 0.5),
    scale * (j + 0.5),
    0.1 * scale,
    0,
    2 * Math.PI,
    false
  );
  c.fill();
  c.closePath();
}

function markSquare(square, color) {
  c.fillStyle = color;
  c.strokeStyle = "rgb(0, 0, 0, 0)";
  c.beginPath();
  c.moveTo(square.i * scale, square.j * scale);
  c.lineTo((square.i + 1) * scale, square.j * scale);
  c.lineTo((square.i + 1) * scale, (square.j + 1) * scale);
  c.lineTo(square.i * scale, (square.j + 1) * scale);
  c.lineTo(square.i * scale, square.j * scale);
  c.fill();
  c.closePath();
}

function printHistory() {
  let n = 1;
  let histstring = "";
  board.history.forEach((element) => {
    if (n % 2) {
      histstring += (n + 1) / 2 + ": " + moveNotation(element);
    } else {
      histstring += ", " + moveNotation(element) + "\n";
    }
    n++;
  });
  if (board.winner == 1) {
    histstring += "White wins!";
  } else if (board.winner == 2) {
    histstring += "Black wins!";
  } else if (board.winner == 3) {
    histstring += "Draw!";
  }
  document.getElementById("history").innerText = histstring;
  document.getElementById("history").scrollTop =
  document.getElementById("history").scrollHeight;
}

function updateScoreBoard() {
  printHistory();
  document.getElementById("opponentscore").innerText =
    board.nstones[0] +
    " + " +
    (board.score[0] - board.nstones[0]) +
    " = " +
    board.score[0];
  document.getElementById("ownscore").innerText =
    board.nstones[1] +
    " + " +
    (board.score[1] - board.nstones[1]) +
    " = " +
    board.score[1];
}

function draw() {
  scale = Math.min(cvs.width / board.width, cvs.height/board.height);
  c.strokeStyle = "rgb(0, 0, 0)";
  c.beginPath();
  for (let i = 0; i <= board.width; i++) {
  for (let j = 0; j <= board.height; j++) {
    if((i + j) % 2){
      markSquare({i :i, j : j}, "#804C36");}
    else
    {
      markSquare({i :i, j : j}, "#C19A6C");
    }
  }}
  
  c.stroke();
  c.closePath();
  if (selected.i != undefined) {
    markSquare(selected, "rgba(128, 64, 64, 1)");
  }

  if (board.history.length > 0) {
    markSquare(
      board.history[board.history.length - 1].from,
      "rgba(64, 128, 64, 1)"
    );
    markSquare(
      board.history[board.history.length - 1].to,
      "rgba(64, 64, 128, 1)"
    );
  }
  let stone = 0;
  for (let i = 0; i < board.width; i++) {
    for (let j = 0; j < board.height; j++) {
      if (showterritory.checked) {
        if (board.territory[i][j] == 1) {
          markSquare({ i: i, j: j }, "rgba(200,200,200, 0.7)");
        }
        if (board.territory[i][j] == 2) {
          markSquare({ i: i, j: j }, "rgba(55, 55, 55, 0.7)");
        }
      }
      if (selected.i != i || selected.j != j || !mouse.dragging) {
        stone = board.atPos({ i: i, j: j });
        drawStone(scale * (i + 0.5), scale * (j + 0.5), stone);
      }
    }
  }
  if (board.activePlayer == amplayer)
  legalmoves.forEach((element) => {
    drawMarker(element.to.i, element.to.j);
  });
  if (selected.i != undefined && mouse.dragging) {
    drawStone(mouse.x, mouse.y, board.atPos(selected));
  }
}

cvs.addEventListener("mousedown", (e) => {
  let clicked = {
    i: Math.floor(e.offsetX / scale),
    j: Math.floor(e.offsetY / scale),
  };
  console.log("Clicked ", clicked.i, clicked.j);
  if (selected.i == undefined) {
    if (board.atPos(clicked) == board.activePlayer) {
      selected = clicked;
      mouse.dragging = true;
      legalmoves = board.getLegalMoves(selected);
    }
    if (board.atPos(clicked) == 0)
    {
      socket.emit("move", {
        gameID: gameID,
        playerID: getCookie("playerID"),
        move: { from: -1, to: clicked },
      });
      // TODO: wait for server response
      // board.makeMove(-1, clicked);
      updateScoreBoard();
    }
  } else {
    if (board.isLegal(selected, clicked)) {
      socket.emit("move", {
        gameID: gameID,
        playerID: getCookie("playerID"),
        move: { from: selected, to: clicked },
      });
      // board.makeMove(selected, clicked);
      updateScoreBoard();
    }
    selected = { i: undefined, j: undefined };
    legalmoves = board.getLegalMoves(-1);
  }
});

cvs.addEventListener("mouseup", (e) => {
  let clicked = {
    i: Math.floor(e.offsetX / scale),
    j: Math.floor(e.offsetY / scale),
  };
  mouse.dragging = false;
  if (selected.i != clicked.i || selected.j != clicked.j) {
    if (board.isLegal(selected, clicked)) {
      socket.emit("move", {
        gameID: gameID,
        playerID: getCookie("playerID"),
        move: { from: selected, to: clicked },
      });
      // board.makeMove(selected, clicked);
      updateScoreBoard();
    }
    selected = { i: undefined, j: undefined };
    legalmoves = board.getLegalMoves(-1);
  }
});

socket.on("boardUpdate", (data) => {
  board.fromHistory(data.hist)
  updateScoreBoard()
  legalmoves = board.getLegalMoves(-1);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  draw();
});

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  draw();
}

animate();
