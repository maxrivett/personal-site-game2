import Phaser from 'phaser';
import GameSceneBase  from '../GameSceneBase';
import Player from '../Player';

export default class BigSign extends Phaser.GameObjects.Zone {

  private signText: Phaser.GameObjects.Text;
  private signRect: Phaser.GameObjects.Rectangle;
  private clickRadius: number;
  private showByClick: boolean;
  private activated: boolean;

  constructor(scene: GameSceneBase, x: number, y: number, width: number, height: number, text: string, player: Player) {
	super(scene, x, y, width, height);
  
	scene.add.existing(this).setOrigin(0, 0);
	scene.physics.world.enable(this, 1);
  
	const screenCenterX = scene.cameras.main.width / 2;
	const screenCenterY = scene.cameras.main.height / 2;
	const rectWidth = 600;
	const padding = 20; // Padding around the text
	
	// Create signText at the screen center
	this.signText = scene.add.text(screenCenterX, screenCenterY, text, {
	  fontFamily: 'PokemonPixel',
	  fontSize: '40px',
	  color: '#000000',
	  align: 'center',
	  wordWrap: { width: rectWidth - 2*padding } 
	})
	  .setOrigin(0.5, 0.5)
	  .setDepth(111)
	  .setVisible(false)
	  .setScrollFactor(0);
  
	// Calculate the dynamic height based on the text height
	const dynamicHeight = this.signText.height + 2 * padding;
  
	/// Create signRect at the screen center
	this.signRect = scene.add.rectangle(screenCenterX, screenCenterY, rectWidth, dynamicHeight, 0xffffff)
	  .setStrokeStyle(4, 0x000000)
	  .setDepth(110)
	  .setVisible(false)
	  .setScrollFactor(0);
  }
  


	collideSign(player: any): void {
		this.showSignText();
	}

	showSignText(): void {
		this.signRect.setVisible(true);
		this.signText.setVisible(true);
		(this.scene as any).showingBigSign = true;  // A property of the scene, see BaseScene's update
		this.activated = true;
	}

	hideSignText(): void {
		this.signRect.setVisible(false);
		this.signText.setVisible(false);
		this.showByClick = false;
		(this.scene as any).showingBigSign = false;  // A property of the scene, see BaseScene's update
		this.activated = false;
	}

	checkPlayerPosition(player: Player): void {
		const playerBounds = player.getBounds(); // Assuming player.getBounds() gives you a Phaser.Geom.Rectangle or similar
		const signBounds = this.getBounds();

		if (Phaser.Geom.Rectangle.Overlaps(playerBounds, signBounds)) {
		  this.showSignText();
		} else {
		  this.hideSignText();
		}
	  }

}