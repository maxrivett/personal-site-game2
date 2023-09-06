import Phaser from 'phaser';

const SPEED = 110;
const TILE_WIDTH = 16;

const DIALOGUE: { [key: string]: string[] } = {
    Intro: ["Hi there! (Hit the spacebar to advance my text.)", "I'm going to follow you and tell you about myself along the way. Let's get out of this room and start exploring!"],
    HighSchool: ["Here is ... ", "Yes"]
  };

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


  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, target: Phaser.GameObjects.Sprite) {
    super(scene, x, y, texture);
    this.target = target;
    this.scene = scene;
    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.cursorKeys = this.scene.input.keyboard.createCursorKeys(); 
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
    if (this.cursorKeys.space?.isDown && !this.spacebarJustPressed) {
        console.log("should update");
        this.updateSign();
        this.spacebarJustPressed = true;
      } else if (this.cursorKeys.space?.isUp) {
        this.spacebarJustPressed = false;
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
    if (this.isFollowing != bool) {
      console.log("hereeee");
      this.dialogQueue = DIALOGUE.Intro; // Replace with your real dialog
      this.updateSign();
    }
    this.isFollowing = bool;
  }

  public getFollowing() {
    return this.isFollowing;
  }

  createSign(text: string) {
    const screenCenterX = this.scene.cameras.main.width / 2;
    const screenCenterY = this.scene.cameras.main.height - (this.scene.cameras.main.height / 8);
    const padding = 20; // Padding around the text
    const signWidth = 600;  // Increased width
    
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
  
  updateSign() {
    if (this.signRect && this.signText) this.setSignVisibility(false);
    if (this.dialogQueue.length > 0) {
      this.currentDialog = this.dialogQueue.shift()!;
      this.createSign(this.currentDialog);
    }
  }
}
