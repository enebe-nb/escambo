import { Container, ITextStyle, NineSlicePlane, Text } from 'pixi.js';
import { Inventory } from './inventory.js';
import { Category, ItemId, ItemList } from './item.js';
import { Bundle, Gauge } from './resources.js';

export type TraderSpeak = 'intro'|'fail'|'success'|'tryagain'|'empty';

export interface TraderData {
    race: Trader.Race;
    mainDemand: ItemId;
    subDemand: Category;
    commoness: Partial<typeof ItemList>;
    speaks: Record<TraderSpeak, string[]>;
}

export class Trader implements TraderData {
    race: Trader.Race;
    mainDemand: ItemId;
    subDemand: Category;
    commoness: Partial<typeof ItemList>;
    readonly speaks: Record<TraderSpeak, string[]>;

    ratioList: typeof ItemList;
    //ratioMax: number;
    tries = 2;
    inventory = new Inventory();
    readonly greed = Math.random()*0.3 + 0.6;

    constructor(baseData: TraderData) {
        this.race = baseData.race;
        this.mainDemand = baseData.mainDemand;
        this.subDemand = baseData.subDemand;
        this.commoness = baseData.commoness;
        this.speaks = baseData.speaks;

        this.ratioList = {} as typeof ItemList;
        //this.ratioMax = 0;
        for (let id in ItemList) {
            const _id = id as keyof typeof ItemList;
            this.ratioList[_id] = Object.assign({}, ItemList[_id]);
            const override = this.commoness[_id];
            if (override !== undefined) {
                this.ratioList[_id].commoness = override.commoness;
            } //this.ratioMax += this.ratioList[_id].commoness;
        }
    }

    generateDemands() {
        const ret: ([ItemId|Category, number])[] = [];
        ret.push([this.mainDemand, 3]);
        ret.push([this.subDemand, Math.floor(Math.random()*3) + 1]);
        let allowedDemands: Category[] = ['structural', 'gases', 'fluids', 'chemical', 'organic', 'fuel', 'medicine', 'eletronic'];
        allowedDemands = allowedDemands.filter(v => v != this.subDemand);

        for (let i = 0; i < 3; ++i) {
            const demandIndex = Math.floor(Math.random()*allowedDemands.length);
            ret.push([allowedDemands[demandIndex], (Math.floor(Math.random()*3) + 1)*(Math.random()<0.5?1:-1)]);
            allowedDemands.splice(demandIndex, 1);
        }

        return ret;
    }
}

const demandStyle: ITextStyle = {
    fontFamily: 'minecraft',
    fontSize: 6,
    fill: 0xb0b0d0,
};

export class DemandView extends Container {
    constructor(demands: ([ItemId|Category, number])[]) {
        super();
        const frame = new NineSlicePlane(Bundle.data?.ui.textures.frame1);
        frame.width = 76; frame.x = -39;
        const title = new Text('Demands:', Object.assign({}, demandStyle, {fill:0xffffff}));
        title.anchor.set(0.5, 0); title.x = 0; title.y = 2;
        this.addChild(frame, title);

        let offset = 11;
        for (let tuple of demands) {
            const item = ItemList[tuple[0] as ItemId];
            const name = new Text(item ? item.name : (tuple[0].charAt(0).toUpperCase() + tuple[0].slice(1)), demandStyle);
            const gauge = new Gauge([Math.abs(tuple[1]), 3], tuple[1] > 0 ? 'left' : 'right');
            name.y = offset; gauge.y = offset + 1; const width = name.width + gauge.width;
            if (tuple[1] > 0) { name.x = -width/2; gauge.x = name.width - width/2; }
            else { gauge.x = -width/2 + gauge.width - 1; name.x = gauge.width - width/2; }
            this.addChild(name, gauge);
            offset += 9;
        }

         frame.height = offset + 2;
    }
}

export namespace Trader {
    export enum Race {
        Bug,
        Deepone,
        Human,
        Robot,
    };
}

export const TraderList: Record<Trader.Race, TraderData> = [
    {race: Trader.Race.Bug, mainDemand: 'blood', subDemand: 'organic', commoness:{}, speaks: {
        intro: ['Hello friend, let\'s trade! If you accept to travel with us, I can pay a good price to your family.'],
        fail: ['It seems we have nothing to talk about, I really thought you were my friend ...'],
        success: ['That is what I\'m talking about! Thanks friend, I hope can we make more deals next time.'],
        tryagain: ['Hmmm, this doesn\'t look so good. you can make a friend discount, right?'],
        empty: ['Look at you ... are you ready to make a real deal?'],
    }},
    {race: Trader.Race.Deepone, mainDemand: 'isotopes', subDemand: 'fluids', commoness:{}, speaks: {
        intro: ['Hey Air Breather! Don\'t worry, the peace treaty with your species is still valid.'],
        fail: ['I wasn\'t expecting much from you anyway, so ... when does the treaty expire again?'],
        success: ['That is acceptable, when you\'re free, call me, we can take a swim together.'],
        tryagain: ['You are abusing your species standings. Come on, it\'s not so hard.'],
        empty: ['That sight is nostalgic, typical of Air Breathers. Take this, there\'s many of yours out there to take revenge.'],
    }},
    {race: Trader.Race.Human, mainDemand: 'oxygen', subDemand: 'fuel', commoness:{}, speaks: {
        intro: ['Man, I\'m so glad to see another human, it has been such a long time ...'],
        fail: ['I really want to help you, but you don\'t make it easy for me. I wish you good luck.'],
        success: ['Nice, I will put a good word for you with the boss, I just hope i don\'t forget until there.'],
        tryagain: ['Hey, I\'m a human comrade. Can\'t you make it better?'],
        empty: ['Man, you are starving! I can take you to the next station, but you know what happens with deserters, right?'],
    }},
    {race: Trader.Race.Robot, mainDemand: 'coolant', subDemand: 'structural', commoness:{}, speaks: {
        intro: ['Nice to meet you! Humans are allowed to call me by model name. Since they have trouble with serial numbers.'],
        fail: ['Unfortunately, the time allocated to talk with humans has expired. Until next time.'],
        success: ['This place has proved to be very valuable. Thank you very much!'],
        tryagain: ['This offer is not favorable. Please try again.'],
        empty: ['Emergency protocol activated. Do you agree with the terms of use?'],
    }},
];
