import {Component} from '@angular/core';
import {ToastController, AlertController, Loading, LoadingController, Platform} from 'ionic-angular';
import {BullscowsService} from '../../app/services/bullscows/bullscows';
import {Bullscows} from "../../app/services/bullscows/bullscows.interface";
import {SettingsProvider} from './../../providers/settings/settings';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  loader: Loading;
  bullscows: Bullscows[];
  myRand: number;
  selectedTheme: String;

  constructor(
    private bullscowsService: BullscowsService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    private settings: SettingsProvider) {
    this.settings.setActiveTheme('light-theme');
    this.settings.getActiveTheme().subscribe(val => this.selectedTheme = val);
  }

  ngOnInit() {
    this.initLoader();
    this.loadBullscows();
  }

  toggleAppTheme() {
    if (this.selectedTheme === 'dark-theme') {
      this.settings.setActiveTheme('light-theme');
    } else {
      this.settings.setActiveTheme('dark-theme');
    }
  }

  ionViewDidEnter() {
    if (localStorage.length === 0) {
      this.myRand = this.random();
    }
    else {
      this.myRand = parseInt(localStorage.getItem('random'));
    }
  }

  random(): number {
    let digits = "123456789".split('');
    let first = this.shuffle(digits).pop();
    digits.push('0');
    return parseInt(first + this.shuffle(digits).join('').substring(0, 3), 10);
  }

  shuffle(o) {
    for (let j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) ;
    return o;
  }

  showWinnerAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Вы выиграли!',
      message: 'Загаданное число: ' + this.myRand + '<p>Начать новую игру?</p>',
      buttons: [
        {text: 'Нет'},
        {
          text: 'Да',
          handler: data => {
            this.bullscows.length = 0;
            localStorage.clear();
            this.ionViewDidEnter();
          }
        }
      ]
    });

    prompt.present();
  }

  countUnique(a) {
    let counts = [];
    for (var i = 0; i <= a.length; i++) {
      if (counts[a[i]] === undefined) {
        counts[a[i]] = 1;
      } else {
        return true;
      }
    }
    return false;
  }

  showInputAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Ответ',
      inputs: [{name: 'title', placeholder: 'Введите число', type: 'number'}],
      buttons: [
        {text: 'Отмена'},
        {
          text: 'Добавить',
          handler: data => {

            if (data.title > 4) {
              data.title = data.title.slice(0, 4);
            }

            /*  Check for 4-digits number and for input only digits */
            let regex = /^[0-9]+$/;
            if (data.title !== "" && data.title.length === 4 && data.title.match(regex) && this.countUnique(data.title) === false && data.title[0] !== "0") {
              /*  Count bulls and cows */
              let bulls = 0;
              let cows = 0;
              for (let i = 0; i < data.title.length; i++) {
                if (data.title[i] === this.myRand.toString()[i]) {
                  bulls++;
                }
                /* count cows */
                if (this.myRand.toString().includes(data.title[i]) && data.title[i] !== this.myRand.toString()[i]) {
                  cows++;
                }

                if (data.title.length === bulls) {
                  this.showWinnerAlert();
                }
              }

              if (localStorage.length !== 0 && localStorage.getItem('bullscows').includes(data.title)) {
                this.showDuplicateAlert();
              }
              else {
                this.bullscowsService.add(data.title, [], []).subscribe(
                  response => {

                    let bullscows: Bullscows = {
                      name: data.title,
                      done: false,
                      tags: [bulls + ' '],
                      tags2: [cows + ' '],
                    };
                    this.bullscows.unshift(bullscows);
                    this.bullscowsService.saveAll(this.bullscows);
                    localStorage.setItem('random', this.myRand.toString())
                  }
                );

              }
            }
            else {
              this.showErrorAlert();
            }
          }
        }
      ]
    });
    prompt.present();

    /* Slice the input number if number length are more then 4 digits */
    prompt.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert input');
      firstInput.focus();
      firstInput.setAttribute('oninput', 'this.value=this.value.slice(0,4)');
    });
  }

  private presentToast(message: string) {
    this.toastCtrl.create({message: message, duration: 2000}).present();
  }

  private initLoader() {
    this.loader = this.loadingCtrl.create({
      content: "Загрузка..."
    });
  }

  private loadBullscows() {
    this.loader.present().then(() => {
      this.bullscowsService.fetch().subscribe(
        data => {
          this.bullscows = data;
          this.loader.dismiss();
        }
      );
    })
  }

  deleteAll() {
    this.bullscows.length = 0;
    localStorage.clear();
    this.presentToast("Все ответы были удалены");
  }

  clearAllWithoutFirst() {
    if (this.bullscows.length !== 1) {
      for (let i = 1; i < this.bullscows.length; i++) {
        this.bullscows.splice(i);
        localStorage.setItem('bullscows', JSON.stringify(this.bullscows));
      }
      this.presentToast("Все ответы кроме первого были удалены");
    }
    this.bullscows.push();
    this.bullscowsService.saveAll(this.bullscows);
  }

  showClearAlertWithoutFirst() {
    let prompt = this.alertCtrl.create({
      title: 'Удалить?',
      buttons: [
        {text: 'Отмена'},
        {
          text: 'Все кроме первого',
          handler: data => {
            this.clearAllWithoutFirst();
          }
        },
        {
          text: 'Удалить всё',
          handler: data => {
            this.deleteAll();
          }
        }
      ]
    });

    prompt.present();
  }

  showNewGameAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Начать новую игру?',
      buttons: [
        {text: 'Нет'},
        {
          text: 'Да',
          handler: data => {
            this.bullscows.length = 0;
            localStorage.clear();
            this.ionViewDidEnter();
          }
        }
      ]
    });

    prompt.present();
  }

  exitAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Выход',
      message: 'Вы уверены, что хотите выйти?',
      buttons: [{
        text: "Да",
        handler: () => {
          this.exitApp();
          localStorage.clear();
        }
      }, {
        text: "Отмена",
        role: 'cancel'
      }]
    })
    prompt.present();
  }

  exitApp() {
    this.platform.exitApp();
  }

  popoverAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Опции',
      message: 'Выберите из списка ниже:',
      buttons: [{
        text: "Новая игра",
        handler: () => {
          this.showNewGameAlert()
        }
      },
        {
          text: "Удаление",
          handler: () => {
            this.showClearAlertWithoutFirst()
          }
        },

        {
          text: "Выход",
          handler: () => {
            this.exitAlert()
          }
        }]
    })
    prompt.present();
  }

  showAnswerAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Ответ',
      message: 'Загаданное число: ' + this.myRand,
      buttons: [{
        text: "Ok",
        role: 'cancel'
      }]
    })
    prompt.present();
  }

  showHelpAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Правила игры',
      message: 'Компьютер задумывает четыре различные цифры из 0,1,2,...9. Игрок делает ходы, чтобы узнать эти цифры и их порядок. Каждый ход состоит из четырёх цифр, 0 не может стоять на первом месте. Все цифры должны быть разными. В ответ компьютер показывает число отгаданных цифр, стоящих на своих местах (число быков) - полных совпадений и число отгаданных цифр, стоящих не на своих местах (число коров). Пример: компьютер задумал 8931. Игрок сделал ход 8134. Компьютер ответил: 2 быка (цифры 8 и 3) и 1 корова (цифра 1).',
      buttons: [{
        text: "Ok",
        role: 'cancel'
      }]
    })
    prompt.present();
  }

  showDuplicateAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Ошибка!',
      message: 'Ранее уже было добавлено такое число. Введите другое число.',
      buttons: [{
        text: "Ok",
        role: 'cancel'
      }]
    })
    prompt.present();
  }

  showErrorAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Ошибка!',
      message: 'Введите правильное число',
      buttons: [{
        text: "Ok",
        role: 'cancel'
      }]
    })
    prompt.present();
  }

}
