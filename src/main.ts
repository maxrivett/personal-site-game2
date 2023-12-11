import Phaser from 'phaser';
import GameSceneBase from './GameSceneBase';
import BootScene from './scenes/BootScene';
import GameScene1 from './scenes/GameScene1';
import HighSchoolBuildingScene from './scenes/HighSchoolBuildingScene';
import ChildhoodBuildingScene from './scenes/ChildhoodBuildingScene';
import GameScene4 from './scenes/UniversityScene';
import GameScene5 from './scenes/GameScene5';
import ChildhoodRoomScene from './scenes/ChildhoodRoomScene';
import ChildhoodScene from './scenes/ChildhoodScene';
import TransitionScene1 from './scenes/TransitionScene1';
import HighSchoolScene from './scenes/HighSchoolScene';
import TransitionScene2 from './scenes/TransitionScene2';
import UniversityScene from './scenes/UniversityScene';
import UniversityBuildingScene from './scenes/UniversityBuildingScene';
import TransitionScene3 from './scenes/TransitionScene3';
import WorkScene from './scenes/WorkScene';
import WorkBuildingScene from './scenes/WorkBuildingScene';
import WorkCarScene from './scenes/WorkCarScene';
import IntroScene from './scenes/IntroScene';
import CreditsScene from './scenes/CreditsScene';

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
    // scene: [BootScene, GameScene1, GameScene2, GameScene3, GameScene4, GameScene5, GameScene6],
    scene: [BootScene, IntroScene, ChildhoodScene, ChildhoodBuildingScene, ChildhoodRoomScene, TransitionScene1, HighSchoolScene, HighSchoolBuildingScene, TransitionScene2, UniversityScene, UniversityBuildingScene, TransitionScene3, WorkScene, WorkBuildingScene, WorkCarScene, CreditsScene],
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT, // make the game scale to fit the container
        autoCenter: Phaser.Scale.CENTER_BOTH, // center the game canvas
    },
};

new Phaser.Game(config);