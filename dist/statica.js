Array.prototype.equals = function (array) {
    if (!array)
        return false;
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            return false;   
        }           
    }       
    return true;
}
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

function data(obj){
  return class {
    constructor(val){
      if(obj.vals.includes(val)) this["[[PrimitiveValue]]"] = val;
      else throw new Error(`Value passed in not in valid values array: ${JSON.stringify(obj.vals)}`);
      if(obj.type) this.datatype = obj.type;
    }
    get value(){
      return this["[[PrimitiveValue]]"];
    }
    set value(val){
      if(obj.vals.includes(val)) this["[[PrimitiveValue]]"] = val;
      else throw new Error(`Value passed in not in valid values array: ${JSON.stringify(obj.vals)}`);
    }
  }
}

class Interface {
  constructor(inter, name){
    this.inter = inter;
    this.name = name;
  }
}
Object.prototype.implements = function impl(_interface, ...others){
  if(!(_interface instanceof Interface)) throw new Error("You cannot implement a non-interface.")
  if(!this.interfaces) this.interfaces = [_interface.name];
  else this.interfaces.push(_interface.name);
  let props = _interface.inter;
  let keys = Object.keys(this);
  for(let prop of Object.entries(props)){
    if(!keys.includes(prop[0])){
      if(!prop[1].value)
      throw new Error(`Expected property ${prop[0]}, but not found.`);
      else this[prop[0]] = prop[1].value;
    } 
    else if(prop[1].type){
      if(prop[1].type !== typeof this[prop[0]]){
      if(!prop[1].value) throw new Error(`Expected property ${prop[0]} to be of type ${prop[1].type}.`);
      else this[prop[0]] = prop[1].value;
      } 
    }
  }
  if(others.length > 0){
    impl.call(this, ...others);
  }
  return this;
}
Function.prototype.params = function(...vals){
  if(!this.fheader) this.fheader = {};
  this.fheader.params = vals;
  return this;
}

Function.prototype.returns = function(val){
  if(!this.fheader) this.fheader = {};
  this.fheader.returns = val;
  return this;
}
let T = {}
T.ready = (value) => value ? value : {}
T.generic = (value) => {
  if(value.constructor && typeof value === "object"){
    return `c:${value.constructor.name}`;
  } else if (value.interfaces) {
    return `i:${value.interfaces[0]}`;
  } else if (value.datatype){
    return `d:${value.datatype}`;
  }
  return Object.prototype.toString.call(value).replace(/\[object\s(.+)\]/, "$1");
}
T.typecheck = (value, typelist) => {
  if(typeof typelist === "string"){
    if(typelist === "Any"){
      return true;
    }
    let inverse = false;
    let mode;
    if(typelist[0] === "!"){
      inverse = true;
      typelist = typelist.replace("!", "");
    }
    if(typelist.includes("&")){
      typelist = typelist.split("&");
      mode = "AND";
    } else {
      typelist = typelist.split("|");
      mode = "OR";
    }
    let result = false;
    let iter = 0;
    for(let type of typelist){
      if(result === true && mode === "OR"){
        break;
      } else if (result === false && mode === "AND" && !(iter === 0)){
        break;
      }
      if(mode === "AND") result = false;
      iter++;
      if(!(/[cide]\:(.+)/.test(type))){
        let name = Object.prototype.toString.call(value).replace(/\[object\s(.+)\]/, "$1")
        result = name === type.replace(/[\@\#\?]/g, "");
        let optional = /(.+)\?/.test(type);
        if(!value && optional){
          result = true;
        }
        if(name === "Number"){
          let int = /(.+)\#/.test(type);
          if(int && !(value % 1 === 0)) result = false;
        }
        if(name === "String"){
          let char = /(.+)@/.test(type);
          if(char && !(value.length === 1)) result = false;
        }
      } else if (/e\:(.+)/.test(type)) {
        if(value){
          result = value.__proto__.__proto__.constructor.name === type.replace("e:", "").replace("?", "");
        } else {
          let optional = /(.+)\?/.test(type);
          if(value === undefined || value === null && optional){
            result = true;
          }
        }
      } else if (/c\:(.+)/.test(type)) {
        if(value){
          result = value.constructor.name === type.replace("c:", "").replace("?", "");
        } else {
          let optional = /(.+)\?/.test(type);
          if(value === undefined || value === null && optional){
            result = true;
          }
        }
      } else if (/i\:(.+)/.test(type)) {
        if(T.ready(value).interfaces){
          result = value.interfaces.includes(type.replace("i:", "").replace("?", ""));
        } else {
          let optional = /(.+)\?/.test(type);
          if(value === undefined || value === null && optional){
            result = true;
          }
        }
      } else if (/d\:(.+)/.test(type)) {
        if(T.ready(value).datatype){
          result = value.datatype === type.replace("d:", "").replace("?", "");
        } else {
          let optional = /(.+)\?/.test(type);
          if(value === undefined || value === null && optional){
            result = true;
          }
        }
      }
    }
    if(inverse) result = !result;
    return result;
  } else if (typeof typelist === "object"){
    let result = false;
    if(T.ready(value).fheader){
      if(value.fheader.params.equals(typelist.params) &&
      value.fheader.returns === typelist.returns) result = true;
    } else {
      throw new Error("Function header not specified.");
    }
    return result;
  }
}
T.typewrapper = class {
    constructor(value, type){
      this._value = value;
      this._type = type;
      Object.defineProperty(this, "_", {
        get: function(){
          return this._value;
        },
        set: function(value){
          if(T.typecheck(value, this._type)) this._value = value;
          else throw new Error(`Value ${JSON.stringify(value)} is not of type ${this._type}.`)
        }
      })
    }
} 
T.type = (value, type) => {
    if(T.typecheck(value, type)) return new T.typewrapper(value, type);
    else throw new Error(`Value ${JSON.stringify(value)} is not of type ${type}.`);
}
T.typeify = (arr, types) => {
  for(let i = 0; i < arr.length; i++){
    if(!types[i]){
      arr[i] = T.type(arr[i], T.generic(arr[i]));
    } else {
      arr[i] = T.type(arr[i], types[i]);
    }
  }
}
T.returns = (value, type, func) => {
  type = type ? type : T.generic(value);
  return T.type(value, type)._;
}
