import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "work/car";
const SOUNDTRACK = "";

export default class UniversityScene extends GameSceneBase {
    constructor() {
        super('WorkCarScene',  ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 48, 48, 'fat', 1, "Nate: Cleaning cars sure is a lot of work!", this.player, 0, 0, 0, 1);

        this.addNPC(npc1);

        this.makeAnimations('fat');
    }
}