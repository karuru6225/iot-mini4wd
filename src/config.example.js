module.exports = {
  mqttUrl: 'mqtt://mqtt-server.example.com',
  mqttService: 'service_name',
  mqttToken: 'mqtt-no-token',
  isSendByMqtt: false,
  useLipoFuel: false,
  lipoFuelI2cDev: 6,
  lipoFuelInterval: 60000,
  useAccelGyro: false,
  accelGyroI2cDev: 6,
  accelGyroInterval: 1000,
  usePhotoReflector: false,
  photoReflectorPort: '15',
  photoReflectorInterval: 10,
  useMini4Battery: true,
  mini4BatteryI2cDev: 1,
  mini4BatteryInterval: 1000
};
