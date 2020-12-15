import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from "rollup-plugin-terser";
const lib = require("./package.json");
const outputFileName= 'cp-axios';
const name= "cpAxios";

const mode= process.env.NODE_ENV;
const input = './lib/index.js';

const startYear= 2020;
const year= new Date().getFullYear();
const banner= `// ${lib.name} v${lib.version}\n// Copyright (c) ${year===startYear? startYear : `${startYear}-${year}`} ${lib.author.name} <${lib.author.email}>`;

const config = mode === 'development' ? [
        {
            input,
            output: {
                file: `dist/${outputFileName}.js`,
                format: 'cjs',
                name,
                exports: "auto"
            },
            plugins: [
                resolve(),
                commonjs(),
                json()
            ]
        },
    ] :
    [
        {
            input,
            output: {
                file: `dist/${outputFileName}.umd.js`,
                format: 'umd',
                name,
                exports: "auto",
                banner
            },
            plugins: [
                resolve({browser: true}),
                commonjs(),
                json()
            ]
        },
        {
            input,
            output: {
                file: `dist/${outputFileName}.umd.min.js`,
                format: 'umd',
                name,
                exports: "auto",
                banner
            },
            plugins: [
                resolve({browser: true}),
                commonjs(),
                json(),
                terser()
            ]
        }
    ];


export default config;
