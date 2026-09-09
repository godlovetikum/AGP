import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {FilterState, SavedView, SortMode} from '../domain/models';

type SavedViewsPanelProps = {views: SavedView[]; filter: FilterState; sortMode: SortMode; onSave: (view: SavedView) => void; onLoad: (view: SavedView) => void; onDelete: (id: string) => void};

export function SavedViewsPanel({views, filter, sortMode, onSave, onLoad, onDelete}: SavedViewsPanelProps) {
  const [name, setName] = useState('');
  return <View style={styles.panel}><Text style={styles.heading}>Saved views</Text><View style={styles.editor}><TextInput style={styles.input} placeholder="View name" value={name} onChangeText={setName}/><Pressable style={styles.save} onPress={() => {if (name.trim()) {onSave({id: `view-${Date.now()}`, name: name.trim(), filter, sortMode}); setName('');}}}><Text style={styles.saveText}>Save</Text></Pressable></View>{views.map(view => <View key={view.id} style={styles.viewRow}><Pressable onPress={() => onLoad(view)}><Text style={styles.viewName}>{view.name}</Text></Pressable><Pressable onPress={() => onDelete(view.id)}><Text style={styles.delete}>Delete</Text></Pressable></View>)}</View>;
}

const styles = StyleSheet.create({panel: {backgroundColor: '#f7f8fb', padding: 10, borderRadius: 10, marginTop: 8}, heading: {fontWeight: '800', color: '#172033'}, editor: {flexDirection: 'row', gap: 6, marginTop: 6}, input: {flex: 1, borderWidth: 1, borderColor: '#dfe4ed', backgroundColor: '#fff', padding: 8}, save: {backgroundColor: '#5267d9', padding: 9, borderRadius: 8}, saveText: {color: '#fff', fontWeight: '700'}, viewRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7}, viewName: {color: '#5267d9', fontWeight: '700'}, delete: {color: '#b34848'}});
