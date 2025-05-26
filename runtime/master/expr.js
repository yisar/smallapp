//copy from vue1.x https://github.com/vuejs/vue/blob/1.1/src/parsers/expression.js

var defaultAllowedKeywords = "Math,Date,this,true,false,null,undefined,Infinity,NaN,isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,parseInt,parseFloat"
var improperKeywordsRE = new RegExp(
    "^(" + "break,case,class,catch,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,let,return,super,switch,throw,try,var,while,with,yield,enum,await,implements,package,protected,static,interface,private,public".replace(/,/g, "\\b|") + "\\b)"
)
var wsRE = /\s/g
var newlineRE = /\n/g
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g
var restoreRE = /"(\d+)"/g
var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/
var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g
var booleanLiteralRE = /^(?:true|false)$/
var saved = []

function save(str, isString) {
    var i = saved.length
    saved[i] = isString ? str.replace(newlineRE, "\\n") : str
    return '"' + i + '"'
}
function restore(str, i) {
    return saved[i]
}
function isSimplePath(expression) {
    return pathTestRE.test(expression) && !booleanLiteralRE.test(expression)
}
function parseKeywordsToRE(keywords) {
    return new RegExp(
        "^(?:" + keywords.replace(wsRE, "").replace(/\$/g, "\\$").replace(/,/g, "\\b|") + "\\b)"
    )
}

class Expr {
    constructor(options = {}) {
        let { scope = "$", scopes, params } = options
        this._cache = new Map()
        this._funcParams = (params || (scopes ? [scope, ...Object.keys(scopes)] : [scope])).join(",").replace(wsRE, "")
        this._funcBefore = `function(${this._funcParams}){return `
        this._funcAfter = "}"
        this.scope = scope
        if (scopes) {
            const keys = Object.keys(scopes)
            for (let i = 0, l = keys.length; i < l; i++) {
                const key = keys[i]
                const keywords = scopes[key]
                scopes[key] = parseKeywordsToRE(
                    Object.prototype.toString.call(keywords) === "[object Array]" ? keywords.join(",") : keywords
                )
            }
            this._scopeREs = scopes
        }
        let paramsPrefix
        if (params && params.length > 1) {
            params = params.slice(1)
            paramsPrefix = params.join(",")
            this._paramsPrefixRE = parseKeywordsToRE(paramsPrefix)
        }
        const allowedKeywords = paramsPrefix ? `${paramsPrefix},${defaultAllowedKeywords}` : defaultAllowedKeywords
        this._allowedKeywordsRE = parseKeywordsToRE(allowedKeywords)
    }

    _addScope(expression) {
        if (this._paramsPrefixRE && this._paramsPrefixRE.test(expression)) {
            return expression
        }
        if (this._scopeREs) {
            const keys = Object.keys(this._scopeREs)
            for (let i = 0, l = keys.length; i < l; i++) {
                const re = this._scopeREs[keys[i]]
                if (re.test(expression)) {
                    return `${keys[i]}.${expression}`
                }
            }
        }
        return `${this.scope}.${expression}`
    }

    compile(expression) {
        if (process.env.NODE_ENV === "development" && improperKeywordsRE.test(expression)) {
            console.warn(`Avoid using reserved keywords in expression: ${expression}`)
        }
        saved.length = 0
        let body = expression.replace(saveRE, save).replace(wsRE, "")
        const self = this
        let c, path
        return (" " + body).replace(identRE, (raw) => {
            c = raw.charAt(0)
            path = raw.slice(1)
            if (self._allowedKeywordsRE.test(path)) {
                return raw
            } else {
                path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path
                return c + self._addScope(path)
            }
        }).replace(restoreRE, restore).slice(1)
    }

    parse(source) {
        if (!(source && (source = source.trim()))) {
            return ""
        }
        let hit = this._cache.get(source)
        if (hit) {
            return hit
        }
        const result = isSimplePath(source) && source.indexOf("[") < 0 ? this._addScope(source) : this.compile(source)
        this._cache.set(source, result)
        return result
    }

    build(expression) {
        try {
            return new Function(this._funcParams, `return ${expression}`)
        } catch (e) {
            if (process.env.NODE_ENV === "development") {
                console.warn(`Invalid expression. Generated function body: ${expression}`)
            }
        }
    }

    buildToString(expression) {
        return `${this._funcBefore}${expression}${this._funcAfter}`
    }

    make(source) {
        const expression = this.parse(source)
        return this.build(expression)
    }

    makeToString(source) {
        const expression = this.parse(source)
        return this.buildToString(expression)
    }
}

export function expr(expr, obj) {
    const jep = new Expr()
    const fun = jep.make(expr)
    const res = fun(obj)
    return res
}