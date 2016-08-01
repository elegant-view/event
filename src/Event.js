/**
 * @file 事件
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import * as util from './util';
import OrderedProtectObject from 'protectobject/OrderedProtectObject';

const EVENT = Symbol('events');

export default class Event {
    constructor() {
        this[EVENT] = new OrderedProtectObject();
    }

    /**
     * 获取事件
     *
     * @protected
     * @return {OrderedProtectObject}
     */
    getEvent() {
        return this[EVENT];
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
        const handlers = this[EVENT].get(eventName);
        if (handlers) {
            this[EVENT].safeExecute(() => {
                for (let i = 0, il = handlers.length; i < il; ++i) {
                    const handler = handlers[i];
                    handler.fn.apply(handler.context, args);
                }
            }, null, true);
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
            let handlers;
            this[EVENT].safeIterate((value, name) => {
                if (eventName === name) {
                    handlers = value;
                    return true;
                }
            });

            if (handlers && handlers.length) {
                const newHandlers = [];
                for (let i = 0, il = handlers.length; i < il; ++i) {
                    if (checkFn(handlers[i])) {
                        newHandlers.push(handlers[i]);
                    }
                }
                this[EVENT].set(eventName, newHandlers);
            }
        };

        if (fn) {
            iterator(handler => {
                // 返回true表明当前handler不属于要移除的范畴

                if (handler.fn !== fn) {
                    return true;
                }

                if (context && handler.context !== context) {
                    return true;
                }

                return false;
            });
        }
        else {
            this[EVENT].set(eventName, []);
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
