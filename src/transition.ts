import { Container, Sprite } from "pixi.js";
import { BugShip, DeeponeShip, HumanShip, RobotShip, Ship } from "./ship.js";
import { Trader } from "./trader.js";
import { Bundle } from "./resources.js";

export class TransitionWarp {
    node: Container = new Container();
    ship: Ship;
    bg: Sprite;

    constructor(race: Trader.Race, type: Ship.Type) {
        switch(race) {
          case Trader.Race.Bug:
            this.ship = new BugShip(type);
            break;
          case Trader.Race.Deepone:
            this.ship = new DeeponeShip(type);
            break;
          case Trader.Race.Human:
            this.ship = new HumanShip(type);
            break;
          case Trader.Race.Robot:
            this.ship = new RobotShip(type);
            break;
          default: throw new Error('Race Error: '+race);
        }
        this.node.addChild(this.bg = new Sprite(Bundle.data?.background));
        this.node.addChild(this.ship?.sprite);
    }

    async play(node: Container) {
        node.addChild(this.node);
        this.ship.sprite.play();
        await new Promise(r => setTimeout(r, this.ship.delay));
        this.ship.animator.play();
        await new Promise(r => setTimeout(r, this.ship.duration));
        node.removeChild(this.node);
    }
}



