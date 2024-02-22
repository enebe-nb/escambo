import { DisplayObject, IPointData, Point, Ticker } from "pixi.js";

export type Animator = {
    target: DisplayObject;
    // start: IPointData;
    // end: IPointData;
    // delta: IPointData;
    duration: number;
    current: number; // TODO is it necessary?

    update(dt: number): void;
    play(): void;
};

export namespace Animator {
    export type EasingFunction = (t: number) => number;
    export namespace Ease {
        export function Linear(t: number):number { return t; }
        export function In(t: number):number { return t*t; }
        export function Out(t: number):number { const tm = 1-t; return 1-tm*tm; }
        export function InOut(t: number):number {
            if (t < 0.5) return 2*t*t;
            const tm = -2*t+2;
            return 1-tm*tm/2;
        }

        export function InBack(t: number):number {
            const c1 = 1.70158;
            const c3 = c1 + 1;

            return (c3*t - c1)*t*t;
        }

        export function OutBack(t: number):number {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const tm = 1-t;

            return 1 + (c3*tm - c1)*tm*tm;
        }
    }
}

export class TweenAnimator implements Animator {
    constructor(target:DisplayObject, start:IPointData, end:IPointData, duration:number, easing:Animator.EasingFunction = Animator.Ease.Linear) {
        this.target = target;
        this.start = start; this.end = end;
        this.delta = new Point(end.x - start.x, end.y - start.y);
        this.duration = duration;
        this.easing = easing;
    }

    update(dt: number) {
        const ticker = Ticker.shared;
        this.current += dt * 1000 / ticker.FPS;
        if (this.current >= this.duration) {
            this.target.x = this.end.x;
            this.target.y = this.end.y;
            ticker.remove(this.update, this);
        } else {
            const ratio = this.easing(this.current / this.duration);
            this.target.x = this.start.x + this.delta.x * ratio;
            this.target.y = this.start.y + this.delta.y * ratio;
        }
    }

    play() {
        this.target.x = this.start.x;
        this.target.y = this.start.y;
        this.current = 0;
        Ticker.shared.add(this.update, this);
    }

    readonly target;
    readonly start;
    readonly end;
    readonly delta;
    readonly duration;
    readonly easing;
    current: number = 0;
}


export class FadeAnimator implements Animator {
    constructor(target:DisplayObject, direction: FadeAnimator.Direction, duration:number, easing:Animator.EasingFunction = Animator.Ease.Linear) {
        this.target = target;
        this.direction = direction;
        this.duration = duration;
        this.easing = easing;
    }

    update(dt: number) {
        const ticker = Ticker.shared;
        this.current += dt * 1000 / ticker.FPS;
        if (this.current >= this.duration) {
            this.target.alpha = this.direction == FadeAnimator.Direction.Hide ? 0 : 1;
            ticker.remove(this.update, this);
        } else {
            const ratio = this.easing(this.current / this.duration);
            this.target.alpha = this.direction == FadeAnimator.Direction.Hide ? 1-ratio : ratio;
        }
    }

    play() {
        this.target.alpha = this.direction == FadeAnimator.Direction.Hide ? 1 : 0;
        this.current = 0;
        Ticker.shared.add(this.update, this);
    }

    readonly target;
    readonly direction;
    readonly duration;
    readonly easing;
    current: number = 0;
}

export namespace FadeAnimator {
    export enum Direction { Hide, Show }
}
