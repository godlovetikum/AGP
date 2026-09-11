import React from 'react';
import {Modal, Pressable, StyleSheet, Text} from 'react-native';

export type ContextMenuItem = {label: string; onPress: () => void; destructive?: boolean};

export function ContextMenu({visible, onClose, items}: {visible: boolean; onClose: () => void; items: ContextMenuItem[]}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.menu} onPress={event => event.stopPropagation()}>
        {items.map(item => <Pressable key={item.label} style={styles.item} onPress={() => {onClose(); item.onPress();}}><Text style={[styles.label, item.destructive && styles.destructive]}>{item.label}</Text></Pressable>)}
      </Pressable>
    </Pressable>
  </Modal>;
}

const styles = StyleSheet.create({backdrop: {flex: 1, backgroundColor: 'rgba(20, 28, 45, 0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 58, paddingRight: 16}, menu: {minWidth: 210, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, elevation: 5}, item: {paddingHorizontal: 17, paddingVertical: 14}, label: {color: '#172033', fontWeight: '700'}, destructive: {color: '#b34848'}});
