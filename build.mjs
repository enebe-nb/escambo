import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as esbuild from 'esbuild';

async function CopyPixiLib() {
    await fs.mkdir('./dist/lib', {recursive:true});
    return Promise.all([
        fs.copyFile('./node_modules/pixi.js/dist/pixi.min.mjs', './dist/lib/pixi.min.mjs'),
        fs.copyFile('./node_modules/pixi.js/dist/pixi.min.mjs.map', './dist/lib/pixi.min.mjs.map'),
    ]);
};

async function BuildTypescript() {
    const sources = (await fs.readdir('src', {recursive: true})).filter((v) => path.extname(v) === '.ts').map((v) => path.join('src',v));
    const options = {
        bundle: false, // TODO do bundle?
        entryPoints: sources,
        outdir: 'dist/js',
        //format: 'esm', // TODO in tsconfig?
        //external: ['pixi.js'],
        //drop: ['debugger','console'], // TODO prod/dev
        //minify: true, // TODO prod/dev
        sourcemap: true, // TODO prod/dev
    };
    await esbuild.build(options);
}

await Promise.all([CopyPixiLib(), BuildTypescript()]);
console.log('done!');
