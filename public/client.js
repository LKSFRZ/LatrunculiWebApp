"use_strict";

// var socket = io.connect('http://localhost:4000');

boardwidth = 8;
boardheight = 8;

const cvs = document.getElementById("playingarea");
const c = cvs.getContext("2d");

const activePlayerDisplay = document.getElementById("activePlayerDisplay");

const PlayerLabel = ["None", "White", "Black"];

const directions = [
  { i: 1, j: 0 },
  { i: 0, j: 1 },
  { i: -1, j: 0 },
  { i: 0, j: -1 },
];

var legalmoves = [];

cvs.width = Math.min(window.innerWidth, window.innerHeight) * 0.8;
cvs.height = Math.min(window.innerWidth, window.innerHeight) * 0.8;

scale = cvs.width / Math.max(boardwidth, boardheight);

window.addEventListener("resize", function () {
  cvs.width = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  cvs.height = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  scale = cvs.width / Math.max(boardwidth, boardheight);
});

let mouse = {
  x: undefined,
  y: undefined,
  dragging: false,
};

cvs.addEventListener("mousemove", function (e) {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
});

class Board {
  constructor() {
    this.state = new Array(boardwidth);
    for (let i = 0; i < boardwidth; i++) {
      this.state[i] = new Array(boardheight);
      for (let j = 0; j < boardheight; j++) {
        this.state[i][j] = 0;
      }
    }
    for (let i = 0; i < boardwidth; i++) {
      this.state[i][0] = 1;
      this.state[i][1] = 1;
      this.state[i][boardheight - 1] = 2;
      this.state[i][boardheight - 2] = 2;
    }

    this.selected = { i: undefined, j: undefined };
    this.activePlayer == 1;
  }

  onBoard(pos) {
    return (
      pos.i >= 0 && pos.i < boardwidth && pos.j >= 0 && pos.j < boardheight
    );
  }

  atPos(pos) {
    if (this.onBoard(pos)) {
      return this.state[pos.i][pos.j];
    }
    return -1;
  }

  getLegalMoves(from) {
    var legal = [];
    // console.log("requested legal moves from ", from);
    directions.forEach((direction) => {
      // console.log("direction: ", direction);
      var dist = 1;
      var pos = {
        i: from.i + dist * direction.i,
        j: from.j + dist * direction.j,
      };
      // console.log("checking ", pos, this.onBoard(pos), this.atPos(pos));
      while (this.atPos(pos) == 0) {
        // console.log("checking ", pos);
        legal.push(pos);
        dist++;
        pos = {
          i: from.i + dist * direction.i,
          j: from.j + dist * direction.j,
        };
      }
    });
    // console.log("found legal moves", legal);
    return legal;
  }

  drawStone = (x, y, color) => {
    c.strokeStyle = "rgb(255, 255, 255)";
    if (color == 1) {
      c.fillStyle = "rgba(200, 200, 200, 1)";
    } else {
      c.fillStyle = "rgba(55, 55, 55, 1)";
    }
    c.beginPath();
    c.arc(x, y, 0.4 * scale, 0, 2 * Math.PI, false);
    c.fill();
    c.stroke();
    c.closePath();
  };

  drawIndicator = (x, y) => {
    c.fillStyle = "rgba(50,50,50,.8)";
    c.beginPath();
    c.arc(x, y, 0.1 * scale, 0, 2 * Math.PI, false);
    c.fill();
    c.closePath();
  };

  draw = () => {
    if (this.selected.i != undefined) {
      c.fillStyle = "rgba(50,50,50, .8)";

      c.fillRect(
        this.selected.i * scale,
        this.selected.j * scale,
        scale,
        scale
      );
      legalmoves.forEach((element) => {
        this.drawIndicator(
          element.i * scale + scale / 2,
          element.j * scale + scale / 2
        );
        // console.log(element);
      });
    }

    for (let i = 0; i < boardwidth; i++) {
      for (let j = 0; j < boardheight; j++) {
        if (
          this.state[i][j] != 0 &&
          !(mouse.dragging && this.selected.i == i && this.selected.j == j)
        ) {
          this.drawStone(
            i * scale + scale / 2,
            j * scale + scale / 2,
            this.state[i][j]
          );
        }
      }
    }

    c.beginPath();

    for (let i = 0; i <= boardwidth; i++) {
      c.moveTo(i * scale, 0);
      c.lineTo(i * scale, boardheight * scale);
    }
    for (let j = 0; j <= boardheight; j++) {
      c.moveTo(0, j * scale);
      c.lineTo(boardwidth * scale, j * scale);
    }

    c.stroke();
    c.closePath();

    if (this.selected.i != undefined && mouse.dragging) {
      this.drawStone(
        mouse.x,
        mouse.y,
        this.state[this.selected.i][this.selected.j]
      );
    }

    this.update();
  };

  update = () => {};
}

// let lineArray = [];

// for (let index = 0; index < 7; index++) {
//   lineArray.push(
//     new Line((index + 1) * scale, 0, (index + 1) * scale, 8 * scale)
//   );
//   lineArray.push(
//     new Line(0, (index + 1) * scale, 8 * scale, (index + 1) * scale)
//   );
// }

const board = new Board();

cvs.addEventListener("mousedown", (e) => {
  mouse.dragging = true;
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;

  let clicked = {
    i: Math.floor(mouse.x / scale),
    j: Math.floor(mouse.y / scale),
  };

  var clickedlegal = false;
  legalmoves.forEach(move => {
    if(clicked.i == move.i && clicked.j == move.j)
    {
      clickedlegal = true;
    }
  });

  if (board.selected.i != undefined && clickedlegal) {
    socket.emit("move", {
      from: board.selected,
      to: clicked,
    });
    board.selected.i = undefined;
    board.selected.j = undefined;
    legalmoves = [];
  }
  if (board.state[clicked.i][clicked.j] == board.activePlayer) {
    board.selected.i = clicked.i;
    board.selected.j = clicked.j;
    legalmoves = board.getLegalMoves(board.selected);
  }
});

cvs.addEventListener("mouseup", (e) => {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
  mouse.dragging = false;
  let clicked = {
    i: Math.floor(mouse.x / scale),
    j: Math.floor(mouse.y / scale),
  };
  var clickedlegal = false;
  legalmoves.forEach(move => {
    if(clicked.i == move.i && clicked.j == move.j)
    {
      clickedlegal = true;
    }
  });
  if (
    !(clicked.i == board.selected.i && clicked.j == board.selected.j) &&
    board.selected.i != undefined &&
    clickedlegal
  ) {
    // board.state[Math.floor(mouse.x / scale)][Math.floor(mouse.y / scale)] =
    //   board.state[board.selected.i][board.selected.j];
    // board.state[board.selected.i][board.selected.j] = 0;
    socket.emit("move", {
      from: board.selected,
      to: clicked,
    });
  }
  if (!(clicked.i == board.selected.i && clicked.j == board.selected.j)) {
    board.selected.i = undefined;
    board.selected.j = undefined;
    legalmoves = [];
  }
});

socket.on("boardUpdate", (data) => {
  board.state = data.state;
  activePlayerDisplay.innerText = PlayerLabel[data.active] + " to move";
  board.activePlayer = data.active;
  // socket.emit("message", {m: "data recerived", data: data})
});

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);

  /* this is where we call our animation methods, such as  
    Shape.draw() */

  //   lineArray.forEach((line) => {
  //     line.draw();
  //   });
  board.draw();
}

animate();
