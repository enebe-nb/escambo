import { Inventory } from "./inventory.js";

export abstract class Player {
    static inventory = new Inventory();
    static hunger: [number, number] = [0, 6];
    static thirst: [number, number] = [0, 3];
    static suffocate: [number, number] = [0, 1];

    static reset() {
        this.inventory.clear();
        this.hunger = [0, 6];
        this.thirst = [0, 3];
        this.suffocate = [0, 1];
    }
}
