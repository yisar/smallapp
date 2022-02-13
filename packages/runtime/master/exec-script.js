export function execScript(path, ref) {
    const { modules, JSSDK, fre, comp, getApp, Page, Component, App, $handleEvent, setStates, $for, } = ref
    const str = JSSDK.readFileSync(path)
    const fn = new Function('module', 'require', 'fre', 'comp', 'getApp', 'Page', 'Component', 'App', '$handleEvent', '$for', 'setStates', str)

    const relative = function (parent) {
        const resolve = function (path) {
            var orig = path;
            var reg = path + '.js';
            var index = path + '/index.js';
            return modules[reg] && reg
                || modules[index] && index
                || orig;
        };
        function require(p) {
            return modules[resolve(p)];
        }
        return function (p) {
            if ('.' != p.charAt(0)) return require(p);
            var path = parent.split('/');
            var segs = p.split('/');
            path.pop();

            for (var i = 0; i < segs.length; i++) {
                var seg = segs[i];
                if ('..' == seg) path.pop();
                else if ('.' != seg) path.push(seg);
            }

            return require(path.join('/'));
        };
    };

    fn.exports = {};
    fn.call(fn.exports, fn, relative(path), fre, comp, getApp, Page, Component, App, $handleEvent, $for, setStates);
    modules[path] = fn.exports
}