const BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BootScene() {
    // Start with BootScene
    Phaser.Scene.call(this, {
      key: 'BootScene'
    });
  },

  // Load game-wide assets
  preload: function () {
    this.load.spritesheet('scientist', '../assets/characters/scientist/scientist.png', {
      frameWidth: 24,
      frameHeight: 24
    });
  },

  // Start up the world scene
  create: function () {
    this.scene.start('WorldScene');
  }
});

let cursors;
let player;
let showDebug = false;

const WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function WorldScene() {
    Phaser.Scene.call(this, {
      key: 'WorldScene'
    });
  },

  preload: function () {
    this.load.image('tiles', '../assets/tilesets/terrain.png');
    this.load.tilemapTiledJSON('map', '../assets/maps/map-3.json');  
  },

  create: function () {
    // Make the map from the tileset 'map' key
    const map = this.make.tilemap({ key: 'map' });

    // Tileset used for this map
    const tileset = map.addTilesetImage('terrain', 'tiles');
    
    // Map layers
    const belowLayer = map.createStaticLayer('below', tileset, 0, 0);
    const worldLayer = map.createStaticLayer('world', tileset, 0, 0);
    const aboveLayer = map.createStaticLayer('above', tileset, 0, 0);

    // Set collision layer if collides property is true
    worldLayer.setCollisionByProperty({ collides: true });

    // Set the world layer depth above the belowLayer
    aboveLayer.setDepth(10);

    // Player spawns at "Spawn Point" object on map
    const spawnPoint = map.findObject('objects', obj => obj.name === 'Spawn Point');

    player = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'scientist')
      .setSize(16, 20);
    
    this.physics.add.collider(player, worldLayer);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const anims = this.anims;
    anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('scientist', {
        start: 8,
        end: 10,
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers('scientist', {
        start: 4,
        end: 5,
      }),
      frameRate: 5,
      repeat: -1
    });
    anims.create({
      key: "walk-up",
      frames: this.anims.generateFrameNumbers('scientist', {
        start: 6,
        end: 7,
      }),
      frameRate: 5,
      repeat: -1
    });
    
    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = this.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.zoom = 2;

    // Set up the arrows to control the camera
    cursors = this.input.keyboard.createCursorKeys();

    // Help text that has a "fixed" position on the screen
    this.add
    .text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
    .setScrollFactor(0)
    .setDepth(30);

    this.input.keyboard.once("keydown_D", event => {
      // Turn on physics debugging to show player's hitbox
      this.physics.world.createDebugGraphic();
      console.log(this.physics.world);
  
      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);
      worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
      });
    });
  },

  update: function (time, delta) {
    const speed = 100;

    // Stop any previous movement from the last frame
    player.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
      player.body.setVelocityX(-100);
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(100);
    }

    // Vertical movement
    if (cursors.up.isDown) {
      player.body.setVelocityY(-100);
    } else if (cursors.down.isDown) {
      player.body.setVelocityY(100);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    player.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (cursors.left.isDown) {
      player.anims.play("walk-left", true);
      player.flipX = false;
    } else if (cursors.right.isDown) {
      player.anims.play("walk-left", true);
      player.flipX = true;
    } else if (cursors.up.isDown) {
      player.anims.play("walk-up", true);
    } else if (cursors.down.isDown) {
      player.anims.play("walk-down", true);
    } else {
      player.anims.stop();
    }
  }
});

const config = {
  type: Phaser.AUTO,
  parent: 'content', // ID of dom to add to
  width: 800,
  height: 600,
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