import { AnimatedSprite, Spritesheet, Texture} from "pixi.js"
import { Bundle } from "./resources.js";
import { Animator, TweenAnimator } from "./animator.js";

export type Ship = {
    textures: Texture[];
    sprite: AnimatedSprite;
    animator: Animator;
    duration: number;
    delay: number;
}

export namespace Ship {
    export enum Type {Incoming, Idle, Outgoing};
}

export class BugShip implements Ship {
    textures: Texture[];
    sprite: AnimatedSprite;
    animator: Animator;
    readonly duration;
    readonly delay;

    constructor(animationType: Ship.Type) {
        const sheet = Bundle.data?.bug as Spritesheet;
        this.textures = [sheet.textures.ship0, sheet.textures.ship1, sheet.textures.ship2, sheet.textures.empty];
        switch(animationType) {
          case Ship.Type.Incoming:
            this.sprite = new AnimatedSprite([
                {texture: this.textures[3], time: 200},
                {texture: this.textures[2], time: 250},
                {texture: this.textures[1], time: 700},
                {texture: this.textures[0], time: 150},
            ], true);
            this.delay = 200; this.duration = 1500;
            this.sprite.updateAnchor = true; this.sprite.loop = false;
            this.animator = new TweenAnimator(this.sprite, {x:75,y:75}, {x:132,y:75}, 1100, Animator.Ease.Out);
            break;
          case Ship.Type.Idle:
            this.delay = 0; this.duration = 700;
            this.sprite = new AnimatedSprite([this.textures[0]]);
            this.animator = new TweenAnimator(this.sprite, {x:132,y:75}, {x:132,y:75}, 0, Animator.Ease.Linear);
            break;
          case Ship.Type.Outgoing:
            this.sprite = new AnimatedSprite([
                {texture: this.textures[0], time: 150},
                {texture: this.textures[1], time: 700},
                {texture: this.textures[2], time: 250},
                {texture: this.textures[3], time: 10},
            ], true);
            this.delay = 0; this.duration = 1500;
            this.sprite.updateAnchor = true; this.sprite.loop = false;
            this.animator = new TweenAnimator(this.sprite, {x:132,y:75}, {x:190,y:75}, 1100, Animator.Ease.In);
            break;
          default: throw Error('wrong anim type');
        }
    }
}

export class DeeponeShip implements Ship {
    textures: Texture[];
    sprite: AnimatedSprite;
    animator: Animator;
    readonly duration;
    readonly delay;

    constructor(animationType: Ship.Type) {
        const sheet = Bundle.data?.deepone as Spritesheet;
        this.textures = [sheet.textures.ship0, sheet.textures.ship1, sheet.textures.ship2, sheet.textures.empty];
        switch(animationType) {
          case Ship.Type.Incoming:
            this.sprite = new AnimatedSprite([
                {texture: this.textures[3], time: 200},
                {texture: this.textures[2], time: 250},
                {texture: this.textures[0], time: 150},
                {texture: this.textures[1], time: 150},
                {texture: this.textures[0], time: 200},
                {texture: this.textures[1], time: 200},
                {texture: this.textures[0], time: 300},
            ], true);
            this.delay = 200; this.duration = 1600;
            this.sprite.updateAnchor = true; this.sprite.loop = false;
            this.animator = new TweenAnimator(this.sprite, {x:75,y:75}, {x:132,y:75}, 1250, Animator.Ease.Out);
            break;
          case Ship.Type.Idle:
            this.delay = 0; this.duration = 700;
            this.sprite = new AnimatedSprite([this.textures[0]]);
            this.animator = new TweenAnimator(this.sprite, {x:132,y:75}, {x:132,y:75}, 0, Animator.Ease.Linear);
            break;
          case Ship.Type.Outgoing:
            this.sprite = new AnimatedSprite([
                {texture: this.textures[0], time: 150},
                {texture: this.textures[1], time: 150},
                {texture: this.textures[0], time: 150},
                {texture: this.textures[1], time: 150},
                {texture: this.textures[0], time: 150},
                {texture: this.textures[2], time: 300},
                {texture: this.textures[3], time: 10},
            ], true);
            this.delay = 0; this.duration = 1500;
            this.sprite.updateAnchor = true; this.sprite.loop = false;
            this.animator = new TweenAnimator(this.sprite, {x:132,y:75}, {x:190,y:75}, 1150, Animator.Ease.In);
            break;
          default: throw Error('wrong anim type');
        }
    }
}

export class HumanShip implements Ship {
    textures: Texture[];
    sprite: AnimatedSprite;
    animator: Animator;
    readonly duration;
    readonly delay;

    constructor(animationType: Ship.Type) {
        const sheet = Bundle.data?.human as Spritesheet;
        this.textures = [sheet.textures.ship0, sheet.textures.ship1, sheet.textures.ship2, sheet.textures.empty];
        switch(animationType) {
          case Ship.Type.Incoming:
            this.sprite = new AnimatedSprite([
                {texture: this.textures[3], time: 200},
                {texture: this.textures[2], time: 250},
                {texture: this.textures[1], time: 700},
                {texture: this.textures[0], time: 150},
            ], true);
            this.delay = 200; this.duration = 1500;
            this.sprite.updateAnchor = true; this.sprite.loop = false;
            this.animator = new TweenAnimator(this.sprite, {x:75,y:75}, {x:132,y:75}, 1100, Animator.Ease.Out);
            break;
          case Ship.Type.Idle:
            this.delay = 0; this.duration = 700;
            this.sprite = new AnimatedSprite([this.textures[0]]);
            this.animator = new TweenAnimator(this.sprite, {x:132,y:75}, {x:132,y:75}, 0, Animator.Ease.Linear);
            break;
          case Ship.Type.Outgoing:
            this.sprite = new AnimatedSprite([
                {texture: this.textures[0], time: 150},
                {texture: this.textures[1], time: 700},
                {texture: this.textures[2], time: 250},
                {texture: this.textures[3], time: 10},
            ], true);
            this.delay = 0; this.duration = 1500;
            this.sprite.updateAnchor = true; this.sprite.loop = false;
            this.animator = new TweenAnimator(this.sprite, {x:132,y:75}, {x:190,y:75}, 1100, Animator.Ease.In);
            break;
          default: throw Error('wrong anim type');
        }
    }
}

export class RobotShip implements Ship {
    textures: Texture[];
    sprite: AnimatedSprite;
    animator: Animator;
    readonly duration;
    readonly delay;

    constructor(animationType: Ship.Type) {
        const sheet = Bundle.data?.robot as Spritesheet;
        this.textures = [sheet.textures.ship0, sheet.textures.ship1, sheet.textures.ship2, sheet.textures.empty];
        switch(animationType) {
          case Ship.Type.Incoming:
            this.sprite = new AnimatedSprite([
                {texture: this.textures[3], time: 200},
                {texture: this.textures[2], time: 400},
                {texture: this.textures[1], time: 400},
                {texture: this.textures[0], time: 400},
            ], true);
            this.delay = 200; this.duration = 1300;
            this.sprite.updateAnchor = true; this.sprite.loop = false;
            this.animator = new TweenAnimator(this.sprite, {x:132,y:75}, {x:132,y:75}, 0, Animator.Ease.Out);
            break;
          case Ship.Type.Idle:
            this.delay = 0; this.duration = 700;
            this.sprite = new AnimatedSprite([this.textures[0]]);
            this.animator = new TweenAnimator(this.sprite, {x:132,y:75}, {x:132,y:75}, 0, Animator.Ease.Linear);
            break;
          case Ship.Type.Outgoing:
            this.sprite = new AnimatedSprite([
                {texture: this.textures[0], time: 400},
                {texture: this.textures[1], time: 400},
                {texture: this.textures[2], time: 400},
                {texture: this.textures[3], time: 10},
            ], true);
            this.delay = 0; this.duration = 1600;
            this.sprite.updateAnchor = true; this.sprite.loop = false;
            this.animator = new TweenAnimator(this.sprite, {x:132,y:75}, {x:132,y:75}, 0, Animator.Ease.In);
            break;
          default: throw Error('wrong anim type');
        }
    }
}
