import Phaser from "phaser";

const config = {
  type: Phaser.AUTO, // default webgl if your browser is compatible
  width: 800,
  height: 600,
  physics: {
    default: "arcade", // arcade physics plugin
    arcade: {
      debug: true,

      // gravity: {
      //   y: 300,
      // },
    },
  },
  scene: {
    preload, //preload: preload
    create,
    update,
  },
};

let bird = null;

let pipeHorizontalDistance = 0;

const VELOCITY = 220;

const PIPES_TO_RENDER = 4;

const pipeVerticalDistanceRange = [150, 250];
const pipeVerticalDistance = Phaser.Math.Between(...pipeVerticalDistanceRange);

// const pipeVerticalPosition = Phaser.Math.Between(30, config.height - 30 - pipeVerticalDistance);

const initialBirdPosition = { x: config.width * 0.1, y: config.height / 2 };

//loading assests, images, music, anims
function preload() {
  //this context -scene
  // contains functions and properties that we can use
  this.load.image("sky-bg", "assets/sky.png");
  this.load.image("bird", "assets/bird.png");
  this.load.image("pipe", "assets/pipe.png");
}

function create() {
  // this.add.image(config.width / 2, config.height / 2, "sky-bg"); // center position and the key
  this.add.image(0, 0, "sky-bg").setOrigin(0, 0);
  bird = this.physics.add.sprite(initialBirdPosition.x, initialBirdPosition.y, "bird").setOrigin(0, 0);
  bird.body.gravity.y = 350;

  for (let i = 0; i <= PIPES_TO_RENDER; i++) {
    let upperPipe = this.physics.add.sprite(0, 0, "pipe").setOrigin(0, 1);
    let lowerPipe = this.physics.add.sprite(0, 0, "pipe").setOrigin(0, 0);

    placePipe(upperPipe, lowerPipe);
  }

  this.input.on("pointerdown", flap);
  this.input.keyboard.on("keydown_SPACE", flap);
}

function update(time, delta) {
  if (bird.y < -bird.height || bird.y > config.height) {
    restartPlayerPosition();
  }
}

function placePipe(uPipe, lPipe) {
  pipeHorizontalDistance += 400;
  const pipeVerticalDistance = Phaser.Math.Between(...pipeVerticalDistanceRange);
  const pipeVerticalPosition = Phaser.Math.Between(30, config.height - 30 - pipeVerticalDistance);

  uPipe.x = pipeHorizontalDistance;
  uPipe.y = pipeVerticalPosition;

  lPipe.x = uPipe.x;
  lPipe.y = uPipe.y + pipeVerticalDistance;

  uPipe.body.velocity.x = -200;
  lPipe.body.velocity.x = -200;
}

function flap() {
  console.log("flap flap");
  bird.body.velocity.y = bird.body.velocity.y - VELOCITY;
  console.log(bird.body.velocity.y);
}

function restartPlayerPosition() {
  bird.x = initialBirdPosition.x;
  bird.y = initialBirdPosition.y;
  bird.body.velocity.y = 0;
}

new Phaser.Game(config);
