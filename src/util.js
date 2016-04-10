/**
 * @file 一堆工具方法
 * @author yibuyisheng(yibuyisheng@163.com)
 */

export function getClassName(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
}

export function isFunction(value) {
    return getClassName(value) === 'Function';
}
