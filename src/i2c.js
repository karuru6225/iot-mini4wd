import mraa from 'mraa';

export default class I2c {
  constructor(dev, address){
    this._mraaI2c = new mraa.I2c(dev);
    this._mraaI2c.frequency(mraa.I2C_FAST);
    this._devAddr = address;
  }
  _write(addr, byteArray){
    this._mraaI2c.address(this._devAddr);
    let _addr = addr;
    byteArray.forEach(data => {
      this._mraaI2c.writeReg(_addr, data);
      _addr++;
    });
  }
  _read(addr, length = 1){
    this._mraaI2c.address(this._devAddr);
    this._mraaI2c.writeByte(addr);
    return this._mraaI2c.read(length);
  }
  getDevAddress(){
    return this._devAddr;
  }
  writeBit(addr, bitaddr, bit){
    this.writeBits(addr, bitaddr, [bit]);
  }
  writeBits(addr, bitaddr, bits){
    if(bits.length > 8){
      throw 'too long bits';
    }
    let data = 0;
    let mask = 0xff << (bitaddr + 1);
    mask |= 0xff >> (7 - bitaddr + bits.length);
    mask &= 0xff;
    bits.forEach(bit => {
      data |= bit ? 1 : 0;
      data = data << 1;
    });
    data = data >> 1;
    data = data << (bitaddr - bits.length + 1);
    const prev = this._read(addr)[0];
    const next = (prev & mask) | data;
    this._write(addr, [next]);
  }
  writeByte(addr, data){
    this._write(addr, [data]);
  }
  writeBytes(addr, dataAry){
    this._write(addr, dataAry);
  }
  readBit(addr, bitaddr){
    const data = this._read(addr)[0];
    return data & (1 << bitaddr);
  }
  readBits(addr, bitaddr, length){
    let data = this._read(addr)[0];
    data = data << (8 - bitaddr - 1);
    data &= 0xff;
    data = data >> (bitaddr - length + 1);
    return data;
  }
  readByte(addr){
    return this._read(addr)[0];
  }
  readBytes(addr, length){
    return this._read(addr, length);
  }
}
