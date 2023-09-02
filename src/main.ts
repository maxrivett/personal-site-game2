import Phaser from 'phaser';
import GameSceneBase from './GameSceneBase';
import BootScene from './scenes/BootScene';
import GameScene1 from './scenes/GameScene1';
import GameScene2 from './scenes/GameScene2';

const config: Phaser.Types.Core.GameConfig = {
    title: 'Max Rivett',
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        },
    },
    scene: [BootScene, GameScene1, GameScene2],
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT, // make the game scale to fit the container
        autoCenter: Phaser.Scale.CENTER_BOTH, // center the game canvas
    },
};

new Phaser.Game(config);