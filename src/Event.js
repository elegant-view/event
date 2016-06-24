/**
 * @file 事件
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import * as util from './util';
import OrderedProtectObject from 'ProtectObject/OrderedProtectObject';

const EVENT = Symbol('events');

export default class Event {
    constructor() {
        this[EVENT] = new OrderedProtectObject();
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
        if (!util.isFunction(fn)) {
            return;
        }

        const handlers = this[EVENT].get(eventName) || [];
        handlers.push({fn, context});
        this[EVENT].set(eventName, handlers);
    }

    /**
     * 同步触发事件
     *
     * @public
     * @param  {string}    eventName 事件名字
     * @param  {...[*]} args      要传给事件回调函数的参数列表
     */
    trigger(eventName, ...args) {
        const handlers = this[EVENT][eventName];
        if (handlers) {
            this[EVENT].safeExecute(() => {
                this[EVENT].set(eventName, handlers);
                for (let i = 0, il = handlers.length; i < il; ++i) {
                    const handler = handlers[i];
                    handler.fn.apply(handler.context, args);
                }
            });
        }
    }

    /**
     * 移除事件回调
     *
     * @public
     * @param  {string=} eventName 参数名字
     * @param  {function=} fn 回调函数
     * @param  {Object=} context 上下文对象
     */
    off(eventName, fn, context) {
        if (!eventName) {
            this[EVENT].destroy();
            this[EVENT] = new OrderedProtectObject();
            return;
        }

        const iterator = checkFn => {
            const handlers = this[EVENT].get(eventName);
            const newHandlers = [];
            for (let i = 0, il = handlers.length; i < il; ++i) {
                if (checkFn(handlers[i])) {
                    newHandlers.push(handlers[i]);
                }
            }
            this[EVENT].set(eventName, newHandlers);
        };

        if (eventName && fn !== undefined) {
            this[EVENT].set(eventName, null);
        }
        else if (eventName && fn && context !== undefined) {
            iterator(handler => fn !== handler.fn);
        }
        else if (eventName && fn && context) {
            iterator(handler => fn !== handler.fn || context !== handler.context);
        }
    }

    /**
     * 销毁
     *
     * @public
     */
    destroy() {
        this[EVENT] = null;
    }
}
