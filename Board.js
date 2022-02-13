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
    for (let i = 0; i < width; i++) {
      this.state[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        this.state[i][j] = 0;
      }
    }

    for (let i = 0; i < width; i++) {
      this.state[i][0] = 1;
      this.state[i][1] = 1;
      this.state[i][height - 1] = 2;
      this.state[i][height - 2] = 2;
    }

    this.activePlayer = 1;
    this.history = [];
    this.score = [2 * width, 2 * width];
    this.playerIds = [-1, -1];
  }

  getLegalMoves() {} // needed for engine, probably no implementation

  onBoard(pos) {
    return (pos.i >= 0 && pos.i < this.width && pos.j >= 0 && pos.j < this.height);
  }

  atPos(pos)
  {
    if(this.onBoard(pos))
    {
      return this.state[pos.i][pos.j];
    }
    return -1;
  }

  getLegalMoves(from) {
    var legal = [];
    directions.forEach(direction => {
      var dist = 1;
      var pos = {i: from.i + dist * direction.i, j: from.j + dist * direction.j};
      while (this.onBoard(pos) && this.atPos(pos) == 0) {
        legal.push({from: from, to: pos});
        dist++;
        pos = {i: from.i + dist * direction.i, j: from.j + dist * direction.j};
      }
    });
    return legal;
  }

  setPlayer(id, player)
  {
    this.playerIds[player] = id;
  }

  isLegal(from, to) {
    if (
      from.i != undefined &&
      from.j != undefined &&
      to.i != undefined &&
      to.j != undefined
    ) {
      if (
        from.i >= 0 &&
        from.i < this.width &&
        from.j >= 0 &&
        from.j < this.height &&
        to.i >= 0 &&
        to.i < this.width &&
        to.j >= 0 &&
        to.j < this.height
      ) {
        if (
          this.state[from.i][from.j] == this.activePlayer &&
          this.state[to.i][to.j] == 0 &&
          !(from.i == to.i && from.j == to.j)
        ) {
          let valid = false;
          if (from.i == to.i) {
            valid = true;
            for (
              let index = Math.min(from.j, to.j);
              index <= Math.max(from.j, to.j);
              index++
            ) {
              if (index != from.j) {
                if (this.state[from.i][index] != 0) {
                  valid = false;
                }
              }
            }
          }
          if (from.j == to.j) {
            valid = true;
            for (
              let index = Math.min(from.i, to.i);
              index <= Math.max(from.i, to.i);
              index++
            ) {
              if (index != from.i) {
                if (this.state[index][from.j] != 0) {
                  valid = false;
                }
              }
            }
          }
          return valid;
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
        victim.i < this.width &&
        victim.j < this.height &&
        victim.i >= 0 &&
        victim.j >= 0
      ) {
        if (
          anvil.i == -1 ||
          anvil.i == this.width ||
          anvil.j == -1 ||
          anvil.j == this.height
        ) {
          if (this.state[victim.i][victim.j] == 3 - this.activePlayer) {
            this.state[victim.i][victim.j] = 0;
          }
        } else {
          if (
            this.state[anvil.i][anvil.j] == this.activePlayer &&
            this.state[victim.i][victim.j] == 3 - this.activePlayer
          ) {
            this.state[victim.i][victim.j] = 0;
          }
        }
      }
    });
  }

  updateScore() {}

  makeMove(from, to) {
    if (this.isLegal(from, to)) {
      this.state[from.i][from.j] = 0;
      this.state[to.i][to.j] = this.activePlayer;
      this.capture(to);
      this.updateScore();
      this.history.push({from:from ,to:to});
      this.activePlayer = 3 - this.activePlayer;
    }
  }
}

module.exports = Board;
