import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "work";
const SOUNDTRACK = "hearthome";

export default class UniversityScene extends GameSceneBase {
    constructor() {
        super('WorkScene',  ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 560, 464, 'grunt', 1, "Contact Max at maxnrivett@gmail.com", this.player, 0, 0, 0, 1);

        this.addNPC(npc1);

        this.makeAnimations('grunt');
    }
}