export type RecordStatus = 'active' | 'paused' | 'suspended' | 'archived' | 'closed' | 'unknown';
export type SubscriptionStatus = 'active' | 'free' | 'trial' | 'cancelled' | 'expired' | 'paused' | 'notApplicable' | 'unknown';
export type BillingCycle = 'monthly' | 'annual' | 'oneTime' | 'custom';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type SortMode = 'newest' | 'oldest' | 'updated' | 'leastUpdated' | 'verified' | 'leastVerified' | 'accountAsc' | 'accountDesc' | 'clientAsc' | 'clientDesc' | 'platformAsc' | 'platformDesc' | 'projectAsc' | 'projectDesc' | 'emailAsc' | 'emailDesc';
export type TextOperator = 'contains' | 'equals' | 'startsWith';
export type DateRange = {from?: string; to?: string};

/** A user-named link that can be attached to any register entity. */
export type LinkReference = {id: string; label: string; url: string; isPrimary?: boolean};
export type ContactReference = {id: string; label: string; value: string; kind: 'phone' | 'email' | 'whatsapp' | 'other'; isPrimary?: boolean};

export type AccountRecord = {
  id: string;
  accountName: string;
  email: string;
  phoneNumber?: string;
  username: string;
  platformId: string;
  categoryId?: string;
  accountUrl?: string;
  links?: LinkReference[];
  clientIds?: string[];
  projectIds?: string[];
  /** Compatibility aliases used only while existing screens are migrated to the relation editor. */
  clientId?: string;
  projectId?: string;
  owner?: string;
  relatedAccountIds?: string[];
  passwordRef?: string;
  status: RecordStatus;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPlan?: string;
  subscriptionStartDate?: string;
  subscriptionExpiryDate?: string;
  renewalDate?: string;
  billingCycle?: BillingCycle;
  paymentNotes?: string;
  priority?: Priority;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
};

export type Client = {id: string; name: string; notes: string; contacts?: ContactReference[]; websiteUrl?: string; links?: LinkReference[]; archived?: boolean; createdAt?: string; updatedAt?: string};
export type Project = {id: string; name: string; description: string; notes: string; websiteUrl?: string; links?: LinkReference[]; clientIds?: string[]; clientId?: string; accountIds?: string[]; status: RecordStatus; archived?: boolean; createdAt?: string; updatedAt?: string};
export type Platform = {id: string; name: string; description?: string; categoryId?: string; websiteUrl?: string; links?: LinkReference[]; archived?: boolean; createdAt?: string; updatedAt?: string};
export type Category = {id: string; name: string; description?: string; archived?: boolean; createdAt?: string; updatedAt?: string};

export type SavedView = {id: string; name: string; filter: FilterState; sortMode: SortMode};
export type TextFilter = {operator: TextOperator; value: string};
export type FilterState = {query?: string; clientId?: string; projectId?: string; platformId?: string; categoryId?: string; statuses?: RecordStatus[]; subscriptionStatuses?: SubscriptionStatus[]; priorities?: Priority[]; tags?: string[]; email?: TextFilter; username?: TextFilter; accountName?: TextFilter; notes?: TextFilter; addedRange?: DateRange; updatedRange?: DateRange; verifiedRange?: DateRange; expiryRange?: DateRange; neverVerified?: boolean};
export type RegisterData = {schemaVersion: 3; records: AccountRecord[]; clients: Client[]; projects: Project[]; platforms: Platform[]; categories: Category[]; tags: string[]; owners: string[]; subscriptionPlans: string[]; savedViews: SavedView[]; updatedAt: string};

export const emptyFilter: FilterState = {statuses: ['active']};
export const sortOptions: {id: SortMode; name: string}[] = [{id: 'newest', name: 'Newest added'}, {id: 'oldest', name: 'Oldest added'}, {id: 'updated', name: 'Recently updated'}, {id: 'leastUpdated', name: 'Least recently updated'}, {id: 'verified', name: 'Recently verified'}, {id: 'leastVerified', name: 'Least recently verified'}, {id: 'accountAsc', name: 'Account A–Z'}, {id: 'accountDesc', name: 'Account Z–A'}, {id: 'clientAsc', name: 'Client A–Z'}, {id: 'clientDesc', name: 'Client Z–A'}, {id: 'platformAsc', name: 'Platform A–Z'}, {id: 'platformDesc', name: 'Platform Z–A'}, {id: 'projectAsc', name: 'Project A–Z'}, {id: 'projectDesc', name: 'Project Z–A'}, {id: 'emailAsc', name: 'Email A–Z'}, {id: 'emailDesc', name: 'Email Z–A'}];

export const defaultCategories: Category[] = ['AI and cloud AI', 'Social media', 'Web development', 'Websites and applications', 'Hosting', 'Backend services', 'Cloud services', 'Git and source control', 'Development tools', 'Design and creative tools', 'Investment and finance', 'Communication', 'Email and productivity', 'Education', 'E-commerce', 'Domain and DNS services', 'Client services', 'Other'].map(name => ({id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name}));
export const defaultPlatforms: Platform[] = [['ChatGPT', 'AI and cloud AI'], ['Gemini', 'AI and cloud AI'], ['Manus', 'AI and cloud AI'], ['Claude', 'AI and cloud AI'], ['Replit', 'Development tools'], ['GitHub', 'Git and source control'], ['GitLab', 'Git and source control'], ['Bitbucket', 'Git and source control'], ['Vercel', 'Hosting'], ['Netlify', 'Hosting'], ['Render', 'Hosting'], ['Firebase', 'Backend services'], ['Supabase', 'Backend services'], ['AWS', 'Cloud services'], ['Google Cloud', 'Cloud services'], ['DigitalOcean', 'Cloud services'], ['Instagram', 'Social media'], ['Facebook', 'Social media'], ['X/Twitter', 'Social media'], ['LinkedIn', 'Social media'], ['TikTok', 'Social media'], ['YouTube', 'Social media'], ['Pinterest', 'Social media'], ['Namecheap', 'Domain and DNS services'], ['GoDaddy', 'Domain and DNS services'], ['Hostinger', 'Hosting'], ['Other', 'Other']].map(([name, category]) => ({id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, categoryId: category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}));
export const defaultSubscriptionPlans = ['Free', 'Pro', 'Business', 'Enterprise'];
export const defaultOwners = ['Personal', 'Client', 'Team', 'Organization', 'Shared', 'Internal'];
export const defaultRecordStatus: RecordStatus = 'active';
export const defaultSubscriptionStatus: SubscriptionStatus = 'notApplicable';
export const defaultPriority: Priority = 'normal';
export const defaultBillingCycle: BillingCycle = 'monthly';
export const normalizeRecordStatus = (value: unknown): RecordStatus => ['active', 'paused', 'suspended', 'archived', 'closed', 'unknown'].includes(String(value)) ? value as RecordStatus : 'active';
export const normalizeSubscriptionStatus = (value: unknown): SubscriptionStatus => ['active', 'free', 'trial', 'cancelled', 'expired', 'paused', 'notApplicable', 'unknown'].includes(String(value)) ? value as SubscriptionStatus : 'notApplicable';
export const normalizePriority = (value: unknown): Priority => ['low', 'normal', 'high', 'urgent'].includes(String(value)) ? value as Priority : 'normal';
export const normalizeBillingCycle = (value: unknown): BillingCycle | undefined => ['monthly', 'annual', 'oneTime', 'custom'].includes(String(value)) ? value as BillingCycle : undefined;
export const currentSchemaVersion = 3;
export const emptyRegisterData = (now = new Date().toISOString()): RegisterData => ({schemaVersion: currentSchemaVersion, records: [], clients: [{id: 'personal', name: 'Personal', notes: '', contacts: []}], projects: [], platforms: defaultPlatforms, categories: defaultCategories, tags: [], owners: defaultOwners, subscriptionPlans: defaultSubscriptionPlans, savedViews: [], updatedAt: now});
export const emptyAccountRecord = (now = new Date().toISOString()): AccountRecord => ({id: '', accountName: '', email: '', phoneNumber: '', username: '', platformId: '', status: defaultRecordStatus, subscriptionStatus: defaultSubscriptionStatus, priority: defaultPriority, notes: '', tags: [], createdAt: now, updatedAt: now});
export const coerceRegisterData = (value: Partial<RegisterData>): RegisterData => ({...emptyRegisterData(), ...value, schemaVersion: currentSchemaVersion, records: value.records || [], clients: value.clients?.length ? value.clients : emptyRegisterData().clients, projects: value.projects || [], platforms: value.platforms?.length ? value.platforms : defaultPlatforms, categories: value.categories?.length ? value.categories : defaultCategories, tags: value.tags || [], owners: value.owners?.length ? value.owners : defaultOwners, subscriptionPlans: value.subscriptionPlans?.length ? value.subscriptionPlans : defaultSubscriptionPlans, savedViews: value.savedViews || []});
export const createLink = (label: string, url: string, isPrimary = false): LinkReference => ({id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, label, url, isPrimary});
export const isSubscriptionExpiring = (record: AccountRecord, now = Date.now(), withinDays = 30) => {if (!record.subscriptionExpiryDate) return false; const expiry = Date.parse(record.subscriptionExpiryDate); return expiry >= now && expiry <= now + withinDays * 86400000;};
export const needsVerification = (record: AccountRecord, now = Date.now(), withinDays = 90) => !record.lastVerifiedAt || Date.parse(record.lastVerifiedAt) < now - withinDays * 86400000;
export const EMPTY_VALUE_LABEL = 'Not provided';
