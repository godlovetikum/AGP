import React, {useEffect, useState} from 'react';
import {Alert, AppState, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LockScreen} from './LockScreen';
import {DashboardScreen} from './DashboardScreen';
import {RegisterScreen} from './RegisterScreen';
import {AccountFormScreen} from './AccountFormScreen';
import {AccountDetailScreen} from './AccountDetailScreen';
import {SettingsScreen} from './SettingsScreen';
import {CategoriesScreen} from './CategoriesScreen';
import {PlatformsScreen} from './PlatformsScreen';
import {ProjectsScreen} from './ProjectsScreen';
import {useRegisterStore} from '../hooks/useRegisterStore';
import {nativeStore} from '../services/nativeStore';
import {AccountRecord, RegisterData} from '../domain/models';

type Screen = 'dashboard' | 'records' | 'form' | 'detail' | 'settings' | 'categories' | 'platforms' | 'projects';

export default function AppShell() {
  const {data, ready, hasPin, setPin, saveRecord, removeRecord, persist} = useRegisterStore();
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [selected, setSelected] = useState<AccountRecord>();
  const [locked, setLocked] = useState(false);
  const [pin, setPinValue] = useState('');

  useEffect(() => { const subscription = AppState.addEventListener('change', state => { if (state !== 'active' && hasPin) setLocked(true); }); return () => subscription.remove(); }, [hasPin]);
  if (!ready) return <SafeAreaView style={styles.safe}/>;
  if (locked) return <SafeAreaView style={styles.safe}><LockScreen hasPin={hasPin} pin={pin} onChangePin={setPinValue} onUnlock={async () => { if (nativeStore && !(await nativeStore.verifyPin(pin))) return Alert.alert('Incorrect PIN'); setLocked(false); setPinValue(''); }} onBiometric={async () => { if (nativeStore && await nativeStore.authenticateBiometric()) setLocked(false); }}/></SafeAreaView>;

  const add = () => { setSelected(undefined); setScreen('form'); };
  const openRecord = (record: AccountRecord) => { setSelected(record); setScreen('detail'); };
  const save = async (value: Partial<AccountRecord> & {accountName: string; platformId: string; password?: string}) => {
    const now = new Date().toISOString();
    const record: AccountRecord = {...selected, ...value, id: selected?.id || `${Date.now()}`, accountName: value.accountName, platformId: value.platformId, email: value.email || '', username: value.username || '', tags: value.tags || [], notes: value.notes || '', status: value.status || 'active', createdAt: selected?.createdAt || now, updatedAt: now};
    await saveRecord({...record, password: value.password}); setSelected(record); setScreen('detail');
  };
  const saveData = async (next: RegisterData) => { await persist(next); };

  if (screen === 'records') return <SafeAreaView style={styles.safe}><RegisterScreen data={data} onBack={() => setScreen('dashboard')} onAdd={add} onOpen={openRecord}/></SafeAreaView>;
  if (screen === 'form') return <SafeAreaView style={styles.safe}><AccountFormScreen record={selected} data={data} onBack={() => setScreen(selected ? 'detail' : 'records')} onSave={save}/></SafeAreaView>;
  if (screen === 'detail' && selected) return <SafeAreaView style={styles.safe}><AccountDetailScreen record={selected} data={data} onBack={() => setScreen('records')} onEdit={() => setScreen('form')} onDelete={async () => { await removeRecord(selected); setScreen('records'); }}/></SafeAreaView>;
  if (screen === 'categories') return <SafeAreaView style={styles.safe}><CategoriesScreen data={data} onBack={() => setScreen('settings')} onSave={saveData}/></SafeAreaView>;
  if (screen === 'platforms') return <SafeAreaView style={styles.safe}><PlatformsScreen data={data} onBack={() => setScreen('settings')} onSave={saveData}/></SafeAreaView>;
  if (screen === 'projects') return <SafeAreaView style={styles.safe}><ProjectsScreen data={data} onBack={() => setScreen('settings')} onSave={saveData}/></SafeAreaView>;
  if (screen === 'settings') return <SafeAreaView style={styles.safe}><SettingsScreen data={data} hasPin={hasPin} onBack={() => setScreen('dashboard')} onCategories={() => setScreen('categories')} onPlatforms={() => setScreen('platforms')} onProjects={() => setScreen('projects')} onSetPin={async value => { await setPin(value); setScreen('dashboard'); }}/></SafeAreaView>;
  return <SafeAreaView style={styles.safe}><DashboardScreen data={data} onRecords={() => setScreen('records')} onAdd={add} onSettings={() => setScreen('settings')}/></SafeAreaView>;
}

const styles = StyleSheet.create({safe: {flex: 1, backgroundColor: '#f5f7fb'}});
