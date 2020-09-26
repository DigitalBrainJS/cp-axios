const axios= require('axios');
const utils = require('axios/lib/utils');
const bind = require('axios/lib/helpers/bind');
const mergeConfig = require('axios/lib/core/mergeConfig');
const defaults = require('axios/lib/defaults');
const CPAxios = require('./core/CPAxios');
const CPromise= require('c-promise2');

function createInstance(defaultConfig) {
    const context = new CPAxios(defaultConfig);
    const instance = bind(CPAxios.prototype.request, context);

    utils.extend(instance, CPAxios.prototype, context);

    utils.extend(instance, context);

    return instance;
}

const _axios = createInstance(defaults);

_axios.Axios = CPAxios;

(()=>{
    const props= Object.getOwnPropertyNames(axios);
    props.forEach(prop=>{
       if(!Object.prototype.hasOwnProperty.call(_axios, prop)){
           _axios[prop]= axios[prop];
       }
    });
})();

_axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(_axios.defaults, instanceConfig));
};

_axios.all = function all(promises) {
    return CPromise.all(promises);
};

module.exports = _axios;

module.exports.default = _axios;

