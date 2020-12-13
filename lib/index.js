const mergeConfig = require('axios/lib/core/mergeConfig');
const defaults = require('axios/lib/defaults');
const CPAxios = require('./core/CPAxios');
const {proxyContext}= require('./utils');
const CPromise= require('c-promise2');

function createInstance(defaultConfig) {
    const context = new CPAxios(defaultConfig);

    const instance = CPAxios.prototype.request.bind(context);

    return proxyContext(instance, context);
}

const cpAxios = createInstance(defaults);

cpAxios.Axios = CPAxios;

cpAxios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(cpAxios.defaults, instanceConfig));
};

cpAxios.all = function all(promises) {
    return CPromise.all(promises);
};

module.exports = cpAxios;

module.exports.default = cpAxios;

