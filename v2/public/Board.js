const directions = [
  { i: 1, j: 0 },
  { i: 0, j: 1 },
  { i: -1, j: 0 },
  { i: 0, j: -1 },
];

class Board {
  constructor(width, height, edgecapture) {
    this.width = width;
    this.height = height;
    this.edgecapture = edgecapture;
    this.state = new Array(width);
    this.territory = new Array(width);
    for (let i = 0; i < width; i++) {
      this.state[i] = new Array(height);
      this.territory[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        this.state[i][j] = 0;
        this.territory[i][j] = 0;
      }
    }

    this.activePlayer = 1;
    this.opponent = 2;
    this.history = [];
    this.score = [2 * width, 2 * width];
    this.nstones = [2 * width, 2 * width];
    this.winner = 0; // ongoing: 0, white: 1, black: 2, draw: 3
    this.timecontrol = { startingtime: 300, delay: 10 };
    this.beginning = 0;
    this.time = [this.timecontrol.startingtime, this.timecontrol.startingtime];
    this.updateScore();
  }

  getLegalMoves() {} // needed for engine, probably no implementation

  onBoard(pos) {
    return (
      pos.i >= 0 && pos.i < this.width && pos.j >= 0 && pos.j < this.height
    );
  }

  atPos(pos) {
    if (this.onBoard(pos)) {
      return this.state[pos.i][pos.j];
    }
    return -1;
  }

  sees(pos, dir) {
    var check = {
      i: pos.i + dir.i,
      j: pos.j + dir.j,
    };
    while (this.onBoard(check)) {
      if (this.atPos(check) > 0) {
        return this.atPos(check);
      }
      check.i = check.i + dir.i;
      check.j = check.j + dir.j;
    }
    return 0;
  }

  getLegalMoves(from) {
    var legal = [];
    if (from == -1) {
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          let pos = { i: i, j: j };
          if (this.isLegal(-1, pos)) {
            legal.push({ from: -1, to: pos });
          }
        }
      }
    }
    directions.forEach((direction) => {
      var dist = 1;
      var pos = {
        i: from.i + dist * direction.i,
        j: from.j + dist * direction.j,
      };
      while (this.atPos(pos) == 0) {
        legal.push({ from: from, to: pos });
        dist++;
        pos = {
          i: from.i + dist * direction.i,
          j: from.j + dist * direction.j,
        };
      }
    });
    if (this.winner != 0) {
      legal = [];
    }
    return legal;
  }

  isLegal(from, to) {
    // if (this.winner != 0) {
    //   return false;
    // }
    // console.log(this.onBoard(from), this.onBoard(to));
    if (from == -1) {
      // console.log("Clicked at ", this.atPos(to));
      if (this.atPos(to) == 0) {
        var ret = true;
        directions.forEach((dir) => {
          // console.log(to, " sees ", this.sees(to, dir), " in ", dir, " opponent = ", this.opponent);
          // console.log(this.sees(to, dir) == this.opponent)
          if (this.sees(to, dir) == this.opponent) {
            ret = false;
          }
        });
        return ret;
      }
    } else {
      if (this.onBoard(from) && this.onBoard(to)) {
        if (this.atPos(from) == this.activePlayer) {
          let ret = false;
          directions.forEach((dir) => {
            var pos = {
              j: from.j + dir.j,
              i: from.i + dir.i,
            };
            while (this.onBoard(pos) && this.atPos(pos) == 0) {
              if (pos.i == to.i && pos.j == to.j) {
                ret = true;
              }
              pos.i = pos.i + dir.i;
              pos.j = pos.j + dir.j;
            }
          });
          return ret;
        }
      }
    }
    return false;
  }

  capture(to) {
    var anvil, victim;

    directions.forEach((direction) => {
      anvil = { i: to.i + 2 * direction.i, j: to.j + 2 * direction.j };
      victim = { i: to.i + direction.i, j: to.j + direction.j };
      if (
        ((this.atPos(anvil) == -1 && this.edgecapture) ||
          this.atPos(anvil) == this.activePlayer) &&
        this.atPos(victim) == this.opponent
      ) {
        this.state[victim.i][victim.j] = 0;
      }
    });
  }

  nextto(square) {
    let out = [];
    directions.forEach((direction) => {
      let neighbor = { i: square.i + direction.i, j: square.j + direction.j };
      if (this.onBoard(neighbor)) {
        out.push(neighbor);
      }
    });
    return out;
  }

  updateScore() {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.territory[i][j] = 0;
      }
    }
    let n = 1;
    let owner = [0];
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        if (this.state[i][j] == 0 && this.territory[i][j] == 0) {
          //floodfill
          var neighbors = [];
          var borderswhite = false;
          var bordersblack = false;
          this.territory[i][j] = n;
          neighbors = neighbors.concat(this.nextto({ i: i, j: j }));
          while (neighbors.length > 0) {
            let neighbor = neighbors.pop();
            if (
              this.atPos(neighbor) == 0 &&
              this.territory[neighbor.i][neighbor.j] == 0
            ) {
              this.territory[neighbor.i][neighbor.j] = n;
              neighbors = neighbors.concat(this.nextto(neighbor));
            }
            if (this.atPos(neighbor) == 1) {
              borderswhite = true;
            }
            if (this.atPos(neighbor) == 2) {
              bordersblack = true;
            }
          }
          if (bordersblack && !borderswhite) {
            owner.push(2);
          } else if (!bordersblack && borderswhite) {
            owner.push(1);
          } else {
            owner.push(0);
          }
          n++;
        }
      }
    }
    this.score[0] = 0;
    this.score[1] = 0;
    this.nstones = [0, 0];
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        let o = owner[this.territory[i][j]];
        this.territory[i][j] = o + this.atPos({ i: i, j: j });
        if (o > 0) {
          this.score[o - 1] += 1;
        }
        if (this.atPos({ i: i, j: j }) > 0) {
          this.nstones[this.atPos({ i: i, j: j }) - 1] += 1;
          this.score[this.atPos({ i: i, j: j }) - 1] += 1;
        }
      }
    }
    // if (
    // this.score[0] > (this.width * this.height) / 2 ||
    // this.nstones[1] < this.width
    // ) {
    // this.winner = 1;
    // } else if (
    // this.score[1] > (this.width * this.height) / 2 ||
    // this.nstones[0] < this.width
    // ) {
    // this.winner = 2;
    // }
  }

  makeMove(from, to) {
    console.log("Move ", from, to, "is legal: ", this.isLegal(from, to));
    if (this.isLegal(from, to)) {
      if (from == -1) {
        this.state[to.i][to.j] = this.activePlayer;
      } else {
        this.state[from.i][from.j] = 0;
        this.state[to.i][to.j] = this.activePlayer;
        this.capture(to);
      }
      this.history.push({ from: from, to: to });
      this.updateScore();
      if (this.winner == 0) {
        this.activePlayer = 3 - this.activePlayer;
        this.opponent = 3 - this.activePlayer;
        console.log(
          "Player: ",
          this.activePlayer,
          " Opponent: ",
          this.opponent
        );
      }
    }
  }
}
