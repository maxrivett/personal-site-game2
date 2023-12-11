import GameSceneBase from '../GameSceneBase';

const ZONE = "childhood/building1/room1";
const SOUNDTRACK = "";


export default class ChildhoodRoomScene extends GameSceneBase {
    constructor() {
        super('ChildhoodRoomScene', ZONE, SOUNDTRACK);
    }
}