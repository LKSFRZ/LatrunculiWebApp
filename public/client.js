"use_strict";

// var socket = io.connect('http://localhost:4000');

boardwidth = 8;
boardheight = 8;

const cvs = document.getElementById("playingarea");
const c = cvs.getContext("2d");

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

class Line {
  constructor(x0, y0, x1, y1) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  draw = () => {
    c.strokeStyle = "rgb(255, 255, 255)";
    c.beginPath();
    c.moveTo(this.x0, this.y0);
    c.lineTo(this.x1, this.y1);
    c.stroke();
    c.closePath();
    this.update();
  };

  update = () => {};
}

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

  draw = () => {
    for (let i = 0; i < boardwidth; i++) {
      for (let j = 0; j < boardheight; j++) {
        if (
          this.state[i][j] != 0 &&
          !(this.selected.i == i && this.selected.j == j)
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

    if (this.selected.i != undefined) {
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
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
  mouse.dragging = true;
  let i = Math.floor(mouse.x / scale);
  let j = Math.floor(mouse.y / scale);
  if (board.state[i][j] != 0) {
    board.selected.i = i;
    board.selected.j = j;
  }
});

cvs.addEventListener("mouseup", (e) => {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;

  if (
    !(
      Math.floor(mouse.x / scale) == board.selected.i &&
      Math.floor(mouse.y / scale) == board.selected.j
    ) &&
    board.state[Math.floor(mouse.x / scale)][Math.floor(mouse.y / scale)] == 0
  ) {
    // board.state[Math.floor(mouse.x / scale)][Math.floor(mouse.y / scale)] =
    //   board.state[board.selected.i][board.selected.j];
    // board.state[board.selected.i][board.selected.j] = 0;
    socket.emit("move", 
    {
        from: {i: board.selected.i, j: board.selected.j},
        to:{i: Math.floor(mouse.x / scale),
        j:Math.floor(mouse.y / scale)}
    })
  }

  mouse.dragging = false;
  board.selected.i = undefined;
  board.selected.j = undefined;
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
