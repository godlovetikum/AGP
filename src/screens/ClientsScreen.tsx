import React, {useState} from 'react';
import {Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Client, RegisterData} from '../domain/models';
import {FormField} from '../components/FormField';
import {isValidUrl} from '../domain/validation';

export function ClientsScreen({data, onBack, onSave}: {data: RegisterData; onBack: () => void; onSave: (next: RegisterData) => void}) {
  const [editing, setEditing] = useState<Client>();
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [notes, setNotes] = useState('');
  const begin = (client?: Client) => {setEditing(client); setName(client?.name || ''); setWebsiteUrl(client?.websiteUrl || ''); setNotes(client?.notes || '');};
  const save = () => {
    if (!name.trim()) return Alert.alert('Client name required');
    if (!isValidUrl(websiteUrl)) return Alert.alert('Enter a valid http or https website link');
    const now = new Date().toISOString();
    const client: Client = {id: editing?.id || `client-${Date.now()}`, name: name.trim(), websiteUrl: websiteUrl.trim() || undefined, notes: notes.trim(), archived: editing?.archived || false, createdAt: editing?.createdAt || now, updatedAt: now};
    onSave({...data, clients: [...data.clients.filter(item => item.id !== client.id), client]});
    begin();
  };
  const archive = (client: Client) => {
    if (data.records.some(record => record.clientId === client.id)) return Alert.alert('Reassign accounts first', 'This client still has account records. Reassign them before archiving the client.');
    if (data.projects.some(project => project.clientId === client.id)) return Alert.alert('Reassign projects first', 'This client still has projects. Reassign them before archiving the client.');
    onSave({...data, clients: data.clients.map(item => item.id === client.id ? {...item, archived: true, updatedAt: new Date().toISOString()} : item)});
  };
  return <ScrollView contentContainerStyle={styles.page}><Pressable onPress={onBack}><Text style={styles.back}>‹ Filing settings</Text></Pressable><Text style={styles.title}>Clients</Text><Text style={styles.hint}>Clients are optional context for accounts and projects. Personal, internal, shared, and investment records do not need a client.</Text><View style={styles.card}><Text style={styles.cardTitle}>{editing ? 'Edit client' : 'Add client'}</Text><FormField label="Name" value={name} placeholder="Example: Acme Ltd" onChangeText={setName}/><FormField label="Website link" value={websiteUrl} placeholder="https://..." keyboardType="url" onChangeText={setWebsiteUrl}/><FormField label="Notes" value={notes} placeholder="Optional client notes" multiline onChangeText={setNotes}/><Pressable style={styles.primary} onPress={save}><Text style={styles.primaryText}>{editing ? 'Save changes' : 'Add client'}</Text></Pressable>{editing ? <Pressable style={styles.outline} onPress={() => begin()}><Text style={styles.outlineText}>Cancel edit</Text></Pressable> : null}</View><Text style={styles.section}>Active clients</Text>{data.clients.filter(item => !item.archived).map(client => <View style={styles.row} key={client.id}><View style={styles.flex}><Text style={styles.rowTitle}>{client.name}</Text><Text style={styles.rowMeta}>{data.records.filter(record => record.clientId === client.id).length} account(s) · {data.projects.filter(project => project.clientId === client.id).length} project(s)</Text>{client.websiteUrl ? <Pressable onPress={() => Linking.openURL(client.websiteUrl!)}><Text style={styles.link}>{client.websiteUrl}</Text></Pressable> : null}</View><Pressable onPress={() => begin(client)}><Text style={styles.action}>Edit</Text></Pressable><Pressable onPress={() => archive(client)}><Text style={styles.archive}>Archive</Text></Pressable></View>)}</ScrollView>;
}

const styles = StyleSheet.create({page: {padding: 20, paddingBottom: 50}, back: {color: '#5267d9', fontWeight: '700'}, title: {fontSize: 26, fontWeight: '800', color: '#172033', marginVertical: 16}, hint: {color: '#687386', lineHeight: 21}, card: {backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#e2e7f0', padding: 16, marginTop: 18}, cardTitle: {fontSize: 17, fontWeight: '800', color: '#172033', marginBottom: 14}, primary: {backgroundColor: '#5267d9', borderRadius: 12, padding: 14, marginTop: 4}, primaryText: {color: '#fff', fontWeight: '800', textAlign: 'center'}, outline: {borderWidth: 1, borderColor: '#cbd3e0', borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 8}, outlineText: {color: '#5267d9', fontWeight: '800'}, section: {fontSize: 13, fontWeight: '800', color: '#687386', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 8}, row: {backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e7f0', borderRadius: 13, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10}, flex: {flex: 1}, rowTitle: {color: '#172033', fontWeight: '800'}, rowMeta: {color: '#687386', fontSize: 12, marginTop: 5}, link: {color: '#5267d9', fontSize: 12, marginTop: 5, textDecorationLine: 'underline'}, action: {color: '#5267d9', fontWeight: '800'}, archive: {color: '#b34848', fontWeight: '700'}});
