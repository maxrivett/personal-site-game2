import Phaser from 'phaser';
import { GameScene } from './GameSceneBase';

const SPEED = 110; // same speed as player
const TILE_WIDTH = 16; // tile width is really 32px but want him in middle of tile

// All of Max's dialogue, key is the time for him to say it
const INITIAL_DIALOGUE = ["Hi there! (Hit the spacebar to advance my text.)", "I'm going to follow you and tell you about myself along the way. Let's get out of this room and start exploring!"];
const DIALOGUE: { [key : string]: string[] } = {
    "ChildhoodScene": ["I was born and raised in Toronto, Canada.", "I have since moved down to San Diego for school.", "There are some balloons just south of my childhood home that you should stand on!"],
    "ChildhoodBuildingScene": ["When you see balloons, stand on top of them to learn about me!"],
    "TransitionScene1": ["Let's keep heading up."],
    "HighSchoolScene": ["Try to talk to as many people as you can!", "They all have something important to say.", "Well maybe not all of them..."],
    "HighSchoolBuildingScene": ["High School was a lot of fun!", "Got to take a wide variety of classes and learnt a lot.", "Well I guess that's just school in general..."],
    "TransitionScene2": ["This website is a constant work-in-progess.", "Come back soon and you'll see more characters walking around!", "And who knows what else!"],
    "UniversityScene": ["Isn't it beautiful here!", "Let's go check out the university."],
    "UniversityBuildingScene": ["UCSD has been a blast!", "I love the CS classes, and get to take a bunch of neat electives.", "Last semester I took a full course on Weapons of Mass Destruction! (POLI 142D)"],
    "TransitionScene3": ["Isn't computer programming so interesting...", "The possibilities are endless!"],
    "WorkScene": ["Let's check out this truck here and then the buildings!"],
    "WorkCarScene": ["Funny enough, I'm not even a \"car guy\"!"],
    "WorkBuildingScene": ["Prepare for walls of text!", "There are pros and cons to gamifying a personal website..."]

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
  private spacebarJustPressed: boolean = false;  
  private gameScene: GameScene;

  /**
   * Create a Max character.
   * @param {Phaser.Scene} scene - The scene to which Max belongs.
   * @param {number} x - The x-coordinate of Max.
   * @param {number} y - The y-coordinate of Max.
   * @param {string} texture - The texture to be used for Max.
   * @param {Phaser.GameObjects.Sprite} target - The target sprite that Max will follow.
   */
  constructor(scene: Phaser.Scene, gameScene: GameScene, x: number, y: number, texture: string, target: Phaser.GameObjects.Sprite) {
    super(scene, x, y, texture);
    this.target = target;
    this.scene = scene;
    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.cursorKeys = this.scene.input.keyboard.createCursorKeys(); 
    this.gameScene = gameScene;
    setTimeout(() => {
      this.sayDialogue(this.scene);
    }, 1500);
    this.gameScene.maxIsFollowing = true;
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
      //play sound if there is text on the screen
        if (this.getSignVisibility() === true) {
          this.gameScene.playSoundEffect("button");
        }
        this.setSignVisibility(false);
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
      if (this.scene.scene.key == "ChildhoodRoomScene") {
        this.dialogQueue = INITIAL_DIALOGUE;
        this.updateSign(); // this one line caused me 15 hours of debugging because it was outside of the if statement
      }
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

  public sayDialogue(scene: Phaser.Scene) {
    this.scene = scene;
    if (DIALOGUE[scene.scene.key] === undefined) return;
    this.dialogQueue = this.dialogQueue.concat(DIALOGUE[scene.scene.key]);
    this.updateSign();
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
    if (this.signText && this.signRect) {
      if (visible) {
        this.signText.setVisible(true);
        this.signRect.setVisible(true);
      } else {
          this.signText.setVisible(false);
          this.signRect.setVisible(false);
        
          // Destroy text and rect contents
          // this.signText.destroy();
          // this.signRect.destroy();
        
          // // Nullify the references
          this.signText = null;
          this.signRect = null;
      }
    }
  }

  /**
   * Get the visibility of the text sign.
   * @returns {boolean} Whether the sign is visible.
   */
  getSignVisibility() {
    if (this.signText && this.signRect) {
        return this.signText.visible && this.signRect.visible;
    }
    return false;
  }


  
  /**
   * Update the dialog sign.
   */
  updateSign() {
    if (this.signRect && this.signText) {
      this.signRect = null;
      this.signText = null;
    }
    if (this.dialogQueue.length > 0) {
      const currentDialogue = this.dialogQueue.shift();
      // this.createSign(currentDialogue);
      setTimeout(() => {
        this.createSign(currentDialogue);
      }, 150);
    }
  }
}
