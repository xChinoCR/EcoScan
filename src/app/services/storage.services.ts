import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { EcoActivity } from '../models/activity.model';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.defineDriver(CordovaSQLiteDriver);
    this._storage = await this.storage.create();
  }

  async saveActivity(activity: Omit<EcoActivity, 'id'>): Promise<EcoActivity> {
    const activities = await this.getActivities();
    const newActivity: EcoActivity = {
      ...activity,
      id: this.generateId()
    };
    activities.push(newActivity);
    await this._storage?.set('activities', activities);
    return newActivity;
  }

  async getActivities(): Promise<EcoActivity[]> {
    return (await this._storage?.get('activities')) || [];
  }

  async deleteActivity(id: string): Promise<void> {
    let activities = await this.getActivities();
    activities = activities.filter(a => a.id !== id);
    await this._storage?.set('activities', activities);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}