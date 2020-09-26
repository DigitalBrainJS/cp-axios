const axios= require('axios');
const utils = require('axios/lib/utils');
const bind = require('axios/lib/helpers/bind');
const mergeConfig = require('axios/lib/core/mergeConfig');
const defaults = require('axios/lib/defaults');
const CPAxios = require('./core/CPAxios');
const CPromise= require('c-promise2');

function createInstance(defaultConfig) {
    var context = new CPAxios(defaultConfig);
    var instance = bind(CPAxios.prototype.request, context);

    utils.extend(instance, CPAxios.prototype, context);

    utils.extend(instance, context);

    return instance;
}

// Create the default instance to be exported
var _axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
_axios.Axios = CPAxios;

(()=>{
    const props= Object.getOwnPropertyNames(axios);
    props.forEach(prop=>{
       if(!Object.prototype.hasOwnProperty.call(_axios, prop)){
           _axios[prop]= axios[prop];
       }
    });
})();

// Factory for creating new instances
_axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(_axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
/*_axios.Cancel = axios.Cancel;
_axios.CancelToken = axios.CancelToken;
_axios.isCancel = axios.isCancel;*/

// Expose all/spread
_axios.all = function all(promises) {
    return CPromise.all(promises);
};

//_axios.spread = require('axios/lib/helpers/spread');

module.exports = _axios;

// Allow use of default import syntax in TypeScript
module.exports.default = _axios;

