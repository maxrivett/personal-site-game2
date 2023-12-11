import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "university/building";
const SOUNDTRACK = "";

export default class UniversityScene extends GameSceneBase {
    constructor() {
        super('UniversityBuildingScene',  ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 176, 240, 'guy', 6, "The seats match UCSD's color theme!", this.player, 176, 272, 208, 272);

        this.addNPC(npc1);

        this.makeAnimations('guy');
    }
}