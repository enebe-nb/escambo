const context = new (window.AudioContext || window.webkitAudioContext)();

const bgm = document.createElement('audio');
bgm.src = 'snd/slow-travel.mp3';
bgm.loop = true;

export const SfxClick = document.createElement('audio');
SfxClick.src = 'snd/click.wav';

export const SfxConsume = document.createElement('audio');
SfxConsume.src = 'snd/consume.wav';
SfxConsume.volume = 0.8;

export const SfxDamage = document.createElement('audio');
SfxDamage.src = 'snd/damage.wav';
SfxDamage.volume = 0.8;

export const SfxDialog = document.createElement('audio');
SfxDialog.src = 'snd/dialog.wav';

export const SfxShip = document.createElement('audio');
SfxShip.src = 'snd/ship.wav';
SfxShip.volume = 0.8;

export const SfxShipRobot = document.createElement('audio');
SfxShipRobot.src = 'snd/robot-ship.wav';
SfxShipRobot.volume = 0.35;

export function playBgm() {
    if (context.state === "suspended") context.resume();

    const bgmPipe = context.createMediaElementSource(bgm);
    bgmPipe.connect(context.destination);
    bgm.play();
}

export function playSfx (sfx: HTMLAudioElement) {
    const sfxPipe = context.createMediaElementSource(bgm);
    sfxPipe.connect(context.destination);
    sfx.addEventListener('complete', () => sfxPipe.disconnect);
    sfx.loop = false;
    sfx.play();
}

export function loopSfx (sfx: HTMLAudioElement) {
    const sfxPipe = context.createMediaElementSource(bgm);
    sfxPipe.connect(context.destination);
    //sfx.addEventListener('complete', () => sfxPipe.disconnect);
    sfx.loop = true;
    sfx.play();

    return () => { sfxPipe.disconnect(); sfx.pause(); sfx.currentTime = 0; }
}
