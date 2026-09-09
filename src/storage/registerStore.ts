import {RegisterData} from '../domain/models';
import {nativeStore} from '../services/nativeStore';
const timestamp=()=>new Date().toISOString();
export const defaultRegisterData=():RegisterData=>({schemaVersion:1,records:[],clients:[{id:'personal',name:'Personal',notes:''}],projects:[],platforms:['Instagram','Facebook','TikTok','YouTube','LinkedIn','X','Pinterest','Email','Other'].map(name=>({id:name.toLowerCase(),name})),tags:[],savedViews:[],updatedAt:timestamp()});
export async function loadRegisterData():Promise<RegisterData>{const fallback=defaultRegisterData(); if(!nativeStore)return fallback; try{const value=JSON.parse(await nativeStore.load()); if(Array.isArray(value)) return {...fallback,records:value}; return {...fallback,...value,clients:value.clients?.length?value.clients:fallback.clients,platforms:value.platforms?.length?value.platforms:fallback.platforms,savedViews:value.savedViews||[]};}catch{return fallback;}}
export async function saveRegisterData(data:RegisterData){const next={...data,updatedAt:timestamp()}; if(nativeStore) await nativeStore.save(JSON.stringify(next)); return next;}
