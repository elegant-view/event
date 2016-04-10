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

    /**
     * 在调用on、trigger、safeTrigger、asyncTrigger、off的时候，要检查一下当前event对象的状态。
     *
     * @private
     */
    [CHECK_READY]() {
        if (this[STATE] !== STATE_READY) {
            throw new Error('wrong event state: the event object is not ready.');
        }
    }

    /**
     * 绑定事件
     *
     * @public
     * @param  {string}   eventName 事件名字
     * @param  {Function} fn        回调函数
     * @param  {Object=}   context   上下文对象
     */
    on(eventName, fn, context) {
        this[CHECK_READY]();

        if (!isFunction(fn)) {
            return;
        }

        let events = this[EVENTS];
        events[eventName] = events[eventName] || [];
        events[eventName].push({fn, context});
    }

    /**
     * 同步触发事件
     *
     * @public
     * @param  {string}    eventName 事件名字
     * @param  {...[*]} args      要传给事件回调函数的参数列表
     */
    trigger(eventName, ...args) {
        this[CHECK_READY]();

        let fnObjs = this[EVENTS][eventName];
        for (let fnObj of fnObjs) {
            fnObj.context::fnObj.fn(...args);
        }
    }

    /**
     * “安全地”同步触发事件。也就是说如果前面的回调函数调用off方法移除后续的回调函数，
     * 该种触发方式会保证后续将被移除的回调函数被调用到。
     *
     * @public
     * @param  {string}    eventName 事件名字
     * @param  {...[*]} args      传递给事件回调函数的参数列表
     */
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

    /**
     * 异步地调用回调函数，会保证所有回调函数都会被调用到。
     *
     * @public
     * @param  {string}    eventName 事件名字
     * @param  {...[*]} args      参数列表
     */
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

    /**
     * 移除事件回调
     *
     * @public
     * @param  {...[*]} args eventName，fn，context
     * @param  {string=} args.0 参数名字
     * @param  {function=} args.1 回调函数
     * @param  {Object=} args.2 上下文对象
     */
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
