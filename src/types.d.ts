/*
log = console.log;
pcKeys = Object.keys(pc);
function createTSD(value, name) {
  var out = '';
  var keys = Object.keys(value);
  log(keys);
  out += `interface ${name} {\n`;
  for (var key of keys) {
    var type = typeof value[key];
    //out += `  // typeof == ${type}\n`
    if (value[key] instanceof Array) {
      type = '[]';
    } else if (value[key] instanceof Object) {
      type = value[key].constructor.name;
      if (type == 'Object') {
        type = 'object';
      }
    }
    if (type == "function") {
        type = "Function";
    }
    if (pcKeys.includes(type)) {
        type = 'pc.' + type;
    }
    out += `  ${key}: ${type};\n`;
  }
  out += `}\n`;
  return out;
}

log(createTSD(entity.script.scripts[0], 'ScriptTypeOrbitCamera'));
*/

interface ScriptType {
  _callbacks: object;
  _callbackActive: object;
  app: pc.Application;
  entity: pc.Entity;
  _enabled: boolean;
  _enabledOld: boolean;
  __destroyed: boolean;
  __attributes: object;
  __attributesRaw: object;
  __scriptType: Function;
  __executionOrder: number;
  _initialized: boolean;
  _modelsAabb: pc.BoundingBox;
  _pivotPoint: pc.Vec3;
  _yaw: number;
  _pitch: number;
  _distance: number;
  _targetYaw: number;
  _targetPitch: number;
  _targetDistance: number;
  _postInitialized: boolean;
}
