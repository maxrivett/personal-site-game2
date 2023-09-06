import Phaser from 'phaser';
import GameSceneBase  from '../GameSceneBase';
import Player from '../Player';

export default class Sign extends Phaser.GameObjects.Zone {

  private direction: string;
  private signText: Phaser.GameObjects.Text;
  private signRect: Phaser.GameObjects.Rectangle;
  private clickRadius: number;
  private showByClick: boolean;
  private activated: boolean;

  constructor(scene: GameSceneBase, x: number, y: number, width: number, height: number, text: string, player: Player) {
    super(scene, x, y, width, height);

    scene.add.existing(this).setOrigin(0, 0);
    scene.physics.world.enable(this, 1);

	
    
	// Create signText first
	this.signText = scene.add.text(Math.round(x), Math.round(y), text, {
		fontFamily: 'PokemonPixel',
		fontSize: '16px',
		color: '#000000'
	})
	.setOrigin(0.5, 0.5)
	.setDepth(101)
	.setVisible(false);

	// Calculate center of the sign
	let signCenterX = x + width / 2;

	// Calculate offsets
	let offsetY = -this.signText.height - 10;  // 10 is padding, adjust as needed
	let offsetX = 0;  // no need for offsetX as we're already setting it to the sign's center

	// Move signText based on calculated offsets
	this.signText.setX(Math.round(signCenterX));  // set to sign's center
	this.signText.setY(Math.round(y + offsetY));  // set above the sign

	// Create signRect based on same offsets
	this.signRect = scene.add.rectangle(Math.round(signCenterX), Math.round(y + offsetY), this.signText.width + 10, this.signText.height, 0xffffff)
	.setStrokeStyle(1, 0x000000)
	.setOrigin(0.5, 0.5)  // setting origin to the center
	.setDepth(100)
	.setVisible(false);


  }

	collideSign(player: any): void {
		this.showSignText();
	}

	showSignText(): void {
		this.signRect.setVisible(true);
		this.signText.setVisible(true);
		(this.scene as any).showingSign = true;  // A property of the scene, see BaseScene's update
		this.activated = true;
	}

	hideSignText(): void {
		this.signRect.setVisible(false);
		this.signText.setVisible(false);
		this.showByClick = false;
		(this.scene as any).showingSign = false;  // A property of the scene, see BaseScene's update
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