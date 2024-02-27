import { Application, Container, Text } from "pixi.js";
import { InventoryView, OfferView, StarterPack } from "./inventory.js";
import { Player } from "./player.js";
import { Button, Gauge } from "./resources.js";
import { ItemConsume, ItemId, ItemTooltip } from "./item.js";
import { FadeAnimator } from "./animator.js";
import { DemandView, Trader, TraderList } from "./trader.js";
import { TransitionWarp } from "./transition.js";
import { StarterDialog, TraderDialog } from "./dialog.js";
import { Ship } from "./ship.js";
import { SfxClick, SfxConsume, SfxDamage, SfxShip, SfxShipRobot, playSfx } from "./audio.js";

export interface Scene {
    app: Application;
    node: Container;
    play(): Promise<Scene|void>;
}

const fontStyle = {
    fontFamily: 'minecraft',
    fontSize: 10,
    fill: 0xffffff
};

export class StarterScene implements Scene {
    app: Application;
    node = new Container();

    constructor(app: Application) { this.app = app; }

    async play(): Promise<Scene|void> {
        playSfx(SfxShip);
        await (new TransitionWarp(Trader.Race.Human, Ship.Type.Incoming)).play(this.node);
        const dialog = new StarterDialog();
        this.app.view.addEventListener?.('click', dialog.onclick.bind(dialog));
        await dialog.play(this.node);
        this.app.view.removeEventListener?.('click', dialog.onclick.bind(dialog));

        Player.reset();
        Player.inventory.addOne('oxygen', 30);
        Player.inventory.addOne('water', 30);

        const helper = new Text("Select an initial Cargo", fontStyle);
        helper.anchor.set(0.5, 0.5); helper.x = 120; helper.y = 12;
        const tooltip = new ItemTooltip();
        tooltip.x = 120; tooltip.y = 102;
        this.node.addChild(helper, tooltip);

        const packs = [new StarterPack(tooltip), new StarterPack(tooltip), new StarterPack(tooltip)];
        packs[0].node.x = 1;   packs[0].node.y = 26;
        packs[1].node.x = 80;  packs[1].node.y = 26;
        packs[2].node.x = 159; packs[2].node.y = 26;
        this.node.addChild(packs[0].node, packs[1].node, packs[2].node);
        const choice:number = await new Promise(r => {
            packs[0].button.on('click', () => r(0));
            packs[1].button.on('click', () => r(1));
            packs[2].button.on('click', () => r(2));
        })

        Player.inventory.add(packs[choice].items);
        this.node.removeChildren();
        playSfx(SfxShip);
        await (new TransitionWarp(Trader.Race.Human, Ship.Type.Outgoing)).play(this.node);
        return new DaysScene(this.app);
    }
}

export class DaysScene implements Scene {
    app: Application;
    node = new Container();

    constructor(app: Application) { this.app = app; }

    async play(): Promise<Scene|void> {
        const hungerGauge = new Gauge(Player.hunger, 'right');
        hungerGauge.x = 76; hungerGauge.y = 41;
        const thirstGauge = new Gauge(Player.thirst, 'right');
        thirstGauge.x = 76; thirstGauge.y = 59;
        const suffocateGauge = new Gauge(Player.suffocate, 'right');
        suffocateGauge.x = 76; suffocateGauge.y = 77;
        this.node.addChild(hungerGauge, thirstGauge, suffocateGauge);

        const days = Math.floor(Math.random()*2.9 + 2.2);
        const consume = Player.inventory.consume(days);
        const sprites: ItemConsume[][] = [[], [], []];
        for (let i = 0; i < days; ++i) {
            sprites[0].push(new ItemConsume(consume[0][i]));
            sprites[0][i].x = 80+18*i; sprites[0][i].y = 36;
            sprites[1].push(new ItemConsume(consume[1][i]));
            sprites[1][i].x = 80+18*i; sprites[1][i].y = 54;
            sprites[2].push(new ItemConsume(consume[2][i]));
            sprites[2][i].x = 80+18*i; sprites[2][i].y = 72;
            this.node.addChild(sprites[0][i], sprites[1][i], sprites[2][i]);
        }

        const helper = new Text(days+" days later", fontStyle);
        helper.anchor.set(0.5, 0.5); helper.x = 120; helper.y = 18;
        this.node.addChild(helper);
        (new FadeAnimator(helper, FadeAnimator.Direction.Show, 800)).play();
        await new Promise(r => setTimeout(r, 1000));
        for (let i = 0; i < days; ++i) {
            sprites[0][i].markIt();
            sprites[1][i].markIt();
            sprites[2][i].markIt();
            let hasDmg = false;
            if (!consume[0][i]) { hasDmg = true; ++Player.hunger[0]; hungerGauge.update(); } else if (Player.hunger[0] > 0) { --Player.hunger[0]; hungerGauge.update(); }
            if (!consume[1][i]) { hasDmg = true; ++Player.thirst[0]; thirstGauge.update(); } else if (Player.thirst[0] > 0) { --Player.thirst[0]; thirstGauge.update(); }
            if (!consume[2][i]) { hasDmg = true; ++Player.suffocate[0]; suffocateGauge.update(); } else if (Player.suffocate[0] > 0) { --Player.suffocate[0]; suffocateGauge.update(); }
            playSfx(hasDmg ? SfxDamage : SfxConsume);
            await new Promise(r => setTimeout(r, 600));
            if (Player.hunger[0] >= Player.hunger[1]
                || Player.thirst[0] >= Player.thirst[1]
                || Player.suffocate[0] >= Player.suffocate[1]) return this.death();
        }

        await new Promise(r => setTimeout(r, 400));
        return new TraderScene(this.app);
    }

    async death(): Promise<Scene|void> {
        let helper = new Text("You were found dead!", fontStyle);
        helper.anchor.set(0.5, 0.5); helper.x = 120; helper.y = 104;
        this.node.addChild(helper);

        helper = new Text("Click to restart", fontStyle);
        helper.anchor.set(0.5, 0.5); helper.x = 120; helper.y = 118;
        this.node.addChild(helper);

        await new Promise(r => this.app.view.addEventListener?.('click', r, {once:true}));
        return new StarterScene(this.app);
    }
}

export class TraderScene implements Scene {
    app: Application;
    node = new Container();
    uiOffer = new Container();

    constructor(app: Application) { this.app = app; }

    async play(): Promise<Scene|void> {
        const race = Math.floor(Math.random()*4) as Trader.Race;
        const trader = new Trader(TraderList[race]);
        trader.inventory.generate(trader.ratioList, 8, [20, 60]);

        const demands = trader.generateDemands();
        const uiDemand = new DemandView(demands);
        uiDemand.x = 120; uiDemand.y = 32;
        const confirm = new Button('Confirm Offer');
        confirm.x = 120; confirm.y = 18;
        confirm.visible = false;

        const tooltip = new ItemTooltip();
        tooltip.x = 120; tooltip.y = 1;
        const playerList = new InventoryView(Player.inventory.items, 92, tooltip);
        playerList.x = 2; playerList.y = 2;
        const traderList = new InventoryView(trader.inventory.items, 92, tooltip);
        traderList.x = 160; traderList.y = 2;
        const playerOffer = new OfferView();
        playerOffer.x = 2; playerOffer.y = 95;
        const traderOffer = new OfferView();
        traderOffer.x = 122; traderOffer.y = 95;
        this.uiOffer.addChild(playerList, playerOffer, traderList, traderOffer, uiDemand, confirm, tooltip);

        playSfx(race == Trader.Race.Robot ? SfxShipRobot : SfxShip);
        await (new TransitionWarp(race, Ship.Type.Incoming)).play(this.node);
        const dialog = new TraderDialog(race);
        this.app.view.addEventListener?.('click', dialog.onclick.bind(dialog));
        const itemKeys = Object.keys(Player.inventory.items);
        if (itemKeys.length == 0 || itemKeys.length == 1 && itemKeys[0] == 'oxygen') {
            // Runaway
            dialog.text = TraderList[race].speaks.empty;
            await dialog.play(this.node);
            playSfx(race == Trader.Race.Robot ? SfxShipRobot : SfxShip);
            await (new TransitionWarp(race, Ship.Type.Outgoing)).play(this.node);

            this.app.view.removeEventListener?.('click', dialog.onclick.bind(dialog));
            let helper = new Text("You ran away!", fontStyle);
            helper.anchor.set(0.5, 0.5); helper.x = 120; helper.y = 104;
            this.node.addChild(helper);
            helper = new Text("Click to restart", fontStyle);
            helper.anchor.set(0.5, 0.5); helper.x = 120; helper.y = 118;
            this.node.addChild(helper);

            await new Promise(r => this.app.view.addEventListener?.('click', r, {once:true}));
            return new StarterScene(this.app);
        }
        dialog.text = TraderList[race].speaks.intro;
        await dialog.play(this.node);

        while(trader.tries) {
            this.node.addChild(this.uiOffer);
            playerList.onitemclick = (id: ItemId) => {
                playSfx(SfxClick);
                playerOffer.add(id, 1, Player.inventory.items[id]!.amount);
                if (playerOffer.length > 0 && traderOffer.length > 0) confirm.visible = true;
            };
            traderList.onitemclick = (id: ItemId) => {
                playSfx(SfxClick);
                traderOffer.add(id, 1, trader.inventory.items[id]!.amount);
                if (playerOffer.length > 0 && traderOffer.length > 0) confirm.visible = true;
            };
            await new Promise<void>(r => {confirm.on('click', () => {if (playerOffer.length > 0 && traderOffer.length > 0) r();});});
            this.node.removeChild(this.uiOffer);

            const priceRatio = playerOffer.calcValueWithDemands(demands) / traderOffer.calcValueWithDemands(demands);
            if (priceRatio > trader.greed) {
                Player.inventory.remove(playerOffer.toAmounts());
                Player.inventory.add(traderOffer.toItems());
                dialog.text = TraderList[race].speaks.success;
                await dialog.play(this.node, true);
                break;
            } else {
                dialog.text = --trader.tries ? TraderList[race].speaks.tryagain : TraderList[race].speaks.fail;
                await dialog.play(this.node, true);
            }
        }

        playSfx(race == Trader.Race.Robot ? SfxShipRobot : SfxShip);
        await (new TransitionWarp(race, Ship.Type.Outgoing)).play(this.node);
        this.app.view.removeEventListener?.('click', dialog.onclick.bind(dialog));
        return new DaysScene(this.app);
    }
}
