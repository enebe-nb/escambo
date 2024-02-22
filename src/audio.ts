const context = new (window.AudioContext || window.webkitAudioContext)();

const bgm = document.createElement('audio');
bgm.src = 'snd/slow-travel.mp3';
bgm.loop = true;
bgm.volume = 0.4;

export function playBgm() {
    if (context.state === "suspended") context.resume();

    const bgmPipe = context.createMediaElementSource(bgm);
    bgmPipe.connect(context.destination);
    bgm.play();
}
