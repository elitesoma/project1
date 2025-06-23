// Lost in Libya: A Muslim Man’s Spooky Holiday

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 400,
  parent: 'game-container',
  pixelArt: true,
  scene: [BootScene, MainScene, UIScene],
  physics: { default: 'arcade', arcade: { debug: false } }
};

let game = new Phaser.Game(config);

// BootScene: Load assets
function BootScene() {
  Phaser.Scene.call(this, { key: 'BootScene' });
}
BootScene.prototype = Object.create(Phaser.Scene.prototype);
BootScene.prototype.constructor = BootScene;
BootScene.prototype.preload = function () {
  // Simple tiles and sprites as examples. Replace/expand as needed!
  this.load.image('tiles', 'https://i.imgur.com/M6rwarW.png'); // placeholder tileset
  this.load.spritesheet('ahmad', 'https://i.imgur.com/Z1iX1rA.png', { frameWidth: 32, frameHeight: 32 }); // placeholder
  this.load.image('ghost', 'https://i.imgur.com/5V2QbZ6.png');
  this.load.image('tea', 'https://i.imgur.com/n2w7cPH.png');
  this.load.audio('spooky', 'https://cdn.pixabay.com/audio/2022/07/26/audio_125bfa6cf2.mp3');
  this.load.audio('laugh', 'https://cdn.pixabay.com/audio/2022/09/27/audio_128c6bfa3e.mp3');
  this.load.audio('gulp', 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b4b8e9e.mp3');
};
BootScene.prototype.create = function () {
  this.scene.start('MainScene');
};

// MainScene: The game world
function MainScene() {
  Phaser.Scene.call(this, { key: 'MainScene' });
}
MainScene.prototype = Object.create(Phaser.Scene.prototype);
MainScene.prototype.constructor = MainScene;

MainScene.prototype.create = function () {
  // Sound
  this.spookyMusic = this.sound.add('spooky', { loop: true, volume: 0.2 });
  this.spookyMusic.play();

  // Map (simple tile background)
  this.add.tileSprite(0, 0, 640, 400, 'tiles').setOrigin(0);

  // Player (Ahmad)
  this.ahmad = this.physics.add.sprite(320, 200, 'ahmad', 0);
  this.ahmad.setCollideWorldBounds(true);

  // Animations
  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('ahmad', { start: 0, end: 3 }),
    frameRate: 7,
    repeat: -1
  });

  // Ghost enemy
  this.ghost = this.physics.add.sprite(100, 100, 'ghost');
  this.ghost.setAlpha(0.8);

  // Tea collectible
  this.tea = this.physics.add.sprite(500, 300, 'tea');

  // Player state
  this.courage = 3; // like health
  this.teaCount = 0;

  // Camera
  this.cameras.main.startFollow(this.ahmad);

  // Input
  this.cursors = this.input.keyboard.createCursorKeys();
  this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  // Colliders
  this.physics.add.overlap(this.ahmad, this.ghost, this.encounterGhost, null, this);
  this.physics.add.overlap(this.ahmad, this.tea, this.collectTea, null, this);

  // Timed events: funny/scary events
  this.time.addEvent({ delay: 9000, callback: this.randomEvent, callbackScope: this, loop: true });

  // Dialogue
  this.dialogue = [
    "Ahmad: 'Bismillah... hope my phone works out here.'",
    "A cold wind blows. Was that a sheep... or something else?",
    "You hear a vendor shouting: 'Fresh amulets! Guaranteed 30% ghost resistance!'",
    "A spooky grandma ghost floats by, muttering about lost slippers."
  ];
  this.dialogueIndex = 0;

  // Show UI
  this.scene.launch('UIScene', { courage: this.courage, teaCount: this.teaCount });
};

MainScene.prototype.update = function () {
  // Movement
  let speed = 120;
  let moving = false;
  if (this.cursors.left.isDown) {
    this.ahmad.setVelocityX(-speed);
    moving = true;
  } else if (this.cursors.right.isDown) {
    this.ahmad.setVelocityX(speed);
    moving = true;
  } else {
    this.ahmad.setVelocityX(0);
  }
  if (this.cursors.up.isDown) {
    this.ahmad.setVelocityY(-speed);
    moving = true;
  } else if (this.cursors.down.isDown) {
    this.ahmad.setVelocityY(speed);
    moving = true;
  } else {
    this.ahmad.setVelocityY(0);
  }
  if (moving) this.ahmad.anims.play('walk', true);
  else this.ahmad.anims.stop();

  // Ghost follows Ahmad (simple AI)
  this.physics.moveToObject(this.ghost, this.ahmad, 55);

  // Tea interaction
  if (this.physics.overlap(this.ahmad, this.tea) && Phaser.Input.Keyboard.JustDown(this.keyE)) {
    this.collectTea(this.ahmad, this.tea);
  }
};

MainScene.prototype.encounterGhost = function (player, ghost) {
  this.sound.play('laugh', { volume: 0.7 });
  this.courage -= 1;
  this.scene.get('UIScene').events.emit('updateCourage', this.courage);

  // Ghost teleports away
  ghost.x = Phaser.Math.Between(60, 580);
  ghost.y = Phaser.Math.Between(60, 340);

  if (this.courage <= 0) {
    this.gameOver();
  }
};

MainScene.prototype.collectTea = function (player, tea) {
  this.sound.play('gulp', { volume: 0.5 });
  this.teaCount += 1;
  this.courage = Math.min(this.courage + 1, 5); // heal courage
  this.scene.get('UIScene').events.emit('updateCourage', this.courage);
  this.scene.get('UIScene').events.emit('updateTea', this.teaCount);
  // Move tea somewhere else
  tea.x = Phaser.Math.Between(60, 580);
  tea.y = Phaser.Math.Between(60, 340);
};

MainScene.prototype.randomEvent = function () {
  // Show random dialogue or event
  const idx = this.dialogueIndex % this.dialogue.length;
  this.scene.get('UIScene').events.emit('showDialogue', this.dialogue[idx]);
  this.dialogueIndex++;
  // Fun: sometimes spawn a new ghost!
  if (Math.random() < 0.25) {
    let ghost = this.physics.add.sprite(Phaser.Math.Between(60, 580), Phaser.Math.Between(60, 340), 'ghost');
    ghost.setAlpha(0.7);
    this.physics.add.overlap(this.ahmad, ghost, this.encounterGhost, null, this);
    this.time.delayedCall(7000, () => ghost.destroy());
  }
};

MainScene.prototype.gameOver = function () {
  this.spookyMusic.stop();
  this.scene.pause();
  this.scene.get('UIScene').events.emit('gameOver');
};

// UIScene: HUD and dialogue
function UIScene() {
  Phaser.Scene.call(this, { key: 'UIScene' });
}
UIScene.prototype = Object.create(Phaser.Scene.prototype);
UIScene.prototype.constructor = UIScene;

UIScene.prototype.init = function (data) {
  this.courage = data.courage || 3;
  this.teaCount = data.teaCount || 0;
};

UIScene.prototype.create = function () {
  // Courage (hearts)
  this.courageText = this.add.text(10, 10, 'Courage: ' + '💚'.repeat(this.courage), { fontSize: '20px', fill: '#fff' }).setScrollFactor(0);

  // Tea
  this.teaText = this.add.text(10, 40, `Tea: ${this.teaCount} 🫖`, { fontSize: '16px', fill: '#fff' }).setScrollFactor(0);

  // Dialogue box
  this.dialogueBox = this.add.text(60, 350, '', { fontSize: '16px', fill: '#ffd', backgroundColor: '#222a', padding: { x: 8, y: 6 } }).setScrollFactor(0);

  // Listen for events
  this.events.on('updateCourage', (courage) => {
    this.courage = courage;
    this.courageText.setText('Courage: ' + '💚'.repeat(this.courage));
  });
  this.events.on('updateTea', (teaCount) => {
    this.teaCount = teaCount;
    this.teaText.setText(`Tea: ${this.teaCount} 🫖`);
  });
  this.events.on('showDialogue', (msg) => {
    this.dialogueBox.setText(msg);
    this.time.delayedCall(3400, () => this.dialogueBox.setText(''));
  });
  this.events.on('gameOver', () => {
    this.add.rectangle(320, 200, 400, 180, 0x000000, 0.8);
    this.add.text(220, 180, "GAME OVER", { fontSize: '32px', fill: '#fa4' });
    this.add.text(180, 230, "Ahmad’s courage failed him in spooky Libya!", { fontSize: '18px', fill: '#fff' });
    this.add.text(220, 270, "Refresh to try again!", { fontSize: '18px', fill: '#fff' });
  });
};
