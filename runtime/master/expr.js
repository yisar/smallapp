export function getter(obj, key, def, p, undef) {
    key = keyArr(key)
    for (p = 0; p < key.length; p++) {
        const k = key[p]
        obj = obj ? obj[isNaN(k + 0) ? k : k + 0] : undef
    }
    return obj === undef ? def : obj
}

function keyArr(key) {
    return key.match(/[^.^\]^[]+|(?=\[\]|\.\.)/g,) || ['']
}

export function setter(obj, keys, val) {
    keys = keyArr(keys)
    var i = 0, l = keys.length, t = obj, x, k
    while (i < l) {
        k = '' + keys[i++]
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') break
        t = t[k] = (i === l) ? val : (typeof (x = t[k]) === typeof (keys)) ? x : (keys[i] * 0 !== 0 || !!~('' + keys[i]).indexOf('.')) ? {} : []
    }
}

// let obj = {
//     foo: {
//         bar: ['hi', { buz: { baz: 'hello' } }]
//     }
// }

// setter(obj, 'foo.bar[1].buz.baz', 'world')
// console.log(getter(obj, 'foo.bar[1].buz.baz'))
// console.log(getBaz)
