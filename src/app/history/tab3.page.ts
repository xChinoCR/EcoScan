import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController, IonicModule } from '@ionic/angular';
import { Haptics } from '@capacitor/haptics';
import { StorageService } from '../services/storage.services';
import { EcoActivity, ActivityType } from '../models/activity.model';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  providers: [DatePipe],
  imports: [IonicModule, CommonModule] 
})
export class Tab3Page implements OnInit {
getDefaultTitle(arg0: string): string|undefined {
throw new Error('Method not implemented.');
}
  activities: EcoActivity[] = [];
  isLoading = true;

  constructor(
    private storageService: StorageService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private datePipe: DatePipe
  ) {}

  async ngOnInit() {
    await this.loadActivities();
  }

  async loadActivities() {
    try {
      this.isLoading = true;
      this.activities = await this.storageService.getActivities();
      this.sortActivities();
    } catch (error) {
      console.error('Error loading activities:', error);
      this.showToast('Error al cargar actividades', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private sortActivities() {
    this.activities.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getActivityIcon(type: ActivityType): string {
    const icons = {
      qr: 'qr-code-outline',
      photo: 'camera-outline',
      location: 'location-outline'
    };
    return icons[type] || 'help-circle-outline';
  }

  getActivityColor(type: ActivityType): string {
    const colors = {
      qr: 'success',
      photo: 'primary',
      location: 'warning'
    };
    return colors[type] || 'medium';
  }

  getFormattedDate(date: string): string {
    return this.datePipe.transform(date, 'medium') || '';
  }

  async deleteActivity(activity: EcoActivity) {
    await Haptics.vibrate({ duration: 50 });
    
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Eliminar esta actividad?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.storageService.deleteActivity(activity.id);
            this.activities = this.activities.filter(a => a.id !== activity.id);
            this.showToast('Actividad eliminada', 'success');
          }
        }
      ]
    });
    
    await alert.present();
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  navigateToDashboard() {
    this.navCtrl.navigateRoot('/tabs/tab1');
  }
}