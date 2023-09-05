import Phaser from 'phaser';

const SPEED = 110;
const TILE_WIDTH = 16;

export default class Max extends Phaser.Physics.Arcade.Sprite {
  target: Phaser.GameObjects.Sprite;
  followQueue: Phaser.Math.Vector2[] = [];
  private targetPosition: Phaser.Math.Vector2 | null = null;
  private isFollowing = true;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, target: Phaser.GameObjects.Sprite) {
    super(scene, x, y, texture);
    this.target = target;
    scene.physics.world.enable(this);
    scene.add.existing(this);
  }

  update() {
    if (!this.targetPosition && this.followQueue.length > 1) {
      this.targetPosition = this.followQueue.shift();
      this.moveMax(this.targetPosition.x, this.targetPosition.y);
    } else if (!this.targetPosition) {
      // Max is idle, face towards the player
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.anims.play(dx > 0 ? 'max_stand_right' : 'max_stand_left', true);
      } else {
        this.anims.play(dy > 0 ? 'max_stand_down' : 'max_stand_up', true);
      }
    }

    if (this.targetPosition) {
      if (Phaser.Math.Distance.Between(this.x, this.y, this.targetPosition.x, this.targetPosition.y) < TILE_WIDTH / 8) {
        this.setPosition(this.targetPosition.x, this.targetPosition.y);
        this.body.reset(this.targetPosition.x, this.targetPosition.y);
        this.body.velocity.set(0, 0);
        this.targetPosition = null;
      }
    }
  }

  recordPlayerPosition(x: number, y: number) {
    if (this.isFollowing === false) return;
    let a = true;
    if (this.followQueue.length > 0) {
        a = (this.followQueue[this.followQueue.length-1].x != x || this.followQueue[this.followQueue.length-1].y != y);
    } 
    if (x % (TILE_WIDTH/2) === 0 && y % (TILE_WIDTH/2) === 0 && a === true) {
        this.followQueue.push(new Phaser.Math.Vector2(x, y));
    }
  }

  moveMax(targetX: number, targetY: number) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;

    // Determine the direction to play the corresponding walking animation
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            this.anims.play('max_right', true);
        } else {
            this.anims.play('max_left', true);
        }
    } else {
        if (dy > 0) {
            this.anims.play('max_down', true);
        } else {
            this.anims.play('max_up', true);
        }
    }
    this.scene.physics.moveTo(this, targetX, targetY, SPEED);
  }

  setFollowing(bool: boolean) {
    this.isFollowing = bool;
  }
}
