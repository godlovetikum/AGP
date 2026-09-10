import React from 'react';
import {Linking, Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {Client, Platform, Project, RegisterData} from '../domain/models';

type Props = {entity: Client | Project | Platform; kind: 'client' | 'project' | 'platform'; data: RegisterData; onBack: () => void; onOpenAccount?: (id: string) => void; onOpenClient?: (id: string) => void; onOpenProject?: (id: string) => void};

export function FilingDetailScreen({entity, kind, data, onBack, onOpenAccount, onOpenClient, onOpenProject}: Props) {
  const links = entity.links || [];
  const accounts = kind === 'client' ? data.records.filter(r => r.clientIds?.includes(entity.id) || r.clientId === entity.id) : kind === 'project' ? data.records.filter(r => r.projectIds?.includes(entity.id) || r.projectId === entity.id) : data.records.filter(r => r.platformId === entity.id);
  const projects = kind === 'client' ? data.projects.filter(p => p.clientIds?.includes(entity.id) || p.clientId === entity.id) : [];
  const clients = kind === 'project' ? data.clients.filter(c => (entity as Project).clientIds?.includes(c.id) || (entity as Project).clientId === c.id) : [];
  return <ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={onBack}><Text style={styles.back}>‹ Back</Text></Pressable><Text style={styles.eyebrow}>{kind}</Text><Text style={styles.title}>{entity.name}</Text>
    {kind === 'platform' ? <Text style={styles.context}>Platform context for accounts</Text> : null}
    {kind === 'project' ? <Text style={styles.description}>{(entity as Project).description}</Text> : null}
    <Section title="Related accounts" />{accounts.length ? accounts.map(account => <Pressable style={styles.row} key={account.id} onPress={() => onOpenAccount?.(account.id)}><Text style={styles.rowTitle}>{account.accountName}</Text><Text style={styles.meta}>{account.email} · {data.platforms.find(p => p.id === account.platformId)?.name || 'No platform'}</Text></Pressable>) : <Text style={styles.empty}>No accounts associated.</Text>}
    {kind === 'client' ? <><Section title="Related projects" />{projects.length ? projects.map(project => <Pressable style={styles.row} key={project.id} onPress={() => onOpenProject?.(project.id)}><Text style={styles.rowTitle}>{project.name}</Text><Text style={styles.meta}>{project.description}</Text></Pressable>) : <Text style={styles.empty}>No projects associated.</Text>}</> : null}
    {kind === 'project' ? <><Section title="Related clients" />{clients.length ? clients.map(client => <Pressable style={styles.row} key={client.id} onPress={() => onOpenClient?.(client.id)}><Text style={styles.rowTitle}>{client.name}</Text></Pressable>) : <Text style={styles.empty}>No clients associated.</Text>}</> : null}
    <Section title="Links" />{links.length ? links.map(link => <Pressable key={link.id} onPress={() => Linking.openURL(link.url)}><Text style={styles.link}>{link.label}: {link.url}</Text></Pressable>) : <Text style={styles.empty}>No links saved.</Text>}
  </ScrollView>;
}
function Section({title}: {title: string}) {return <Text style={styles.section}>{title}</Text>;}
const styles = StyleSheet.create({page: {padding: 20, paddingBottom: 50}, back: {color: '#5267d9', fontWeight: '700', marginTop: 10}, eyebrow: {color: '#5267d9', fontWeight: '800', textTransform: 'uppercase', marginTop: 24}, title: {fontSize: 28, fontWeight: '800', color: '#172033', marginTop: 8}, context: {color: '#5267d9', marginTop: 8, textDecorationLine: 'underline'}, description: {color: '#687386', lineHeight: 21, marginTop: 8}, section: {fontSize: 13, fontWeight: '800', color: '#5267d9', textTransform: 'uppercase', marginTop: 24, marginBottom: 8}, row: {backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e7f0', borderRadius: 12, padding: 14, marginBottom: 8}, rowTitle: {fontWeight: '800', color: '#172033'}, meta: {color: '#687386', marginTop: 4}, link: {color: '#5267d9', textDecorationLine: 'underline', marginBottom: 10}, empty: {color: '#687386'}});
