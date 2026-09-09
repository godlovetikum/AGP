import React, {useMemo, useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {AccountRecord, RegisterData, RecordStatus, SubscriptionStatus, Priority, BillingCycle} from '../domain/models';
import {FormField} from '../components/FormField';
import {SelectField} from '../components/SelectField';
import {normalizeTags, validateAccount} from '../domain/validation';

type SaveValue = Partial<AccountRecord> & {accountName: string; platformId: string; password?: string; tagsText?: string};

type FormState = SaveValue & {email: string; username: string; notes: string; tagsText: string; clientId: string; projectId: string; categoryId: string; status: RecordStatus; subscriptionStatus: SubscriptionStatus; priority: Priority; billingCycle: BillingCycle | ''; password: string};

const statuses = [{id: 'active', name: 'Active'}, {id: 'paused', name: 'Paused'}, {id: 'suspended', name: 'Suspended'}, {id: 'archived', name: 'Archived'}, {id: 'closed', name: 'Closed'}, {id: 'unknown', name: 'Unknown'}];
const subscriptionStatuses = [{id: 'notApplicable', name: 'Not applicable'}, {id: 'active', name: 'Active subscription'}, {id: 'free', name: 'Free plan'}, {id: 'trial', name: 'Trial'}, {id: 'cancelled', name: 'Cancelled'}, {id: 'expired', name: 'Expired'}, {id: 'paused', name: 'Paused'}, {id: 'unknown', name: 'Unknown'}];
const priorities = [{id: 'low', name: 'Low'}, {id: 'normal', name: 'Normal'}, {id: 'high', name: 'High'}, {id: 'urgent', name: 'Urgent'}];
const billingCycles = [{id: 'monthly', name: 'Monthly'}, {id: 'annual', name: 'Annual'}, {id: 'oneTime', name: 'One-time'}, {id: 'custom', name: 'Custom'}];

const initialValue = (record: AccountRecord | undefined, data: RegisterData): FormState => ({
  ...(record || {}),
  accountName: record?.accountName || '',
  email: record?.email || '',
  username: record?.username || '',
  accountUrl: record?.accountUrl || '',
  clientId: record?.clientId || '',
  projectId: record?.projectId || '',
  platformId: record?.platformId || data.platforms[0]?.id || '',
  categoryId: record?.categoryId || data.categories[0]?.id || '',
  owner: record?.owner || data.owners[0] || '',
  status: record?.status || 'active',
  subscriptionStatus: record?.subscriptionStatus || 'notApplicable',
  subscriptionPlan: record?.subscriptionPlan || '',
  subscriptionStartDate: record?.subscriptionStartDate || '',
  subscriptionExpiryDate: record?.subscriptionExpiryDate || '',
  renewalDate: record?.renewalDate || '',
  billingCycle: record?.billingCycle || '',
  paymentNotes: record?.paymentNotes || '',
  priority: record?.priority || 'normal',
  tagsText: record?.tags?.join(', ') || '',
  notes: record?.notes || '',
  password: '',
});

export function AccountFormScreen({record, data, onBack, onSave}: {record?: AccountRecord; data: RegisterData; onBack: () => void; onSave: (value: SaveValue) => void}) {
  const [value, setValue] = useState<FormState>(() => initialValue(record, data));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = <K extends keyof FormState>(key: K, next: FormState[K]) => setValue(previous => ({...previous, [key]: next}));
  const projects = useMemo(() => value.clientId ? data.projects.filter(item => item.clientId === value.clientId) : data.projects, [data.projects, value.clientId]);
  const submit = () => {
    const nextErrors = validateAccount(value);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return Alert.alert('Review the form', 'Complete the highlighted fields before saving.');
    onSave({...value, tags: normalizeTags(value.tagsText), password: value.password || undefined});
  };
  const field = (label: string, key: keyof FormState, props: {placeholder?: string; multiline?: boolean; keyboardType?: 'default' | 'email-address' | 'url' | 'number-pad'; secureTextEntry?: boolean} = {}) => <View><FormField label={label} value={String(value[key] || '')} onChangeText={next => update(key, next as never)} {...props}/>{errors[String(key)] ? <Text style={styles.error}>{errors[String(key)]}</Text> : null}</View>;
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <Pressable onPress={onBack}><Text style={styles.back}>‹ Back</Text></Pressable>
    <Text style={styles.title}>{record ? 'Edit account' : 'New account record'}</Text>
    <Text style={styles.hint}>Account name and email identify the record. Other fields add filing and operational context.</Text>

    <Section title="Account identity" />
    {field('Account name *', 'accountName', {placeholder: 'Example: ChatGPT Pro'})}
    {field('Email address', 'email', {placeholder: 'login@example.com', keyboardType: 'email-address'})}
    {field('Username', 'username', {placeholder: 'Optional platform username'})}
    {field('Account link', 'accountUrl', {placeholder: 'https://...', keyboardType: 'url'})}

    <Section title="Platform and filing" />
    <SelectField label="Platform *" value={value.platformId} options={data.platforms.filter(item => !item.archived)} onChange={next => update('platformId', next)} />
    {errors.platformId ? <Text style={styles.error}>{errors.platformId}</Text> : null}
    <SelectField label="Category" value={value.categoryId} options={[{id: '', name: 'No category'}, ...data.categories.filter(item => !item.archived)]} onChange={next => update('categoryId', next)} />
    <SelectField label="Owner" value={value.owner || ''} options={[{id: '', name: 'Not specified'}, ...data.owners.map(item => ({id: item, name: item}))]} onChange={next => update('owner', next)} />
    <SelectField label="Client" value={value.clientId} options={[{id: '', name: 'No client'}, ...data.clients.filter(item => !item.archived)]} onChange={next => {update('clientId', next); if (value.projectId && !data.projects.some(item => item.id === value.projectId && item.clientId === next)) update('projectId', '');}} />
    <SelectField label="Project" value={value.projectId} options={[{id: '', name: 'No project'}, ...projects.filter(item => !item.archived)]} onChange={next => update('projectId', next)} />

    <Section title="Subscription and billing" />
    <SelectField label="Subscription status" value={value.subscriptionStatus} options={subscriptionStatuses} onChange={next => update('subscriptionStatus', next as SubscriptionStatus)} />
    <SelectField label="Subscription plan" value={value.subscriptionPlan || ''} options={[{id: '', name: 'Not specified'}, ...data.subscriptionPlans.map(item => ({id: item, name: item}))]} onChange={next => update('subscriptionPlan', next)} />
    {field('Subscription start date', 'subscriptionStartDate', {placeholder: 'YYYY-MM-DD'})}
    {field('Subscription expiry date', 'subscriptionExpiryDate', {placeholder: 'YYYY-MM-DD'})}
    {field('Renewal date', 'renewalDate', {placeholder: 'YYYY-MM-DD'})}
    <SelectField label="Billing cycle" value={value.billingCycle} options={[{id: '', name: 'Not specified'}, ...billingCycles]} onChange={next => update('billingCycle', next as BillingCycle)} />
    {field('Payment notes', 'paymentNotes', {placeholder: 'Non-sensitive billing reference'})}

    <Section title="Status and review" />
    <SelectField label="Account status" value={value.status} options={statuses} onChange={next => update('status', next as RecordStatus)} />
    <SelectField label="Priority" value={value.priority || 'normal'} options={priorities} onChange={next => update('priority', next as Priority)} />
    {field('Last verified date', 'lastVerifiedAt', {placeholder: 'YYYY-MM-DD'})}

    <Section title="Sensitive information" />
    {field('Password (optional)', 'password', {placeholder: 'Stored separately and securely', secureTextEntry: true})}
    <Text style={styles.securityNote}>Passwords are not saved in ordinary register data. Use only if secure device storage is available.</Text>

    <Section title="Tags and notes" />
    {field('Tags', 'tagsText', {placeholder: 'Comma-separated tags'})}
    {field('Notes', 'notes', {placeholder: 'General reference or operational notes', multiline: true})}
    <Pressable style={styles.save} onPress={submit}><Text style={styles.saveText}>Save record</Text></Pressable>
  </ScrollView>;
}

function Section({title}: {title: string}) { return <Text style={styles.section}>{title}</Text>; }
const styles = StyleSheet.create({page: {padding: 20, paddingBottom: 55}, back: {color: '#5267d9', fontWeight: '700'}, title: {fontSize: 25, fontWeight: '800', color: '#172033', marginVertical: 16}, hint: {color: '#687386', marginBottom: 4, lineHeight: 21}, section: {fontSize: 13, fontWeight: '800', color: '#5267d9', textTransform: 'uppercase', letterSpacing: 1, marginTop: 22, marginBottom: 12}, error: {color: '#b34848', fontSize: 12, marginTop: -10, marginBottom: 10}, securityNote: {color: '#687386', fontSize: 12, lineHeight: 18, marginTop: -6, marginBottom: 6}, save: {backgroundColor: '#5267d9', borderRadius: 12, padding: 15, marginVertical: 18}, saveText: {color: '#fff', textAlign: 'center', fontWeight: '800'}});
