import {AccountRecord, Category, Client, Platform, Project, RegisterData} from './models';

const key = (value?: string) => (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
const same = (a?: string, b?: string) => key(a) === key(b);

export const duplicateAccount = (data: RegisterData, candidate: Pick<AccountRecord, 'id' | 'accountName' | 'email' | 'platformId' | 'categoryId'>) => data.records.find(record => record.id !== candidate.id && same(record.accountName, candidate.accountName) && same(record.email, candidate.email) && record.platformId === candidate.platformId && record.categoryId === candidate.categoryId);
export const duplicateClient = (data: RegisterData, candidate: Pick<Client, 'id' | 'name'>) => data.clients.find(client => client.id !== candidate.id && same(client.name, candidate.name));
export const duplicateProject = (data: RegisterData, candidate: Pick<Project, 'id' | 'name'>) => data.projects.find(project => project.id !== candidate.id && same(project.name, candidate.name));
export const duplicatePlatform = (data: RegisterData, candidate: Pick<Platform, 'id' | 'name' | 'categoryId'>) => data.platforms.find(platform => platform.id !== candidate.id && same(platform.name, candidate.name) && platform.categoryId === candidate.categoryId);
export const duplicateCategory = (data: RegisterData, candidate: Pick<Category, 'id' | 'name'>) => data.categories.find(category => category.id !== candidate.id && same(category.name, candidate.name));
