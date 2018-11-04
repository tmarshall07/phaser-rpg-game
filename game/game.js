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
    this.load.atlas('atlas', '../assets/characters/kat/atlas.png', '../assets/characters/kat/atlas.json');
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
    this.load.image('tiles', '../assets/maps/map-1.png');
    this.load.tilemapTiledJSON('map', '../assets/maps/map-1.json');  
  },

  create: function () {
    // Make the map from the tileset 'map' key
    const map = this.make.tilemap({ key: 'map' });

    // Tileset used for this map
    const tileset = map.addTilesetImage('map-1', 'tiles');
    
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
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24);
    
    this.physics.add.collider(player, worldLayer);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const anims = this.anims;
    anims.create({
      key: "misa-left-walk",
      frames: anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-right-walk",
      frames: anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-front-walk",
      frames: anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-back-walk",
      frames: anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = this.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

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
    const speed = 175;
    const prevVelocity = player.body.velocity.clone();

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
      player.anims.play("misa-left-walk", true);
    } else if (cursors.right.isDown) {
      player.anims.play("misa-right-walk", true);
    } else if (cursors.up.isDown) {
      player.anims.play("misa-back-walk", true);
    } else if (cursors.down.isDown) {
      player.anims.play("misa-front-walk", true);
    } else {
      player.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
      else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
      else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
      else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
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