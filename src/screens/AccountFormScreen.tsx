import React, {useState} from 'react';
import {Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {AccountRecord, Platform, RegisterData, RecordStatus, SubscriptionStatus, Priority, BillingCycle} from '../domain/models';
import {FormField} from '../components/FormField';
import {SelectField} from '../components/SelectField';
import {LinksEditor} from '../components/LinksEditor';
import {AssociationPicker} from '../components/AssociationPicker';
import {normalizeTags, validateAccount} from '../domain/validation';
import {duplicateAccount} from '../domain/duplicates';

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
  phoneNumber: record?.phoneNumber || '',
  username: record?.username || '',
  accountUrl: record?.accountUrl || '',
  links: record?.links || (record?.accountUrl ? [{id: `${record.id}-primary`, label: 'Primary link', url: record.accountUrl, isPrimary: true}] : []),
  clientId: record?.clientId || '',
  projectId: record?.projectId || '',
  clientIds: record?.clientIds || (record?.clientId ? [record.clientId] : []),
  projectIds: record?.projectIds || (record?.projectId ? [record.projectId] : []),
  platformId: record?.platformId || '',
  categoryId: record?.categoryId || '',
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

export function AccountFormScreen({record, data, onBack, onSave, onCreateRelated, onCreatePlatform}: {record?: AccountRecord; data: RegisterData; onBack: () => void; onSave: (value: SaveValue) => void; onCreateRelated?: (next: RegisterData) => void; onCreatePlatform?: (next: RegisterData) => void}) {
  const [value, setValue] = useState<FormState>(() => initialValue(record, data));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [section, setSection] = useState<'identity' | 'filing' | 'subscription' | 'review' | 'notes'>('identity');
  const [association, setAssociation] = useState<'clients' | 'projects' | null>(null);
  const [createKind, setCreateKind] = useState<'clients' | 'projects' | null>(null); const [createName, setCreateName] = useState(''); const [platformModal, setPlatformModal] = useState(false); const [platformName, setPlatformName] = useState('');
  const filteredPlatforms = data.platforms.filter(item => !item.archived && (!value.categoryId || item.categoryId === value.categoryId));
  const createPlatform = () => {if (!platformName.trim() || !value.categoryId) return; const id = `platform-${Date.now()}`; const now = new Date().toISOString(); const platform: Platform = {id, name: platformName.trim(), categoryId: value.categoryId, archived: false, createdAt: now, updatedAt: now}; const next = {...data, platforms: [...data.platforms, platform]}; onCreatePlatform?.(next); update('platformId', id); setPlatformName(''); setPlatformModal(false);};
  const quickCreate = () => {if (!createName.trim()) return; const id = `${createKind === 'clients' ? 'client' : 'project'}-${Date.now()}`; const now = new Date().toISOString(); const next = createKind === 'clients' ? {...data, clients: [...data.clients, {id, name: createName.trim(), notes: '', contacts: [], archived: false, createdAt: now, updatedAt: now}]} : {...data, projects: [...data.projects, {id, name: createName.trim(), description: '', notes: '', clientIds: [], accountIds: [], status: 'active' as RecordStatus, archived: false, createdAt: now, updatedAt: now}]}; onCreateRelated?.(next); if (createKind === 'clients') {update('clientIds', [...value.clientIds, id]); update('clientId', value.clientId || id);} else {update('projectIds', [...value.projectIds, id]); update('projectId', value.projectId || id);} setCreateName(''); setCreateKind(null);};
  const update = <K extends keyof FormState>(key: K, next: FormState[K]) => setValue(previous => ({...previous, [key]: next}));
  const submit = () => {
    const nextErrors = validateAccount(value);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return Alert.alert('Review the form', 'Complete the highlighted fields before saving.');
    const duplicate = duplicateAccount(data, {id: record?.id || '', accountName: value.accountName, email: value.email, platformId: value.platformId, categoryId: value.categoryId});
    if (duplicate) return Alert.alert('Possible duplicate account', `${duplicate.accountName} already uses this category, platform, and email. Create another anyway?`, [{text: 'Cancel'}, {text: 'Create anyway', onPress: () => onSave({...value, tags: normalizeTags(value.tagsText), password: value.password || undefined})}]);
    onSave({...value, tags: normalizeTags(value.tagsText), password: value.password || undefined});
  };
  const field = (label: string, key: keyof FormState, props: {placeholder?: string; multiline?: boolean; keyboardType?: 'default' | 'email-address' | 'url' | 'number-pad' | 'phone-pad'; secureTextEntry?: boolean} = {}) => <View><FormField label={label} value={String(value[key] || '')} onChangeText={next => update(key, next as never)} {...props}/>{errors[String(key)] ? <Text style={styles.error}>{errors[String(key)]}</Text> : null}</View>;
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <Pressable onPress={onBack}><Text style={styles.back}>‹ Back</Text></Pressable>
    <Text style={styles.title}>{record ? 'Edit account' : 'New account record'}</Text>
    <Text style={styles.hint}>Account name, email, or phone identify the record. Other fields add filing and operational context.</Text>
    <View style={styles.sectionMenu}><SectionButton label="Identity and links" active={section === 'identity'} onPress={() => setSection('identity')} /><SectionButton label="Category and relationships" active={section === 'filing'} onPress={() => setSection('filing')} /><SectionButton label="Subscription and billing" active={section === 'subscription'} onPress={() => setSection('subscription')} /><SectionButton label="Status and review" active={section === 'review'} onPress={() => setSection('review')} /><SectionButton label="Notes and save" active={section === 'notes'} onPress={() => setSection('notes')} /></View>

    {section === 'identity' ? <><Section title="Account identity" />
    {field('Account name *', 'accountName', {placeholder: 'Example: ChatGPT Pro'})}
    {field('Email address', 'email', {placeholder: 'login@example.com', keyboardType: 'email-address'})}
    {field('Phone number', 'phoneNumber', {placeholder: '+1 555 0100', keyboardType: 'phone-pad'})}
    {field('Username', 'username', {placeholder: 'Optional platform username'})}
    <LinksEditor links={value.links} onChange={links => update('links', links)} /></> : null}

    {section === 'filing' ? <><Section title="Classify this account" />
    <SelectField label="Category *" value={value.categoryId} options={[{id: '', name: 'Choose a category first'}, ...data.categories.filter(item => !item.archived)]} onChange={next => {update('categoryId', next); if (value.platformId && !data.platforms.find(item => item.id === value.platformId && item.categoryId === next)) update('platformId', '');}} />
    {errors.categoryId ? <Text style={styles.error}>{errors.categoryId}</Text> : null}
    {value.categoryId ? <><SelectField label="Platform *" value={value.platformId} options={[{id: '', name: 'Choose a platform'}, ...filteredPlatforms]} onChange={next => update('platformId', next)} /><Pressable style={styles.addInline} onPress={() => setPlatformModal(true)}><Text style={styles.addInlineText}>+ Add platform to this category</Text></Pressable></> : <Text style={styles.optional}>Choose a category to see only platforms filed under it.</Text>}
    {errors.platformId ? <Text style={styles.error}>{errors.platformId}</Text> : null}
    <SelectField label="Owner" value={value.owner || ''} options={[{id: '', name: 'Not specified'}, ...data.owners.map(item => ({id: item, name: item}))]} onChange={next => update('owner', next)} />
    <Text style={styles.optional}>Relationships are optional. Add them only when this account belongs to a client or project.</Text>
    <Pressable style={styles.associate} onPress={() => setAssociation('clients')}><Text style={styles.associateText}>Associate multiple clients ({value.clientIds.length})</Text></Pressable>
    <Pressable style={styles.associate} onPress={() => setAssociation('projects')}><Text style={styles.associateText}>Associate multiple projects ({value.projectIds.length})</Text></Pressable></> : null}

    {section === 'subscription' ? <><Section title="Subscription and billing" />
    <SelectField label="Subscription status" value={value.subscriptionStatus} options={subscriptionStatuses} onChange={next => update('subscriptionStatus', next as SubscriptionStatus)} />
    <SelectField label="Subscription plan" value={value.subscriptionPlan || ''} options={[{id: '', name: 'Not specified'}, ...data.subscriptionPlans.map(item => ({id: item, name: item}))]} onChange={next => update('subscriptionPlan', next)} />
    {field('Subscription start date', 'subscriptionStartDate', {placeholder: 'YYYY-MM-DD'})}
    {field('Subscription expiry date', 'subscriptionExpiryDate', {placeholder: 'YYYY-MM-DD'})}
    {field('Renewal date', 'renewalDate', {placeholder: 'YYYY-MM-DD'})}
    <SelectField label="Billing cycle" value={value.billingCycle} options={[{id: '', name: 'Not specified'}, ...billingCycles]} onChange={next => update('billingCycle', next as BillingCycle)} />
    {field('Payment notes', 'paymentNotes', {placeholder: 'Non-sensitive billing reference'})}</> : null}

    {section === 'review' ? <><Section title="Status and review" />
    <SelectField label="Account status" value={value.status} options={statuses} onChange={next => update('status', next as RecordStatus)} />
    <SelectField label="Priority" value={value.priority || 'normal'} options={priorities} onChange={next => update('priority', next as Priority)} />
    {field('Last verified date', 'lastVerifiedAt', {placeholder: 'YYYY-MM-DD'})}</> : null}

    {section === 'notes' ? <><Section title="Sensitive information" />
    {field('Password (optional)', 'password', {placeholder: 'Stored separately and securely', secureTextEntry: true})}
    <Text style={styles.securityNote}>Passwords are not saved in ordinary register data. Use only if secure device storage is available.</Text>

    <Section title="Tags and notes" />
    {field('Tags', 'tagsText', {placeholder: 'Comma-separated tags'})}
    {field('Notes', 'notes', {placeholder: 'General reference or operational notes', multiline: true})}
    <Pressable style={styles.save} onPress={submit}><Text style={styles.saveText}>Save record</Text></Pressable>
    </> : null}
    <AssociationPicker visible={association === 'clients'} title="Associate clients" options={data.clients.filter(item => !item.archived).map(item => ({id: item.id, title: item.name, subtitle: `${item.contacts?.find(contact => contact.value)?.value || 'No contact'} · client`}))} selectedIds={value.clientIds} onCancel={() => setAssociation(null)} onCreateNew={() => {setAssociation(null); setCreateKind('clients');}} onSave={ids => {update('clientIds', ids); update('clientId', ids[0] || ''); setAssociation(null);}} />
    <AssociationPicker visible={association === 'projects'} title="Associate projects" options={data.projects.filter(item => !item.archived).map(item => ({id: item.id, title: item.name, subtitle: `${item.description} · ${item.status}`}))} selectedIds={value.projectIds} onCancel={() => setAssociation(null)} onCreateNew={() => {setAssociation(null); setCreateKind('projects');}} onSave={ids => {update('projectIds', ids); update('projectId', ids[0] || ''); setAssociation(null);}} />
    <Modal visible={Boolean(createKind)} transparent animationType="fade" onRequestClose={() => setCreateKind(null)}><View style={styles.modalBackdrop}><View style={styles.createCard}><Text style={styles.createTitle}>Create {createKind === 'clients' ? 'client' : 'project'}</Text><TextInput style={styles.createInput} value={createName} onChangeText={setCreateName} placeholder={createKind === 'clients' ? 'Client name' : 'Project name'} autoFocus/><View style={styles.createActions}><Pressable onPress={() => setCreateKind(null)}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={quickCreate}><Text style={styles.modalSaveText}>Create and attach</Text></Pressable></View></View></View></Modal>
    <Modal visible={platformModal} transparent animationType="fade" onRequestClose={() => setPlatformModal(false)}><View style={styles.modalBackdrop}><View style={styles.createCard}><Text style={styles.createTitle}>Add platform</Text><Text style={styles.modalHint}>This platform will be filed under the selected category.</Text><TextInput style={styles.createInput} value={platformName} onChangeText={setPlatformName} placeholder="Platform name" autoFocus/><View style={styles.createActions}><Pressable onPress={() => setPlatformModal(false)}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={createPlatform}><Text style={styles.modalSaveText}>Add and select</Text></Pressable></View></View></View></Modal>
  </ScrollView>;
}

function Section({title}: {title: string}) { return <Text style={styles.section}>{title}</Text>; }
function SectionButton({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) { return <Pressable style={[styles.sectionButton, active && styles.sectionButtonActive]} onPress={onPress}><Text style={[styles.sectionButtonText, active && styles.sectionButtonTextActive]}>{label}</Text></Pressable>; }
  const styles = StyleSheet.create({page: {padding: 20, paddingBottom: 55}, back: {color: '#5267d9', fontWeight: '700'}, title: {fontSize: 25, fontWeight: '800', color: '#172033', marginVertical: 16}, hint: {color: '#687386', marginBottom: 4, lineHeight: 21}, sectionMenu: {gap: 8, marginBottom: 8}, sectionButton: {backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce2ec', borderRadius: 10, padding: 12}, sectionButtonActive: {borderColor: '#5267d9', backgroundColor: '#eef1f8'}, sectionButtonText: {color: '#5267d9', fontWeight: '700'}, sectionButtonTextActive: {fontWeight: '800'}, section: {fontSize: 13, fontWeight: '800', color: '#5267d9', textTransform: 'uppercase', letterSpacing: 1, marginTop: 22, marginBottom: 12}, error: {color: '#b34848', fontSize: 12, marginTop: -10, marginBottom: 10}, securityNote: {color: '#687386', fontSize: 12, lineHeight: 18, marginTop: -6, marginBottom: 6}, optional: {color: '#687386', fontSize: 12, marginBottom: 10}, addInline: {borderWidth: 1, borderColor: '#dce2ec', borderRadius: 10, padding: 11, marginTop: -4, marginBottom: 10}, addInlineText: {color: '#5267d9', fontWeight: '700', textAlign: 'center'}, associate: {borderWidth: 1, borderColor: '#dce2ec', borderRadius: 10, padding: 11, marginTop: -4, marginBottom: 10}, associateText: {color: '#5267d9', fontWeight: '700', textAlign: 'center'}, save: {backgroundColor: '#5267d9', borderRadius: 12, padding: 15, marginVertical: 18}, saveText: {color: '#fff', textAlign: 'center', fontWeight: '800'}, modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,.35)', justifyContent: 'center', padding: 24}, createCard: {backgroundColor: '#fff', borderRadius: 16, padding: 18}, createTitle: {fontSize: 18, fontWeight: '800', color: '#172033', marginBottom: 12}, modalHint: {color: '#687386', lineHeight: 19, marginBottom: 12}, createInput: {borderWidth: 1, borderColor: '#dce2ec', borderRadius: 10, padding: 12, fontSize: 16}, createActions: {flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 18}, cancelText: {color: '#687386', fontWeight: '700'}, modalSaveText: {color: '#5267d9', fontWeight: '800'}});
