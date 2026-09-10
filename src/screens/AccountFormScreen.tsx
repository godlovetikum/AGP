import React, {useState} from 'react';
import {Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {AccountRecord, RegisterData, RecordStatus, SubscriptionStatus, Priority, BillingCycle} from '../domain/models';
import {FormField} from '../components/FormField';
import {SelectField} from '../components/SelectField';
import {LinksEditor} from '../components/LinksEditor';
import {AssociationPicker} from '../components/AssociationPicker';
import {normalizeTags, validateAccount} from '../domain/validation';

type SaveValue = Partial<AccountRecord> & {accountName: string; platformId: string; password?: string; tagsText?: string};

type FormState = SaveValue & {email: string; username: string; notes: string; tagsText: string; clientId: string; projectId: string; clientIds: string[]; projectIds: string[]; categoryId: string; status: RecordStatus; subscriptionStatus: SubscriptionStatus; priority: Priority; billingCycle: BillingCycle | ''; password: string; links: NonNullable<AccountRecord['links']>};

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
  links: record?.links || (record?.accountUrl ? [{id: `${record.id}-primary`, label: 'Primary link', url: record.accountUrl, isPrimary: true}] : []),
  clientId: record?.clientId || '',
  projectId: record?.projectId || '',
  clientIds: record?.clientIds || (record?.clientId ? [record.clientId] : []),
  projectIds: record?.projectIds || (record?.projectId ? [record.projectId] : []),
  platformId: record?.platformId || data.platforms[0]?.id || '',
  categoryId: record?.categoryId || data.categories[0]?.id || '',
  owner: record?.owner || data.owners[0] || '',
  status: record?.status || 'active',
  subscriptionStatus: record?.subscriptionStatus || 'notApplicable',
  subscriptionPlan: record?.subscriptionPlan || '',
  subscriptionStartDate: record?.subscriptionStartDate || '',
  subscriptionExpiryDate: record?.subscriptionExpiryDate || '',
  renewalDate: record?.renewalDate || '',
  billingCycle: (record?.billingCycle || '') as BillingCycle,
  paymentNotes: record?.paymentNotes || '',
  priority: record?.priority || 'normal',
  tagsText: record?.tags?.join(', ') || '',
  notes: record?.notes || '',
  password: '',
});

export function AccountFormScreen({record, data, onBack, onSave, onCreateRelated}: {record?: AccountRecord; data: RegisterData; onBack: () => void; onSave: (value: SaveValue) => void; onCreateRelated?: (next: RegisterData) => void}) {
  const [value, setValue] = useState<FormState>(() => initialValue(record, data));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [association, setAssociation] = useState<'clients' | 'projects' | null>(null);
  const [createKind, setCreateKind] = useState<'clients' | 'projects' | null>(null); const [createName, setCreateName] = useState('');
  const quickCreate = () => {if (!createName.trim()) return; const id = `${createKind === 'clients' ? 'client' : 'project'}-${Date.now()}`; const now = new Date().toISOString(); const next = createKind === 'clients' ? {...data, clients: [...data.clients, {id, name: createName.trim(), notes: '', contacts: [], archived: false, createdAt: now, updatedAt: now}]} : {...data, projects: [...data.projects, {id, name: createName.trim(), description: '', notes: '', clientIds: [], accountIds: [], status: 'active' as RecordStatus, archived: false, createdAt: now, updatedAt: now}]}; onCreateRelated?.(next); if (createKind === 'clients') {update('clientIds', [...value.clientIds, id]); update('clientId', value.clientId || id);} else {update('projectIds', [...value.projectIds, id]); update('projectId', value.projectId || id);} setCreateName(''); setCreateKind(null);};
  const update = <K extends keyof FormState>(key: K, next: FormState[K]) => setValue(previous => ({...previous, [key]: next}));
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
    <LinksEditor links={value.links} onChange={links => update('links', links)} />

    <Section title="Platform and filing" />
    <SelectField label="Platform *" value={value.platformId} options={data.platforms.filter(item => !item.archived)} onChange={next => update('platformId', next)} />
    {errors.platformId ? <Text style={styles.error}>{errors.platformId}</Text> : null}
    <SelectField label="Category" value={value.categoryId} options={[{id: '', name: 'No category'}, ...data.categories.filter(item => !item.archived)]} onChange={next => update('categoryId', next)} />
    <SelectField label="Owner" value={value.owner || ''} options={[{id: '', name: 'Not specified'}, ...data.owners.map(item => ({id: item, name: item}))]} onChange={next => update('owner', next)} />
    <Text style={styles.optional}>Relationships are optional. Add them only when this account belongs to a client or project.</Text>
    <Pressable style={styles.associate} onPress={() => setAssociation('clients')}><Text style={styles.associateText}>Associate multiple clients ({value.clientIds.length})</Text></Pressable>
    <Pressable style={styles.associate} onPress={() => setAssociation('projects')}><Text style={styles.associateText}>Associate multiple projects ({value.projectIds.length})</Text></Pressable>

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
    <AssociationPicker visible={association === 'clients'} title="Associate clients" options={data.clients.filter(item => !item.archived).map(item => ({id: item.id, title: item.name, subtitle: `${item.contacts?.find(contact => contact.value)?.value || 'No contact'} · client`}))} selectedIds={value.clientIds} onCancel={() => setAssociation(null)} onCreateNew={() => {setAssociation(null); setCreateKind('clients');}} onSave={ids => {update('clientIds', ids); update('clientId', ids[0] || ''); setAssociation(null);}} />
    <AssociationPicker visible={association === 'projects'} title="Associate projects" options={data.projects.filter(item => !item.archived).map(item => ({id: item.id, title: item.name, subtitle: `${item.description} · ${item.status}`}))} selectedIds={value.projectIds} onCancel={() => setAssociation(null)} onCreateNew={() => {setAssociation(null); setCreateKind('projects');}} onSave={ids => {update('projectIds', ids); update('projectId', ids[0] || ''); setAssociation(null);}} />
    <Modal visible={Boolean(createKind)} transparent animationType="fade" onRequestClose={() => setCreateKind(null)}><View style={styles.modalBackdrop}><View style={styles.createCard}><Text style={styles.createTitle}>Create {createKind === 'clients' ? 'client' : 'project'}</Text><TextInput style={styles.createInput} value={createName} onChangeText={setCreateName} placeholder={createKind === 'clients' ? 'Client name' : 'Project name'} autoFocus/><View style={styles.createActions}><Pressable onPress={() => setCreateKind(null)}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={quickCreate}><Text style={styles.saveText}>Create and attach</Text></Pressable></View></View></View></Modal>
  </ScrollView>;
}

function Section({title}: {title: string}) { return <Text style={styles.section}>{title}</Text>; }
  const styles = StyleSheet.create({page: {padding: 20, paddingBottom: 55}, back: {color: '#5267d9', fontWeight: '700'}, title: {fontSize: 25, fontWeight: '800', color: '#172033', marginVertical: 16}, hint: {color: '#687386', marginBottom: 4, lineHeight: 21}, section: {fontSize: 13, fontWeight: '800', color: '#5267d9', textTransform: 'uppercase', letterSpacing: 1, marginTop: 22, marginBottom: 12}, error: {color: '#b34848', fontSize: 12, marginTop: -10, marginBottom: 10}, securityNote: {color: '#687386', fontSize: 12, lineHeight: 18, marginTop: -6, marginBottom: 6}, optional: {color: '#687386', fontSize: 12, marginBottom: 10}, associate: {borderWidth: 1, borderColor: '#dce2ec', borderRadius: 10, padding: 11, marginTop: -4, marginBottom: 10}, associateText: {color: '#5267d9', fontWeight: '700', textAlign: 'center'}, save: {backgroundColor: '#5267d9', borderRadius: 12, padding: 15, marginVertical: 18}, saveText: {color: '#fff', textAlign: 'center', fontWeight: '800'}, modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,.35)', justifyContent: 'center', padding: 24}, createCard: {backgroundColor: '#fff', borderRadius: 16, padding: 18}, createTitle: {fontSize: 18, fontWeight: '800', color: '#172033', marginBottom: 12}, createInput: {borderWidth: 1, borderColor: '#dce2ec', borderRadius: 10, padding: 12, fontSize: 16}, createActions: {flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 18}, cancelText: {color: '#687386', fontWeight: '700'}});
