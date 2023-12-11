import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "university";
const SOUNDTRACK = "sunyshore";

export default class UniversityScene extends GameSceneBase {
    constructor() {
        super('UniversityScene',  ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 336, 732, 'grunt', 8, "Max dislikes making tilemaps, so bear with the poor quality!", this.player, 304, 368, 700, 764);

        this.addNPC(npc1);

        this.makeAnimations('grunt');
    }
}