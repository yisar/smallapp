import { Fragment, h, render, useCallback, useEffect, useLayout, useMemo, useReducer, useRef, useState } from './fre-esm.js'
import comp from './components/index'
import { Page } from './page'
import { getApp } from './app.js'
import { Component } from './component.js'
import { $handleEvent, $for } from './helper.js'
import { wx } from './wxapi'
import { expr } from './expr.js'
import { getter, setter } from './safe-obj.js'

export const global = {
    modules: {},
    Page,
    getApp,
    Component,
    fre: { Fragment, h, render, useCallback, useEffect, useLayout, useMemo, useReducer, useRef, useState },
    comp,
    $handleEvent,
    $for,
    setStates: {},
    wx,
    expr,
    getter,
    setter,
    native: {
        readFileSync(path) {
            var request = new XMLHttpRequest()
            request.open('GET', '/' + path, false)
            request.send(null)
            if (request.status === 200) {
                return request.responseText
            }
        },
        log(msg) {
            console.log(msg)
        }
    }
}