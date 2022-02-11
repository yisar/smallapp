import { Fragment, h, render, useCallback, useEffect, useLayout, useMemo, useReducer, useRef, useState } from './fre-esm.js'
import comp from './components/index'
import { Page } from './page'
import { getApp } from './app.js'

const fre = { Fragment, h, render, useCallback, useEffect, useLayout, useMemo, useReducer, useRef, useState }

export const global = {
    modules: {},
    Page,
    getApp,
    fre,
    comp,
    JSSDK: {
        readFileSync(path) {
            var request = new XMLHttpRequest();
            request.open('GET', 'http://localhost:5000/' + path, false);
            request.send(null);
            if (request.status === 200) {
                return request.responseText
            }
        }
    }
}