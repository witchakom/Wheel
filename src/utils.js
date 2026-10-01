import {PAL} from './data/palettes'

export const uid=()=>Math.random().toString(36).slice(2,9);

export const cls=(...a)=>a.filter(Boolean).join(' ');

export const col=(it,i,pal)=>it.c||PAL[pal][i%PAL[pal].length];
