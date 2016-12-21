import I2c from './i2c';

export default class ADS1015 {
  static get CONFIG_HIGH_OS(){
    return {
      nop:  0b0000000000000000,
      exec: 0b1000000000000000
    }
  }

  static get CONFIG_HIGH_MUX(){
    return {
      diff01:  0b0000000000000000, //default
      diff03:  0b0001000000000000,
      diff13:  0b0010000000000000,
      diff23:  0b0011000000000000,
      single0: 0b0100000000000000,
      single1: 0b0101000000000000,
      single2: 0b0110000000000000,
      single3: 0b0111000000000000
    };
  }

  static get CONFIG_HIGH_PGA(){
    return {
      gain6_114: 0b0000000000000000,
      gain4_096: 0b0000001000000000,
      gain2_048: 0b0000010000000000, //default
      gain1_024: 0b0000011000000000,
      gain0_512: 0b0000100000000000,
      gain0_256: 0b0000111000000000
    }
  }

  static get CONFIG_HIGH_MODE(){
    return {
      continuous: 0b0000000000000000,
      singleshot: 0b0000000100000000 //default
    }
  }


  static get CONFIG_LOW_DR(){
    return {
      dr128,
      dr250,
      dr128,
      dr128,
      dr128,
      dr128,
    }
  }

  static get CONFIG_LOW_CMODE(){
  }

  static get CONFIG_LOW_CPOL(){
  }

  static get CONFIG_LOW_CLAT(){
  }

  static get CONFIG_LOW_CQUE(){
  }
}
