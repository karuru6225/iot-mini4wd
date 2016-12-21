import I2c from './i2c';

export default class GyroAccelMpu6050 {
  static get GyroScale(){
    return {
      'deg250': {
        bits: [0, 0],
        magni: 250.0 / 32768
      },
      'deg500': {
        bits: [0, 1],
        magni: 500.0 / 32768
      },
      'deg1000': {
        bits: [1, 0],
        magni: 1000.0 / 32768
      },
      'deg2000': {
        bits: [1, 1],
        magni: 2000.0 / 32768
      }
    };
  }

  static get AccelScale(){
    return {
      'g2': {
        bits: [0, 0],
        magni: 2.0 / 32768
      },
      'g4': {
        bits: [0, 1],
        magni: 4.0 / 32768
      },
      'g8': {
        bits: [1, 0],
        magni: 8.0 / 32768
      },
      'g16': {
        bits: [1, 1],
        magni: 16.0 / 32768
      }
    };
  }

  constructor(dev, address){
    this._i2c = new I2c(dev, address);
    this.setClockSource();
    this.setGyroScale();
    this.setAccelScale();
    this.setLowPassFilter();
    this.sleep(false);
  }
  /*
   * 0 | Internal oscillator
   * 1 | PLL with X Gyro reference
   * 2 | PLL with Y Gyro reference
   * 3 | PLL with Z Gyro reference
   * 4 | PLL with external 32.768kHz reference
   * 5 | PLL with external 19.2MHz reference
   * 6 | Reserved
   * 7 | Stops the clock and keeps the timing generator in reset
   */
  setClockSource(){
    this._i2c.writeBits(0x6b, 2, [0, 0, 1]);
  }

  setGyroScale(scale = GyroAccelMpu6050.GyroScale.deg500){
    this._i2c.writeBits(0x1b, 4, scale.bits);
    this._gyroMagni = scale.magni;
  }

  setAccelScale(scale = GyroAccelMpu6050.AccelScale.g16){
    this._i2c.writeBits(0x1c, 4, scale.bits);
    this._accelMagni = scale.magni;
  }

  /*
   * DLPF_CFG   accel-Hz   accel-delay   gyro-Hz   gyro-delay
   * 0 0 0  0        260             0       256         0.98
   * 0 0 1  1        184           2.0       188          1.9
   * 0 1 0  2         94           3.0        98          2.8
   * 0 1 1  3         44           4.9        42          4.8
   * 1 0 0  4         21           8.5        20          8.3
   * 1 0 1  5         10          13.8        10         13.4
   * 1 1 0  6          5          19.0         5         18.6
   */
  setLowPassFilter(cfg = 4){
    this._i2c.writeBits(0x1a, 2, [1, 0, 0]);
    this._minInterval = 1000/40;
  }

  sleep(enable){
    this._i2c.writeBit(0x6b, 6, enable);
  }

  whoAmI(){
    return this._i2c.readByte(0x75) == this._i2c.getDevAddress();
  }

  calibration(callback, finished){
    try{
      const m = this.getMotion();

      for(let p in m){
        this._calib[p] += m[p];
      }
      this._calib.cnt++;

      if(callback(this._calib.cnt)){
        setTimeout(this.calibration.bind(this, callback), this._minInterval);
      }else{
        for(let p in this._e){
          this._e[p] = -(this._calib[p]/this._calib.cnt);
        }
        finished(this._e)
      }
    }catch(e){
      setTimeout(this.calibration.bind(this, callback), 0);
    }
  }

  setCalibrationData(obj){
    for(let key of ['ax', 'ay', 'az', 'gx', 'gy', 'gz']){
      this._e[key] = obj[key];
    }
  }

  getCalibrationData(){
    return this._e;
  }

  startCalibration(callback, finished){
    this._e = {
      ax: 0,
      ay: 0,
      az: 0,
      gx: 0,
      gy: 0,
      gz: 0,
    };
    this._calib = {
      ax: 0,
      ay: 0,
      az: 0,
      gx: 0,
      gy: 0,
      gz: 0,
      cnt: 0
    };
    setTimeout(this.calibration.bind(this, callback, finished), this._minInterval);
  }

  getMotion(){
    const raw = this._i2c.readBytes(0x3b, 14);
    return {
      ax: new Buffer([raw[0],  raw[1]] ).readInt16BE(0) * this._accelMagni + this._e.ax,
      ay: new Buffer([raw[2],  raw[3]] ).readInt16BE(0) * this._accelMagni + this._e.ay,
      az: new Buffer([raw[4],  raw[5]] ).readInt16BE(0) * this._accelMagni + this._e.az,
      gx: new Buffer([raw[8],  raw[9]] ).readInt16BE(0) * this._gyroMagni + this._e.gx,
      gy: new Buffer([raw[10], raw[11]]).readInt16BE(0) * this._gyroMagni + this._e.gy,
      gz: new Buffer([raw[12], raw[13]]).readInt16BE(0) * this._gyroMagni + this._e.gz
    };
  }
}
