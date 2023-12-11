import Phaser from 'phaser';
import PlayerData from '../PlayerData';

export default class IntroScene extends Phaser.Scene {
    public playerData!: PlayerData;
    private professorText: string[];
    private currentTextIndex: number;
    private signText!: Phaser.GameObjects.Text; // Text object for dialogue
    private signRect!: Phaser.GameObjects.Rectangle; // Background rectangle for dialogue
    private choiceSprites: Phaser.GameObjects.Sprite[]; // Sprites for character selection
    private nameInput!: HTMLInputElement; // HTML input element for name input
    soundtrack: string;
    music: Phaser.Sound.BaseSound;
    soundEffect: Phaser.Sound.BaseSound;
    private startText!: Phaser.GameObjects.Text; // Text object for 'Click to begin'
    private professorImage!: Phaser.GameObjects.Image; // Image object for professor
    private tileImage!: Phaser.GameObjects.Image;
    private gameFinished: boolean;
    private outlineSprites: Phaser.GameObjects.Sprite[] = [];


    constructor() {
        super('IntroScene');
        this.professorText = [
            "Welcome to the world of Max!",
            "Are you a boy? Or are you a girl?",
        ];
        this.currentTextIndex = 0;
        this.choiceSprites = [];
        this.gameFinished = false;
    }

    /**
     * Initialize the scene.
     * @param {Object} data - The data object passed from the previous scene.
     */
    init(data: { playerData: PlayerData }) {
        this.playerData = data.playerData;
    }

    preload() {
        // Load assets for the intro scene
        this.load.image('professor', 'assets/sprites/intro/professor.png');
        this.load.image('boy', 'assets/sprites/intro/boy.png');
        this.load.image('girl', 'assets/sprites/intro/girl.png');
        this.load.image('tile','assets/sprites/intro/tile.png');

        this.load.audio('music', ['../assets/audio/intro.mp3', '../assets/audio/intro.ogg']); // childhood
        this.load.audio('doorenter', ['../assets/audio/doorenter.mp3', '../assets/audio/doorenter.ogg']); // work
        this.load.audio('button', ['../assets/audio/button.mp3', '../assets/audio/button.ogg']); // work

    }

    create() {
        this.soundtrack = 'music';
        this.createStartText();

        // Load professor image but keep it hidden initially
        // this.professorImage = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'professor');
        this.professorImage = this.add.image(this.cameras.main.width * 1.5, this.cameras.main.centerY, 'professor');
        this.professorImage.setVisible(false);
        this.professorImage.setDepth(10);
        this.tileImage = this.add.image(this.cameras.main.centerX * 1.05, this.cameras.main.centerY * 1.5, 'tile');
        this.tileImage.setVisible(false);
        this.tileImage.setDepth(-10);

        // Prepare character selection but keep it hidden for now
        this.showCharacterSelection();

        // Prepare the name input field but keep it hidden for now
        this.createNameInputField(); 

        // Start the scene on click
        this.input.once('pointerdown', this.startScene, this);
    }

    createStartText() {
        // Create 'Click to begin' text at the center of the screen
        this.startText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Click to begin', {
            fontFamily: 'PokemonPixel',
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5); // Center the text
        this.tweens.add({
            targets: this.startText,
            alpha: 0,
            ease: 'Cubic.easeOut',  
            duration: 1000,
            repeat: -1,
            yoyo: true,
            // hold: 2500 // Duration to hold at full alpha (adjust as needed)
          });
    }

    startScene() {
        this.playSoundEffect('button');
        // Remove 'Click to begin' text
        this.startText.setVisible(false);
        this.playSoundtrack();

        // Slide in the professor image from the right side
        this.tweens.add({
            targets: this.professorImage,
            x: this.cameras.main.centerX,
            ease: 'Power1',
            duration: 1000,
            onStart: () => {
                // Ensure the professor image is visible as the tween starts
                this.professorImage.setVisible(true);
                this.tileImage.setVisible(true);
            },
            onComplete: () => {
                
                this.beginDialogue();
            }
        });
    }

    beginDialogue() {
        // Display the professor's dialogue in a styled text box
        this.createSign(this.professorText[this.currentTextIndex]);
        // Advance text on click
        this.input.on('pointerdown', this.advanceText, this);
    }

    advanceText() {
         // Check if the game is finished
        if (this.gameFinished) {
            return;
        }
        this.playSoundEffect('button');
        // Advance through the professor's dialogue
        this.currentTextIndex++;
        if (this.currentTextIndex < this.professorText.length) {
            this.updateSign(this.professorText[this.currentTextIndex]);
        } else {
            // Once all dialogue is displayed, show character choices
            this.signRect.setVisible(false);
            this.signText.setVisible(false);
            this.displayChoices();
        }
    }

    showCharacterSelection() {
        // Check if the game is finished
        if (this.gameFinished) {
            return;
        }
        // Create interactive sprites for character selection
        let boySprite = this.add.sprite(200, 300, 'boy').setInteractive();
        let girlSprite = this.add.sprite(600, 300, 'girl').setInteractive();

        boySprite.setVisible(false);
        girlSprite.setVisible(false);

        // boySprite.on('pointerdown', () => this.handleCharacterSelection(true));
        boySprite.on('pointerdown', () => {
            this.handleCharacterSelection(true)
            // Play the button sound effect
            this.playSoundEffect('button');
        }, this);
        // girlSprite.on('pointerdown', () => this.handleCharacterSelection(false));
        girlSprite.on('pointerdown', () => {
            this.handleCharacterSelection(false)
            // Play the button sound effect
            this.playSoundEffect('button');
        }, this);

        this.choiceSprites.push(boySprite, girlSprite);
    }

    displayChoices() {
        this.professorImage.setAlpha(0.3); // Reduce professor's opacity
        this.tileImage.setAlpha(0.3); // Reduce professor's opacity
    
        // Make character choice sprites flicker
        let cnt = 0;
        for (let i = 0; i < this.choiceSprites.length; i++) {
            cnt += this.choiceSprites[i].visible ? 1 : 0;
        }
        if (cnt < this.choiceSprites.length && cnt > 0) {
            return;
        }
        this.showOutlines();

    }
    
    
    
    

    createNameInputField() {
        let gender = this.playerData.getPlayerGender();
        let left = gender ? '60%' : '40%'; 
        // Create an HTML input field for the player's name
        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.placeholder = 'Enter your name'; // Placeholder text
        this.nameInput.maxLength = 25; // Limit the number of characters to 25
        this.nameInput.style.position = 'absolute';
        this.nameInput.style.top = '50%'; // Center vertically
        this.nameInput.style.left = left; // Position horizontally based on gender
        this.nameInput.style.transform = `translateX(-${left})`; // Adjust for centering
        this.nameInput.style.fontFamily = 'PokemonPixel';
        this.nameInput.style.fontSize = '30px';
        this.nameInput.style.padding = '10px';
        this.nameInput.style.display = 'none';
        this.nameInput.style.width = '300px'; // Wider input box
        document.body.appendChild(this.nameInput);
    }
    
    
    handleCharacterSelection(isBoy: boolean) {
        // Update playerData with the chosen gender
        this.playerData.setPlayerGender(isBoy);
    
        // Hide the professor image
        this.professorImage.setVisible(false);
        this.tileImage.setVisible(false);
    
        // Hide the unchosen sprite
        if (isBoy) {
            // If player chose boy, hide the girl sprite
            this.choiceSprites[1].setVisible(false);
        } else {
            // If player chose girl, hide the boy sprite
            this.choiceSprites[0].setVisible(false);
        }

        this.hideOutlines();
    
        // Show the name input field
        this.showNameInput();

        // Set gameFinished to true after this segment
        this.gameFinished = true;
    }
    
    showNameInput() {
        let gender = this.playerData.getPlayerGender();
        let left = gender ? '60%' : '40%'; 
        // Update the sign with instructions for entering the name
        this.updateSign("Please enter your name:");
    
        // Style and display the name input field
        this.nameInput.style.display = 'block';
        this.nameInput.style.top = '50%'; // Center vertically
        this.nameInput.style.left = `${left}`; // Center horizontally
        this.nameInput.style.transform = `translate(-50%, -${left})`; // Adjust for centering
        this.nameInput.focus();
        this.nameInput.onchange = () => this.handleNameInput(this.nameInput.value);
    }
       

    handleNameInput(name: string) {
        // Update playerData with the player's name and transition to the game
        this.playSoundEffect('button');
        this.playerData.setPlayerName(name);
        this.nameInput.style.display = 'none';
        this.choiceSprites.forEach(sprite => sprite.setVisible(false));
        this.choiceSprites.pop();
        this.choiceSprites.pop();
        this.finalMessage();
    }

    finalMessage() {
        this.choiceSprites.forEach(sprite => sprite.setVisible(false));
        this.professorImage.setVisible(true);
        this.professorImage.setAlpha(1);
        this.tileImage.setVisible(true);
        this.tileImage.setAlpha(1);
        let lastLine = `Nice to meet you, ${this.playerData.getName()}! Let's get you into Max's World.`;
        this.updateSign(lastLine);
        this.signRect.setVisible(true);
        this.signText.setVisible(true);
        setTimeout(() => {
            this.stopSoundtrack();
        }, 2900);
        setTimeout(() => {
            this.enterGame();
          }, 4000);
        // Set gameFinished to true after this segment
        this.gameFinished = true;
    }

    enterGame() {
        // Start the main game scene
        this.playSoundEffect('doorenter');
        if (this.playerData) {
            this.transitionScene(this.playerData.getCurrentScene());
            // this.scene.start(this.playerData.getCurrentScene(), { playerData: this.playerData });
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
            // Start the new scene and pass along the player data
            this.scene.start(targetScene, { playerData: this.playerData });
        }
    }

    createSign(text: string) {
        // Create a text sign for dialogue
        const screenCenterX = this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.height - (this.cameras.main.height / 8);

        const padding = 20; // Padding around the text
        const signWidth = 600;

        this.signRect = this.add.rectangle(screenCenterX, screenCenterY, signWidth, 100, 0xffffff)
            .setStrokeStyle(4, 0x000000)
            .setDepth(100)
            .setVisible(true)
            .setScrollFactor(0);

        // Create signText centered on the screen but aligned to the left
        this.signText = this.add.text(screenCenterX - signWidth / 2 + padding, screenCenterY, `Professor: ${text}`, {
            fontFamily: 'PokemonPixel',
            fontSize: '30px',
            color: '#000000',
            align: 'left',
            wordWrap: { width: signWidth - 2 * padding }
        })
            .setOrigin(0, 0.5)
            .setDepth(101)
            .setVisible(true)
            .setScrollFactor(0);

        // Update the signRect height dynamically based on text height
        const dynamicHeight = this.signText.height + 2 * padding;
        this.signRect.setSize(signWidth, dynamicHeight);
    }

    updateSign(newText: string) {
        // Update the text and adjust the size of the signRect
        this.signText.setText(`Professor: ${newText}`);
        const padding = 20;
        const dynamicHeight = this.signText.height + 2 * padding;
        this.signRect.setSize(this.signRect.width, dynamicHeight);
    }

    playSoundtrack() {
        if (this.soundtrack === "") { // no music for the scene
            return;
        }
        this.music = this.sound.add(this.soundtrack, { volume: 0 }); // start with volume at 0
        this.music.play();
    
        // Fade in the volume over fadeInDuration seconds
        const fadeInDuration = 5;
        this.tweens.add({
            targets: this.music,
            volume: {from: 0, to: 1}, // target volume
            duration: fadeInDuration*1000, // 1000 because in ms
            ease: 'Linear'
        });
    }

    playSoundEffect(soundEffect: string) {
        this.soundEffect = this.sound.add(soundEffect);
        this.soundEffect.play();
    }
    
    

    stopSoundtrack() {
        console.log("stopping");
        if (this.music && this.music.isPlaying) {
            const fadeOutDuration = 1; // Duration in seconds for the fade out
    
            // Fade out the volume
            this.tweens.add({
                targets: this.music,
                volume: { from: 1, to: 0 },
                duration: fadeOutDuration * 1000,
                ease: 'Linear',
                onComplete: () => {
                    // Stop the music after the volume has faded out
                    this.music.stop();
                }
            });
        }
    }
    // Function to hide the outlines
    hideOutlines() {
        this.outlineSprites.forEach(outlineSprite => {
            outlineSprite.setVisible(false);
        });
    }

    showOutlines() {
        // Define the outline color (you can change this)
        const outlineColor = 0xb5ffb5; // Green color
    
        // Create an outline sprite for each choice sprite
        this.choiceSprites.forEach(sprite => {
            sprite.setVisible(true);
    
            // Create an outline sprite with the same texture and frame as the player sprite
            const outlineSprite = this.add.sprite(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
            this.outlineSprites.push(outlineSprite);

            // Scale up the outline sprite slightly
            outlineSprite.setScale(1.00); // Adjust the scale factor as needed
    
            // Set the outline sprite's tint to the outline color
            outlineSprite.setTint(outlineColor);
    
            // Create a mask using the player sprite
            const maskGraphics = this.make.graphics();
            maskGraphics.fillStyle(0xb5ffb5); // Green color
            maskGraphics.fillRect(sprite.x - sprite.width / 2, sprite.y - sprite.height / 2, sprite.width, sprite.height);
            const mask = new Phaser.Display.Masks.BitmapMask(this, maskGraphics);
    
            // Apply the mask to the outline sprite
            outlineSprite.setMask(mask);
    
            // Flicker the outline sprite's alpha values
            this.tweens.add({
                targets: outlineSprite,
                alpha: 0, // Set the alpha to 0 to make it disappear
                ease: 'Cubic.easeOut',
                duration: 1000,
                repeat: -1,
                yoyo: true,
                hold: 1000 // Duration to hold at full alpha (adjust as needed)
            });
        });
    }
}
