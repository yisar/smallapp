export function getter(obj, keys, def, p, undef) {
    keys = keyArr(keys)
    for (p = 0; p < keys.length; p++) {
        const k = keys[p]
        obj = obj ? obj[isNaN(+k) ? k : +k] : undef
    }
    return obj === undef ? def : obj
}

function keyArr(key) {
    return key.match(/[^.^\]^[]+|(?=\[\]|\.\.)/g,) || ['']
}

export function setter(source, keys, update) {
    keys = keyArr(keys)

    let next = copy(source),
        last = next,
        i = 0,
        l = keys.length

    for (; i < l; i++) {
        last = last[keys[i]] =
            i === l - 1
                ? update && !!update.call
                    ? update(last[keys[i]])
                    : update
                : copy(last[keys[i]])
    }
    return next
}

function copy(source) {
    let to = source && !!source.pop ? [] : {}
    for (let i in source) to[i] = source[i]
    return to
}

// let obj = {
//     foo: {
//         bar: ['hi', { buz: { baz: 'hello' } }]
//     }
// }

// let next = setter(obj, 'foo.bar[1].buz.baz', 'world')
// console.log(JSON.stringify(next))
// console.log(getter(next, 'foo.bar[1].buz.baz'))