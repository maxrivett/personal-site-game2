import GameSceneBase from '../GameSceneBase';
import NPC from '../NPC';

const ZONE = "zone1";

export default class GameScene1 extends GameSceneBase {
    constructor() {
        super('GameScene1', ZONE);
    }

    create(data: any) {
        super.create(data);

        const npc1 = new NPC(this, 1520, 1520, 'guy', 0, "Welcome to Zone 1!", this.player, 0, 0, 0, 0);
        const npc2 = new NPC(this, 1620, 1620, 'cynthia', 0, "You're still in Zone 1!", this.player, 1600, 1700, 1600, 1700);
        const npc3 = new NPC(this, 1570, 1620, 'cynthia', 2, "I don't rotate :(", this.player, 0, 0, 0, 1);

        this.addNPC(npc1);
        this.addNPC(npc2);
        this.addNPC(npc3);

        this.makeAnimations('guy');
        this.makeAnimations('cynthia');
    }
}
