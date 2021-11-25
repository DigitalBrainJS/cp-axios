[![Build Status](https://travis-ci.com/DigitalBrainJS/cp-axios.svg?branch=master)](https://travis-ci.com/DigitalBrainJS/cp-axios)
[![Coverage Status](https://coveralls.io/repos/github/DigitalBrainJS/cp-axios/badge.svg?branch=master)](https://coveralls.io/github/DigitalBrainJS/cp-axios?branch=master)
![npm](https://img.shields.io/npm/dm/cp-axios)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/cp-axios)
![David](https://img.shields.io/david/DigitalBrainJS/cp-axios)

## Table of contents :page_with_curl:
- [SYNOPSIS](#synopsis-sparkles)
- [Installation](#installation-hammer)
- [CDN bundle](#cdn-bundle)
- [Usage examples](#usage-examples)
    - [Request aborting using CPromise cancellation  API](#request-aborting-using-cpromise-cancellation-api)
    - [Request aborting using AbortController signal](#request-aborting-using-abortcontroller-signal)
    - [Request aborting using Axios cancelToken](#request-aborting-using-axios-canceltoken)
    - [Using generators as async functions](#using-generators-as-async-functions)
    - [Abortable concurrent requests](#abortable-concurrent-requests)
    - [React usage](#react-usage)
- [API Reference](#api-reference)    
- [Related projects](#related-projects)    
- [License](#license)    


## SYNOPSIS :sparkles:

**cpAxios** is a simple [axios](https://www.npmjs.com/package/axios) wrapper that provides an advanced cancellation api.

This library supports three types of the cancellation  API that could be used *simultaneously*:
- Axios [cancelableToken](https://github.com/axios/axios#cancellation)
- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) signal
- [CPromise](https://www.npmjs.com/package/c-promise2) promise cancellation  API 

In addition, since cpAxios return a custom promise instead of the native, you get some powers of [CPromise](https://www.npmjs.com/package/c-promise2):
- concurrency limiting fot creating request queues
- progress capturing
- promise timeouts

## Installation :hammer:

Starting from version `0.1.12` the package imports peer dependencies instead of built-in.
So, you should install `c-promise2` and `axios` packages manually using the following command:

```bash
$ npm install cp-axios
```

```bash
$ yarn add cp-axios
```

### CDN bundle
Browser UMD bundle (with all dependencies inside):
- [production UMD bundle](https://unpkg.com/cp-axios) (or [minified](https://unpkg.com/cp-axios/dist/cp-axios.umd.min.js) ~45KB)

module global export- `cpAxios`

## Usage examples

#### Live Example

[Live browser example](https://codesandbox.io/s/strange-almeida-1lcjj)

#### Request aborting using CPromise cancellation API:
````javascript
 const cpAxios= require('cp-axios');
 const url= 'https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=5s';

 const chain = cpAxios(url)
      .timeout(5000)
      .then(response => {
          console.log(`Done: ${JSON.stringify(response.data)}`)
      }, err => {
          console.warn(`Request failed: ${err}`)
      });

 setTimeout(() => chain.cancel(), 500);
````

#### Request aborting using AbortController signal:
````javascript
 const cpAxios= require('cp-axios');
 const CPromise= require('c-promise2');
 const url= 'https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=5s';

 // you could use any other AbortController implementation, but CPromise already provides it
 const abortController = new CPromise.AbortController();
 const {signal} = abortController;
 
 cpAxios(url, {signal})
      .timeout(5000)
      .then(response => {
          console.log(`Done: ${JSON.stringify(response.data)}`)
      }, err => {
          console.warn(`Request failed: ${err}`)
      });

 setTimeout(() => abortController.abort(), 500);
````

#### Request aborting using Axios cancelToken:
````javascript
 const cpAxios= require('cp-axios');
 const url= 'https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=5s';
 const source = cpAxios.CancelToken.source();
 
 cpAxios(url, {cancelToken: source.token})
      .timeout(5000)
      .then(response => {
          console.log(`Done: ${JSON.stringify(response.data)}`)
      }, err => {
          console.warn(`Request failed: ${err}`)
      });

 setTimeout(() => source.cancel(), 500);
````

#### Using generators as async functions:

````javascript
const cpAxios= require('cp-axios');
const CPromise= require('c-promise2');
const url= 'https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=5s';

const chain= CPromise.run(function*(){
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
    cpAxios("https://run.mocky.io/v3/753aa609-65ae-4109-8f83-9cfe365290f0?mocky-delay=3s"),
    cpAxios("https://run.mocky.io/v3/30a97b24-ed0e-46e8-9f78-8f954aead2f8?mocky-delay=5s")
]).timeout(10000).then(responses=> {
    console.log(`Results :`, responses[0].data, responses[1].data);
}, function (err) {
    console.warn(`We got an error: ${err}`);
});

// other request will be aborted if one fails

 setTimeout(()=> chain.cancel(), 1000); // abort the requests after 1000ms 
````

Making a request queue using mapper function with concurrency limit and progress capturing 
[Live Demo](https://codesandbox.io/s/cpromise-all-concurrent-generatorforked-k0fjk?file=/src/index.js):
````javascript
import { CPromise } from "c-promise2";
import cpAxios from "cp-axios";

const promise = CPromise.all(
  [
    "https://run.mocky.io/v3/7b038025-fc5f-4564-90eb-4373f0721822?mocky-delay=2s&x=1",
    "https://run.mocky.io/v3/7b038025-fc5f-4564-90eb-4373f0721822?mocky-delay=2s&x=2",
    "https://run.mocky.io/v3/7b038025-fc5f-4564-90eb-4373f0721822?mocky-delay=2s&x=3",
    "https://run.mocky.io/v3/7b038025-fc5f-4564-90eb-4373f0721822?mocky-delay=2s&x=4",
    "https://run.mocky.io/v3/7b038025-fc5f-4564-90eb-4373f0721822?mocky-delay=2s&x=5",
    "https://run.mocky.io/v3/7b038025-fc5f-4564-90eb-4373f0721822?mocky-delay=2s&x=6",
    "https://run.mocky.io/v3/7b038025-fc5f-4564-90eb-4373f0721822?mocky-delay=2s&x=7"
  ],
  {
    mapper: (url) => {
      console.log(`Request [${url}]`);
      return cpAxios(url);
    },
    concurrency: 2
  }
)
  .innerWeight(7)
  .progress((p) => console.log(`Progress: ${(p * 100).toFixed(1)}`))
  .then(
    (v) => console.log(`Done: `, v),
    (e) => console.warn(`Failed: ${e}`)
  );

// yeah, we able to cancel the entire task and abort pending network requests
//setTimeout(() => promise.cancel(), 4500);
````
## React usage

`cpAxios` can be easily used with React using the [`useAsyncEffect`](https://www.npmjs.com/package/use-async-effect2) hook, which allows canceled asynchronous functions to be executed as effects ([Live Demo](https://codesandbox.io/s/use-async-effect-axios-minimal-pdngg?file=/src/TestComponent.js)):

```jsx
import React from "react";
import { useAsyncEffect } from "use-async-effect2";
import cpAxios from "cp-axios";

/*
 Note: the related network request will also be aborted
 Check out your network console
 */

function TestComponent({ url, timeout }) {
  const [cancel, done, result, err] = useAsyncEffect(
    function* () {
      return (yield cpAxios(url).timeout(timeout)).data;
    },
    { states: true, deps: [url] }
  );

  return (
    <div>
      {done ? (err ? err.toString() : JSON.stringify(result)) : "loading..."}
      <button onClick={cancel} disabled={done}>
        Cancel async effect (abort request)
      </button>
    </div>
  );
}

export default TestComponent;
```

The request will be automatically aborted when the effect is canceled / restarted.

## API Reference

The package exports a wrapped version of the axios instance. 
See the axios [documentation](https://www.npmjs.com/package/axios#axios) to get more information.

`cpAxios(url, {signal, ...nativeAxiosOptions}): CPromise`

Options:

- `signal`- the AbortController signal

- `...nativeAxiosOptions`- other options supported by [axios](https://www.npmjs.com/package/axios) package

Learn more about [CPromise](https://www.npmjs.com/package/c-promise2) features 

## Related projects

- [cp-fetch](https://www.npmjs.com/package/cp-fetch) - fetch with timeouts and promise cancellation 
- [c-promise2](https://www.npmjs.com/package/c-promise2) - promise with cancellation and progress capturing support 

## License

The MIT License Copyright (c) 2020 Dmitriy Mozgovoy robotshara@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

