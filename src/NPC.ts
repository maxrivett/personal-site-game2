import Phaser from 'phaser';
import Player from './Player';  // Update the import based on your actual Player class path

const TILE_WIDTH = 32;  
const WALK_SPEED = 80; // Reduced walk speed

enum NPC_DIRECTION {
  Up = 'Up',
  Down = 'Down',
  Left = 'Left',
  Right = 'Right'
}

export default class NPC extends Phaser.Physics.Arcade.Sprite {

  private player: Player;
  private signText: Phaser.GameObjects.Text;
  private signRect: Phaser.GameObjects.Rectangle;
  private target: Phaser.Math.Vector2;
  private direction: NPC_DIRECTION;
  private moveEvent: Phaser.Time.TimerEvent; 

  private isPlayerInSight: boolean; 
  private shouldResumeMovement: boolean;

  private isStationary: boolean;
  private isNonRotational: boolean;


  // Define bounds for NPC movement
  private minX: number;
  private maxX: number;
  private minY: number;
  private maxY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string | number, text: string, player: Player, minX: number, maxX: number, minY: number, maxY: number) {
    super(scene, x, y, texture, frame);
    this.player = player;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    
    this.initTextBox(text);
    
    this.target = new Phaser.Math.Vector2(this.x, this.y);
    switch (frame) {
      case 0:
        this.direction = NPC_DIRECTION.Up;
        break;
      case 1:
        this.direction = NPC_DIRECTION.Right;
        break;
      case 2:
        this.direction = NPC_DIRECTION.Down;
        break;
      case 3:
        this.direction = NPC_DIRECTION.Left;
        break;
    
      default:
        this.direction = NPC_DIRECTION.Down;
        break;
    }
    
    // Set the domain bounds
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;

    this.isPlayerInSight = false;
    this.shouldResumeMovement = false;

    this.isStationary = (minX+minY+maxX+maxY) < 2; // 0 for stationary but rotational
    this.isNonRotational = (minX+minY+maxX+maxY) === 1; // 1 for stationary no rotation

    // Initialize the move event
    if (!this.isStationary) {
      this.scheduleNextMove();
    }
  }

  private initTextBox(text: string) {
    // Create signText first
    this.signText = this.scene.add.text(this.x, this.y, text, {
      fontFamily: 'PokemonPixel',
      fontSize: '16px',
      color: '#000000'
    })
    .setOrigin(0.5, 0.5)  // setting origin to the center
    .setVisible(false)
    .setDepth(101);

    // Calculate center of the NPC
    let npcCenterX = this.x;

    // Calculate offsets
    let offsetY = -this.signText.height + 2*TILE_WIDTH;  // 15 is padding, adjust as needed

    // Move signText based on calculated offsets
    this.signText.setX(Math.round(npcCenterX));  // set to NPC's center
    this.signText.setY(Math.round(this.y + offsetY));  // set above the NPC

    // Create signRect based on same offsets
    this.signRect = this.scene.add.rectangle(Math.round(npcCenterX), Math.round(this.y + offsetY), this.signText.width + 10, this.signText.height, 0xffffff)
    .setStrokeStyle(1, 0x000000)
    .setOrigin(0.5, 0.5)  // setting origin to the center
    .setVisible(false)
    .setDepth(100);
  }


  private changeDirection() {
    if (this.isNonRotational) return;
    if (this.isPlayerInSight) return; // dont let npc move
    const directions = [NPC_DIRECTION.Up, NPC_DIRECTION.Down, NPC_DIRECTION.Left, NPC_DIRECTION.Right];
    this.direction = directions[Math.floor(Math.random() * directions.length)];
    
    let newTarget = new Phaser.Math.Vector2(this.target.x, this.target.y);
    switch (this.direction) {
      case NPC_DIRECTION.Up:
        newTarget.y -= TILE_WIDTH;
        break;
      case NPC_DIRECTION.Down:
        newTarget.y += TILE_WIDTH;
        break;
      case NPC_DIRECTION.Left:
        newTarget.x -= TILE_WIDTH;
        break;
      case NPC_DIRECTION.Right:
        newTarget.x += TILE_WIDTH;
        break;
    }
    
    // Check if the new target is within bounds
    if (newTarget.x >= this.minX && newTarget.x <= this.maxX && newTarget.y >= this.minY && newTarget.y <= this.maxY) {
      this.target = newTarget;
      this.anims.play(`${this.texture.key}_${this.direction.toLowerCase()}`, true);
    }
    
    // Schedule the next change of direction
    this.scheduleNextMove();
  }

  public preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    const playerInSight = this.lineOfSightIntersectsPlayer(); // Check if player is in sight

    if (playerInSight && !this.isPlayerInSight) {
      this.isPlayerInSight = true;
      this.showTextBox();
      if (this.moveEvent) this.moveEvent.remove(false); // Remove the existing movement event
    } 
    else if (!playerInSight && this.isPlayerInSight) {
      this.isPlayerInSight = false;
      this.hideTextBox();
      this.shouldResumeMovement = true; // Set flag to resume movement
    }
  
    if (this.shouldResumeMovement) {
      this.scheduleNextMove(); // Schedule the next movement
      this.shouldResumeMovement = false; // Reset the flag
    }

    if (this.isPlayerInSight) return; // dont let npc move

    if (this.target.x === this.x && this.target.y === this.y) {
      switch (this.direction) {
          case NPC_DIRECTION.Up:
              this.anims.play(`${this.texture.key}_stand_up`, true);
              break;
          case NPC_DIRECTION.Down:
              this.anims.play(`${this.texture.key}_stand_down`, true);
              break;
          case NPC_DIRECTION.Left:
              this.anims.play(`${this.texture.key}_stand_left`, true);
              break;
          case NPC_DIRECTION.Right:
              this.anims.play(`${this.texture.key}_stand_right`, true);
              break;
          default:
              break;
      }
    } else {
        this.scene.physics.moveTo(this, this.target.x, this.target.y, WALK_SPEED);
    }

    if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 1) {
      this.setPosition(this.target.x, this.target.y);
      this.body.reset(this.target.x, this.target.y);
    }
  }

  private lineOfSightIntersectsPlayer(): boolean {
    let sightDistance = 3 * TILE_WIDTH; // 3 tile widths
    const tolerance = 15; // 15 pixel tolerance to either side of the line
    
    switch (this.direction) {
      case NPC_DIRECTION.Up:
        return Math.abs(this.player.x - this.x) <= tolerance && this.player.y >= this.y - sightDistance && this.player.y < this.y;
      case NPC_DIRECTION.Down:
        return Math.abs(this.player.x - this.x) <= tolerance && this.player.y <= this.y + sightDistance && this.player.y > this.y;
      case NPC_DIRECTION.Left:
        return Math.abs(this.player.y - this.y) <= tolerance && this.player.x >= this.x - sightDistance && this.player.x < this.x;
      case NPC_DIRECTION.Right:
        return Math.abs(this.player.y - this.y) <= tolerance && this.player.x <= this.x + sightDistance && this.player.x > this.x;
      default:
        return false;
    }
  }
  

  private showTextBox() {
    this.signText.setPosition(this.x, this.y - 25).setVisible(true);
    this.signRect.setPosition(this.x, this.y - 25).setVisible(true);
  }

  private hideTextBox() {
    this.signText.setVisible(false);
    this.signRect.setVisible(false);
  }

  private scheduleNextMove() {
    const randomDelay = Phaser.Math.Between(500, 5000); // Generate a random delay between 500ms to 5000ms
    this.moveEvent = this.scene.time.addEvent({
      delay: randomDelay,
      callback: this.changeDirection,
      callbackScope: this,
      loop: false // Do not loop because we'll schedule the next one manually
    });
  }
}
