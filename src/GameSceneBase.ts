import Phaser from 'phaser';
import Player from './Player';
import PlayerData from './PlayerData';
import Sign from './interactive/sign'; 
import BigSign from './interactive/bigsign'; 
import NPC from './NPC'; 
import Max from './Max';

const TILE_WIDTH = 32;
const PLAYER_SPRITE = "barry"; // change later
const MAP_MAX_WIDTH = 800;
const MAP_MAX_HEIGHT = 600;

const MAXS_SCENE = "GameScene6";
const SNOWY_SCENE = "GameScene1";

/**
 * Class representing a game scene.
 * @extends Phaser.Scene
 */
export default class GameScene extends Phaser.Scene {
    protected player?: Player;
    protected npcs: NPC[] = [];
    protected playerData!: PlayerData;
    zone: string;
    public signs: Sign[] = [];
    public bigSigns: BigSign[] = [];
    public showingSign: boolean = false;
    public showingBigSign: boolean = false;
    private isFading: boolean = false;
    private debounce: boolean = false;
    playerPositionQueue: Phaser.Math.Vector2[] = [];
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;

    /**
     * Create a new GameScene instance.
     * @param {string} sceneKey - The unique key used to identify the scene.
     * @param {string} zone - The zone or area within the scene.
     */
    constructor(sceneKey: string, zone: string) {
        super({ key: sceneKey });
        this.zone = zone;
    }

    /**
     * Returns the current player.
     * @returns {Player|undefined} The player object.
     */
    public get Player() {
        return this.player;
    }

    /**
     * Initialize the scene.
     * @param {Object} data - The data object passed from the previous scene.
     */
    init(data: { playerData: PlayerData }) {
        this.playerData = data.playerData;
    }

    /**
     * Preload assets for the scene.
     */
    preload() {
        // Preload assets here
        this.preloadResources();
    }

    /**
     * Create game entities and set up the initial game state.
     * @param {any} data - The data object passed from the previous scene.
     */
    create(data: any) {
        this.playerData = data.playerData;
        this.physics.world.debugGraphic.visible = false; // debug graphics        

        // (this.plugins.get('PhaserSceneWatcherPlugin') as any).watchAll();
        this.makeAnimations('player');
        this.makeAnimations('max');

        // Create game entities here

        const map = this.make.tilemap({ key: `map_${this.zone}` });
        const tileset = map.addTilesetImage("tileset", "tiles");

        // Layers
        const groundLayer = map.createLayer("Ground", tileset, 0, 0);
        const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
        const worldLayer = map.createLayer("World", tileset, 0, 0);
        const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);
        aboveLayer.setDepth(10) // make sure above player

        if (this.scene.key === "GameScene1") {
            const topLayer = map.createLayer("Top Layer", tileset, 0, 0);
            topLayer.setDepth(11); // make sure above other layers
        }

        // for collisions
        worldLayer.setCollisionBetween(1, 21000, true); // adding collisions for all tiles in the world layer   

        const objectLayer = map.getObjectLayer('Objects');
        this.signs = [];
        this.showingSign = false;
        this.bigSigns = [];
        this.showingBigSign = false;

        this.player = new Player(this, 0, 0, this.playerData);
        
        objectLayer.objects.forEach(obj => {
            
            if (obj.type === 'sign') {
                const mySign = new Sign(this, obj.x, obj.y, obj.width, obj.height, obj.properties[0].value, this.player);
                this.signs.push(mySign);
            }
            if (obj.type === 'exit') {
                const exit = this.add.rectangle(obj.x, obj.y, TILE_WIDTH / 2, TILE_WIDTH / 2, 0xff0000, 0);
                this.physics.add.existing(exit, false); // make true to show the box

                // Collide with exit and start the target scene
                this.debounce = false;
                this.physics.add.overlap(this.player, exit, () => {
                    if (this.debounce) return;
                    this.debounce = true;
                    if (!this.isFading) {
                        this.isFading = true;
                        this.transitionScene((obj as any).properties.find((prop: { name: string; }) => prop.name === "targetScene").value);
                    }
                });
            }            
            if (obj.type === 'spawn') {
                // obj.properties[0].value = pastScene
                if (obj.properties[0].value === this.playerData.getPastScene() || !this.playerData.isActive()) {
                    // This is the correct spawn point
                    let xPos = obj.x, yPos = obj.y;
                    if (!this.playerData.isActive()) { // meaning they just loaded into the game
                        const { x, y } = this.playerData.getPosition();
                        xPos = x;
                        yPos = y;
                        this.playerData.setActive(true);
                    }
                    this.player.setPosition(xPos, yPos);
                    if (this.playerData.isMaxFollowing() === true) {
                        let xVal = 0;
                        let yVal = 0;
                        switch (this.playerData.getLastDirection()) {
                            case 1: // up
                                yVal = 32;
                                break;
                            case 2: // down
                                yVal = -32;
                                break;
                            case 3: // left
                                xVal = 32;
                                break;
                            case 4: // right
                                xVal = -32;
                                break;
                            default:
                                break;
                        }
                        const max = new Max(this, xPos + xVal, yPos + yVal, 'max', this.player);
                        this.player.setMax(max, (this.scene.key != MAXS_SCENE));
                    } 
                }
            }
            if (obj.type === 'bigSign') {
                const myBigSign = new BigSign(this, obj.x, obj.y, obj.width, obj.height, obj.properties[0].value, this.player);
                this.bigSigns.push(myBigSign);
            }
            if (obj.type === 'max') {
                this.player.setMax((new Max(this, obj.x, obj.y, 'max', this.player)), (this.scene.key != MAXS_SCENE));
            }
        });


        // enable physics for the player sprite
        this.physics.add.existing(this.player, false); // make true to show the box
        // for collisions
        this.physics.add.collider(this.player, worldLayer);

        // Calculate offsets for centering
        let offsetX = map.widthInPixels < MAP_MAX_WIDTH ? (MAP_MAX_WIDTH - map.widthInPixels) / 2 : 0;
        let offsetY = map.heightInPixels < MAP_MAX_HEIGHT ? (MAP_MAX_HEIGHT - map.heightInPixels) / 2 : 0;
        // Camera to follow player around
        this.cameras.main.startFollow(this.player); //, true, 0.1, 0.1
        this.cameras.main.setBounds(-offsetX, -offsetY, map.widthInPixels, map.heightInPixels); 
        // Set the camera position to the center of the scene
        this.cameras.main.setScroll(offsetX, offsetY);
        this.cameras.main.setBackgroundColor('#000000');

        if (this.scene.key === SNOWY_SCENE) {
            this.snow();
        }
    }

    /**
     * Update function called once per frame.
     * @param {number} time - The current time. Can be used for timing events.
     * @param {number} delta - The delta time in ms since the last frame.
     */
    update(time: number, delta: number): void {
        // Iterate over each sign in the 'signs' array
        // For each sign, check if the player's position meets certain criteria defined in 'checkPlayerPosition'
        this.signs.forEach((sign: Sign) => {
            sign.checkPlayerPosition(this.player);
        });

        // Iterate over each sign in the 'bigSigns' array
        // Similar to 'signs', but potentially for a different type of sign or different criteria
        this.bigSigns.forEach((bigSign: BigSign) => {
            bigSign.checkPlayerPosition(this.player);
        });

        // If the player object exists, call its update function
        // This could handle player animations, movements, or other logic
        if (this.player) {
            this.player.update();
        }

        // If there are one or more NPCs in the 'npcs' array
        if (this.npcs.length > 0) {
            // Iterate over each NPC in the 'npcs' array
            this.npcs.forEach((npc: NPC) => {
                // If the NPC object exists, call its preUpdate function with the current time and delta
                // This could handle NPC movements, AI logic, etc.
                if (npc) {
                    npc.preUpdate(time, delta);
                }
            });
        }
    }
    
    /**
     * Creates animation sequences for a sprite based on provided key.
     * @param {string} spriteKey - The key identifying which sprite to animate.
     */
    makeAnimations(spriteKey: string) {
        const anims = [
            {key: 'up', frames: [0, 10, 0, 2]},
            {key: 'right', frames: [1, 4, 1, 7]},
            {key: 'down', frames: [5, 8, 5, 11]},
            {key: 'left', frames: [6, 3, 6, 9]},
            {key: 'stand_left', frames: [6]},
            {key: 'stand_right', frames: [1]},
            {key: 'stand_up', frames: [0]},
            {key: 'stand_down', frames: [5]}
        ];
    
        for (const anim of anims) {
            const uniqueKey = `${spriteKey}_${anim.key}`;
            if (!this.anims.exists(uniqueKey)) {
                this.anims.create({
                    key: uniqueKey,
                    frames: anim.frames.map(frame => ({ key: spriteKey, frame })),
                    frameRate: 7,
                    repeat: 0
                });
            }
        }
    }    

    /**
     * Adds an NPC to the scene.
     * @param {NPC} npc - The NPC to be added to the scene.
     */
    addNPC(npc: NPC) {
        this.npcs.push(npc);
    }

    /**
     * Removes all NPCs from the scene.
     */
    clearNPCs() {
        while (this.npcs.length > 0) { // loop through all NPCs and pop
            this.npcs.pop();
        }        
    }

    /**
     * Handles scene transition logic.
     * @param {string} targetScene - The name of the scene to transition to.
     * @private
     */
    private async transitionScene(targetScene: string) {
        // Check if the target scene exists
        if (targetScene) {
            // Set the player's direction data for the next scene
            this.playerData.setDirectionInteger(this.player.getDirection());
            // Fade out the camera over 1 second (1000 ms) with RGBA color (0, 0, 0, 0)
            // Use a Promise to make sure the fade out is complete before moving on
            await new Promise(resolve => {
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    // Fade out complete; resolve the Promise
                    resolve(null);
                });
            });
            // Fade the camera back in over 1 second with RGBA color (0, 0, 0, 0)
            // Use a Promise to synchronize this block of code
            await new Promise(resolve => {
                this.cameras.main.fadeIn(1000, 0, 0, 0);
                // No event for fade-in completion is set, resolving Promise immediately
                resolve(null);
            });
            // Update the player's past scene to the current scene
            this.playerData.setPastScene(this.playerData.getCurrentScene());
            // Update the player's current scene to the target scene
            this.playerData.setCurrentScene(targetScene);
            // Clear out any existing NPCs in the scene
            this.clearNPCs();
            // Start the new scene and pass along the player data
            this.scene.start(targetScene, { playerData: this.playerData });
        }
        // Reset the fading flag
        this.isFading = false;
        // Reset the debounce flag to allow scene transitions again
        this.debounce = false;
    }

    snow() {    
        this.emitter = this.add.particles(0, 0, 'snowflake', {
            x: { min: 0, max: this.scale.width },
            y: 0,
            speed: { min: 50, max: 150 },
            angle: { min: 80, max: 100 },  // Vary the angle slightly
            scale: { min: 0.01, max: 0.02 },
            alpha: { start: 0.5, end: 0 },
            lifespan: { min: 6000, max: 10000 },
            blendMode: 'ADD'
        });
        this.emitter.setScrollFactor(0, 0)
    }


    /**
     * Preloads the necessary resources for the scene.
     */
    preloadResources() {
        // keys can load only once. This is why we do different keys for all maps (not necessary for tileset since the same for all)
        this.load.image("tiles", "../assets/tiles/tileset.png");
        this.load.tilemapTiledJSON(`map_${this.zone}`, `../assets/tiles/${this.zone}/tilemap.json`);
        // Load sprite sheets
        this.load.spritesheet(`player`, `../assets/sprites/player/${PLAYER_SPRITE}sheet.png`, { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('guy', `../assets/sprites/player/guysheet.png`, { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('cynthia', `../assets/sprites/player/cynthiasheet.png`, { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('max', `../assets/sprites/player/maxsheet.png`, { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('mom', `../assets/sprites/player/momsheet.png`, { frameWidth: 32, frameHeight: 32 });
        // Scene Watcher
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); // for font
        
        this.load.image('snowflake', '../assets/sprites/environment/snowflake.png');
    }
}

