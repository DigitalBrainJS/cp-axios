const axios = require('axios');
const CPromise = require('c-promise2');
const {Axios} = axios;

const isThenable = (thing) => thing && typeof thing.then === 'function';
const _setImmediate = typeof setImmediate === 'function' ? setImmediate : setTimeout;

class CPAxios extends Axios {
    request(config) {
        if (typeof config === 'string') {
            config = arguments[1] || {};
            config.url = arguments[0];
        }

        const {cancelToken, signal, onDownloadProgress, onUploadProgress, ...axiosConfig} = config;

        if (cancelToken) {
            if (!isThenable(cancelToken.promise)) {
                return CPromise.reject(new Error('Unknown cancelToken object type'))
            }

            cancelToken.promise.then((reason) => {
                promise.cancel(reason.message);
            })
        }

        const promise = new CPromise((resolve, reject, scope) => {
            _setImmediate(() => {
                const {isCaptured} = scope;
                super.request({
                    ...axiosConfig,
                    onDownloadProgress: isCaptured ? /* istanbul ignore next */ function (event) {
                        const {loaded, total} = event;
                        scope.progress(0.5 + loaded / total / 2, {loaded, total, type: 'download'});
                        onDownloadProgress && onDownloadProgress(event);
                    } : onDownloadProgress,
                    onUploadProgress: isCaptured ? /* istanbul ignore next */ function (event) {
                        const {loaded, total} = event;
                        scope.progress(loaded / total / 2, {loaded, total, type: 'upload'});
                        onUploadProgress && onUploadProgress(event);
                    } : onUploadProgress,
                    cancelToken: new axios.CancelToken(function executor(cancel) {
                        scope.onCancel(cancel)
                    }),
                }).then(resolve, reject);
            })
        }, {signal});

        return promise;
    }
}

module.exports = CPAxios;
