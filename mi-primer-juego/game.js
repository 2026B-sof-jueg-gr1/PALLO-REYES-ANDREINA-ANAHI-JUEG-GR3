const config = { type: Phaser.AUTO, width: 800, height: 600,
    physics: { default: 'arcade' },
    scene: { preload: preload, create: create, update: update } };

const game = new Phaser.Game(config);
let player, cursors;

function preload() {
    this.load.image('block', 'https://labs.phaser.io/assets/sprites/block.png');
}
function create() {
    player = this.physics.add.image(400, 300, 'block');
    this.cameras.main.startFollow(player);
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    player.setVelocity(0);
    if (cursors.left.isDown) player.setVelocityX(-300);
    else if (cursors.right.isDown) player.setVelocityX(300);
}