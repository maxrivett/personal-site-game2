import GameScene from '..src/GameScene';

const ZONE = "zone1";

export default class GameScene1 extends GameSceneBase {
    constructor() {
        super({ key: 'GameScene1', zone: ZONE });
    }
}