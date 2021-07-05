import { distinct } from "./utils_bbox";

var pcKeys = Object.keys(pc);

function toString(value) {
  if (value === null) {
    return 'null';
  } else if (value === undefined) {
    return 'undefined';
  } else if (value instanceof Array) {
    var out = '';
    out = '[' + value.join(', ') + ']';
    if (out.length > 70) {
        out = out.substr(0, 70);
        out += '...';
    }
    return out;
  } else if (value instanceof Function) {
    return `name: ${value.name}, length: ${value.length}`;
  }
  return value.toString();
}

function dumpAsObject(value, depth) {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  var out = '';
  var spaces = "  ".repeat(depth);
  var keys = Object.keys(value);
  for (var key of keys) {
    var type = typeof value[key];
    //out += `${spaces}// typeof == ${type}\n`
    if (value[key] instanceof Array) {
      var arr = value[key];
      var typenames = arr.map(e=>{
        if (e.constructor) {
          return e.constructor.name
        }
      });
      typenames = distinct(typenames);
      for (var i=0; i<typenames.length; i++) {
        if (typenames[i] == "String") {
          typenames[i] = 'string';
        } else if (typenames[i] == "Number") {
          typenames[i] = 'number';
        } else if (typenames[i] == "Array") {
          typenames[i] = ''; // otherwise: Array[]
        } else if (pcKeys.includes(typenames[i]) && typenames[i] != "string") {
          typenames[i] = 'pc.' + typenames[i];
        }
      }
      type = typenames.map(x=>x+'[]').join(' | ');
      //type = '[]';
    } else if (value[key] instanceof Object) {
      type = value[key].constructor.name;
      if (type == 'Object') {
        type = 'object';
      }
    } else if (1) {
      // convert function to "name" key etc.
    }
    if (type == "function") {
        type = "Function";
    }
    if (pcKeys.includes(type) && type != "string") {
        type = 'pc.' + type;
    }
    out += `${spaces}${key}: ${type}; // ${toString(value[key])}\n`;
  }
  return out;
}

export function tsd(value: any, name?: string) {
  console.log(tsdRet(value, name));
}

export function tsdRet(value: any, name?: string) {
  if (!name && value instanceof Object) {
    name = value.constructor.name;
  }
  var out = '';
  out += `interface ${name} {\n`;
  out += dumpAsObject(value, 1);
  out += `}\n`;
  return out;
}
