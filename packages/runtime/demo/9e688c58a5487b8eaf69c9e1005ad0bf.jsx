var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);
var stdin_exports = {};
__export(stdin_exports, {
  default: () => stdin_default
});
var stdin_default = (props) => {
  const [state, setState] = fre.useState(props.data);
  return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(comp.Text, null, "0"), /* @__PURE__ */ fre.h(comp.Button, {
    type: `primary`
  }, "+1"));
};
const UseItem = (props) => {
  const [state, setState] = fre.useState({});
  return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(comp.View, {
    class: `list-items`
  }, /* @__PURE__ */ fre.h(comp.Icon, {
    type: `${iitem.completed ? "success" : "circle"}`,
    onClick: $handleEvent("clickIco", "7", "tap"),
    "data-id": `${iitem.id}`
  }), /* @__PURE__ */ fre.h(comp.Input, {
    class: `aaa ${iitem.completed ? "completed" : ""}`,
    onKeyDown: $handleEvent("edittodo", "7", "confirm"),
    "data-id": `${iitem.id}`,
    value: `${iitem.name}`
  }), /* @__PURE__ */ fre.h(comp.Icon, {
    type: `clear`,
    onClick: $handleEvent("clear", "7", "tap")
  }), /* @__PURE__ */ fre.h(comp.View, {
    slot: `aaa`
  }, "111"), /* @__PURE__ */ fre.h(comp.ChildChild, {
    onEee: $handleEvent("eee", "7", "eee")
  }), /* @__PURE__ */ fre.h(comp.Button, {
    onClick: $handleEvent("clear", "7", "tap")
  }, "aaa")));
};
const ChildChild = (props) => {
  const [state, setState] = fre.useState({});
  return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(comp.Text, {
    onClick: $handleEvent("emmm", "16", "tap")
  }, "pages/kid/index.wxml"));
};
module.exports = __toCommonJS(stdin_exports);
