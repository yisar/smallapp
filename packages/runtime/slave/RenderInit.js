import _global from "../master/GlobalValue"
import './FreApi'
import './web-components/index'
import './fre-components/index'
import { h, render, useReducer, useState, useEffect } from './Fre'
import { styled, setup } from 'goober'


export function initRender(e) {
    const { pageid, appJson: obj, json, style, script, option } = e
    const { data } = option
    setup(h)

    window.data = data
    window.pageid = pageid
    window.fre = { h, render, useReducer, useEffect, useState, styled }
    window.components = {}
    
    const styleStr = `
    const style = document.createElement('style');
    style.innerHTML = \`${style}\`;
    document.getElementById("root").appendChild(style);
    document.title = "${obj.window.navigationBarTitleText}";
    document.body.style.background = "${obj.window.backgroundColor}";
    `

    new Function('document', styleStr)(window.document)
    new Function('window', script)(window)

}