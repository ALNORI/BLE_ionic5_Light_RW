import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { BLE } from '@ionic-native/ble/ngx';
import { Router } from '@angular/router';
import {DataService} from '../data.service';


const LED_SERVICE = 'a000';
const LED_CHARACERISTIC = 'a001';

const UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const UART_TX_CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const UART_RX_CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';


const LIGHTBULB_SERVICE = 'ff10';
const SWITCH_CHARACTERISTIC = 'ff11';
const DIMMER_CHARACTERISTIC = 'ff12';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  device;
  device2: any;
  peripheral: any = {};
  power: boolean;
  brightness: number;
  statusMessage: string;

  constructor(private activatedRoute: ActivatedRoute,
              private ble: BLE,
              private ngZone: NgZone,
              private alertCtrl: AlertController,
              private route: ActivatedRoute,
              private router: Router,
              public dataService: DataService) {


    this.device = this.dataService.getParamData();
    console.log(JSON.stringify(this.device) + ' selected from Detail');

    this.setStatus('Connecting to ' + this.device.name || this.device.id);

    this.ble.connect(this.device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => this.showAlert('Disconnected', 'The peripheral unexpectedly disconnected')
    ); /**/

  }
  goBack() {
    this.router.navigateByUrl('home');
  }
  ngOnInit(): void {
    // console.log(JSON.stringify(this.device) + ' selected');
    this.activatedRoute.params.subscribe((params) => {
      console.log('Params: ', params);
    });
  }

  onConnected(peripheral) {

    this.peripheral = peripheral;
    this.setStatus('Connected to ' + (peripheral.name || peripheral.id));

    // Update the UI with the current state of the switch characteristic
    this.ble.read(this.peripheral.id, LED_SERVICE, LED_CHARACERISTIC).then(
      buffer => {
        const data = new Uint8Array(buffer);
        console.log('switch characteristic ' + data[0]);
        this.ngZone.run(() => {
          this.power = data[0] !== 0;
        });
      }
    );

  }

  onPowerSwitchChange(event) {
    console.log('onPowerSwitchChange');
    // *********************************** */
    const data = new Uint8Array(1);

    // *********************************** */
    data[0] = this.power ? 0 : 1;

    this.ble.write(this.peripheral.id, LED_SERVICE, LED_CHARACERISTIC, data.buffer);
    console.log('Sending: ' + data[0]);

  }
  onPowerSwitchChangeII(state: number) {
    console.log('onPowerSwitchChange');
    // *********************************** */
    const data = new Uint8Array(1);

    // *********************************** */
    data[0] = state;
    console.log('this.data[0]: ' + data[0]);

    this.ble.write(this.peripheral.id, LED_SERVICE, LED_CHARACERISTIC, data.buffer);
    console.log('Sending: ' + data[0]);

  }

  setBrightness(event) {
    console.log('this.brightness: ' + this.brightness);
    const data = new Uint8Array([this.brightness]);
    console.log('Sending: ' + data[0]);
    this.ble.write(this.peripheral.id, LED_SERVICE, LED_CHARACERISTIC, data.buffer).then(
      () => this.setStatus('Set brightness to ' + this.brightness),
      e => this.showAlert('Unexpected Error', 'Error updating dimmer characteristic ' + e)
    );
  }

  // Disconnect peripheral when leaving the page
  ionViewWillLeave() {
    console.log('ionViewWillLeave disconnecting Bluetooth');
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    );
  }

  async showAlert(title, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

}
