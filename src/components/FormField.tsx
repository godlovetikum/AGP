import React from 'react';
import {StyleSheet, Text, TextInput, TextInputProps, View} from 'react-native';
export function FormField({label, multiline, ...props}: TextInputProps & {label: string}) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} multiline={multiline} style={[styles.input, multiline && styles.multiline]} placeholderTextColor="#87909c" /></View>; }
const styles = StyleSheet.create({field: {marginBottom: 15}, label: {fontWeight: '800', color: '#4e596b', marginBottom: 7}, input: {backgroundColor: '#fff', borderWidth: 1, borderColor: '#dfe4ed', borderRadius: 10, padding: 13, color: '#172033', fontSize: 15}, multiline: {minHeight: 110, textAlignVertical: 'top'}});
