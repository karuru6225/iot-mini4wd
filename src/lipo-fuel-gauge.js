import I2c from './i2c';

export default class LipoFuelGauge {
  constructor(dev, address = 0x36){
    this._i2c = new I2c(dev, address);
    this.powerOnReset();
  }
  powerOnReset(){
    this._i2c.writeBytes(0xfe, [0x54, 0x00]);
  }
  getPercent(){
    const raw = this._i2c.readBytes(0x04, 2);
    return raw[0];
  }
  getVoltage(){
    const raw = this._i2c.readBytes(0x02, 2);
    return ( ( (raw[0]<<8) | raw[1]) >> 4 ) * 1.25;
  }
}
