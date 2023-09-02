import Phaser from 'phaser';
import Player from './Player';
import PlayerData from './PlayerData';
import Sign from './interactive/sign'; 
import BigSign from './interactive/bigsign'; 
import NPC from './NPC'; 

const TILE_WIDTH = 32;
const PLAYER_SPRITE = "guy"; // change later
const MAP_MAX_WIDTH = 800;
const MAP_MAX_HEIGHT = 600;

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

    constructor(sceneKey: string, zone: string) {
        super({ key: sceneKey });
        this.zone = zone;
    }

    public get Player() {
        return this.player;
    }

    init(data: { playerData: PlayerData }) {
        this.playerData = data.playerData;
    }

    preload() {
        // Preload assets here
        this.preloadResources();
    }

    create(data: any) {
        this.playerData = data.playerData;
        this.physics.world.debugGraphic.visible = false; // debug graphics        

        // (this.plugins.get('PhaserSceneWatcherPlugin') as any).watchAll();
        this.makeAnimations();

        // Create game entities here

        const map = this.make.tilemap({ key: `map_${this.zone}` });
        const tileset = map.addTilesetImage("tileset", "tiles");

        // Layers
        const groundLayer = map.createLayer("Ground", tileset, 0, 0);
        const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
        const worldLayer = map.createLayer("World", tileset, 0, 0);
        const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

        // for collisions
        worldLayer.setCollisionBetween(1, 21000, true); // adding collisions for all tiles in the world layer   

        const objectLayer = map.getObjectLayer('Objects');
        this.signs = [];
        this.showingSign = false;
        this.bigSigns = [];
        this.showingBigSign = false;
        let pastScene = this.playerData.getPastScene();

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
                    const spawnx = obj.x, spawny = obj.y;
                    if (!this.playerData.isActive()) { // meaning they just loaded into the game
                        const { x, y } = this.playerData.getPosition();
                        this.player = new Player(this, x, y, this.playerData); // create a new Player entity at last save
                        this.playerData.setActive(true);
                    } else {
                        this.player = new Player(this, spawnx, spawny, this.playerData); // create a new Player entity at spawn
                    }
                }
            }
            if (obj.type === 'bigSign') {
                const myBigSign = new BigSign(this, obj.x, obj.y, obj.width, obj.height, obj.properties[0].value, this.player);
                this.bigSigns.push(myBigSign);
            }
        });

        aboveLayer.setDepth(10) // make sure above player

        // enable physics for the player sprite
        this.physics.add.existing(this.player, false); // make true to show the box
        // for collisions
        this.physics.add.collider(this.player, worldLayer);

        // Calculate offsets for centering
        let offsetX = map.widthInPixels < MAP_MAX_WIDTH ? (MAP_MAX_WIDTH - map.widthInPixels) / 2 : 0;
        let offsetY = map.heightInPixels < MAP_MAX_HEIGHT ? (MAP_MAX_HEIGHT - map.heightInPixels) / 2 : 0;
        // Camera to follow player around
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(-offsetX, -offsetY, map.widthInPixels, map.heightInPixels); 
        // Set the camera position to the center of the scene
        this.cameras.main.setScroll(offsetX, offsetY);
        this.cameras.main.setBackgroundColor('#888888');
    }

    
    /**
     * Update function that is called once per frame.
     * 
     * @param time The current time. Can be used for timing events.
     * @param delta The delta time in ms since the last frame. Can be used for frame rate independent timing.
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

    
    // Player animation
    makeAnimations() {
        // Sprite animations
        if (!this.anims.exists('up')) { // Check if the animation already exists before creating it
            this.anims.create({
                key: 'up',
                frames: [
                    { key: 'player', frame: 0 },
                    { key: 'player', frame: 10 },
                    { key: 'player', frame: 0 },
                    { key: 'player', frame: 2 },
                ],
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists('right')) {
            this.anims.create({
                key: 'right',
                frames: [
                    { key: 'player', frame: 1 },
                    { key: 'player', frame: 4 },
                    { key: 'player', frame: 1 },
                    { key: 'player', frame: 7 },
                ],
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('down')) {
            this.anims.create({
                key: 'down',
                frames: [
                    { key: 'player', frame: 5 },
                    { key: 'player', frame: 8 },
                    { key: 'player', frame: 5 },
                    { key: 'player', frame: 11 },
                ],
                frameRate: 10,
                repeat: -1
            });
        }
        
        if (!this.anims.exists('left')) {
            this.anims.create({
                key: 'left',
                frames: [
                    { key: 'player', frame: 6 },
                    { key: 'player', frame: 3 },
                    { key: 'player', frame: 6 },
                    { key: 'player', frame: 9 },
                ],
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('stand_left')) {
            this.anims.create({
                key: 'stand_left', frames: [ { key: 'player', frame: 6 }, ], frameRate: 10, repeat: -1
            });
        }
        if (!this.anims.exists('stand_right')) {
            this.anims.create({
                key: 'stand_right', frames: [ { key: 'player', frame: 1 }, ], frameRate: 10, repeat: -1
            });
        }
        if (!this.anims.exists('stand_up')) {
            this.anims.create({
                key: 'stand_up', frames: [ { key: 'player', frame: 0 }, ], frameRate: 10, repeat: -1
            });
        }
        if (!this.anims.exists('stand_down')) {
            this.anims.create({
                key: 'stand_down', frames: [ { key: 'player', frame: 5 }, ], frameRate: 10, repeat: -1
            });
        }
    }

    /**
     * Adds an NPC to the scene. Function called in GameScene#.ts
     * 
     * @param npc the NPC to be added
     */
    addNPC(npc: NPC) {
        this.npcs.push(npc);
    }

    /**
     * Empty NPC list; used before changing scenes.
     */
    clearNPCs() {
        while (this.npcs.length > 0) { // loop through all NPCs and pop
            this.npcs.pop();
        }        
    }

    /**
     * Transition from the current scene to the specified target scene.
     *
     * @param targetScene The name of the scene to transition to.
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

    preloadResources() {
        // keys can load only once. This is why we do different keys for all maps (not necessary for tileset since the same for all)
        this.load.image("tiles", "../assets/tiles/tileset.png");
        this.load.tilemapTiledJSON(`map_${this.zone}`, `../assets/tiles/${this.zone}/tilemap.json`);

        // Load sprite sheets
        this.load.spritesheet('player', `../assets/sprites/player/${PLAYER_SPRITE}sheet.png`, { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('npc', `../assets/sprites/player/${PLAYER_SPRITE}sheet.png`, { frameWidth: 32, frameHeight: 32 });

        // Scene Watcher
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); // for font
    }

    
}

