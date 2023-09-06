import Phaser from 'phaser';
import GameSceneBase from './GameSceneBase';
import BootScene from './scenes/BootScene';
import GameScene1 from './scenes/GameScene1';
import GameScene2 from './scenes/GameScene2';
import GameScene3 from './scenes/GameScene3';
import GameScene4 from './scenes/GameScene4';
import GameScene5 from './scenes/GameScene5';
import GameScene6 from './scenes/GameScene6';

const config: Phaser.Types.Core.GameConfig = {
    title: 'Max Rivett',
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    antialias: false,
    render: {
        pixelArt: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        },
    },
    scene: [BootScene, GameScene1, GameScene2, GameScene3, GameScene4, GameScene5, GameScene6],
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT, // make the game scale to fit the container
        autoCenter: Phaser.Scale.CENTER_BOTH, // center the game canvas
    },
};

new Phaser.Game(config);