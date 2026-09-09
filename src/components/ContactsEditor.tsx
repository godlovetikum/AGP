import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ContactReference} from '../domain/models';
import {FormField} from './FormField';

type Props = {contacts: ContactReference[]; onChange: (contacts: ContactReference[]) => void};
const make = (kind: ContactReference['kind'], label: string): ContactReference => ({id: `${Date.now()}-${kind}`, kind, label, value: '', isPrimary: false});
export function ContactsEditor({contacts, onChange}: Props) {
  const values = contacts.length ? contacts : [make('phone', 'Phone number'), make('email', 'Email'), make('whatsapp', 'WhatsApp')];
  const update = (id: string, changes: Partial<ContactReference>) => onChange(values.map(item => item.id === id ? {...item, ...changes} : item));
  return <View style={styles.root}><Text style={styles.heading}>Contact information</Text>{values.map(contact => <View style={styles.card} key={contact.id}><FormField label={contact.label} value={contact.value} placeholder={contact.kind === 'email' ? 'contact@example.com' : 'Add contact information'} keyboardType={contact.kind === 'email' ? 'email-address' : 'default'} onChangeText={value => update(contact.id, {value})}/>{contact.kind === 'other' ? <Pressable onPress={() => onChange(values.filter(item => item.id !== contact.id))}><Text style={styles.remove}>Remove contact</Text></Pressable> : null}</View>)}<Pressable style={styles.add} onPress={() => onChange([...values, make('other', 'Additional contact')])}><Text style={styles.addText}>+ Add another contact method</Text></Pressable></View>;
}
const styles = StyleSheet.create({root: {marginTop: 4}, heading: {fontWeight: '800', color: '#4e596b', marginBottom: 8}, card: {backgroundColor: '#f8f9fc', borderRadius: 12, padding: 12, marginBottom: 8}, remove: {color: '#b34848', fontWeight: '700', paddingVertical: 5}, add: {borderWidth: 1, borderColor: '#cbd3e0', borderRadius: 10, padding: 12, alignItems: 'center'}, addText: {color: '#5267d9', fontWeight: '800'}});
