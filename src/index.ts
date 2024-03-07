import * as PIXI from 'pixi.js'
import { Bundle } from './resources.js';
import { Scene, StarterScene, TraderScene } from './scene.js';
import { playBgm } from './audio.js';
import { Player } from './player.js';

function fitSizeWithRatio(width:number, height:number, baseWidth:number, baseHeight:number) {
    const ret = {width, height, scale:0};
    if (width / height > baseWidth / baseHeight) {
        ret.width = Math.round((height / baseHeight) * baseWidth);
    } else {
        ret.height = Math.round((width / baseWidth) * baseHeight);
    }
    ret.scale = Math.max(ret.width / baseWidth, ret.height / baseHeight);
    return ret;
}

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
const app = new PIXI.Application();
document.body.innerHTML = "";
document.body.appendChild(app.view as any);
app.view.addEventListener?.('wheel', (e:Event) => e.preventDefault(), {passive: false});

function onResize() {
    const size = fitSizeWithRatio(innerWidth, innerHeight, 240, 135);
    app.renderer.resolution = size.scale;
    app.view.width = size.width;
    app.view.height = size.height;
} onResize(); window.addEventListener('resize', onResize);

(async () => {
    let title = new PIXI.Text("Loading...", {fontFamily: 'minecraft', fontSize: 10, fill: 0xffffff});
    title.anchor.set(0.5, 0.5); title.x = 120; title.y = 67;
    app.stage.addChild(title);
    await Bundle.load();
    app.stage.removeChild(title);
    title = new PIXI.Text("The game is loaded.\nClick to start!", {fontFamily: 'minecraft', fontSize: 10, fill: 0xffffff});
    title.anchor.set(0.5, 0.5); title.x = 120; title.y = 67;
    app.stage.addChild(title);
    await new Promise<void>(r => app.view.addEventListener?.('click', () => { playBgm(); r();}, {once:true}));
    let scene:Scene|void = new StarterScene(app);
    // Test
    //Player.inventory.addOne('oxygen', 8);
    //Player.inventory.addOne('water', 7);
    //Player.inventory.addOne('grains', 6);
    //let scene:Scene|void = new TraderScene(app);
    do {
        app.stage.removeChildren();
        app.stage.addChild(scene.node);
        scene = await scene.play();
    } while(scene);
})();
