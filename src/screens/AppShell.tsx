import React, {useEffect, useState} from 'react';
import {Alert, AppState, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
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
import {ClientsScreen} from './ClientsScreen';
import {useRegisterStore} from '../hooks/useRegisterStore';
import {nativeStore} from '../services/nativeStore';
import {AccountRecord, RegisterData} from '../domain/models';
import {setAccountRelations} from '../domain/relationships';
import {FilingDetailScreen} from './FilingDetailScreen';
import {Client, Platform, Project} from '../domain/models';

export type RootStackParamList = {Dashboard: undefined; Register: undefined; AccountForm: undefined; AccountDetail: undefined; Settings: undefined; Categories: undefined; Platforms: undefined; Projects: undefined; Clients: undefined; FilingDetail: undefined};
const Stack = createNativeStackNavigator<RootStackParamList>();
const screenOptions = {headerShown: false, contentStyle: {backgroundColor: '#f5f7fb'}};

export default function AppShell() {
  const {data, ready, hasPin, setPin, saveRecord, updateRecord, removeRecord, persist} = useRegisterStore();
  const [selected, setSelected] = useState<AccountRecord>();
  const [selectedFiling, setSelectedFiling] = useState<{entity: Client | Project | Platform; kind: 'client' | 'project' | 'platform'}>();
  const [locked, setLocked] = useState(false);
  const [pin, setPinValue] = useState('');
  useEffect(() => {const subscription = AppState.addEventListener('change', state => {if (state !== 'active' && hasPin) setLocked(true);}); return () => subscription.remove();}, [hasPin]);
  if (!ready) return <SafeAreaView style={styles.safe}/>;
  if (locked) return <SafeAreaView style={styles.safe}><LockScreen hasPin={hasPin} pin={pin} onChangePin={setPinValue} onUnlock={async () => {if (nativeStore && !(await nativeStore.verifyPin(pin))) return Alert.alert('Incorrect PIN'); setLocked(false); setPinValue('');}} onBiometric={async () => {if (nativeStore && await nativeStore.authenticateBiometric()) setLocked(false);}}/></SafeAreaView>;

  const saveData = async (next: RegisterData) => {await persist(next);};
  const save = async (value: Partial<AccountRecord> & {accountName: string; platformId: string; password?: string}) => {const now = new Date().toISOString(); const primaryLink = value.links?.find(link => link.isPrimary) || value.links?.[0]; const record: AccountRecord = {...selected, ...value, id: selected?.id || `${Date.now()}`, accountName: value.accountName, platformId: value.platformId, accountUrl: primaryLink?.url || undefined, email: value.email || '', username: value.username || '', tags: value.tags || [], notes: value.notes || '', status: value.status || 'active', createdAt: selected?.createdAt || now, updatedAt: now}; await saveRecord({...record, password: value.password}); const synced = setAccountRelations({...data, records: [...data.records.filter(item => item.id !== record.id), record]}, record.id, record.clientIds || [], record.projectIds || []); await persist(synced); setSelected(record);};
  const updateSelected = async (changes: Partial<AccountRecord>) => {if (!selected) return; const saved = await updateRecord(selected.id, changes); setSelected(saved.records.find(record => record.id === selected.id));};
  const add = (navigation: {navigate: (route: 'AccountForm') => void}) => {setSelected(undefined); navigation.navigate('AccountForm');};
  const openAccount = (id: string, navigation: {navigate: (route: 'AccountDetail') => void}) => {const record = data.records.find(item => item.id === id); if (record) {setSelected(record); navigation.navigate('AccountDetail');}};
  const openFiling = (id: string, kind: 'client' | 'project' | 'platform', navigation: {navigate: (route: 'FilingDetail') => void}) => {const entity = kind === 'client' ? data.clients.find(item => item.id === id) : kind === 'project' ? data.projects.find(item => item.id === id) : data.platforms.find(item => item.id === id); if (entity) {setSelectedFiling({entity, kind}); navigation.navigate('FilingDetail');}};

  return <NavigationContainer><Stack.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
    <Stack.Screen name="Dashboard">{({navigation}) => <DashboardScreen data={data} onRecords={() => navigation.navigate('Register')} onAdd={() => add(navigation)} onSettings={() => navigation.navigate('Settings')}/>}</Stack.Screen>
    <Stack.Screen name="Register">{({navigation}) => <RegisterScreen data={data} onBack={() => navigation.navigate('Dashboard')} onAdd={() => add(navigation)} onOpen={record => {setSelected(record); navigation.navigate('AccountDetail');}}/>}</Stack.Screen>
    <Stack.Screen name="AccountForm">{({navigation}) => <AccountFormScreen record={selected} data={data} onBack={() => navigation.goBack()} onCreateRelated={next => {persist(next);}} onCreatePlatform={next => {persist(next);}} onSave={async value => {await save(value); navigation.navigate('AccountDetail');}}/>}</Stack.Screen>
    <Stack.Screen name="AccountDetail">{({navigation}) => selected ? <AccountDetailScreen record={selected} data={data} onBack={() => navigation.goBack()} onEdit={() => navigation.navigate('AccountForm')} onUpdate={updateSelected} onDelete={async () => {await removeRecord(selected); navigation.navigate('Register');}} onOpenClient={id => openFiling(id, 'client', navigation)} onOpenProject={id => openFiling(id, 'project', navigation)} onOpenPlatform={id => openFiling(id, 'platform', navigation)}/> : null}</Stack.Screen>
    <Stack.Screen name="Settings">{({navigation}) => <SettingsScreen data={data} hasPin={hasPin} onBack={() => navigation.navigate('Dashboard')} onCategories={() => navigation.navigate('Categories')} onPlatforms={() => navigation.navigate('Platforms')} onProjects={() => navigation.navigate('Projects')} onClients={() => navigation.navigate('Clients')} onSetPin={async value => {await setPin(value); navigation.navigate('Dashboard');}}/>}</Stack.Screen>
    <Stack.Screen name="Categories">{({navigation}) => <CategoriesScreen data={data} onBack={() => navigation.goBack()} onSave={saveData}/>}</Stack.Screen>
    <Stack.Screen name="Platforms">{({navigation}) => <PlatformsScreen data={data} onBack={() => navigation.goBack()} onSave={saveData} onOpen={platform => {setSelectedFiling({entity: platform, kind: 'platform'}); navigation.navigate('FilingDetail');}}/>}</Stack.Screen>
    <Stack.Screen name="Projects">{({navigation}) => <ProjectsScreen data={data} onBack={() => navigation.goBack()} onSave={saveData} onOpen={project => {setSelectedFiling({entity: project, kind: 'project'}); navigation.navigate('FilingDetail');}}/>}</Stack.Screen>
    <Stack.Screen name="Clients">{({navigation}) => <ClientsScreen data={data} onBack={() => navigation.goBack()} onSave={saveData} onOpen={client => {setSelectedFiling({entity: client, kind: 'client'}); navigation.navigate('FilingDetail');}}/>}</Stack.Screen>
    <Stack.Screen name="FilingDetail">{({navigation}) => selectedFiling ? <FilingDetailScreen data={data} entity={selectedFiling.entity} kind={selectedFiling.kind} onBack={() => navigation.goBack()} onOpenAccount={id => openAccount(id, navigation)} onOpenClient={id => openFiling(id, 'client', navigation)} onOpenProject={id => openFiling(id, 'project', navigation)}/>: null}</Stack.Screen>
  </Stack.Navigator></NavigationContainer>;
}
const styles = StyleSheet.create({safe: {flex: 1, backgroundColor: '#f5f7fb'}});
