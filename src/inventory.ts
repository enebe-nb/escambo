import { Container, Graphics, ITextStyle, NineSlicePlane, ObservablePoint, Text } from "pixi.js";
import { Category, Item, ItemId, ItemList, ItemStock, ItemTooltip, ItemViewList } from "./item.js";
import { Bundle, Button } from "./resources.js";
import { SfxClick, playSfx } from "./audio.js";

type MinMax = number | [number, number];

export class Inventory {
    items: Partial<Record<ItemId, Item>> = {};

    generate(ratioList: Partial<typeof ItemList>, len: number, value: MinMax) {
        if ('number' === typeof value) value = [value, value];
        let ratioMax = 0;
        for (let id in ratioList) {
            const _id = id as keyof typeof ratioList;
            ratioMax += ratioList[_id]!.commoness;
        }

        const localList = Object.keys(ratioList) as (keyof typeof ratioList)[];
        while(len-- > 0) {
            let r = Math.random() * ratioMax;
            const index = localList.findIndex((i) => {
                if (r < ratioList[i]!.commoness) return true;
                r -= ratioList[i]!.commoness;
                return false;
            }); if (index == -1) continue;

            const itemId = localList[index];
            localList.splice(index, 1);
            this.items[itemId] = new Item(ratioList[itemId]!);
            const rvalue = Math.random()*(value[1] - value[0]) + value[0];
            this.items[itemId]!.amount = Math.max(1, Math.round(rvalue / this.items[itemId]!.baseValue));
            ratioMax -= ratioList[itemId]!.commoness;
        }
    }

    consume(days: number): [(Item|null)[], (Item|null)[], (Item|null)[]] {
        const foods: (ItemId)[] = [];
        const drinks: (ItemId)[] = [];
        for (let id in this.items) {
            const _id = id as keyof typeof this.items;
            if (this.items[_id]!.categories.includes('human-food')) foods.push(_id);
            if (this.items[_id]!.categories.includes('human-drink')) drinks.push(_id);
        }

        const ret: [(Item|null)[], (Item|null)[], (Item|null)[]]  = [[], [], []];
        for (let i = 0; i < days; ++i) {
            if (!foods.length) ret[0].push(null);
            else {
                const index = Math.floor(Math.random()*foods.length);
                ret[0].push(this.items[foods[index]]!);
                if (--this.items[foods[index]]!.amount <= 0) {
                    delete this.items[foods[index]];
                    foods.splice(index, 1);
                }
            }

            if (!drinks.length) ret[1].push(null);
            else {
                const index = Math.floor(Math.random()*drinks.length);
                ret[1].push(this.items[drinks[index]]!);
                if (--this.items[drinks[index]]!.amount <= 0) {
                    delete this.items[drinks[index]];
                    drinks.splice(index, 1);
                }
            }

            if (!this.items.oxygen) ret[2].push(null);
            else {
                ret[2].push(this.items.oxygen);
                if (--this.items.oxygen.amount <= 0) {
                    delete this.items.oxygen;
                }
            }
        }
        return ret;
    }

    add(items: Partial<Record<ItemId, Item>>) {
        for (let id in items) {
            const _id = id as keyof typeof items;
            if (!this.items[_id]) this.items[_id] = items[_id];
            else this.items[_id]!.amount += items[_id]!.amount;
        }
    }

    remove(items: Partial<Record<ItemId, number>>) {
        for (let id in items) {
            const _id = id as keyof typeof items;
            if (!this.items[_id]) continue;
            else {
                this.items[_id]!.amount -= items[_id]!;
                if (this.items[_id]!.amount <= 0) delete this.items[_id];
            }
        }
    }

    addOne(id: ItemId, amount:number) {
        if (this.items[id]) this.items[id]!.amount += amount;
        else {
            this.items[id] = new Item(ItemList[id]);
            this.items[id]!.amount = amount;
        }
    }

    clear() {
        this.items = {};
    }
}

export class StarterPack extends Inventory {
    node = new Container;
    button: Button;

    constructor(tooltip?: ItemTooltip) { super();
        const frame = new NineSlicePlane(Bundle.data?.ui.textures.frame0);
        frame.height = 76; frame.width = 78;
        this.node.addChild(frame);

        const food:Partial<typeof ItemList> = {}
        const commodity:Partial<typeof ItemList> = {};
        for (let id in ItemList) {
            const _id = id as keyof typeof ItemList;
            if (ItemList[_id].categories.includes('human-food')) food[_id] = ItemList[_id];
            if (!ItemList[_id].categories.includes('human-food')
                && !ItemList[_id].categories.includes('human-drink')
                && ItemList[_id].name != 'Oxygen') commodity[_id] = ItemList[_id];
        }
        this.generate(food, 1, [25, 40]);
        this.generate(commodity, 2, [35, 55]);

        let offset = 4
        for (let id in this.items) {
            const _id = id as keyof typeof this.items;
            const view = new ItemViewList(this.items[_id]!, tooltip);
            view.x = 4; view.y = offset;
            this.node.addChild(view);
            offset += 18;
        }

        this.button = new Button("Select");
        this.button.x = 39; this.button.y = offset + 7;
        this.node.addChild(this.button);
    }
}

export class InventoryView extends Container {
    items: Partial<Record<ItemId, Item>>;
    view = new Container();
    scrollLimits: [number, number];
    onitemclick = (id: ItemId):any => {};

    constructor(items: Partial<Record<ItemId, Item>>, height: number, tooltip?: ItemTooltip) {
        super();
        this.items = items;
        const frame = new NineSlicePlane(Bundle.data?.ui.textures.frame0);
        frame.height = height; frame.width = 78;
        const viewMask = new Graphics();
        viewMask.beginFill(0);
        viewMask.drawRect(4, 4, 70, height - 8);
        this.view.mask = viewMask;
        this.view.x = 4; this.view.y = 4;

        let offset = 0;
        for(let id in items) {
            const _id = id as keyof typeof items;
            const item = new ItemViewList(items[_id]!, tooltip);
            item.eventMode = 'static'; item.on('click', () => this.onitemclick(_id));
            item.y = offset; offset += 18;
            this.view.addChild(item);
        }
        this.scrollLimits = [height - this.view.height - 4, 4];
        if (this.scrollLimits[0] > 4) this.scrollLimits[0] = 4;

        this.addChild(frame, this.view, viewMask);
        this.eventMode = 'static';
        this.on('wheel', (evt: WheelEvent) => {if (evt.deltaY != 0) this.scroll(evt.deltaY > 0 ? 5 : -5)});
    }

    scroll(value: number) {
        this.view.y = Math.max(Math.min(this.view.y - value, this.scrollLimits[1]), this.scrollLimits[0]);
    }
}

const nameStyle: Partial<ITextStyle> = {
    fontFamily: 'minecraft',
    fontSize: 6,
    fill: 0xffffff,
}

export class OfferView extends Container {
    views: Partial<Record<ItemId, ItemStock>> = {};
    value= new Text('0', nameStyle);
    length: number;

    constructor() {
        super();
        const frame = new NineSlicePlane(Bundle.data?.ui.textures.frame1);
        frame.height = 38; frame.width = 116;
        this.length = 0;
        const text = new Text('Total Value: ', nameStyle);
        text.x = 4; text.y = 27;
        this.value.x = text.width + 6; this.value.y = 27;
        this.addChild(frame, text, this.value);
    }

    sortView() {
        const keys = Object.keys(this.views) as ItemId[];
        this.length = keys.length;
        let offset = 2;
        for (let key of keys) {
            this.views[key]!.x = offset; this.views[key]!.y = 2;
            offset += 18;
        }
    }

    calcValue() {
        let total = 0;
        for (let id in this.views) {
            const _id = id as keyof typeof this.views;
            total += ItemList[_id].baseValue*this.views[_id]!.amount;
        } this.value.text = total;
        return total;
    }

    calcValueWithDemands(demands: [ItemId | Category, number][]) {
        let total = 0;
        for (let id in this.views) {
            const _id = id as keyof typeof this.views;
            let demandRatio = 1;
            for (let demand of demands) {
                if (_id == demand[0] || ItemList[_id].categories.includes(demand[0] as Category)) {
                    demandRatio *= 1 + 0.1*demand[1];
                }
            }
            total += ItemList[_id].baseValue*this.views[_id]!.amount*demandRatio;
        } return total;
    }

    add(id: ItemId, amount: number, max: number) {
        if (!this.views[id]) {
            if (amount <= 0) return;
            this.views[id] = new ItemStock(id, Math.min(amount, max));
            this.views[id]!.eventMode = 'static';
            this.views[id]!.on('click', () => {
                playSfx(SfxClick);
                this.add(id, -1, max);
            });
            this.addChild(this.views[id]!);
            this.sortView();
        } else {
            this.views[id]!.amount = Math.min(max, this.views[id]!.amount + amount);
            if (this.views[id]!.amount <= 0) {
                this.removeChild(this.views[id]!);
                delete this.views[id];
                this.sortView();
            }
        } this.calcValue();
    }

    clear() {
        for (let id in this.views) {
            const _id = id as keyof typeof this.views;
            this.removeChild(this.views[_id]!);
            delete this.views[_id];
        }
        this.sortView();
        this.calcValue();
    }

    toItems() {
        const ret: Partial<Record<ItemId, Item>> = {}
        for (let id in this.views) {
            const _id = id as keyof typeof this.views;
            ret[_id] = new Item(ItemList[_id]);
            ret[_id]!.amount = this.views[_id]!.amount;
        } return ret;
    }

    toAmounts() {
        const ret: Partial<Record<ItemId, number>> = {}
        for (let id in this.views) {
            const _id = id as keyof typeof this.views;
            ret[_id] = this.views[_id]!.amount;
        } return ret;
    }
}
