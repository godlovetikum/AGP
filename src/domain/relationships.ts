import {AccountRecord, Client, Project, RegisterData} from './models';
const unique = (ids: string[] = []) => Array.from(new Set(ids.filter(Boolean)));
export function setAccountRelations(data: RegisterData, accountId: string, clientIds: string[], projectIds: string[]): RegisterData {
  const clients = unique(clientIds); const projects = unique(projectIds);
  const records = data.records.map(record => record.id === accountId ? {...record, clientIds: clients, clientId: clients[0], projectIds: projects, projectId: projects[0]} : record);
  return {...data, records, projects: data.projects.map(project => ({...project, accountIds: records.filter(record => record.projectIds?.includes(project.id) || record.projectId === project.id).map(record => record.id), clientIds: project.clientIds || []})), updatedAt: new Date().toISOString()};
}
export function setProjectRelations(data: RegisterData, projectId: string, clientIds: string[], accountIds: string[]): RegisterData {
  const clients = unique(clientIds); const accounts = unique(accountIds);
  const records = data.records.map(record => {const current = unique(record.projectIds || (record.projectId ? [record.projectId] : [])); const next = current.filter(id => id !== projectId); return accounts.includes(record.id) ? {...record, projectIds: unique([...next, projectId]), projectId: unique([...next, projectId])[0]} : {...record, projectIds: next, projectId: next[0]};});
  return {...data, records, projects: data.projects.map(project => project.id === projectId ? {...project, clientIds: clients, clientId: clients[0], accountIds: accounts} : project), updatedAt: new Date().toISOString()};
}
export function setClientRelations(data: RegisterData, clientId: string, projectIds: string[], accountIds: string[]): RegisterData {
  const projects = unique(projectIds); const accounts = unique(accountIds);
  const records = data.records.map(record => {const current = unique(record.clientIds || (record.clientId ? [record.clientId] : [])); const next = current.filter(id => id !== clientId); return accounts.includes(record.id) ? {...record, clientIds: unique([...next, clientId]), clientId: unique([...next, clientId])[0]} : {...record, clientIds: next, clientId: next[0]};});
  return {...data, records, projects: data.projects.map(project => {const current = unique(project.clientIds || (project.clientId ? [project.clientId] : [])); const next = current.filter(id => id !== clientId); return projects.includes(project.id) ? {...project, clientIds: unique([...next, clientId]), clientId: unique([...next, clientId])[0]} : {...project, clientIds: next, clientId: next[0]};}), updatedAt: new Date().toISOString()};
}
export const relatedAccountsForProject = (data: RegisterData, project: Project) => data.records.filter(record => project.accountIds?.includes(record.id) || record.projectIds?.includes(project.id) || record.projectId === project.id);
export const relatedAccountsForClient = (data: RegisterData, client: Client) => data.records.filter(record => record.clientIds?.includes(client.id) || record.clientId === client.id);
export const relatedProjectsForClient = (data: RegisterData, client: Client) => data.projects.filter(project => project.clientIds?.includes(client.id) || project.clientId === client.id);
