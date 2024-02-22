import { AnimatedSprite, Assets, Container, ITextStyle, NineSlicePlane, ProgressCallback, Spritesheet, Text } from "pixi.js";

Assets.addBundle('main', {
    'bug': 'img/bug.json',
    'deepone': 'img/deepone.json',
    'human': 'img/human.json',
    'robot': 'img/robot.json',
    'items': 'img/items.json',
    'ui': 'img/ui.json',
    'background': 'img/space-bg.png',
    'defaultfont': 'font/minecraft.woff2',
}); Assets.backgroundLoadBundle('main');

export abstract class Bundle {
    static data?:Record<string, any>;
    static get isReady():boolean {return !!this.data;}
    static async load(onProgress?: ProgressCallback) { this.data = await Assets.loadBundle('main', onProgress); }
}

const fontStyle:Partial<ITextStyle> = {
    fontFamily: 'minecraft',
    fontSize: 6,
    fill: 0xffffff,
}

export class Button extends Container {
    constructor(text: string) { super();
        const bg = new NineSlicePlane(Bundle.data!.ui.textures.frame1);
        const bgActive = new NineSlicePlane(Bundle.data!.ui.textures.frame1active);
        const uiText = new Text(text, fontStyle);
        uiText.anchor.set(0.5, 0.5);
        bg.width = bgActive.width = uiText.width + 6;
        bg.height = bgActive.height = uiText.height + 6;
        bg.x = bgActive.x = -bg.width/2;
        bg.y = bgActive.y = -bg.height/2;
        bgActive.alpha = 0;
        this.addChild(bg, bgActive, uiText);

        this.eventMode = 'static';
        this.on('pointerenter', () => bgActive.alpha = 1);
        this.on('pointerleave', () => bgActive.alpha = 0);
    }
}

export class Gauge extends Container {
    value: [number, number];
    align: 'left'|'right';
    sprites: AnimatedSprite[] = [];

    constructor(value: [number, number], align: 'left'|'right') { super();
        this.value = value;
        this.align = align;
        for (let i = 0; i < value[1]; ++i) {
            this.sprites.push(new AnimatedSprite([
                (Bundle.data?.ui as Spritesheet).textures.emptygauge,
                (Bundle.data?.ui as Spritesheet).textures.greengauge,
                (Bundle.data?.ui as Spritesheet).textures.bluegauge,
            ]));
            this.sprites[i].x = align == 'left'? i*5 : (i+1)*-5+1;
            this.addChild(this.sprites[i]);
        } this.update();
    }

    update() {
        for (let i = 0; i < this.value[1]; ++i) {
            if (i < this.value[0])
                this.sprites[i].gotoAndStop(1);
            else this.sprites[i].gotoAndStop(0);
        }
    }
}
