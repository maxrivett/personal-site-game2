import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "childhood/building1";
const SOUNDTRACK = "";


export default class ChildhoodBuildingScene extends GameSceneBase {
    constructor() {
        super('ChildhoodBuildingScene', ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 272, 240, 'mom', 2, "Max is probably in his room...", this.player, 240, 336, 240, 304);

        this.addNPC(npc1);

        this.makeAnimations('mom');
    }

}