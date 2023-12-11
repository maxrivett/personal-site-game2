import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "childhood";
const SOUNDTRACK = "twinleaf";

export default class ChildhoodScene extends GameSceneBase {
    constructor() {
        super('ChildhoodScene', ZONE, SOUNDTRACK);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 624, 624, 'fat', 3, "Hello and welcome!", this.player, 560, 656, 560, 656);
        const npc2 = new NPC(this, 464, 464, 'grunt', 3, `If it isn't ${this.playerData.getName()}...`, this.player, 400, 496, 400, 496);

        
        this.addNPC(npc1);
        this.addNPC(npc2);

        this.makeAnimations('fat');
        this.makeAnimations('grunt');
    }
}