import { AnimatedSprite, Container, ITextStyle, Sprite, Spritesheet, Text } from "pixi.js";
import { Bundle } from "./resources.js";
import { Trader } from "./trader.js";
import { SfxDialog, loopSfx } from "./audio.js";

const fontStyle:Partial<ITextStyle> = {
    fontFamily: 'minecraft',
    fontSize: 8,
    fill: 0xffffff,
    wordWrap: true,
    wordWrapWidth: 204,
}

export class Dialog {
    textbox: Sprite;
    character: AnimatedSprite;
    text: string[];
    textview?: Text;
    node = new Container();
    current: number = 0; isSkiping: boolean = false;
    reuse = false;
    waitResolver?: ()=>void; waitPromise?: Promise<void>;

    constructor(textbox: Sprite, character: AnimatedSprite, text: string[]) {
        this.textbox = textbox;
        this.textbox.x = 0; this.textbox.y = 135;
        this.character = character;
        this.character.animationSpeed = 0.15;
        this.character.x = 210; this.character.y = 0;
        this.text = text;

        this.node.addChild(textbox);
        this.node.addChild(character);
    }

    async play(node: Container, reuse: boolean = false) {
        this.reuse = reuse;
        node.addChild(this.node);

        this.current = 0;
        while (this.current < this.text.length) {
            const sfxStop = loopSfx(SfxDialog)
            this.character.play();
            this.isSkiping = false;
            this.textview = new Text("", fontStyle);
            this.textview.x = 8; this.textview.y = 95;
            this.node.addChild(this.textview);
            const text = this.text[this.current++];
            for (let i = 0; i < text.length; ++i) {
                this.textview.text += text[i];
                await new Promise(r=>setTimeout(r, 16));
                if (this.isSkiping) {
                    this.textview.text = text;
                    break;
                }
            } sfxStop();
            this.character.gotoAndStop(0);
            this.waitPromise = new Promise<void>(r => {this.waitResolver = r;});
            await this.waitPromise;
            this.node.removeChild(this.textview);
            delete this.waitPromise;
            delete this.waitResolver;
        }

        node.removeChild(this.node);
    }

    onclick() {
        if (this.reuse) {this.reuse = false; return;}
        this.isSkiping = true;
        if (this.waitResolver) this.waitResolver();
    }
}

export class StarterDialog extends Dialog {
    constructor() {
        super(Sprite.from((Bundle.data?.human as Spritesheet).textures.textbox),
            new AnimatedSprite([
                (Bundle.data?.human as Spritesheet).textures.trader,
                (Bundle.data?.human as Spritesheet).textures.tradertalk,
            ]), [
                'Welcome to your new job! Almost everything in this station is automatically managed, so you just need to stay here and observe it.',
                'There\'s 30 days worth of oxygen and water for you, they will be refilled in the next shift at 10 years from now ...',
                'Yeah, I know. Sorry for saying this, but this job is a scam. They can put anything in the death report, nobody will come to check after 10 years.',
                'Many travelers stop here to rest, so you can get more rations from them. Most of them already know about this situation, and they are willing to help.',
                'The company forbids you from buying and selling, but as long you don\'t use credits, you can trade anything. Here, I\'ll give you part of my cargo, what do you prefer?',
            ]);
    }
}

export class TraderDialog extends Dialog {
    constructor(race: Trader.Race) {
        const id = race == Trader.Race.Bug ? 'bug'
            : race == Trader.Race.Deepone ? 'deepone'
            : race == Trader.Race.Human ? 'human'
            : race == Trader.Race.Robot ? 'robot'
            : 'none';
        super(Sprite.from((Bundle.data?.[id] as Spritesheet).textures.textbox),
            new AnimatedSprite([
                (Bundle.data?.[id] as Spritesheet).textures.trader,
                (Bundle.data?.[id] as Spritesheet).textures.tradertalk,
            ]), []);
    }
}

