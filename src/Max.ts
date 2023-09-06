import Phaser from 'phaser';

const SPEED = 110; // same speed as player
const TILE_WIDTH = 16; // tile width is really 32px but want him in middle of tile

// All of Max's dialogue, key is the time for him to say it
const DIALOGUE: { [key: string]: string[] } = {
    Intro: ["Hi there! (Hit the spacebar to advance my text.)", "I'm going to follow you and tell you about myself along the way. Let's get out of this room and start exploring!"],
    HighSchool: ["Here is ... ", "Yes"]
  };

/**
 * Class representing Max, a NPC that follows the player once interacted with
 */
export default class Max extends Phaser.Physics.Arcade.Sprite {
  target: Phaser.GameObjects.Sprite;
  followQueue: Phaser.Math.Vector2[] = [];
  private targetPosition: Phaser.Math.Vector2 | null = null;
  private isFollowing = false;
  private signText: Phaser.GameObjects.Text;
  private signRect: Phaser.GameObjects.Rectangle;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private dialogQueue: string[] = [];
  private currentDialog: string | null = null;
  private spacebarJustPressed: boolean = false;  

  /**
   * Create a Max character.
   * @param {Phaser.Scene} scene - The scene to which Max belongs.
   * @param {number} x - The x-coordinate of Max.
   * @param {number} y - The y-coordinate of Max.
   * @param {string} texture - The texture to be used for Max.
   * @param {Phaser.GameObjects.Sprite} target - The target sprite that Max will follow.
   */
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, target: Phaser.GameObjects.Sprite) {
    super(scene, x, y, texture);
    this.target = target;
    this.scene = scene;
    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.cursorKeys = this.scene.input.keyboard.createCursorKeys(); 
  }

  /**
   * Update Max's state. This method is called in the game loop.
   */
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
    if (this.cursorKeys.space?.isDown && !this.spacebarJustPressed) {
        this.updateSign();
        this.spacebarJustPressed = true;
      } else if (this.cursorKeys.space?.isUp) {
        this.spacebarJustPressed = false;
      }
  }

  /**
   * Record the player's position to allow Max to follow.
   * @param {number} x - The x-coordinate of the player.
   * @param {number} y - The y-coordinate of the player.
   */
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

  /**
   * Move Max to a specific location.
   * @param {number} targetX - The target x-coordinate.
   * @param {number} targetY - The target y-coordinate.
   */
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

  /**
   * Toggle Max's following behavior.
   * @param {boolean} bool - Whether Max should follow.
   */
  setFollowing(bool: boolean) {
    if (this.isFollowing != bool) {
      this.dialogQueue = DIALOGUE.Intro; 
      this.updateSign();
    }
    this.isFollowing = bool;
  }

  /**
   * Get Max's following status.
   * @returns {boolean} Whether Max is following.
   */
  public getFollowing() {
    return this.isFollowing;
  }

  /**
   * Create a text sign for dialog.
   * @param {string} text - The text content for the sign.
   */
  createSign(text: string) {
    const screenCenterX = this.scene.cameras.main.width / 2;
    const screenCenterY = this.scene.cameras.main.height - (this.scene.cameras.main.height / 8);
    const padding = 20; // Padding around the text
    const signWidth = 600;  
    
    // Create signRect at the screen center
    this.signRect = this.scene.add.rectangle(screenCenterX, screenCenterY, signWidth, 100, 0xffffff)
        .setStrokeStyle(4, 0x000000)
        .setDepth(100)
        .setVisible(true)
        .setScrollFactor(0);
    
    // Create signText at the screen center but align text to the left side
    this.signText = this.scene.add.text(screenCenterX - signWidth / 2 + padding, screenCenterY, `Max: ${text}`, {
        fontFamily: 'PokemonPixel',
        fontSize: '30px',
        color: '#000000',
        align: 'left',  // Align text to left
        wordWrap: { width: signWidth - 2 * padding } // Wrap the text
    })
        .setOrigin(0, 0.5)  // Set origin to align left
        .setDepth(101)
        .setVisible(true)
        .setScrollFactor(0);

    // Calculate the dynamic height based on the text height
    const dynamicHeight = this.signText.height + 2 * padding;
  
    // Update the signRect height dynamically
    this.signRect.setSize(signWidth, dynamicHeight);
  }

  /**
   * Set the visibility of the text sign.
   * @param {boolean} visible - Whether the sign should be visible.
   */
  setSignVisibility(visible: boolean) {
    if (visible) {
      this.signText.setVisible(true);
      this.signRect.setVisible(true);
    } else {
      this.signText.setVisible(false);
      this.signRect.setVisible(false);
  
      // Destroy text and rect contents
      this.signText.destroy();
      this.signRect.destroy();
  
      // Nullify the references
      this.signText = null;
      this.signRect = null;
    }
  }
  
  /**
   * Update the dialog sign.
   */
  updateSign() {
    if (this.signRect && this.signText) this.setSignVisibility(false);
    if (this.dialogQueue.length > 0) {
      this.currentDialog = this.dialogQueue.shift()!;
      this.createSign(this.currentDialog);
    }
  }
}
