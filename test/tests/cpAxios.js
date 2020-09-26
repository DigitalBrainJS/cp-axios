const assert = require('assert');
const CPromise = require('c-promise2');
const cpAxios = require('../../lib/index');

describe('cpAxios', function () {
    it('should fetch the url', async function () {
        const url = 'https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=0s';

        return cpAxios(url)
            .then(response => {
                assert.deepStrictEqual(response.data, {
                    "type": "Movie",
                    "name": "Me, Myself & Irene",
                    "year": 2001
                })
            })
    })

    describe('cancelation', function () {
        it('should support request cancelation using promise.cancel', async function () {
            const url = 'https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=2s';

            const chain = cpAxios(url)
                .timeout(5000)
                .then(() => {
                    assert.fail('does not reject');
                }, err => {
                    if (!CPromise.isCanceledError(err)) {
                        assert.fail('error is not an CanceledError instance');
                    }

                    assert.equal(err.message, 'canceled');
                });

            setTimeout(() => {
                chain.cancel();
            }, 500);

            return chain;
        });

        it('should support request cancelation using axios cancelToken', async function () {
            const url = 'https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=2s';

            const source = cpAxios.CancelToken.source();

            const chain = cpAxios(url, {cancelToken: source.token})
                .timeout(5000)
                .then(() => {
                    assert.fail('does not reject');
                }, err => {
                    if (!CPromise.isCanceledError(err)) {
                        assert.fail('error is not an CanceledError instance');
                    }

                    assert.equal(err.message, 'canceled');
                });

            setTimeout(() => {
                source.cancel();
            }, 500);

            return chain;
        });

        it('should support request cancelation using AbortController signal', async function () {
            const url = 'https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=2s';

            const abortController = new CPromise.AbortController();
            const {signal} = abortController;

            const chain = cpAxios(url, {signal})
                .timeout(5000)
                .then(() => {
                    assert.fail('does not reject');
                }, err => {
                    if (!CPromise.isCanceledError(err)) {
                        assert.fail('error is not an CanceledError instance');
                    }

                    assert.equal(err.message, 'canceled');
                });

            setTimeout(() => {
                abortController.abort();
            }, 500);

            return chain;
        })
    });
})
