import {NativeModules} from 'react-native';
export type NativeStore = {load(): Promise<string>; save(value:string): Promise<boolean>; secureSave(id:string,value:string):Promise<boolean>; secureLoad(id:string):Promise<string>; secureDelete(id:string):Promise<boolean>; setClipboard(value:string):Promise<boolean>; authenticateBiometric():Promise<boolean>; getPin():Promise<string>; verifyPin(value:string):Promise<boolean>; setPin(value:string):Promise<boolean>};
export const nativeStore = NativeModules.AccountStorage as NativeStore | undefined;
