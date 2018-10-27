const BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BootScene() {
    Phaser.Scene.call(this, {
      key: 'BootScene'
    });
  },

  preload: function () {
    this.load.spritesheet('player', '/assets/characters/gabe-idle-run.png', {
      frameWidth: 24,
      frameHeight: 24
    });
  },

  create: function () {
    this.scene.start('WorldScene');
  }
});

let cursors;
let player;

const WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function WorldScene() {
    Phaser.Scene.call(this, {
      key: 'WorldScene'
    });
  },

  preload: function () {

  },

  create: function () {
    player = this.physics.add.sprite(50, 100, 'player', 0);
    player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', {
        start: 1,
        end: 6
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', {
        start: 1,
        end: 6
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: [ { key: 'player', frame: 0 } ],
      frameRate: 20
    });

    cursors = this.input.keyboard.createCursorKeys();
  },

  update: function () {
    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.flipX = true;
      player.anims.play('left', true);

    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.flipX = false;
      player.anims.play('right', true);

    } else if (cursors.up.isDown) {
      player.setVelocityY(-160);

    } else if (cursors.down.isDown) {
      player.setVelocityY(160);

    } else {
      // player.flipX = false;
      player.setVelocity(0);
      player.anims.play('idle', true);
    }
  }
});

const config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 320,
  height: 240,
  zoom: 2,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0
      },
    },
  },
  scene: [
    BootScene,
    WorldScene,
  ],
}

const game = new Phaser.Game(config);