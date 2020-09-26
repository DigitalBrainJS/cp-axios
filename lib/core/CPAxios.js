const axios = require('axios');
const CPromise = require('c-promise2');
const {Axios} = axios;

const isThenable = (thing) => thing && typeof thing.then === 'function';

class CPAxios extends Axios {
    request(config) {

        if (typeof config === 'string') {
            config = arguments[1] || {};
            config.url = arguments[0];
        }

        const {cancelToken, signal, ...axiosConfig} = config;

        if (cancelToken) {
            if (!isThenable(cancelToken.promise)) {
                return CPromise.reject(new Error('Unknown cancelToken object type'))
            }

            cancelToken.promise.then((reason) => {
                promise.cancel(reason.message);
            })
        }

        const promise= new CPromise((resolve, reject, {onCancel}) => {
            super.request({
                ...axiosConfig,
                cancelToken: new axios.CancelToken(function executor(cancel) {
                    onCancel(cancel)
                }),
            }).then(resolve, reject);
        }, {signal});

        return promise;
    }
}

module.exports = CPAxios;
