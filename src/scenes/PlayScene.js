import Phaser from "phaser";
import BaseScene from "./BaseScene";

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

    this.bird = null;
    this.pipes = null;
    this.isPaues = false;
    this.pipeHorizontalDistance = 0;
    // this.pipeVerticalDistanceRange = [150, 250];
    // this.pipeHorizontalDistanceRange = [450, 500];
    this.VELOCITY = 300;
    this.score = 0;
    this.scoreText = "";
    this.currentDifficulty = "easy";
    this.difficulties = {
      easy: {
        pipeVerticalDistanceRange: [150, 200],
        pipeHorizontalDistanceRange: [300, 350],
      },
      normal: {
        pipeVerticalDistanceRange: [140, 190],
        pipeHorizontalDistanceRange: [280, 330],
      },
      hard: {
        pipeVerticalDistanceRange: [50, 60],
        pipeHorizontalDistanceRange: [250, 310],
      },
    };
  }

  create() {
    this.currentDifficulty = "easy";
    super.create();
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.handleInputs();
    this.createScore();
    this.createPause();
    this.listenToEvents();
    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("bird", { start: 8, end: 15 }),
      frameRate: 8, //default is 24, but we play 8 in one second
      repeat: -1, //repeat infinitelly
    });
    this.bird.play("fly");
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  //CUSTOM FUNCTIONS

  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }
    this.pauseEvent = this.events.on("resume", () => {
      this.initialTime = 3;
      this.countDownText = this.add
        .text(...this.screenCenter, "Fly in " + this.initialTime, this.fontOptions)
        .setOrigin(0.5);
      this.isPaused = false;
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText("Fly in:" + this.initialTime);
    if (this.initialTime <= 0) {
      this.countDownText.setText("");
      this.physics.resume();
      this.timedEvent.remove();
    }
  }

  createPause() {
    this.isPaused = false;
    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, "pause")
      .setInteractive()
      .setScale(3)
      .setOrigin(1, 1);

    pauseButton.on("pointerdown", () => {
      this.physics.pause();
      this.scene.pause();
      this.scene.launch("PauseScene");
      this.isPaused = true;
    });
  }

  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, "bird")
      .setFlipX(true)
      .setScale(2)
      .setOrigin(0, 0);

    this.bird.setBodySize(this.bird.width - 2, this.bird.height - 8);

    this.bird.body.gravity.y = 600;
    this.bird.setCollideWorldBounds(true);
  }

  createPipes() {
    this.pipes = this.physics.add.group();
    for (let i = 0; i <= PIPES_TO_RENDER; i++) {
      let upperPipe = this.pipes.create(0, 0, "pipe").setImmovable(true).setOrigin(0, 1);
      let lowerPipe = this.pipes.create(0, 0, "pipe").setImmovable(true).setOrigin(0, 0);

      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this); //callback context cokomelli
  }

  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem("bestScore");
    this.scoreText = this.add.text(16, 16, `Score ${this.score}`, { fontSize: "32px", fill: "#000" });
    this.add.text(16, 52, `Best Score ${bestScore || 0}`, { fontSize: "18px", fill: "#000" });
  }

  checkGameStatus() {
    if (this.bird.y <= 0 || this.bird.getBounds().bottom >= this.config.height) {
      this.gameOver();
    }
  }

  handleInputs() {
    this.input.on("pointerdown", this.flap, this); //BURASI ÇOKOMELLİ!!!
    this.input.keyboard.on("keydown_SPACE", this.flap, this);
  }

  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
    const pipeVerticalPosition = Phaser.Math.Between(30, this.config.height - 30 - pipeVerticalDistance);
    const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
  }
  recyclePipes() {
    let tempPipes = [];
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right < 0) {
        //spawn to the end
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score <= 3) {
      this.currentDifficulty = "easy";
    }

    if (3 < this.score < 8) {
      this.currentDifficulty = "normal";
    }

    if (this.score >= 8) {
      this.currentDifficulty = "hard";
    }
  }

  getRightMostPipe() {
    let rightMostX = 0;
    this.pipes.getChildren().forEach((pipe) => {
      rightMostX = Math.max(pipe.x, rightMostX);
    });
    return rightMostX;
  }

  flap() {
    // this.bird.body.velocity.y = this.bird.body.velocity.y - this.VELOCITY;
    if (this.isPaused == false) {
      this.bird.body.velocity.y = -this.VELOCITY;
    }
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem("bestScore");
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem("bestScore", this.score);
    }
  }

  gameOver() {
    this.physics.pause();
    this.bird.setTint("0xff0000");
    this.saveBestScore();
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

export default PlayScene;
