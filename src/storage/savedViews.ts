import {RegisterData, SavedView} from '../domain/models';
export function saveView(data:RegisterData, view:SavedView):RegisterData{return {...data,savedViews:[...(data.savedViews||[]).filter(existing=>existing.id!==view.id),view]};}
export function removeView(data:RegisterData, viewId:string):RegisterData{return {...data,savedViews:(data.savedViews||[]).filter(view=>view.id!==viewId)};}
