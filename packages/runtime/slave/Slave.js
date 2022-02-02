import { initRender } from "./RenderInit"
import {invokeWebviewCallback} from './EventFromCore'

var global = (0, eval)('(function(){return this;})()');