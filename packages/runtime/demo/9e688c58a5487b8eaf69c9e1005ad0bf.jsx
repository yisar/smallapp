var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
    return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(comp.View, null, /* @__PURE__ */ fre.h(comp.Image, {
      src: `https://cdn-us.imgs.moe/2023/06/06/647f223643647.jpeg`
    }), /* @__PURE__ */ fre.h(comp.Input, {
      type: `text`,
      placeholder: `\u8BF7\u8F93\u5165\u62BD\u5361\u5206\u6790URL`,
      onInput: $handleEvent("changeUrl", "2", "bindinput"),
      class: `input`
    }), /* @__PURE__ */ fre.h(comp.Button, {
      type: `primary`,
      onClick: $handleEvent("analyse", "2", "bindtap")
    }, "\u5F00\u59CB\u5206\u6790"), /* @__PURE__ */ fre.h(comp.Text, {
      class: `info`
    }, "\u8FD9\u662F\u4E00\u4E2A\u5C0F\u7A0B\u5E8F\u793A\u4F8B"), /* @__PURE__ */ fre.h(comp.Text, {
      class: `b`
    }, "Made with \u{1F494} & Fre miniapp")));
  }
};
comp.UseItem = (props) => {
  const [state, setState] = fre.useState({});
  useEffect(() => {
    setStates[7] = setState;
  }, []);
  with ({ ...props, ...state }) {
    return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(comp.View, {
      class: `list-items`
    }, /* @__PURE__ */ fre.h(comp.View, {
      slot: `aaa`
    }, /* @__PURE__ */ fre.h(comp.Icon, {
      type: `${iitem.completed ? "success" : "circle"}`,
      onClick: $handleEvent("clickIco", "7", "bind:tap"),
      "data-id": `${iitem.id}`
    })), /* @__PURE__ */ fre.h(comp.Input, {
      class: `aaa ${iitem.completed ? "completed" : ""}`,
      onKeyDown: $handleEvent("edittodo", "7", "bindconfirm"),
      "data-id": `${iitem.id}`,
      value: `${iitem.name}`
    }), /* @__PURE__ */ fre.h(comp.Icon, {
      type: `clear`,
      onClick: $handleEvent("clear", "7", "bind:tap")
    })));
  }
};
comp.ChildChild = (props) => {
  const [state, setState] = fre.useState({});
  useEffect(() => {
    setStates[14] = setState;
  }, []);
  with ({ ...props, ...state }) {
    return /* @__PURE__ */ fre.h(fre.Fragment, null, /* @__PURE__ */ fre.h(comp.Text, {
      onClick: $handleEvent("emmm", "14", "bindtap")
    }, "pages/kid/index.wxml"));
  }
};
