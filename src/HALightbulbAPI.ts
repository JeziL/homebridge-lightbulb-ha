/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from 'node-fetch';

type APIGetMethod = (path: string) => Promise<any>;
type APIPostMethod = (path: string, body: object) => Promise<any>;

export class HALightbulbAPI {
  private readonly entityId: string;
  private readonly apiGet: APIGetMethod;
  private readonly apiPost: APIPostMethod;

  constructor(endpoint: string, authToken: string, entityId: string) {
    this.entityId = entityId;
    this.apiGet = (path: string) => fetch(`${endpoint}${path}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }).then((res) => res.json());
    this.apiPost = (path: string, body: object) => fetch(`${endpoint}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  }

  async getTurnedOn(): Promise<boolean> {
    const resp = await this.apiGet(`/states/${this.entityId}`);
    return resp.state === 'on';
  }

  async setTurnedOn(on: boolean) {
    const service = on ? 'turn_on' : 'turn_off';
    await this.apiPost(`/services/light/${service}`, {
      entity_id: this.entityId,
    });
  }

  async getBrightness(): Promise<number> {
    const resp = await this.apiGet(`/states/${this.entityId}`);
    return resp.attributes.light_brightness as number;
  }

  async setBrightness(value: number) {
    await this.apiPost('/services/light/turn_on', {
      entity_id: this.entityId,
      brightness_pct: value,
    });
  }

  async getColorTemp(): Promise<number> {
    const resp = await this.apiGet(`/states/${this.entityId}`);
    const kelvin = resp.attributes.light_color_temperature as number;
    return Math.round(1000000.0 / kelvin);
  }

  async setColorTemp(value: number) {
    await this.apiPost('/services/light/turn_on', {
      entity_id: this.entityId,
      color_temp: value,
    });
  }
}
