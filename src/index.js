import printf from 'printf';
import mqtt from 'mqtt';
import mraa from 'mraa';
import commander from 'commander';

import LipoFuelGauge from './lipo-fuel-gauge';
import Mpu6050 from './gyro-accel-mpu6050';
import config from './config.js';
import fs from 'fs';

let fg, ga, pr, mb;
let gaInitialized = false;
let fgInitialized = false;
let mbInitialized = false;
let mqttClient;
let doCalibration = true;

commander
  .version('0.0.1')
  .option('-n --no-calibration', 'do not exec calibration')
  .parse(process.argv);

if(commander.noCalibration){
  doCalibration = false;
}

function initialize(){
  console.log('initializing...');

  const preRun = () => {
    const calibrationDataFile = './accelGyroCalibrationData.json';
    if(!doCalibration){
      try{
        const obj = JSON.parse(fs.readFileSync(calibrationDataFile, 'utf8'));
        ga.setCalibrationData(obj);
      }catch(e){
        console.log(e);
      }
    }
    if(gaInitialized && config.useAccelGyro && doCalibration){
      console.log('start calibration.....');
      ga.startCalibration((cnt)=>{
        return cnt < 100;
      }, (calibData) => {
        fs.writeFileSync(calibrationDataFile, JSON.stringify(calibData));
        run();
      });
    }else{
      run();
    }
  };

  if(config.useLipoFuel){
    try{
      fg = new LipoFuelGauge(config.lipoFuelI2cDev, 0x36);
      fgInitialized = true;
      console.log('lipofuelgauge initialize complete');
    }catch(e){
      console.log(e);
    }
  }

  if(config.useAccelGyro){
    while(!gaInitialized){
      try{
        ga = new Mpu6050(config.accelGyroI2cDev, 0x68);
        gaInitialized = true;
      }catch(e){
        console.log(e);
      }
    }
    if(gaInitialized){
      console.log(ga.whoAmI()?'mpu6050 initialize success':'mpu6050 initialize failed');
    }
  }

  if(config.useMini4Battery){
    try{
    }catch(e){
    }
  }

  if(config.usePhotoReflector){
    pr = new mraa.Gpio(mraa.INTEL_EDISON_GP15);
    pr.dir(mraa.DIR_IN);
    pr.mode(mraa.MODE_PULLUP);
    //pr.edge(mraa.EDGE_BOTH);
    let prevEdgeTime = 0;
    /*
    pr.isr(mraa.EDGE_BOTH, ()=>{
      const val = pr.read();
      const currentTime = Date.now();
      let lapUpdate = false;
      console.log('GPIO15_ISR: '+val+' time: '+ currentTime);
      // TODO: lap更新のアルゴリズム
      if(lapUpdate){
        const jsonStr = JSON.stringify({
          service_name: config.mqttService,
          token: config.mqttToken,
          message: {
            "lap": {
              time: currentTime
            }
          }
        });
        if(config.isSendByMqtt){
          mqttClient.publish('mini4wd.LapTime', jsonStr);
        }else{
          console.log(jsonStr);
        }
      }
    });*/
  }

  if(config.isSendByMqtt){
    mqttClient = mqtt.connect(config.mqttUrl);
    mqttClient.on('connect', ()=>{
      console.log('mqtt connected');
      preRun();
    })

    process.on('beforeExit', ()=>{
      console.log('closing mqtt client...');
      mqttClient.close();
    });
  }else{
    preRun();
  }
}

function run(){
  console.log('start!!!!!!!!!!');
  let payload = [];
  if(gaInitialized && config.useAccelGyro){
    var updateAccelGyro = ()=>{
      let m;
      try{
        m = ga.getMotion();
      }catch(e){
        setTimeout(updateAccelGyro, 1000);
        return;
      }
      const jsonStr = JSON.stringify({
        service_name: config.mqttService,
        token: config.mqttToken,
        message: {
          "accel-gyro": {
            accel_x: m.ax*1000000, accel_y: m.ay*1000000, accel_z: m.az*1000000,
            gyro_x: m.gx*1000000, gyro_y: m.gy*1000000, gyro_z: m.gz*1000000,
            time: Date.now()
          }
        }
      });
      //console.log(printf("ax:% 3.3f  ay:% 3.3f  az:% 3.3f", m.ax, m.ay, m.az));
      /*
      console.log(printf("gx:% 3.3f  gy:% 3.3f  gz:% 3.3f", m.gx, m.gy, m.gz));//*/
      if(config.isSendByMqtt){
        mqttClient.publish('mini4wd.AccelGyro', jsonStr);
      }else{
        //console.log(jsonStr);
      }
      setTimeout(updateAccelGyro, config.accelGyroInterval);
    };
    setTimeout(updateAccelGyro, config.accelGyroInterval);
  }

  if(config.useMini4Battery){
  }else{
    setInterval(()=>{
      const v = 3000;
      const jsonStr = JSON.stringify({
        service_name: config.mqttService,
        token: config.mqttToken,
        message: {
          "mini4wd-battery": {
            voltage: v,
            time: Date.now()
          }
        }
      });
      //console.log(printf("voltage: % 2.2f  percent: % 3d", v/1000.0, p));
      if(config.isSendByMqtt){
        mqttClient.publish('mini4wd.Mini4wdBattery', jsonStr);
      }else{
        //console.log(jsonStr);
      }
    },config.mini4BatteryInterval);
  }

  if(fgInitialized && config.useLipoFuel){
    setInterval(()=>{
      const v = fg.getVoltage();
      const p = fg.getPercent();
      const jsonStr = JSON.stringify({
        service_name: config.mqttService,
        token: config.mqttToken,
        message: {
          "lipo-battery": {
            voltage: v,
            percent: p,
            time: Date.now()
          }
        }
      });
      //console.log(printf("voltage: % 2.2f  percent: % 3d", v/1000.0, p));
      if(config.isSendByMqtt){
        mqttClient.publish('mini4wd.LipoBattery', jsonStr);
      }else{
        //console.log(jsonStr);
      }
    }, config.lipoFuelInterval);
  }else{
    setInterval(()=>{
      const v = 3000;
      const p = 50;
      const jsonStr = JSON.stringify({
        service_name: config.mqttService,
        token: config.mqttToken,
        message: {
          "lipo-battery": {
            voltage: v,
            percent: p,
            time: Date.now()
          }
        }
      });
      //console.log(printf("voltage: % 2.2f  percent: % 3d", v/1000.0, p));
      if(config.isSendByMqtt){
        mqttClient.publish('mini4wd.LipoBattery', jsonStr);
      }else{
        //console.log(jsonStr);
      }
    }, config.lipoFuelInterval);
  }

  //*
  if(config.usePhotoReflector){
    let prValue = 0;
    let prevTime = 0;
    let prevLapTime = Date.now();
    setInterval(()=>{
      const val = pr.read();
      if(prValue != val){
        const currentTime = Date.now();
        const deltaT = (currentTime - prevTime);
        prevTime = currentTime;
        console.log('GPIO15_ISR: '+val+' time: '+ currentTime + ' deltaT: ' + deltaT);
        if(deltaT > 2000){
          const jsonStr = JSON.stringify({
            service_name: config.mqttService,
            token: config.mqttToken,
            message: {
              "lap": {
                time: currentTime
              }
            }
          });
          if(config.isSendByMqtt){
            mqttClient.publish('mini4wd.LapTime', jsonStr);
          }else{
            console.log(jsonStr);
          }
        }
        prValue = val;
      }
    }, config.photoReflectorInterval);
  }//*/
}

initialize();
