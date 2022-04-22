var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  default: () => stdin_default
});
module.exports = __toCommonJS(stdin_exports);
var stdin_default = (props) => {
  const [state, setState] = fre.useState(props.data);
  useEffect(() => {
    setStates[2] = setState;
  }, []);
  with (state) {
    return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(comp.View, {
      class: `container`
    }, /* @__PURE__ */ fre.h(comp.View, {
      class: `title`
    }, /* @__PURE__ */ fre.h(comp.Text, null, "todos")), /* @__PURE__ */ fre.h(comp.View, {
      class: `list`
    }, /* @__PURE__ */ fre.h(comp.View, {
      class: `list-items`
    }, /* @__PURE__ */ fre.h(comp.Input, {
      onKeyDown: $handleEvent("addtodo", "2", "bindconfirm"),
      placeholder: `What needs to be done?`,
      value: `${name}`,
      id: `test`
    })), /* @__PURE__ */ fre.h(comp.View, null, $for(list, (item) => /* @__PURE__ */ fre.h(comp.Block, null, /* @__PURE__ */ fre.h(comp.UseItem, {
      iitem: item,
      onMyevent: $handleEvent("clickIco", "2", "bindmyevent"),
      onClear: $handleEvent("clear", "2", "bindclear")
    })))), /* @__PURE__ */ fre.h(comp.View, {
      class: `footer`
    }, /* @__PURE__ */ fre.h(comp.Text, null, leftcount, " items left"), list.length - leftcount > 0 ? /* @__PURE__ */ fre.h(comp.View, {
      class: `clear`,
      onClick: $handleEvent("clearCompleted", "2", "bind:tap")
    }, "clear completed") : null)), /* @__PURE__ */ fre.h(comp.Button, {
      type: `warn`,
      onClick: $handleEvent("toast", "2", "bindtap"),
      style: `margin-top:30px`
    }, "showToast"), /* @__PURE__ */ fre.h(comp.Button, {
      type: `primary`,
      onClick: $handleEvent("navigateTo", "2", "bindtap")
    }, "Switch")));
  }
};
comp.UseItem = (props) => {
  const [state, setState] = fre.useState({});
  useEffect(() => {
    setStates[10] = setState;
  }, []);
  with ({ ...props, ...state }) {
    return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(comp.View, {
      class: `list-items`
    }, /* @__PURE__ */ fre.h(comp.View, {
      slot: `aaa`
    }, /* @__PURE__ */ fre.h(comp.Icon, {
      type: `${iitem.completed ? "success" : "circle"}`,
      onClick: $handleEvent("clickIco", "10", "bind:tap"),
      "data-id": `${iitem.id}`
    })), /* @__PURE__ */ fre.h(comp.Input, {
      class: `aaa ${iitem.completed ? "completed" : ""}`,
      onKeyDown: $handleEvent("edittodo", "10", "bindconfirm"),
      "data-id": `${iitem.id}`,
      value: `${iitem.name}`
    }), /* @__PURE__ */ fre.h(comp.Icon, {
      type: `clear`,
      onClick: $handleEvent("clear", "10", "bind:tap")
    })));
  }
};
comp.ChildChild = (props) => {
  const [state, setState] = fre.useState({});
  useEffect(() => {
    setStates[17] = setState;
  }, []);
  with ({ ...props, ...state }) {
    return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(comp.Text, {
      onClick: $handleEvent("emmm", "17", "bindtap")
    }, "pages/kid/index.wxml"));
  }
};
