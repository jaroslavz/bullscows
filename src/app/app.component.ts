import {Component} from '@angular/core';
import {Platform, ToastController} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SettingsProvider} from './../providers/settings/settings';

import {HomePage} from '../pages/home/home';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;
  public counter = 0;
  selectedTheme: String;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public toastCtrl: ToastController, private settings: SettingsProvider) {
    this.settings.setActiveTheme('light-theme');
    this.settings.getActiveTheme().subscribe(val => this.selectedTheme = val);
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      // splashScreen.hide();

      platform.registerBackButtonAction(() => {
        if (this.counter == 0) {
          this.counter++;
          this.presentToast();
          setTimeout(() => {
            this.counter = 0
          }, 3000)
        } else {
          // console.log("exitapp");
          platform.exitApp();
        }
      }, 0)
    });

  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: "Нажмите ещё раз для выхода",
      duration: 3000,
      position: "bottom"
    });
    toast.present();
    localStorage.clear();
  }
}

