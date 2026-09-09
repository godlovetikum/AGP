import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {AccountRecord} from '../domain/models';

export const formatDate = (value?: string) => {
  if (!value) return 'Not yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString([], {day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'});
};

type AccountCardProps = {record: AccountRecord; names: {client: string; project: string; platform: string}; onPress: () => void};

export function AccountCard({record, names, onPress}: AccountCardProps) {
  return <Pressable onPress={onPress} style={styles.card}>
    <View style={styles.header}><View style={styles.identity}><Text style={styles.platform}>{names.platform.toUpperCase()}</Text><Text style={styles.account}>{record.accountName}</Text></View><Text style={styles.status}>{record.status}</Text></View>
    <Text style={styles.meta}>{names.client}{names.project ? ` • ${names.project}` : ''}</Text>
    {record.email ? <Text style={styles.email}>Email: {record.email}</Text> : null}
    <Text style={styles.updated}>Updated {formatDate(record.updatedAt)}</Text>
    <View style={styles.tags}>{record.tags.map(tag => <Text key={tag} style={styles.tag}>#{tag}</Text>)}</View>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e6eaf1'},
  header: {flexDirection: 'row'}, identity: {flex: 1}, platform: {color: '#5267d9', fontWeight: '800', fontSize: 12}, account: {color: '#172033', fontWeight: '800', fontSize: 18, marginTop: 3}, status: {color: '#287a51', backgroundColor: '#e5f5ec', padding: 6, borderRadius: 14, fontSize: 11}, meta: {color: '#4e596b', marginTop: 12}, email: {color: '#687386', marginTop: 7}, updated: {color: '#687386', fontSize: 11, marginTop: 7}, tags: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8}, tag: {color: '#5267d9', fontSize: 12},
});
