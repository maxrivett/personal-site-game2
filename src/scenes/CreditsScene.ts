import Phaser from 'phaser';

export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super('CreditsScene');
    }

    create() {
        // Create a text object for each contributor
        const contributors = [
            'Credits',
            'Coding          Max Rivett',
            'Soundtrack      Bla bla bla',
            'Sprites         testerester',
            // Add more contributor names as needed
        ];
    
        // Set the initial vertical position for the credits
        let yPosition = this.cameras.main.height;
    
        // Create and display text objects for each contributor
        contributors.forEach(contributor => {
            const text = this.add.text(
                this.cameras.main.width / 2,
                yPosition,
                contributor,
                {
                    fontFamily: 'PokemonPixel',
                    fontSize: '30px',
                    color: '#ffffff',
                }
            );
    
            // Center the text horizontally
            text.setOrigin(0.5, 0);
    
            // Animate the text to scroll upward
            this.tweens.add({
                targets: text,
                y: -100, // Adjust this value for the desired scrolling speed
                duration: 8000, // Adjust this value for the duration of the scroll
                ease: 'Linear',
                onComplete: () => {
                    // Remove the text when it goes off-screen
                    text.destroy();
                },
            });
    
            // Increase the vertical position for the next contributor
            yPosition += text.height + 10; // Add text height + some spacing
        });
    }
}
