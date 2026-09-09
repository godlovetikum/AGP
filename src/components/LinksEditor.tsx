import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {LinkReference} from '../domain/models';
import {FormField} from './FormField';
import {normalizeUrl, isValidUrl} from '../domain/validation';

type Props = {links: LinkReference[]; onChange: (links: LinkReference[]) => void; primaryLabel?: string};
const newLink = (primary = false): LinkReference => ({id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: primary ? 'Primary link' : '', url: '', isPrimary: primary});

export function LinksEditor({links, onChange, primaryLabel = 'Primary link'}: Props) {
  const values = links.length ? links : [newLink(true)];
  const update = (id: string, changes: Partial<LinkReference>) => onChange(values.map(link => link.id === id ? {...link, ...changes, url: changes.url === undefined ? link.url : normalizeUrl(changes.url)} : link));
  const remove = (id: string) => onChange(values.length === 1 ? [newLink(true)] : values.filter(link => link.id !== id));
  return <View style={styles.root}><Text style={styles.heading}>Links</Text>{values.map((link, index) => <View style={styles.linkCard} key={link.id}><FormField label={index === 0 ? primaryLabel : 'Link name'} value={link.label} placeholder={index === 0 ? primaryLabel : 'Example: Client portal'} onChangeText={label => update(link.id, {label})}/>{index > 0 ? null : null}<FormField label="URL" value={link.url} placeholder="https://..." keyboardType="url" onChangeText={url => update(link.id, {url})}/>{link.url && !isValidUrl(link.url) ? <Text style={styles.error}>Enter a valid http or https link.</Text> : null}<Pressable onPress={() => remove(link.id)}><Text style={styles.remove}>{values.length === 1 ? 'Clear link' : 'Remove link'}</Text></Pressable></View>)}<Pressable style={styles.add} onPress={() => onChange([...values, newLink(false)])}><Text style={styles.addText}>+ Add another link</Text></Pressable></View>;
}
const styles = StyleSheet.create({root: {marginTop: 4}, heading: {fontWeight: '800', color: '#4e596b', marginBottom: 8}, linkCard: {backgroundColor: '#f8f9fc', borderRadius: 12, padding: 12, marginBottom: 8}, error: {color: '#b34848', fontSize: 12, marginTop: -8, marginBottom: 8}, remove: {color: '#b34848', fontWeight: '700', paddingVertical: 5}, add: {borderWidth: 1, borderColor: '#cbd3e0', borderRadius: 10, padding: 12, alignItems: 'center'}, addText: {color: '#5267d9', fontWeight: '800'}});
