import {nativeStore} from '../services/nativeStore';
import {
  AccountRecord,
  Category,
  Client,
  Project,
  Platform,
  RegisterData,
  SavedView,
  coerceRegisterData,
  defaultBillingCycle,
  defaultPriority,
  defaultRecordStatus,
  emptyRegisterData,
  normalizeBillingCycle,
  normalizePriority,
  normalizeRecordStatus,
  normalizeSubscriptionStatus,
} from '../domain/models';

export const REGISTER_STORAGE_KEY = 'agp.register.v2';
export const CURRENT_SCHEMA_VERSION = 3;

const timestamp = () => new Date().toISOString();
const text = (value: unknown) => typeof value === 'string' ? value : '';
const idFor = (prefix: string, value: string) => `${prefix}-${value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now()}`;

export const defaultRegisterData = (): RegisterData => emptyRegisterData();

const findOrCreate = <T extends {id: string; name: string}>(items: T[], name: string, prefix: string, create: (id: string) => T) => {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return {items, id: undefined};
  const existing = items.find(item => item.name.trim().toLowerCase() === normalized);
  if (existing) return {items, id: existing.id};
  const id = idFor(prefix, name);
  return {items: [...items, create(id)], id};
};

const migrateLegacyRecord = (raw: Record<string, unknown>, data: RegisterData, index: number): AccountRecord => {
  let next = data;
  const clientName = text(raw.client);
  const projectName = text(raw.project);
  const platformName = text(raw.platform) || 'Other';

  const clientResult = findOrCreate(next.clients, clientName, 'client', id => ({id, name: clientName, notes: ''}));
  next = {...next, clients: clientResult.items};
  const projectResult = findOrCreate(next.projects as Project[], projectName, 'project', id => ({id, name: projectName, description: '', clientId: clientResult.id, notes: '', status: defaultRecordStatus}));
  next = {...next, projects: projectResult.items};
  const platformResult = findOrCreate(next.platforms, platformName, 'platform', id => ({id, name: platformName}) as Platform);
  next = {...next, platforms: platformResult.items};
  Object.assign(data, next);

  const now = timestamp();
  return {
    id: text(raw.id) || `migrated-${index}-${Date.now()}`,
    accountName: text(raw.accountName),
    email: text(raw.email),
    username: text(raw.username),
    platformId: platformResult.id || '',
    clientId: clientResult.id,
    projectId: projectResult.id,
    accountUrl: text(raw.accountUrl) || undefined,
    status: normalizeRecordStatus(raw.status),
    subscriptionStatus: normalizeSubscriptionStatus(raw.subscriptionStatus),
    subscriptionPlan: text(raw.subscriptionPlan) || undefined,
    subscriptionStartDate: text(raw.subscriptionStartDate) || undefined,
    subscriptionExpiryDate: text(raw.subscriptionExpiryDate) || undefined,
    renewalDate: text(raw.renewalDate) || undefined,
    billingCycle: normalizeBillingCycle(raw.billingCycle) || defaultBillingCycle,
    paymentNotes: text(raw.paymentNotes) || undefined,
    priority: normalizePriority(raw.priority) || defaultPriority,
    notes: text(raw.notes),
    tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    createdAt: text(raw.createdAt) || now,
    updatedAt: text(raw.updatedAt) || now,
    lastVerifiedAt: text(raw.lastVerifiedAt) || undefined,
  };
};

export const migrateRegisterData = (value: unknown): RegisterData => {
  const fallback = defaultRegisterData();
  if (Array.isArray(value)) {
    const records: AccountRecord[] = [];
    let data = fallback;
    value.forEach((raw, index) => {
      if (raw && typeof raw === 'object') records.push(migrateLegacyRecord(raw as Record<string, unknown>, data, index));
    });
    return coerceRegisterData({...data, records, schemaVersion: CURRENT_SCHEMA_VERSION});
  }
  if (!value || typeof value !== 'object') return fallback;

  const raw = value as Partial<RegisterData> & {schemaVersion?: number};
  const data = coerceRegisterData(raw);
  const records = Array.isArray(raw.records) ? raw.records.map((record, index) => {
    const input = record as AccountRecord & Record<string, unknown>;
    const hasModernReferences = typeof input.platformId === 'string' && (!input.platform || !text(input.platform));
    return hasModernReferences ? {
      ...input,
      status: normalizeRecordStatus(input.status),
      subscriptionStatus: normalizeSubscriptionStatus(input.subscriptionStatus),
      billingCycle: normalizeBillingCycle(input.billingCycle),
      priority: normalizePriority(input.priority),
      tags: Array.isArray(input.tags) ? input.tags : [],
      createdAt: input.createdAt || timestamp(),
      updatedAt: input.updatedAt || timestamp(),
    } as AccountRecord : migrateLegacyRecord(input, data, index);
  }) : [];
  return coerceRegisterData({...data, records, schemaVersion: CURRENT_SCHEMA_VERSION});
};

export async function loadRegisterData(): Promise<RegisterData> {
  if (!nativeStore) return defaultRegisterData();
  try {
    const raw = await nativeStore.load();
    return migrateRegisterData(JSON.parse(raw));
  } catch {
    return defaultRegisterData();
  }
}

export async function saveRegisterData(data: RegisterData): Promise<RegisterData> {
  const next = coerceRegisterData({...data, updatedAt: timestamp()});
  if (nativeStore) await nativeStore.save(JSON.stringify(next));
  return next;
}

export async function clearRegisterData(): Promise<void> {
  if (nativeStore) await nativeStore.save(JSON.stringify(defaultRegisterData()));
}

export interface RegisterStore {
  load(): Promise<RegisterData>;
  save(data: RegisterData): Promise<RegisterData>;
  clear(): Promise<void>;
}

export const registerStore: RegisterStore = {
  load: loadRegisterData,
  save: saveRegisterData,
  clear: clearRegisterData,
};

export type {AccountRecord, Category, Client, Project, Platform, SavedView};
