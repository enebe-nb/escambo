import { Container, ITextStyle, NineSlicePlane, Sprite, Spritesheet, Text } from "pixi.js";
import { Bundle } from "./resources.js";

export type Category = 'human-food' | 'human-drink'
    | 'structural' | 'gases' | 'fluids' | 'chemical' | 'organic' | 'fuel'
    | 'medicine' | 'eletronic';

export type ItemId = 'hydrogen' | 'hydrogen' | 'oxygen' | 'cabon-dioxide' | 'nitrogen' | 'fluorine'
    | 'hydrazine' | 'methanol' | 'water' | 'biowater' | 'blood' | 'coolant' | 'antiseptic'
    | 'plastic' | 'aluminium' | 'steel' | 'titanium' | 'carbon-fiber' | 'keratin' | 'copper' | 'tungsten'
    | 'oil' | 'kerosene' | 'isotopes'
    | 'meat' | 'grains' | 'fruits' | 'insects' | 'nuts'
    | 'juice' | 'soda' | 'silk';

export interface ItemData {
    //id?: string;
    name: string;
    baseValue: number;
    commoness: number;
    tileId: number;
    categories: readonly Category[];
}

export class Item implements ItemData {
    //id: string;
    name: string;
    baseValue: number;
    commoness: number;
    tileId: number;
    categories: readonly Category[];
    amount = 0;
    //sprite: Sprite;

    constructor(/*id: string, */baseData: ItemData) {
        //this.id = id;
        this.name = baseData.name;
        this.baseValue = baseData.baseValue;
        this.commoness = baseData.commoness;
        this.tileId = baseData.tileId;
        this.categories = baseData.categories;
        //this.sprite = Sprite.from((Bundle.data?.items as Spritesheet).textures[this.tileId]);
    }
}

const nameStyle:Partial<ITextStyle> = {
    fontFamily: 'minecraft',
    fontSize: 6,
    fill: 0xffffff,
}

const numberStyle:Partial<ITextStyle> = {
    align: 'right',
    fontFamily: 'minecraft',
    fontSize: 6,
    fill: 0xffffff,
}

const catStyle:Partial<ITextStyle> = {
    fontFamily: 'minecraft',
    fontSize: 6,
    fill: 0xb0b0e0,
    wordWrap: true,
    wordWrapWidth: 64
}

export class ItemViewList extends Container {
    constructor(item: Item, tooltip?: ItemTooltip) { super();
        const bg = Sprite.from((Bundle.data?.ui as Spritesheet).textures.bluebg);
        bg.width = 70; bg.height = 18;
        bg.alpha = 0;
        const icon = Sprite.from((Bundle.data?.items as Spritesheet).textures[item.tileId]);
        icon.x = 1; icon.y = 1;
        const uiText = new Text(item.name, nameStyle);
        uiText.x = 18; uiText.y = 1;
        if (uiText.width > 52) uiText.width = 52;

        const iconC = Sprite.from((Bundle.data?.ui as Spritesheet).textures.credit);
        iconC.x = 40; iconC.y = 10;
        const uiValue = new Text(item.baseValue, numberStyle);
        uiValue.anchor.x = 1; uiValue.x = 40; uiValue.y = 9;
        const iconA = Sprite.from((Bundle.data?.ui as Spritesheet).textures.amount);
        iconA.x = 65; iconA.y = 10;
        const uiAmount = new Text(item.amount, numberStyle);
        uiAmount.anchor.x = 1; uiAmount.x = 65; uiAmount.y = 9;
        this.addChild(bg, icon, uiText, uiValue, uiAmount, iconC, iconA);

        this.eventMode = 'static';
        this.on('pointerenter', () => {bg.alpha = 1; if (tooltip) tooltip.show(item); });
        this.on('pointerleave', () => {bg.alpha = 0; if (tooltip) tooltip.hide(item); });
        // TODO tooltip
    }
}

export class ItemConsume extends Container {
    redmark = Sprite.from((Bundle.data?.ui as Spritesheet).textures.redmark);
    constructor(item: Item|null) { super();
        const sprite = Sprite.from((Bundle.data?.items as Spritesheet).textures[item?item.tileId:31]);
        this.redmark.alpha = 0;
        this.addChild(sprite, this.redmark);
    }

    markIt() { this.redmark.alpha = 1; }
}

export class ItemStock extends Container {
    _text = new Text;
    _amount = 0;

    constructor(item: ItemId, amount: number) { super();
        this._amount = amount;
        const sprite = Sprite.from((Bundle.data?.items as Spritesheet).textures[ItemList[item].tileId]);
        this._text.anchor.set(0.5, 0); this._text.x = 8; this._text.y = 15;
        this._text.text = amount; this._text.style = { align:'center', fontFamily: 'minecraft', fontSize: 6, fill: 0xffffff, strokeThickness: 1};
        this.addChild(sprite, this._text);
    }

    set amount(v: number) {
        this._text.text = this._amount = v;
    }
    get amount() {
        return this._amount;
    }
}

export class ItemTooltip extends Container {
    item?: Item;
    uiName = new Text("", nameStyle);
    uiCategories = new Text("", catStyle);
    frame = new NineSlicePlane(Bundle.data?.ui.textures.frame1);

    constructor() {
        super();
        this.visible = false;
        this.uiName.y = 2;
        this.uiCategories.y = 11;
        this.addChild(this.frame, this.uiName, this.uiCategories);
    }

    show(item: Item) {
        this.item = item;
        this.uiName.text = item.name;
        this.uiName.x = -this.uiName.width/2;
        const catNames = item.categories.map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(', ');
        this.uiCategories.text = catNames;
        this.uiCategories.x = -this.uiCategories.width/2;

        this.frame.height = this.uiCategories.height + 12;
        this.frame.width = Math.max(this.uiName.width, this.uiCategories.width) + 6;
        this.frame.x = -this.frame.width/2
        this.visible = true;
    }

    hide(item: Item) {
        if (item !== item) return;
        this.visible = false;
    }
}

export const ItemList: Record<ItemId, ItemData> = {
    'hydrogen':
        { name: 'Hydrogen', baseValue: 2, commoness: 3, tileId: 0, categories: ['gases', 'fuel', 'chemical']},
    'oxygen':
        { name: 'Oxygen', baseValue: 1, commoness: 8, tileId: 1, categories: ['gases', 'chemical']},
    'cabon-dioxide':
        { name: 'Carbon Dioxide', baseValue: 1, commoness: 3, tileId: 2, categories: ['gases', 'chemical']},
    'nitrogen':
        { name: 'Nitrogen', baseValue: 4, commoness: 1, tileId: 3, categories: ['gases', 'medicine', 'chemical']},
    'fluorine':
        { name: 'Organofluorine', baseValue: 9, commoness: 1, tileId: 4, categories: ['gases', 'medicine', 'organic']},

    'hydrazine':
        { name: 'Hydrazine', baseValue: 11, commoness: 2, tileId: 5, categories: ['fluids', 'fuel']},
    'methanol':
        { name: 'Methanol', baseValue: 5, commoness: 1, tileId: 6, categories: ['fluids', 'fuel', 'chemical']},
    'water':
        { name: 'Pure Water', baseValue: 5, commoness: 2, tileId: 7, categories: ['fluids', 'human-drink', 'chemical']},
    'biowater':
        { name: 'Bio Water', baseValue: 4, commoness: 3, tileId: 8, categories: ['fluids', 'human-drink', 'organic']},
    'blood':
        { name: 'Blood', baseValue: 8, commoness: 1, tileId: 9, categories: ['fluids', 'medicine', 'organic']},
    'coolant':
        { name: 'Coolant', baseValue: 3, commoness: 2, tileId: 10, categories: ['fluids', 'chemical']},
    'antiseptic':
        { name: 'Antiseptic', baseValue: 3, commoness: 2, tileId: 11, categories: ['fluids', 'medicine']},

    'plastic':
        { name: 'Plastic Chips', baseValue: 4, commoness: 3, tileId: 12, categories: ['structural', 'organic', 'eletronic']},
    'aluminium':
        { name: 'Aluminium Board', baseValue: 1, commoness: 2, tileId: 13, categories: ['structural', 'eletronic']},
    'steel':
        { name: 'Reinforced Steel', baseValue: 5, commoness: 1, tileId: 14, categories: ['structural']},
    'titanium':
        { name: 'Titanium Board', baseValue: 14, commoness: 1, tileId: 15, categories: ['structural']},
    'carbon-fiber':
        { name: 'Carbon Fiber', baseValue: 8, commoness: 1, tileId: 16, categories: ['structural', 'eletronic']},
    'keratin':
        { name: 'Keratin Fiber', baseValue: 4, commoness: 1, tileId: 17, categories: ['structural', 'organic']},
    'copper':
        { name: 'Copper Wire', baseValue: 7, commoness: 2, tileId: 18, categories: ['structural', 'eletronic']},
    'tungsten':
        { name: 'Tungsten Wire', baseValue: 4, commoness: 1, tileId: 19, categories: ['eletronic', 'chemical']},

    'oil':
        { name: 'Filtered Oil', baseValue: 3, commoness: 1, tileId: 20, categories: ['fuel', 'medicine']},
    'kerosene':
        { name: 'Kerosene', baseValue: 6, commoness: 1, tileId: 21, categories: ['fuel', 'chemical']},
    'isotopes':
        { name: 'Rare Isotopes', baseValue: 13, commoness: 1, tileId: 22, categories: ['fuel', 'chemical']},

    'meat':
        { name: 'Irradiated Meat', baseValue: 5, commoness: 1, tileId: 23, categories: ['human-food', 'organic']},
    'grains':
        { name: 'Grains Paste', baseValue: 3, commoness: 3, tileId: 24, categories: ['human-food']},
    'fruits':
        { name: 'Dried Fruits', baseValue: 4, commoness: 1, tileId: 25, categories: ['human-food', 'organic']},
    'insects':
        { name: 'Preserved Insects', baseValue: 3, commoness: 1, tileId: 26, categories: ['human-food', 'organic']},
    'nuts':
        { name: 'Cereal and Nuts', baseValue: 6, commoness: 1, tileId: 27, categories: ['human-food']},

    'juice':
        { name: 'Frozen Juice', baseValue: 2, commoness: 3, tileId: 28, categories: ['human-drink']},
    'soda':
        { name: 'Mock Soda', baseValue: 3, commoness: 1, tileId: 29, categories: ['human-drink']},
    'silk':
        { name: 'Silk', baseValue: 3, commoness: 2, tileId: 30, categories: ['medicine', 'organic']},
} as const;
