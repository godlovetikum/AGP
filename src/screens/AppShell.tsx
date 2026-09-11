import React, {useEffect, useState} from 'react';
import {Alert, AppState, StyleSheet, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
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
import {AccountRecord, RegisterData, Client, Platform, Project} from '../domain/models';
import {setAccountRelations} from '../domain/relationships';
import {FilingDetailScreen} from './FilingDetailScreen';

export type RootStackParamList = {MainTabs: undefined; AccountForm: undefined; AccountDetail: undefined; Categories: undefined; Platforms: undefined; FilingDetail: undefined};
export type TabParamList = {Overview: undefined; Accounts: undefined; Clients: undefined; Projects: undefined; More: undefined};
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const screenOptions = {headerShown: false, contentStyle: {backgroundColor: '#f5f7fb'}};
const tabIcons: Record<keyof TabParamList, string> = {Overview: '⌂', Accounts: '▣', Clients: '●', Projects: '◆', More: '⋯'};
function TabIcon({name, color}: {name: keyof TabParamList; color: string}) { return <Text style={[styles.tabIcon, {color}]}>{tabIcons[name]}</Text>; }

function SafeScreen({children}: {children?: React.ReactNode}) { return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>{children}</SafeAreaView>; }

export default function AppShell() {
  const {data, ready, hasPin, setPin, saveRecord, updateRecord, removeRecord, persist} = useRegisterStore();
  const [selected, setSelected] = useState<AccountRecord>();
  const [selectedFiling, setSelectedFiling] = useState<{entity: Client | Project | Platform; kind: 'client' | 'project' | 'platform'}>();
  const [locked, setLocked] = useState(false);
  const [initialLockChecked, setInitialLockChecked] = useState(false);
  const [pin, setPinValue] = useState('');

  useEffect(() => {if (ready && !initialLockChecked) {setLocked(hasPin); setInitialLockChecked(true);}}, [ready, hasPin, initialLockChecked]);
  useEffect(() => {const subscription = AppState.addEventListener('change', state => {if (state !== 'active' && hasPin) setLocked(true);}); return () => subscription.remove();}, [hasPin]);
  if (!ready) return <SafeScreen />;
  if (locked) return <SafeScreen><LockScreen hasPin={hasPin} pin={pin} onChangePin={setPinValue} onUnlock={async () => {if (nativeStore && !(await nativeStore.verifyPin(pin))) return Alert.alert('Incorrect PIN'); setLocked(false); setPinValue('');}} onBiometric={async () => {if (nativeStore && await nativeStore.authenticateBiometric()) setLocked(false);}}/></SafeScreen>;

  const saveData = async (next: RegisterData) => {await persist(next);};
  const save = async (value: Partial<AccountRecord> & {accountName: string; platformId: string; password?: string}) => {const now = new Date().toISOString(); const primaryLink = value.links?.find(link => link.isPrimary) || value.links?.[0]; const record: AccountRecord = {...selected, ...value, id: selected?.id || `${Date.now()}`, accountName: value.accountName, platformId: value.platformId, accountUrl: primaryLink?.url || undefined, email: value.email || '', username: value.username || '', tags: value.tags || [], notes: value.notes || '', status: value.status || 'active', createdAt: selected?.createdAt || now, updatedAt: now}; await saveRecord({...record, password: value.password}); const synced = setAccountRelations({...data, records: [...data.records.filter(item => item.id !== record.id), record]}, record.id, record.clientIds || [], record.projectIds || []); await persist(synced); setSelected(record);};
  const updateSelected = async (changes: Partial<AccountRecord>) => {if (!selected) return; const saved = await updateRecord(selected.id, changes); setSelected(saved.records.find(record => record.id === selected.id));};
  const add = (navigation: any) => {setSelected(undefined); navigation.navigate('AccountForm');};
  const openAccount = (id: string, navigation: any) => {const record = data.records.find(item => item.id === id); if (record) {setSelected(record); navigation.navigate('AccountDetail');}};
  const openFiling = (id: string, kind: 'client' | 'project' | 'platform', navigation: any) => {const entity = kind === 'client' ? data.clients.find(item => item.id === id) : kind === 'project' ? data.projects.find(item => item.id === id) : data.platforms.find(item => item.id === id); if (entity) {setSelectedFiling({entity, kind}); navigation.navigate('FilingDetail');}};

  return <NavigationContainer><Stack.Navigator initialRouteName="MainTabs" screenOptions={screenOptions}>
    <Stack.Screen name="MainTabs">{({navigation}) => <Tabs.Navigator initialRouteName="Overview" screenOptions={({route}) => ({headerShown: false, tabBarActiveTintColor: '#5267d9', tabBarInactiveTintColor: '#87909c', tabBarLabelStyle: {fontSize: 11, fontWeight: '700'}, tabBarIcon: ({color}) => <TabIcon name={route.name} color={color}/>})}>
      <Tabs.Screen name="Overview">{({navigation: tabNavigation}) => <SafeScreen><DashboardScreen data={data} onRecords={() => tabNavigation.navigate('Accounts')} onAdd={() => add(navigation)} onSettings={() => tabNavigation.navigate('More')}/></SafeScreen>}</Tabs.Screen>
      <Tabs.Screen name="Accounts">{({navigation: tabNavigation}) => <SafeScreen><RegisterScreen data={data} onBack={() => tabNavigation.navigate('Overview')} onAdd={() => add(navigation)} onOpen={record => {setSelected(record); navigation.navigate('AccountDetail');}}/></SafeScreen>}</Tabs.Screen>
      <Tabs.Screen name="Clients">{({navigation: tabNavigation}) => <SafeScreen><ClientsScreen data={data} onBack={() => tabNavigation.navigate('Overview')} onSave={saveData} onOpen={client => {setSelectedFiling({entity: client, kind: 'client'}); navigation.navigate('FilingDetail');}}/></SafeScreen>}</Tabs.Screen>
      <Tabs.Screen name="Projects">{({navigation: tabNavigation}) => <SafeScreen><ProjectsScreen data={data} onBack={() => tabNavigation.navigate('Overview')} onSave={saveData} onOpen={project => {setSelectedFiling({entity: project, kind: 'project'}); navigation.navigate('FilingDetail');}}/></SafeScreen>}</Tabs.Screen>
      <Tabs.Screen name="More">{({navigation: tabNavigation}) => <SafeScreen><SettingsScreen data={data} hasPin={hasPin} onBack={() => tabNavigation.navigate('Overview')} onCategories={() => navigation.navigate('Categories')} onPlatforms={() => navigation.navigate('Platforms')} onProjects={() => tabNavigation.navigate('Projects')} onClients={() => tabNavigation.navigate('Clients')} onSetPin={async value => {await setPin(value); tabNavigation.navigate('Overview');}}/></SafeScreen>}</Tabs.Screen>
    </Tabs.Navigator>}</Stack.Screen>
    <Stack.Screen name="AccountForm">{({navigation}) => <SafeScreen><AccountFormScreen record={selected} data={data} onBack={() => navigation.goBack()} onCreateRelated={next => {persist(next);}} onCreatePlatform={next => {persist(next);}} onSave={async value => {await save(value); navigation.navigate('AccountDetail');}}/></SafeScreen>}</Stack.Screen>
    <Stack.Screen name="AccountDetail">{({navigation}) => selected ? <SafeScreen><AccountDetailScreen record={selected} data={data} onBack={() => navigation.goBack()} onEdit={() => navigation.navigate('AccountForm')} onUpdate={updateSelected} onDelete={async () => {await removeRecord(selected); navigation.navigate('MainTabs');}} onOpenClient={id => openFiling(id, 'client', navigation)} onOpenProject={id => openFiling(id, 'project', navigation)} onOpenPlatform={id => openFiling(id, 'platform', navigation)}/></SafeScreen> : null}</Stack.Screen>
    <Stack.Screen name="Categories">{({navigation}) => <SafeScreen><CategoriesScreen data={data} onBack={() => navigation.goBack()} onSave={saveData}/></SafeScreen>}</Stack.Screen>
    <Stack.Screen name="Platforms">{({navigation}) => <SafeScreen><PlatformsScreen data={data} onBack={() => navigation.goBack()} onSave={saveData} onOpen={platform => {setSelectedFiling({entity: platform, kind: 'platform'}); navigation.navigate('FilingDetail');}}/></SafeScreen>}</Stack.Screen>
    <Stack.Screen name="FilingDetail">{({navigation}) => selectedFiling ? <SafeScreen><FilingDetailScreen data={data} entity={selectedFiling.entity} kind={selectedFiling.kind} onBack={() => navigation.goBack()} onOpenAccount={id => openAccount(id, navigation)} onOpenClient={id => openFiling(id, 'client', navigation)} onOpenProject={id => openFiling(id, 'project', navigation)}/></SafeScreen> : null}</Stack.Screen>
  </Stack.Navigator></NavigationContainer>;
}
const styles = StyleSheet.create({safe: {flex: 1, backgroundColor: '#f5f7fb'}, tabIcon: {fontSize: 18}});
