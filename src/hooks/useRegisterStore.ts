import {useCallback, useEffect, useState} from 'react';
import {AccountRecord, RegisterData} from '../domain/models';
import {nativeStore} from '../services/nativeStore';
import {defaultRegisterData, loadRegisterData, saveRegisterData} from '../storage/registerStore';

export function useRegisterStore() {
  const [data, setData] = useState<RegisterData>(defaultRegisterData());
  const [ready, setReady] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  useEffect(() => { Promise.all([loadRegisterData(), nativeStore?.getPin() || Promise.resolve('')]).then(([loaded, pin]) => {setData(loaded); setHasPin(Boolean(pin)); setReady(true);}); }, []);
  const persist = useCallback(async (next: RegisterData) => { const saved = await saveRegisterData(next); setData(saved); return saved; }, []);
  const saveRecord = useCallback(async (record: AccountRecord & {password?: string}) => { const timestamp = new Date().toISOString(); const passwordRef = record.passwordRef || (record.password ? `${record.id}-secret` : undefined); if (record.password && passwordRef && nativeStore) await nativeStore.secureSave(passwordRef, record.password); const safeRecord = {...record, passwordRef, updatedAt: timestamp}; delete (safeRecord as AccountRecord & {password?: string}).password; return persist({...data, records: [...data.records.filter(item => item.id !== safeRecord.id), safeRecord]}); }, [data, persist]);
  const removeRecord = useCallback(async (record: AccountRecord) => {if (record.passwordRef && nativeStore) await nativeStore.secureDelete(record.passwordRef); return persist({...data, records: data.records.filter(item => item.id !== record.id)});}, [data, persist]);
  const setPin = useCallback(async (value: string) => {if (nativeStore) await nativeStore.setPin(value); setHasPin(Boolean(value));}, []);
  return {data, ready, hasPin, setPin, persist, saveRecord, removeRecord};
}
