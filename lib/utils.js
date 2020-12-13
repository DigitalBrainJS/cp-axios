function collectProps(obj){
    const propMap= {};
    do {
        Object.getOwnPropertyNames(obj).forEach(prop=>{
            !propMap[prop] && (propMap[prop]= true);
        })
    } while ((obj = Object.getPrototypeOf(obj)) && obj !== Object);
    return Object.getOwnPropertyNames(propMap);
}

function proxyContext(obj, context){
    const descriptors= {};
    collectProps(context).forEach(prop=>{
        const value= context[prop];

        if(typeof value==='function'){
            descriptors[prop]= {
                value: value.bind(context),
                enumerable: true,
                writable: false
            }
            return;
        }

        descriptors[prop]= {
            get(){
                return context[prop];
            },

            set(v){
                return context[prop]= v;
            },

            enumerable: true
        }
    })
    Object.defineProperties(obj, descriptors);
    return obj;
}

module.exports= {
    collectProps,
    proxyContext
}
