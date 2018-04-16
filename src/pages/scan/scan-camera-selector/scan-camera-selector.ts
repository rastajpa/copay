import { Component } from '@angular/core';
import { Events, Platform } from 'ionic-angular';

@Component({
  selector: 'scan-camera-selector',
  templateUrl: 'scan-camera-selector.html',
})
export class ScanCameraSelectorPage {

  public showScanCamerasSelector: boolean;
  public scanCameras: any[];
  public showSlideEffect: boolean;
  public title: string;
  public selectedScanCameraId: string;

  constructor(
    private events: Events,
    private platform: Platform
  ) {
    this.showScanCamerasSelector = false;
    this.showSlideEffect = false;
    this.scanCameras = [];
    this.events.subscribe('showScanCamerasSelectorEvent', (scanCameras: any[], selectedCameraId: string, title?: string) => {
      this.title = title ? title : null;
      this.showScanCamerasSelector = true;
      this.selectedScanCameraId = selectedCameraId;
      setTimeout(() => {
        this.showSlideEffect = true;
      }, 50);
      this.scanCameras = scanCameras;

      let unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
        unregisterBackButtonAction();
        this.backdropDismiss();
      }, 0);

    });
  }

  public selectScanCamera(scanCamera: any): void {
    this.events.publish('selectScanCameraEvent', scanCamera);
    this.showSlideEffect = false;
    setTimeout(() => {
      this.showScanCamerasSelector = false;
    }, 150);
  }

  public backdropDismiss(): void {
    this.events.publish('selectScanCameraEvent');
    this.showSlideEffect = false;
    setTimeout(() => {
      this.showScanCamerasSelector = false;
    }, 150);
  }

}
