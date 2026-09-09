export const normalizeTag=(value:string)=>value.trim().replace(/\s+/g,' ');
export const normalizeTags=(value:string|string[])=>[...new Set((Array.isArray(value)?value:value.split(',')).map(normalizeTag).filter(Boolean))];
export const normalizeUrl=(value:string)=>value.trim();
export const isValidUrl=(value?:string)=>!value || /^https?:\/\/\S+$/i.test(value.trim());

export function validateAccount(value:{accountName:string; platformId?:string; accountUrl?:string}) {
  const errors: Record<string,string>={};
  if(!value.accountName.trim()) errors.accountName='Account name is required';
  if(!value.platformId) errors.platformId='Platform is required';
  if(value.accountUrl && !isValidUrl(value.accountUrl)) errors.accountUrl='Enter a valid http or https link';
  return errors;
}
