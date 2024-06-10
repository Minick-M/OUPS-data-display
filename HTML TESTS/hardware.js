// Copyright: Marc Feeley, 2024
// v1: April 10, 2024

let is_connected = false;
let device_latest_readings = [];
let readings_to_average = 4;

const timestampIndex = 0;
const forceIndex = 1;
const xIndex = 2;
const yIndex = 3;
const zIndex = 4;

function get_current_reading() {
  let reading = [0, 0, 0, 0, 0];
  for (let i=0; i<device_latest_readings.length; i++) {
    reading[0] = device_latest_readings[i][0];
    for (let j=1; j<reading.length; j++) {
      reading[j] += device_latest_readings[i][j];
    }
  }
  for (let j=1; j<reading.length; j++) {
    reading[j] = reading[j] / device_latest_readings.length;
  }
  return reading;
}  
    
function handle_device_connection() {
  log('handle_device_connection');
  device_latest_readings = [];
  is_connected = true;
}

function handle_device_disconnection() {
  log('handle_device_disconnection');
  is_connected = false;
}

function handle_device_notification(timestamp, force, ax, ay, az) {
//  log('handle_device_notification ' + timestamp + ' ' + force + ' ' + ax + ' ' + ay + ' ' + az);
  let reading = [timestamp, force, ax, ay, az];
  device_latest_readings.push(reading);
  while (device_latest_readings.length > readings_to_average) device_latest_readings.shift();
}

let trace_packets = false; // For debugging packets
let trace_readings = false; // For debuggin readings

function log(msg) {
  console.log(msg);
}

let device_name_prefix = 'Oups!';

// Hardware connection ids
let OUPS_service_id         = '0000ffe0-0000-1000-8000-00805f9b34fb';
let force_characteristic_id = '0000ffe2-0000-1000-8000-00805f9b34fb';
let IMU_characteristic_id   = '0000ffe3-0000-1000-8000-00805f9b34fb';

let bluetooth_device     = null;
let force_characteristic = null;
let IMU_characteristic   = null;

let latest_force = null;

async function request_device() {

  log('*** Requesting device');

  bluetooth_device = await navigator.bluetooth.requestDevice({
    filters: [{namePrefix: device_name_prefix}],
    optionalServices: [OUPS_service_id]});

  bluetooth_device.addEventListener('gattserverdisconnected', on_disconnected);
}

async function on_disconnected() {

  log('*** Device disconnected');

  ui_state_set('disconnected');
  handle_device_disconnection();

  force_characteristic.removeEventListener('characteristicvaluechanged',
    handle_force_value_changed);
  force_characteristic = null;

  IMU_characteristic.removeEventListener('characteristicvaluechanged',
    handle_IMU_value_changed);
  IMU_characteristic = null;

  bluetooth_device = null;
}

async function disconnect_device() {

  log('*** Disconnecting device');

  if (bluetooth_device === null || !bluetooth_device.gatt.connected) return;

  await bluetooth_device.gatt.disconnect();
}

async function connect_device() {

  if (!bluetooth_device) {
    await request_device();
  }

  if (bluetooth_device.gatt.connected) return;

  //print
  log('*** Connecting to device');

  ui_state_set('connecting');

  const server = await bluetooth_device.gatt.connect();

  const service = await server.getPrimaryService(OUPS_service_id);

  force_characteristic = await service.getCharacteristic(force_characteristic_id);
  force_characteristic.addEventListener('characteristicvaluechanged',
    handle_force_value_changed);

  IMU_characteristic = await service.getCharacteristic(IMU_characteristic_id);
  IMU_characteristic.addEventListener('characteristicvaluechanged',
    handle_IMU_value_changed);

  latest_force = null;

  ui_state_set('connected');
  handle_device_connection();

  await start_notifications();
}

async function start_notifications() {

  log('*** Starting notifications');

  try {
    await force_characteristic.startNotifications();
    await IMU_characteristic.startNotifications();
  } catch (exc) {
    log('Error: ' + exc);
  }
}

async function handle_force_value_changed(event) {

  const view = event.target.value;

  //debug
  if (trace_packets) { 
    let str = 'force packet:';
    for (let i=0; i<14; i++) {
      str = str + ' ' + view.getUint8(i);
    }
    log(str);
  }

  let timestamp = view.getUint32(1, true);
  let force = view.getFloat32(10, true);

  //debug
  if (trace_readings) {
    log(timestamp + ' ' + force);
  }

  latest_force = force;
}

async function handle_IMU_value_changed(event) {

  const view = event.target.value;

  if (trace_packets) {
    let str = 'IMU packet:';
    for (let i=0; i<38; i++) {
      str = str + ' ' + view.getUint8(i);
    }
    log(str);
  }
  
  let timestamp = view.getUint32(1, true);
//  let temp = view.getFloat32(10, true);
  let ax = view.getFloat32(14, true);
  let ay = view.getFloat32(18, true);
  let az = view.getFloat32(22, true);

  if (trace_readings) {
    log(timestamp + ' ' + ax + ' ' + ay + ' ' + az);
  }

  if (latest_force !== null) {
    handle_device_notification(timestamp, latest_force, ax, ay, az);
  }
}

function ui_state_set(state) {
    let but = document.querySelector('.ui_connection_button');
    let msg = document.querySelector('.ui_message');
    if (but && msg) {
      but.setAttribute('data-state', state);
      msg.setAttribute('data-state', state);
      if (state === 'connecting') {
        msg.innerText = 'Un moment SVP...';
        but.innerText = 'Un moment SVP...';
        but.disabled = true;
        but.style.display = 'none';
      } else {
        msg.innerText = (state === 'connected') ? 'Connecté' : 'Déconnecté !!';
        but.innerText = (state === 'connected') ? '>>> Déconnecter <<<' : '>>> Connecter <<<';
        but.disabled = false;
        but.style.display = 'inline';
      }
    }
  }

async function ui_connection_button_click() {
    if (bluetooth_device === null) {
      await connect_device();
    } else {
      await disconnect_device();
    }
  }

ui_state_set('disconnected');