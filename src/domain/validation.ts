export const normalizeTag=(value:string)=>value.trim().replace(/\s+/g,' ');
export const normalizeTags=(value:string|string[])=>[...new Set((Array.isArray(value)?value:value.split(',')).map(normalizeTag).filter(Boolean))];
export function validateAccount(value:{accountName:string; clientId:string; platformId:string}) {const errors: Record<string,string>={}; if(!value.accountName.trim()) errors.accountName='Account name is required'; if(!value.clientId) errors.clientId='Client is required'; if(!value.platformId) errors.platformId='Platform is required'; return errors;}
