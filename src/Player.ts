import Phaser from 'phaser';
import PlayerData from './PlayerData';
import Max from './Max';

const TILE_WIDTH = 32;
const VELOCITY_EPSILON = 1e-2; // velocity close to zero
const enum MOVEMENT_DIRECTION {
    Up = 1,
    Down,
    Left,
    Right,
}
const WALK_SPEED = 80; // pixels/second travel, used in moveTo
const MID_SPEED = 110;
const RUN_SPEED = 140;

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private target: Phaser.Math.Vector2;
    private direction: MOVEMENT_DIRECTION;  
    private playerData: PlayerData;
    public canMove = true; // false if sidebar etc is open
    protected max?: Max;

    constructor(scene: Phaser.Scene, x: number, y: number, playerData: PlayerData) {
        super(scene, x, y, 'player');

        // Add this entity to the scene's physics
        this.scene.physics.world.enable(this);
        // Add this entity to the scene's update list
        this.scene.add.existing(this);
        scene.physics.add.existing(this);

        // Initialize the cursor keys
        this.cursorKeys = this.scene.input.keyboard.createCursorKeys();

        // Initialize the target
        this.target = new Phaser.Math.Vector2(this.x, this.y);
        this.playerData = playerData;
        this.direction = this.playerData.getDirection() || MOVEMENT_DIRECTION.Up;

        // Add an animation complete event listener
        this.on('animationcomplete', this.animComplete, this);

        // this.createMax();
    }

    private snapToGrid(coord: number): number {
        const halfTile = TILE_WIDTH / 2;
        return Math.round((coord + halfTile) / TILE_WIDTH) * TILE_WIDTH - halfTile;
    }

    private animComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        // Add logic to revert to standing animation
        if (animation.key.startsWith('player_walk')) {
            switch (this.direction) {
                case MOVEMENT_DIRECTION.Up:
                    this.anims.play('player_stand_up', true);
                    break;
                case MOVEMENT_DIRECTION.Down:
                    this.anims.play('player_stand_down', true);
                    break;
                case MOVEMENT_DIRECTION.Left:
                    this.anims.play('player_stand_left', true);
                    break;
                case MOVEMENT_DIRECTION.Right:
                    this.anims.play('player_stand_right', true);
                    break;
            }
        }
    }
    

    update() {
        // Snap to grid if velocity is low and not at the target
        if (Math.abs(this.body.velocity.x) <= VELOCITY_EPSILON &&
            Math.abs(this.body.velocity.y) <= VELOCITY_EPSILON) {
            
            this.x = this.snapToGrid(this.x);
            this.y = this.snapToGrid(this.y);
            this.target.x = this.x;
            this.target.y = this.y;
            this.body.reset(this.x, this.y);
        }

        // Check if animation is currently playing
        if (this.anims.currentAnim && this.anims.currentAnim.key.startsWith('player_walk')) {
            return;
        }
        // used for movement checking only (so that no diagonal)
        var directionLocal = 0

        // So that player doesn't get caught between tiles
        let modTargetX = (this.target.x % TILE_WIDTH) - (TILE_WIDTH / 2);
        let modTargetY = (this.target.y % TILE_WIDTH) - (TILE_WIDTH / 2);

        // Standing sprite if no movement
        if (this.target.x === this.x && this.target.y === this.y) {
            switch (this.direction) {  
                case MOVEMENT_DIRECTION.Up:
                    this.anims.play('player_stand_up', true);
                    break;
                case MOVEMENT_DIRECTION.Down:
                    this.anims.play('player_stand_down', true);
                    break;
                case MOVEMENT_DIRECTION.Left:
                    this.anims.play('player_stand_left', true);
                    break;
                case MOVEMENT_DIRECTION.Right:
                    this.anims.play('player_stand_right', true);
                    break;
                default:
                    break;
            }
        }

        // Check for input and update target if necessary
        if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 1 && this.canMove) {
            if (this.cursorKeys.up?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Up)) {
                this.target.y -= (modTargetY === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetY));
                this.direction = MOVEMENT_DIRECTION.Up;
                directionLocal = MOVEMENT_DIRECTION.Up;
                this.anims.play('player_up', true);
                this.playerData.setActive(true);
            } else if (this.cursorKeys.down?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Down)) {
                this.target.y += (modTargetY === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetY));
                this.direction = MOVEMENT_DIRECTION.Down;
                directionLocal = MOVEMENT_DIRECTION.Down;
                this.anims.play('player_down', true);
                this.playerData.setActive(true);
            }

            if (this.cursorKeys.left?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Left)) {
                this.target.x -= (modTargetX === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetX));
                this.direction = MOVEMENT_DIRECTION.Left;
                directionLocal = MOVEMENT_DIRECTION.Left;
                this.anims.play('player_left', true);
                this.playerData.setActive(true);
            } else if (this.cursorKeys.right?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Right)) {
                this.target.x += (modTargetX === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetX));
                this.direction = MOVEMENT_DIRECTION.Right;
                directionLocal = MOVEMENT_DIRECTION.Right;
                this.anims.play('player_right', true);
                this.playerData.setActive(true);
            }
        }

        /// Move towards target
        this.scene.physics.moveTo(this, this.target.x, this.target.y, MID_SPEED);

        if (this.max) {
            // Record player position for Max to follow
            this.max.recordPlayerPosition(this.target.x, this.target.y);
            
            // Update Max's position
            this.max.update();
        } 

        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        if (distance < TILE_WIDTH / 8) { // Adjust this distance as needed
            this.setPosition(this.target.x, this.target.y);
            this.body.reset(this.target.x, this.target.y);
        }
    }

    getDirection(): number {
        return this.direction;
    }

    // public createMax() {
    //     this.max = new Max(this.scene, this.x, this.y, 'maxTexture', this);
    //   }

    public setMax(max: Max) {
        this.max = max;
    }
}