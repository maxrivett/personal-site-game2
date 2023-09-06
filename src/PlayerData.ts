export default class PlayerData {
    private data: any;
    private storageKey: string = 'playerData'; 

    constructor(playerData: any) {
        this.data = playerData;
    }

    getCurrentScene(): string {
        return this.data.currentScene;
    }

    setCurrentScene(scene: string): void {
        this.data.currentScene = scene;
    }

    getPastScene(): string {
        return this.data.pastScene;
    }

    setPastScene(scene: string): void {
        this.data.pastScene = scene;
    }

    getPosition(): { x: number; y: number } {
        return this.data.position;
    }

    setPosition(x: number, y: number): void {
        this.data.position.x = x;
        this.data.position.y = y;
    }

    isActive(): boolean {
        return this.data.active;
        // return this.data && this.data.active;
    }

    setActive(active: boolean): void {
        this.data.active = active;
    }

    getDirection(): integer {
        return this.data.direction;
    }

    setDirectionString(direction: string): void {
        switch (direction) {
            case ("Up") :
                this.data.direction = 1;
                break;
            case ("Down") :
                this.data.direction = 2;
                break;
            case ("Left") :
                this.data.direction = 3;
                break;
            case ("Right") :
                this.data.direction = 4;
                break;
            default:
                this.data.direction = 1;
                break;               
        }
    }

    setDirectionInteger(direction: integer): void {
        this.data.direction = direction;
    }

    saveData(): void {
        const data = JSON.stringify(this.data);
        localStorage.setItem(this.storageKey, data);
    }

    getName(): string {
        return this.data.name;
    }

    isMaxFollowing(): boolean {
        return this.data.maxIsFollowing;
    }

    setMaxFollowing(isFollowing: boolean): void {
        this.data.maxIsFollowing = isFollowing;
    }
    setLastDirection(direction: number) {
        this.data.lastDirection = direction;
    }
    getLastDirection() {
        return this.data.lastDirection;
    }
}