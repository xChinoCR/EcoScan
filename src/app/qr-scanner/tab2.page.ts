import { Component, ElementRef, ViewChild } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { Haptics } from '@capacitor/haptics';
import { Storage } from '@ionic/storage-angular';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonicModule, DatePipe, CommonModule],
})
export class Tab2Page {


  getTruncatedText(text: string, length: number): string {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}
  
  @ViewChild('scannerContainer', { static: false }) scannerContainer!: ElementRef;
  
  scanHistory: any[] = [];
  isScanning = false;
  scanSub: any;
  lightEnabled = false;
  canEnableLight = false;

  constructor(
    private qrScanner: QRScanner,
    private storage: Storage,
    private toastController: ToastController
  ) {}

  async ionViewWillEnter() {
    await this.storage.create();
    this.loadScanHistory();
  }

  async ionViewDidLeave() {
    this.stopScanner();
  }

  async loadScanHistory() {
    this.scanHistory = (await this.storage.get('qrHistory')) || [];
  }

  async startScanner() {
    try {
      const status: QRScannerStatus = await this.qrScanner.prepare();
      
      if (status.authorized) {
        this.isScanning = true;
        this.canEnableLight = status.canEnableLight;
        
        this.showCamera();
        
        this.scanSub = this.qrScanner.scan().subscribe({
          next: async (text: string) => {
            await this.handleScannedQR(text);
          },
          error: (err) => {
            console.error('Error scanning:', err);
            this.presentToast('Error al escanear');
          }
        });
      } else if (status.denied) {
        this.presentToast('Permiso de cámara denegado permanentemente');
      } else {
        this.presentToast('Permiso de cámara denegado temporalmente');
      }
    } catch (error) {
      console.error('Error:', error);
      this.presentToast('Error al iniciar el escáner');
    }
  }

  stopScanner() {
    if (this.scanSub) {
      this.scanSub.unsubscribe();
      this.scanSub = null;
    }
    this.hideCamera();
    this.qrScanner.hide();
    this.isScanning = false;
  }

  showCamera() {
    (window.document.querySelector('ion-app') as HTMLElement).classList.add('camera-view');
    this.scannerContainer.nativeElement.style.display = 'block';
    this.qrScanner.show();
  }

  hideCamera() {
    (window.document.querySelector('ion-app') as HTMLElement).classList.remove('camera-view');
    if (this.scannerContainer?.nativeElement) {
      this.scannerContainer.nativeElement.style.display = 'none';
    }
  }

  async handleScannedQR(text: string) {
    this.stopScanner();
    
    const scanEntry = {
      type: 'QR',
      data: text,
      date: new Date().toISOString()
    };
    
    this.scanHistory.unshift(scanEntry);
    await this.storage.set('qrHistory', this.scanHistory);
    
    await Haptics.vibrate();
    this.presentToast('QR escaneado correctamente!');
  }

  toggleLight() {
    if (this.canEnableLight) {
      if (this.lightEnabled) {
        this.qrScanner.disableLight();
      } else {
        this.qrScanner.enableLight();
      }
      this.lightEnabled = !this.lightEnabled;
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();

    
  }
}