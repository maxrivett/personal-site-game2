import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "building2";

export default class GameScene3 extends GameSceneBase {
    constructor() {
        super('GameScene3', ZONE);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 528, 176, 'mom', 3, "Max is probably in his room...", this.player, 431, 561, 143, 241);

        this.addNPC(npc1);

        this.makeAnimations('mom');
    }

}