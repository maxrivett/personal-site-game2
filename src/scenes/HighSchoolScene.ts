import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "highschool";
const SOUNDTRACK = "jubilife";

export default class HighSchoolScene extends GameSceneBase {
    constructor() {
        super('HighSchoolScene',  ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 368, 976, 'grunt', 3, "Max likes all sorts of music, but has recently been into Ethio-jazz. Check out Hailu Mergia!", this.player, 0, 0, 0, 1);

        this.addNPC(npc1);

        this.makeAnimations('grunt');
    }
}