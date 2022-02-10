var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
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
  fre.useEffect(() => {
    window.components[2] = (data) => setState(data);
    $mount(2);
    return () => $unmount(2);
  }, []);
  return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(View, {
    class: `container`
  }, /* @__PURE__ */ fre.h(View, {
    class: `title`
  }, /* @__PURE__ */ fre.h(Text, null, "todos")), /* @__PURE__ */ fre.h(View, {
    class: `list`
  }, /* @__PURE__ */ fre.h(View, {
    class: `list-items`
  }, /* @__PURE__ */ fre.h(Input, {
    onKeyDown: $handleEvent("addtodo", "2", "confirm"),
    placeholder: `What needs to be done?`,
    value: `${name}`,
    id: `test`
  })), $for(list, (item) => /* @__PURE__ */ fre.h(Block, null, /* @__PURE__ */ fre.h(UseItem, {
    iitem: item,
    onMyevent: $handleEvent("eeevent", "2", "myevent"),
    onClear: $handleEvent("clear", "2", "clear")
  }))), /* @__PURE__ */ fre.h(View, {
    class: `footer`
  }, /* @__PURE__ */ fre.h(Text, null, leftcount, " items left"), list.length - leftcount > 0 ? /* @__PURE__ */ fre.h(View, {
    class: `clear`,
    onClick: $handleEvent("clearCompleted", "2", "tap")
  }, "clear completed") : null)), /* @__PURE__ */ fre.h(Button, {
    type: `warn`,
    onClick: $handleEvent("toast", "2", "tap"),
    style: `margin-top:30px`
  }, "showToast"), /* @__PURE__ */ fre.h(Button, {
    type: `primary`,
    onClick: $handleEvent("motal", "2", "tap")
  }, "showMotal"), /* @__PURE__ */ fre.h(Button, {
    type: `primary`,
    onClick: $handleEvent("navigateTo", "2", "tap")
  }, "navigateTo")));
};
const UseItem = (props) => {
  const [state, setState] = fre.useState({});
  fre.useEffect(() => {
    window.components[7] = (data) => setState(data);
    $mount(7);
    return () => $unmount(7);
  }, []);
  return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(View, {
    class: `list-items`
  }, /* @__PURE__ */ fre.h(Icon, {
    type: `${iitem.completed ? "success" : "circle"}`,
    onClick: $handleEvent("clickIco", "7", "tap"),
    "data-id": `${iitem.id}`
  }), /* @__PURE__ */ fre.h(Input, {
    class: `aaa ${iitem.completed ? "completed" : ""}`,
    onKeyDown: $handleEvent("edittodo", "7", "confirm"),
    "data-id": `${iitem.id}`,
    value: `${iitem.name}`
  }), /* @__PURE__ */ fre.h(Icon, {
    type: `clear`,
    onClick: $handleEvent("clear", "7", "tap")
  }), /* @__PURE__ */ fre.h(View, {
    slot: `aaa`
  }, "111"), /* @__PURE__ */ fre.h(ChildChild, {
    onEee: $handleEvent("eee", "7", "eee")
  }), /* @__PURE__ */ fre.h(Button, {
    onClick: $handleEvent("clear", "7", "tap")
  }, "aaa")));
};
const ChildChild = (props) => {
  const [state, setState] = fre.useState({});
  fre.useEffect(() => {
    window.components[15] = (data) => setState(data);
    $mount(15);
    return () => $unmount(15);
  }, []);
  return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(Text, {
    onClick: $handleEvent("emmm", "15", "tap")
  }, "pages/kid/index.wxml"));
};
module.exports = __toCommonJS(stdin_exports);
