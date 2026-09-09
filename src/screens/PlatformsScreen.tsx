import React, {useState} from 'react';
import {Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Platform, RegisterData} from '../domain/models';
import {FormField} from '../components/FormField';
import {SelectField} from '../components/SelectField';
import {isValidUrl} from '../domain/validation';

export function PlatformsScreen({data, onBack, onSave}: {data: RegisterData; onBack: () => void; onSave: (next: RegisterData) => void}) {
  const [editing, setEditing] = useState<Platform>();
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const begin = (platform?: Platform) => {setEditing(platform); setName(platform?.name || ''); setWebsiteUrl(platform?.websiteUrl || ''); setCategoryId(platform?.categoryId || '');};
  const save = () => {
    if (!name.trim()) return Alert.alert('Platform name required');
    if (!isValidUrl(websiteUrl)) return Alert.alert('Enter a valid http or https website link');
    const now = new Date().toISOString();
    const platform: Platform = {id: editing?.id || `platform-${Date.now()}`, name: name.trim(), websiteUrl: websiteUrl.trim() || undefined, categoryId: categoryId || undefined, archived: editing?.archived || false, createdAt: editing?.createdAt || now, updatedAt: now};
    onSave({...data, platforms: [...data.platforms.filter(item => item.id !== platform.id), platform]});
    begin();
  };
  const archive = (platform: Platform) => onSave({...data, platforms: data.platforms.map(item => item.id === platform.id ? {...item, archived: true, updatedAt: new Date().toISOString()} : item)});
  return <ScrollView contentContainerStyle={styles.page}><Pressable onPress={onBack}><Text style={styles.back}>‹ Filing settings</Text></Pressable><Text style={styles.title}>Platforms</Text><Text style={styles.hint}>Maintain the services and providers used by your accounts. A platform can have a central website link and a category.</Text><View style={styles.card}><Text style={styles.cardTitle}>{editing ? 'Edit platform' : 'Add platform'}</Text><FormField label="Name" value={name} placeholder="Example: Supabase" onChangeText={setName}/><FormField label="Website link" value={websiteUrl} placeholder="https://..." keyboardType="url" onChangeText={setWebsiteUrl}/><SelectField label="Category" value={categoryId} options={[{id: '', name: 'No category'}, ...data.categories.filter(item => !item.archived)]} onChange={setCategoryId}/><Pressable style={styles.primary} onPress={save}><Text style={styles.primaryText}>{editing ? 'Save changes' : 'Add platform'}</Text></Pressable>{editing ? <Pressable style={styles.outline} onPress={() => begin()}><Text style={styles.outlineText}>Cancel edit</Text></Pressable> : null}</View><Text style={styles.section}>Available platforms</Text>{data.platforms.filter(item => !item.archived).map(platform => <View style={styles.row} key={platform.id}><View style={styles.flex}><Text style={styles.rowTitle}>{platform.name}</Text><Text style={styles.rowMeta}>{data.categories.find(category => category.id === platform.categoryId)?.name || 'No category'} · {data.records.filter(record => record.platformId === platform.id).length} account(s)</Text>{platform.websiteUrl ? <Pressable onPress={() => Linking.openURL(platform.websiteUrl!)}><Text style={styles.link}>{platform.websiteUrl}</Text></Pressable> : null}</View><Pressable onPress={() => begin(platform)}><Text style={styles.action}>Edit</Text></Pressable><Pressable onPress={() => archive(platform)}><Text style={styles.archive}>Archive</Text></Pressable></View>)}</ScrollView>;
}

const styles = StyleSheet.create({page: {padding: 20, paddingBottom: 50}, back: {color: '#5267d9', fontWeight: '700'}, title: {fontSize: 26, fontWeight: '800', color: '#172033', marginVertical: 16}, hint: {color: '#687386', lineHeight: 21}, card: {backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#e2e7f0', padding: 16, marginTop: 18}, cardTitle: {fontSize: 17, fontWeight: '800', color: '#172033', marginBottom: 14}, primary: {backgroundColor: '#5267d9', borderRadius: 12, padding: 14, marginTop: 4}, primaryText: {color: '#fff', fontWeight: '800', textAlign: 'center'}, outline: {borderWidth: 1, borderColor: '#cbd3e0', borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 8}, outlineText: {color: '#5267d9', fontWeight: '800'}, section: {fontSize: 13, fontWeight: '800', color: '#687386', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 8}, row: {backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e7f0', borderRadius: 13, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10}, flex: {flex: 1}, rowTitle: {color: '#172033', fontWeight: '800'}, rowMeta: {color: '#687386', fontSize: 12, marginTop: 5}, link: {color: '#5267d9', fontSize: 12, marginTop: 5, textDecorationLine: 'underline'}, action: {color: '#5267d9', fontWeight: '800'}, archive: {color: '#b34848', fontWeight: '700'}});
