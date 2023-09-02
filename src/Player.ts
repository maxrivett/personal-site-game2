import Phaser from 'phaser';
import PlayerData from './PlayerData';

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
    }

    update() {
        // If the player isn't moving and should be, reset target (so that doesn't get stuck to objects)
        if (Math.abs(this.body.velocity.x) <= VELOCITY_EPSILON &&
            Math.abs(this.body.velocity.y) <= VELOCITY_EPSILON &&
            (this.x !== this.target.x || this.y !== this.target.y)) {
            this.target.x = this.x;
            this.target.y = this.y;
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
                    this.anims.play('stand_up', true);
                    break;
                case MOVEMENT_DIRECTION.Down:
                    this.anims.play('stand_down', true);
                    break;
                case MOVEMENT_DIRECTION.Left:
                    this.anims.play('stand_left', true);
                    break;
                case MOVEMENT_DIRECTION.Right:
                    this.anims.play('stand_right', true);
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
                this.anims.play('up', true);
                this.playerData.setActive(true);
            } else if (this.cursorKeys.down?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Down)) {
                this.target.y += (modTargetY === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetY));
                this.direction = MOVEMENT_DIRECTION.Down;
                directionLocal = MOVEMENT_DIRECTION.Down;
                this.anims.play('down', true);
                this.playerData.setActive(true);
            }

            if (this.cursorKeys.left?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Left)) {
                this.target.x -= (modTargetX === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetX));
                this.direction = MOVEMENT_DIRECTION.Left;
                directionLocal = MOVEMENT_DIRECTION.Left;
                this.anims.play('left', true);
                this.playerData.setActive(true);
            } else if (this.cursorKeys.right?.isDown && (directionLocal == 0 || directionLocal == MOVEMENT_DIRECTION.Right)) {
                this.target.x += (modTargetX === 0) ? TILE_WIDTH : (TILE_WIDTH - Math.abs(modTargetX));
                this.direction = MOVEMENT_DIRECTION.Right;
                directionLocal = MOVEMENT_DIRECTION.Right;
                this.anims.play('right', true);
                this.playerData.setActive(true);
            }
        }

        // Move towards target
        this.scene.physics.moveTo(this, this.target.x, this.target.y, MID_SPEED);

        // If close enough to target, snap position to target
        if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 1) {
            this.setPosition(this.target.x, this.target.y);
            this.body.reset(this.target.x, this.target.y);
        }
    }

    getDirection(): number {
        return this.direction;
    }
}