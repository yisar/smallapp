import { Fragment, h, render, useCallback, useEffect, useLayout, useMemo, useReducer, useRef, useState } from './fre-esm.js'
import comp from './components/index'
import { Page } from './page'
import { getApp } from './app.js'
import { Component } from './component.js'
import { $handleEvent, $for } from './helper.js'
import { wx } from './wxapi'
import { getter, setter } from './expr.js'

const fre = { Fragment, h, render, useCallback, useEffect, useLayout, useMemo, useReducer, useRef, useState }

export const global = {
    modules: {},
    Page,
    getApp,
    Component,
    fre,
    comp,
    $handleEvent,
    $for,
    setStates: {},
    wx,
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