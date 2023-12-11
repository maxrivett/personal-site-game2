import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC'

const ZONE = "highschool/building1";
const SOUNDTRACK = "";


export default class HighSchoolBuildingScene extends GameSceneBase {
    constructor() {
        super('HighSchoolBuildingScene', ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 528, 144, 'mom', 3, "Max was a good student!", this.player, 431, 561, 112, 144);
        const npc2 = new NPC(this, 272, 400, 'fat', 3, "Wow these tiles are ugly!", this.player, 0, 0, 0, 1);
        const npc3 = new NPC(this, 272, 368, 'fat', 3, "Yeah Max really has to update this...", this.player, 0, 0, 0, 1);

        this.addNPC(npc1);
        this.addNPC(npc2);
        this.addNPC(npc3);

        this.makeAnimations('mom');
        this.makeAnimations('fat');
    }
}