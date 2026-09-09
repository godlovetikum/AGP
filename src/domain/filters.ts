import {AccountRecord, DateRange, FilterState, TextFilter} from './models';

const matchesText = (value: string, filter?: TextFilter) => {
  if (!filter?.value.trim()) return true;
  const source=value.toLowerCase();
  const target=filter.value.trim().toLowerCase();
  if(filter.operator==='equals') return source===target;
  if(filter.operator==='startsWith') return source.startsWith(target);
  return source.includes(target);
};

const inRange = (value: string|undefined, range?: DateRange) => {
  if(!range?.from&&!range?.to) return true;
  if(!value) return false;
  const time=Date.parse(value);
  return (!range.from||time>=Date.parse(range.from))&&(!range.to||time<=Date.parse(range.to));
};

const withinExpiryRange = (value: string|undefined, range?: DateRange) => inRange(value, range);

export type RecordNames = (record: AccountRecord) => {client:string; project:string; platform:string; category?:string};

export function filterRecords(records: AccountRecord[], filter: FilterState, names: RecordNames) {
  return records.filter(record=>{
    const labels=names(record);
    const haystack=[record.accountName,record.email,record.username,record.notes,record.tags.join(' '),record.owner||'',record.accountUrl||'',labels.client,labels.project,labels.platform,labels.category||''].join(' ').toLowerCase();
    if(filter.query&&!haystack.includes(filter.query.toLowerCase().trim())) return false;
    if(filter.clientId&&record.clientId!==filter.clientId) return false;
    if(filter.projectId&&record.projectId!==filter.projectId) return false;
    if(filter.platformId&&record.platformId!==filter.platformId) return false;
    if(filter.categoryId&&record.categoryId!==filter.categoryId) return false;
    if(filter.statuses?.length&&!filter.statuses.includes(record.status)) return false;
    if(filter.subscriptionStatuses?.length&&!filter.subscriptionStatuses.includes(record.subscriptionStatus || 'notApplicable')) return false;
    if(filter.priorities?.length&&!filter.priorities.includes(record.priority || 'normal')) return false;
    if(filter.tags?.length&&!filter.tags.every(tag=>record.tags.includes(tag))) return false;
    if(!matchesText(record.accountName,filter.accountName)||!matchesText(record.email,filter.email)||!matchesText(record.username,filter.username)||!matchesText(record.notes,filter.notes)) return false;
    if(!inRange(record.createdAt,filter.addedRange)||!inRange(record.updatedAt,filter.updatedRange)||!inRange(record.lastVerifiedAt,filter.verifiedRange)||!withinExpiryRange(record.subscriptionExpiryDate,filter.expiryRange)) return false;
    if(filter.neverVerified&&record.lastVerifiedAt) return false;
    return true;
  });
}

export const isNeverVerified = (record: AccountRecord) => !record.lastVerifiedAt;
export const isWithinDateRange = inRange;
