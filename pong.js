/*jshint esnext: true */

(function() {

  class Ball {
    constructor() {
      this.direction = 'right';
      this.start = null;
      this.speed = 1;
      this.direction = [5,5]; // x/y axis
      this.position = [40,20];


      // Set element and element properties, append to DOM
      this.element = document.createElement('div');
      this.element.className = 'ball';
      document.body.appendChild(this.element);

      this.moveTo(this.position);
    }

    moveTo(position) {
      this.element.style.transform = `translate(${position[0]}px, ${position[1]}px)`;
    }

    collide(axis) {
      this.speed = this.speed + 0.1;
      if (axis === 'x') {
        this.direction[0] = this.direction[0] * -1;
      } else {
        this.direction[1] = this.direction[1] * -1;
      }
    }

    get directionX() {
      return this.direction[0] > 0 ? 'right' : 'left';
    }

    get directionY() {
      return this.direction[1] > 0 ? 'down' : 'up';
    }

    reset() {
      this.direction = [5,5];
      this.position = [40,20];
      this.speed = this.speed + 0.1;
    }
  }

  class Player {
    constructor(side) {
      this.position = 0;
      this.side = side;
      this.moving = false;
      this.direction = null;
      this.start = null;
      this.score = 0;

      // Set element and element properties, append to DOM
      this.element = document.createElement('div');
      this.element.id = side;
      this.element.className = 'player';
      this.element.style.top = 0;
      this.element.style.height = '400px';
      document.body.appendChild(this.element);

      this.move = (timestamp) => {
        if (!this.moving) return;
        if (!this.canMove(this.direction)) return;
        if (!this.start) this.start = timestamp;
        switch (this.direction) {
          case 'up':
            this.position -= pong.moveSpeed;
            break;
          case 'down':
            this.position += pong.moveSpeed;
            break;
        }
        this.element.style.top = this.position + 'px';
        this.movement = window.requestAnimationFrame(this.move);
      };
    }

    stop() {
      this.moving = false;
    }

    canMove(direction) {
      let rect = this.element.getBoundingClientRect();
      switch(direction) {
        case 'up':
          return rect.top > 0;
        case 'down':
          return rect.bottom < window.innerHeight;
      }
    }
  }

  class Scoreboard {
    constructor() {
      this.names = {
        left: 'left',
        right: 'right'
      };
      let scoreElement = document.createElement('div');
      scoreElement.className = 'scoreboard';
      document.body.appendChild(scoreElement);
      let sides = ['left', 'right'];
      for (var i = sides.length - 1; i >= 0; i--) {
        let element = document.createElement('div');
        element.className = 'score';
        element.id = `score-${sides[i]}`;
        scoreElement.appendChild(element);
      }
    }

    update(score) {
      let sides = ['left', 'right'];
      for (var i = sides.length - 1; i >= 0; i--) {
        let element = document.getElementById(`score-${sides[i]}`);
        element.innerHTML = `${this.names[sides[i]]}: ${score[sides[i]]}`;
      }
    }

    updateNames(leftName, rightName) {
      this.names.left = leftName;
      this.names.right = rightName;
    }
  }

  class Settings {
    constructor(game) {
      this.button = document.createElement('div');
      this.button.className = 'settings';
      this.button.innerHTML = 'Settings';
      this.button.addEventListener('click', function() {
        alert('button clicked');
      });
      document.body.appendChild(this.button);
    }
  }

  class Game {
    constructor() {
      this.playerRight = new Player('right');
      this.playerLeft = new Player('left');
      this.ball =  new Ball();
      this.scoreboard = new Scoreboard();
      this.settings = new Settings();

      this.paused = true;
      this.start = null;
      this.moveSpeed = 10;
      this.moveKeys = {
        pause: 32,
        leftPlayer: {
          up: 65,    // a
          down: 83  // s
        },
        rightPlayer: {
          up: 38,   // up
          down: 40  // down
        }
      };

      this.allMoveKeys = [
        this.moveKeys.leftPlayer.up,
        this.moveKeys.leftPlayer.down,
        this.moveKeys.rightPlayer.up,
        this.moveKeys.rightPlayer.down
      ];

      this.move = (timestamp) => {
        if (this.paused) return;
        if (!this.start) this.start = timestamp;

        // -------------------- collisions
        let ballRect = this.ball.element.getBoundingClientRect();
        let playerLeftRect = this.playerLeft.element.getBoundingClientRect();
        let playerRightRect = this.playerRight.element.getBoundingClientRect();

        // HANDLE PLAYER COLLISIONS
        // handle hitting playerRight
        if (this.ball.directionX == 'right') {
          if (ballRect.right >= playerRightRect.left) {
            // ball has reached player
            if (ballRect.top >= playerRightRect.top && ballRect.bottom <= playerRightRect.bottom) {
              // ball has collided with player
              this.ball.collide('x');
            } else {
              // other player has scored
              this.playerLeft.score += 1;
              this.resetRound();
            }
          }
        } else {
        // handle hitting playerLeft
          if (ballRect.left <= playerLeftRect.right) {
            // ball has reached player
            if (ballRect.top >= playerLeftRect.top && ballRect.bottom <= playerLeftRect.bottom) {
              // ball has collided with player
              this.ball.collide('x');
            } else {
              // score a point for player right
              this.playerRight.score += 1;
              this.resetRound();
            }
          }
        }

        // HANDLE TOP/BOTTOM WALL COLLISIONS
        if (ballRect.bottom >= window.innerHeight || ballRect.top <= 0) {
          this.ball.collide('y');
        }

        // HANDLE MOVING BALL
        for (var i = this.ball.direction.length - 1; i >= 0; i--) {
          this.ball.position[i] += this.ball.direction[i] * this.ball.speed;
        }
        this.ball.moveTo(this.ball.position);
        window.requestAnimationFrame(this.move);
      };

      this.scoreboard.update(this.score);
    }

    get score() {
      return {
        left: this.playerLeft.score,
        right: this.playerRight.score
      };
    }

    pause() {
      this.paused = true;
    }

    resetRound() {
      this.scoreboard.update(this.score);
      this.ball.reset();
      this.pause();
    }
  }

  document.addEventListener('keydown', function() {
    if (pong) {
      if (event.keyCode === pong.moveKeys.pause) {
        pong.paused = !pong.paused;
        window.requestAnimationFrame(pong.move);
      }
      if (pong.allMoveKeys) {
        switch (pong.allMoveKeys.indexOf(event.keyCode)) {
          default: break;
          case 0:
            pong.playerLeft.direction = 'up';
            if (!pong.playerLeft.moving) {
              pong.playerLeft.moving = true;
              pong.playerLeft.move();
            }
            break;
          case 1:
            pong.playerLeft.direction = 'down';
            if (!pong.playerLeft.moving) {
              pong.playerLeft.moving = true;
              pong.playerLeft.move();
            }
            break;
          case 2:
            pong.playerRight.direction = 'up';
            if (!pong.playerRight.moving) {
              pong.playerRight.moving = true;
              pong.playerRight.move();
            }
            break;
          case 3:
            pong.playerRight.direction = 'down';
            if (!pong.playerRight.moving) {
              pong.playerRight.moving = true;
              pong.playerRight.move();
            }
            break;
        }
      }
    }
  });

  document.addEventListener('keyup', function() {
    if (pong && pong.allMoveKeys) {
      switch(pong.allMoveKeys.indexOf(event.keyCode)) {
        default: break;
        case 0:
        case 1:
          pong.playerLeft.stop();
          break;
        case 2:
        case 3:
          pong.playerRight.stop();
      }
    }
  });

  window.pong = new Game();
})();
