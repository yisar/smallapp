(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global['voe-bridge'] = {}));
}(this, (function (exports) { 'use strict';

	const isMain = typeof window !== 'undefined';

	exports.isMain = isMain;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
