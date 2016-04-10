/**
 * @file 事件
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import {isFunction} from './util';

const EVENTS = Symbol('events');
const STATE = Symbol('state');
const STATE_READY = Symbol('stateReady');
const STATE_DESTROIED = Symbol('stateDestroied');
const CHECK_READY = Symbol('checkReady');

export default class Event {
    constructor() {
        this[EVENTS] = {};
        this[STATE] = STATE_READY;
    }

    [CHECK_READY]() {
        if (this[STATE] !== STATE_READY) {
            throw new Error('wrong event state: the event object is not ready.');
        }
    }

    on(eventName, fn, context) {
        this[CHECK_READY]();

        if (!isFunction(fn)) {
            return;
        }

        let events = this[EVENTS];
        events[eventName] = events[eventName] || [];
        events[eventName].push({fn, context});
    }

    trigger(eventName, ...args) {
        this[CHECK_READY]();

        let fnObjs = this[EVENTS][eventName];
        for (let fnObj of fnObjs) {
            fnObj.context::fnObj.fn(...args);
        }
    }

    safeTrigger(eventName, ...args) {
        this[CHECK_READY]();

        let fnObjs = this[EVENTS][eventName];
        let fnCalls = [];
        for (let fnObj of fnObjs) {
            fnCalls.push(fnObj.fn.bind(fnObj.context, ...args));
        }

        for (let fn of fnCalls) {
            fn();
        }
    }

    asyncTrigger(eventName, ...args) {
        this[CHECK_READY]();

        let fnObjs = this[EVENTS][eventName];
        let fnCalls = [];
        for (let fnObj of fnObjs) {
            fnCalls.push(fnObj.fn.bind(fnObj.context, ...args));
        }

        setTimeout(() => {
            for (let fn of fnCalls) {
                fn();
            }
        });
    }

    off(...args) {
        this[CHECK_READY]();

        let [eventName, fn, context] = args;
        if (args.length === 0) {
            this[EVENTS] = {};
        }

        let iterator = checkFn => {
            let fnObjs = this[EVENTS][eventName];
            let newFnObjs = [];
            for (let fnObj of fnObjs) {
                if (checkFn(fnObj)) {
                    newFnObjs.push(fnObj);
                }
            }
            this[EVENTS][eventName] = newFnObjs;
        };

        if (args.length === 1) {
            this[EVENTS][eventName] = null;
        }
        else if (args.length === 2) {
            iterator(fnObj => fn !== fnObj.fn);
        }
        else if (args.length === 3) {
            iterator(fnObj => fn !== fnObj.fn || context !== fnObj.context);
        }
    }

    destroy() {
        this[EVENTS] = null;
        this[STATE] = STATE_DESTROIED;
    }
}
