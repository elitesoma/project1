class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }
  preload() {}
  create() { this.scene.start('MainScene'); }
}

class MainScene extends Phaser.Scene {
  constructor() { super({ key: 'MainScene' }); }
  create() {
    // Player (Ahmad)
    this.ahmad = this.add.rectangle(320, 200, 32, 32, 0x00ffcc);
    this.physics.add.existing(this.ahmad);
    this.ahmad.body.setCollideWorldBounds(true);

    // Ghost
    this.ghost = this.add.circle(100, 100, 18, 0xffffff, 0.7);
    this.physics.add.existing(this.ghost);

    // Simple controls
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    let speed = 120;
    this.ahmad.body.setVelocity(0);
    if (this.cursors.left.isDown) this.ahmad.body.setVelocityX(-speed);
    if (this.cursors.right.isDown) this.ahmad.body.setVelocityX(speed);
    if (this.cursors.up.isDown) this.ahmad.body.setVelocityY(-speed);
    if (this.cursors.down.isDown) this.ahmad.body.setVelocityY(speed);

    // Ghost follows player
    this.physics.moveToObject(this.ghost, this.ahmad, 50);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 400,
  parent: 'game-container',
  backgroundColor: '#222',
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, MainScene]
};

new Phaser.Game(config);
