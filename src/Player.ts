import Phaser from 'phaser';
import PlayerData from './PlayerData';
import Max from './Max';

const TILE_WIDTH = 32;
const VELOCITY_EPSILON = 1e-2; // velocity close to zero

/**
 * Enum for movement direction
 * @readonly
 * @enum {number}
 */
const enum MOVEMENT_DIRECTION {
    Up = 1,
    Down,
    Left,
    Right,
}
const WALK_SPEED = 80; // pixels/second travel, used in moveTo
const MID_SPEED = 110;
const RUN_SPEED = 140;

/**
 * Player class extends Phaser's sprite for Arcade physics
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private target: Phaser.Math.Vector2;
    private direction: MOVEMENT_DIRECTION;  
    private playerData: PlayerData;
    public canMove = true; // false if sidebar etc is open
    protected max?: Max;

    /**
     * @constructor
     * @param {Phaser.Scene} scene - The scene that owns this sprite.
     * @param {number} x - The horizontal coordinate relative to the scene.
     * @param {number} y - The vertical coordinate relative to the scene.
     * @param {PlayerData} playerData - The data model for player info.
     */
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
    }

    /**
     * Snap the coordinates to the grid
     * @param {number} coord - The coordinate to snap.
     * @returns {number} The snapped coordinate.
     */
    private snapToGrid(coord: number): number {
        const halfTile = TILE_WIDTH / 2;
        return Math.round((coord + halfTile) / TILE_WIDTH) * TILE_WIDTH - halfTile;
    }

    /**
     * Animation complete event handler.
     * Reverts to standing animation after walking animation completes.
     * @param {Phaser.Animations.Animation} animation - The completed animation.
     * @param {Phaser.Animations.AnimationFrame} frame - The last animation frame.
     */
    private animComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
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

    /**
     * Update method called on every frame
     */
    update() {
        if (this.max) {
            if (!this.max.getFollowing()) {
                const dx = Math.abs(this.x - this.max.x);
                const dy = Math.abs(this.y - this.max.y);
                if (dx < 33 && dy < 33) {
                    this.max.setFollowing(true);
                    this.playerData.setMaxFollowing(true);
                    
                }
            }
        }
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
                this.playerData.setLastDirection(MOVEMENT_DIRECTION.Up);
            } else if (this.cursorKeys.down?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Down)) {
                this.target.y += (modTargetY === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetY));
                this.direction = MOVEMENT_DIRECTION.Down;
                directionLocal = MOVEMENT_DIRECTION.Down;
                this.anims.play('player_down', true);
                this.playerData.setActive(true);
                this.playerData.setLastDirection(MOVEMENT_DIRECTION.Down);
            }

            if (this.cursorKeys.left?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Left)) {
                this.target.x -= (modTargetX === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetX));
                this.direction = MOVEMENT_DIRECTION.Left;
                directionLocal = MOVEMENT_DIRECTION.Left;
                this.anims.play('player_left', true);
                this.playerData.setActive(true);
                this.playerData.setLastDirection(MOVEMENT_DIRECTION.Left);
            } else if (this.cursorKeys.right?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Right)) {
                this.target.x += (modTargetX === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetX));
                this.direction = MOVEMENT_DIRECTION.Right;
                directionLocal = MOVEMENT_DIRECTION.Right;
                this.anims.play('player_right', true);
                this.playerData.setActive(true);
                this.playerData.setLastDirection(MOVEMENT_DIRECTION.Right);
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
        if (distance < TILE_WIDTH / 8) { 
            this.setPosition(this.target.x, this.target.y);
            this.body.reset(this.target.x, this.target.y);
        }
    }

    /**
     * Get the current direction of the player.
     * @returns {number} The current direction.
     */
    getDirection(): number {
        return this.direction;
    }

    /**
     * Assign Max, the follower, to the player.
     * @param {Max} max - The Max entity.
     * @param {boolean} following - Is Max following the player?
     */
    public setMax(max: Max, following: boolean) {
        this.max = max;
        this.max.setFollowing(following);
    }

    public getMax() {
        return this.max;
    }
}