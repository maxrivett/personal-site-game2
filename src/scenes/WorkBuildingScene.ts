import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "work/building";
const SOUNDTRACK = "";

export default class UniversityScene extends GameSceneBase {
    constructor() {
        super('WorkBuildingScene',  ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 368, 368, 'fat', 1, "Did you know that Max also writes for the UCSD Guardian?", this.player, 336, 432, 336, 398);

        this.addNPC(npc1);

        this.makeAnimations('fat');
    }
}