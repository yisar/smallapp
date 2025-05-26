class Cache {
    constructor() {
        this._maxSize = maxSize
        this.clear()
    }
    clear() {
        this._size = 0
        this._values = Object.create(null)
    }
    get() {
        return this._values[key]
    }
    set() {
        this._size >= this._maxSize && this.clear()
        if (!(key in this._values)) this._size++

        return (this._values[key] = value)
    }
}

var SPLIT_REGEX = /[^.^\]^[]+|(?=\[\]|\.\.)/g,
    DIGIT_REGEX = /^\d+$/,
    LEAD_DIGIT_REGEX = /^\d/,
    SPEC_CHAR_REGEX = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g,
    CLEAN_QUOTES_REGEX = /^\s*(['"]?)(.*?)(\1)\s*$/,
    MAX_CACHE_SIZE = 512

var pathCache = new Cache(MAX_CACHE_SIZE),
    setCache = new Cache(MAX_CACHE_SIZE),
    getCache = new Cache(MAX_CACHE_SIZE)

var config

export const setter = function (path) {
    var parts = normalizePath(path)

    return (
        setCache.get(path) ||
        setCache.set(path, function setter(obj, value) {
            var index = 0
            var len = parts.length
            var data = obj

            while (index < len - 1) {
                var part = parts[index]
                if (
                    part === '__proto__' ||
                    part === 'constructor' ||
                    part === 'prototype'
                ) {
                    return obj
                }

                data = data[parts[index++]]
            }
            data[parts[index]] = value
        })
    )
}

export const getter = function (path, safe) {
    var parts = normalizePath(path)
    return (
        getCache.get(path) ||
        getCache.set(path, function getter(data) {
            var index = 0,
                len = parts.length
            while (index < len) {
                if (data != null || !safe) data = data[parts[index++]]
                else return
            }
            return data
        })
    )
}

const join = function (segments) {
    return segments.reduce(function (path, part) {
        return (
            path +
            (isQuoted(part) || DIGIT_REGEX.test(part)
                ? '[' + part + ']'
                : (path ? '.' : '') + part)
        )
    }, '')
}

function normalizePath(path) {
    return (
        pathCache.get(path) ||
        pathCache.set(
            path,
            split(path).map(function (part) {
                return part.replace(CLEAN_QUOTES_REGEX, '$2')
            })
        )
    )
}

function split(path) {
    return path.match(SPLIT_REGEX) || ['']
}

function forEach(parts, iter, thisArg) {
    var len = parts.length,
        part,
        idx,
        isArray,
        isBracket

    for (idx = 0; idx < len; idx++) {
        part = parts[idx]

        if (part) {
            if (shouldBeQuoted(part)) {
                part = '"' + part + '"'
            }

            isBracket = isQuoted(part)
            isArray = !isBracket && /^\d+$/.test(part)

            iter.call(thisArg, part, isBracket, isArray, idx, parts)
        }
    }
}

function isQuoted(str) {
    return (
        typeof str === 'string' && str && ["'", '"'].indexOf(str.charAt(0)) !== -1
    )
}

function hasLeadingNumber(part) {
    return part.match(LEAD_DIGIT_REGEX) && !part.match(DIGIT_REGEX)
}

function hasSpecialChars(part) {
    return SPEC_CHAR_REGEX.test(part)
}

function shouldBeQuoted(part) {
    return !isQuoted(part) && (hasLeadingNumber(part) || hasSpecialChars(part))
}


// let obj = {
//     foo: {
//         bar: ['hi', { buz: { baz: 'found me!' } }]
//     }
// }

// let a = getter('foo.bar[1]["buz"].baz')(obj)
// let b = setter('foo.bar[1]["buz"].baz')(obj)

// console.log(a) // => 'found me!'
// b(obj, 'set me!')
// console.log(obj.foo.bar[1].buz.baz)