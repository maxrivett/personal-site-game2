import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC'

const ZONE = "transition1";
const SOUNDTRACK = "";

export default class TransitionScene1 extends GameSceneBase {
    constructor() {
        super('TransitionScene1',  ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 112, 240, 'border', 1, "Head upwards to learn about Max's time in high school...", this.player, 0, 0, 0, 1);

        this.addNPC(npc1);

        this.makeAnimations('border');
    }
}