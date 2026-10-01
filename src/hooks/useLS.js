import {useState,useEffect} from 'react'

export function useLS(k,d){const[v,s]=useState(()=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):d}catch(e){return d}});
 useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},[k,v]);return[v,s]}
