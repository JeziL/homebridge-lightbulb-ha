import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
} from 'homebridge';
import { HALightbulbAPI } from './HALightbulbAPI';


let hap: HAP;
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory('Lightbulb', LightBulb);
};

class LightBulb implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private readonly lightBulbAPI: HALightbulbAPI;

  private readonly lightbulbService: Service;
  private readonly infoService: Service;

  constructor(log: Logging, config: AccessoryConfig) {
    this.log = log;
    this.name = config.name || 'LightBulb';
    this.lightBulbAPI = new HALightbulbAPI(config.endpoint, config.authToken, config.entityId);

    this.lightbulbService = new hap.Service.Lightbulb(this.name);
    this.lightbulbService.getCharacteristic(hap.Characteristic.On)
      .onGet(this.getOn.bind(this))
      .onSet(this.setOn.bind(this));
    this.lightbulbService.getCharacteristic(hap.Characteristic.Brightness)
      .onGet(this.getBrightness.bind(this))
      .onSet(this.setBrightness.bind(this));
    this.lightbulbService.getCharacteristic(hap.Characteristic.ColorTemperature)
      .onGet(this.getColorTemp.bind(this))
      .onSet(this.setColorTemp.bind(this));

    this.infoService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'LiLi Industry')
      .setCharacteristic(hap.Characteristic.SerialNumber, '4E0A5E1D8BF4FF0C898167095149')
      .setCharacteristic(hap.Characteristic.Model, 'HALIGHT001');

    log.info('LightBulb finished initializing.');
  }

  async getOn(): Promise<CharacteristicValue> {
    return await this.lightBulbAPI.getTurnedOn();
  }

  async setOn(value: CharacteristicValue) {
    await this.lightBulbAPI.setTurnedOn(value as boolean);
  }

  async getBrightness(): Promise<CharacteristicValue> {
    return await this.lightBulbAPI.getBrightness();
  }

  async setBrightness(value: CharacteristicValue) {
    await this.lightBulbAPI.setBrightness(value as number);
  }

  async getColorTemp(): Promise<CharacteristicValue> {
    return await this.lightBulbAPI.getColorTemp();
  }

  async setColorTemp(value: CharacteristicValue) {
    await this.lightBulbAPI.setColorTemp(value as number);
  }

  identify(): void {
    this.log('Identify!');
  }

  getServices(): Service[] {
    return [
      this.infoService,
      this.lightbulbService,
    ];
  }
}
