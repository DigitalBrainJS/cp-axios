![Travis (.com)](https://img.shields.io/travis/com/DigitalBrainJS/cp-axios)
[![Coverage Status](https://coveralls.io/repos/github/DigitalBrainJS/cp-axios/badge.svg?branch=master)](https://coveralls.io/github/DigitalBrainJS/cp-axios?branch=master)
![npm](https://img.shields.io/npm/dm/cp-axios)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/cp-axios)
![David](https://img.shields.io/david/DigitalBrainJS/cp-axios)

##Table of contents
- [SYNOPSIS](#synopsis-sparkles)
- [Installation](#installation-hammer)
- [CDN bundle](#cdn-bundle)
- [Usage examples](#usage-examples)
    - [Request aborting using CPromise cancelation API](#request-aborting-using-cpromise-cancelation-api)
    - [Request aborting using AbortController signal](#request-aborting-using-abortcontroller-signal)
    - [Request aborting using Axios cancelToken](#request-aborting-using-axios-canceltoken)
    - [Using generators as async functions](#using-generators-as-async-functions)
    - [Abortable concurrent requests](#abortable-concurrent-requests)
- [API Reference](#api-reference)    
- [License](#license)    


## SYNOPSIS :sparkles:

**cpAxios** is a simple [axios](https://www.npmjs.com/package/axios) wrapper that provides an advanced cancellation api.

This library supports three types of the cancelation API that could be used *simultaneously*:
- Axios [cancelableToken](https://github.com/axios/axios#cancellation)
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) signal
- [CPromise](https://www.npmjs.com/package/c-promise2) promise cancelation API 

## Installation :hammer:

```bash
$ npm install cp-axios
```

```bash
$ yarn add cp-axios
```

### CDN bundle

- [production UMD bundle](https://unpkg.com/cp-axios) (or [minified](https://unpkg.com/cp-axios/dist/cp-axios.umd.min.js) ~31KB)

module global export- `cpAxios`

## Usage examples

#### Live Example

[Live browser example](https://codesandbox.io/s/mutable-breeze-wdyp)

#### Request aborting using CPromise cancelation API:
````javascript
 const cpAxios= require('cp-axios');

 const chain = cpAxios(url)
      .timeout(5000)
      .then(request => {
          console.log(`Done: ${JSON.stringify(request.json())}`)
      }, err => {
          console.warn(`Request failed: ${err}`)
      });

 setTimeout(() => {
    chain.cancel();
 }, 500);
````

#### Request aborting using AbortController signal:
````javascript
 const cpAxios= require('cp-axios');
 const CPromise= require('c-promise2');

// you could to use any other AbortController implementation, but CPromise already provides it
 const abortController = new CPromise.AbortController();
 const {signal} = abortController;
 
 const chain = cpAxios(url, {signal})
      .timeout(5000)
      .then(request => {
          console.log(`Done: ${JSON.stringify(request.json())}`)
      }, err => {
          console.warn(`Request failed: ${err}`)
      });

 setTimeout(() => {
    chain.cancel();
 }, 500);
````

#### Request aborting using Axios cancelToken:
````javascript
 const cpAxios= require('cp-axios');
 const CPromise= require('c-promise2');

 const source = cpAxios.CancelToken.source();
 
 const chain = cpAxios(url, {cancelToken: source.token})
      .timeout(5000)
      .then(request => {
          console.log(`Done: ${JSON.stringify(request.json())}`)
      }, err => {
          console.warn(`Request failed: ${err}`)
      });

 setTimeout(() => {
    source.cancel();
 }, 500);
````

#### Using generators as async functions:

````javascript
const cpAxios= require('cp-axios');
const CPromise= require('c-promise2');
const url= 'https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=5s';

const chain= CPromise.from(function*(){
    try{
        const response= yield cpAxios(url).timeout(5000);
        console.log(`Done: `, response.data)
    }catch(err){
        console.log(`Error: `, err)
    }   
});

 setTimeout(()=> chain.cancel(), 1000); // abort the request after 1000ms 
````

#### Abortable concurrent requests

````javascript
const cpAxios= require('cp-axios');
const CPromise = require('c-promise2');

// same as cpAxios.all([...])
const chain= CPromise.all([
    cpFetch("https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=3s"),
    cpFetch("https://run.mocky.io/v3/30a97b24-ed0e-46e8-9f78-8f954aead2f8?mocky-delay=5s")
]).timeout(10000).then(responses=> {
    console.log(`Results :`, responses);
}, function (err) {
    console.warn(`We got an error: ${err}`);
});

// other request will aborted if one fails

// setTimeout(()=> chain.cancel(), 1000); // abort the request after 1000ms 
````

## API Reference

The package exports a wrapped version of the axios instance. 
See the axios [documentation](https://www.npmjs.com/package/axios#axios) to gen more information.

`cpAxios(url, {signal, ...nativeFetchOptions}): CPromise`

Options:

- `signal`- the AbortController signal

- `...nativeAxiosOptions`- other options supported by [axios](https://www.npmjs.com/package/axios) package

Learn more about [CPromise](https://www.npmjs.com/package/c-promise2) features 
## License

The MIT License Copyright (c) 2020 Dmitriy Mozgovoy robotshara@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

