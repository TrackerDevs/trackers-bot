"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captialize = exports.noop = exports.arrify = exports.timedDestroy = exports.sleep = exports.HEX = void 0;
/** Essentially an enum of color strings */
exports.HEX = {
    RED: 0xE23645,
    GREEN: 0x51CD66,
    YELLOW: 0xEDC25E,
    BLURPLE: 0x384099,
};
/** Returns a promise that waits for (ms) milliseconds before resolving */
const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.sleep = sleep;
/** Deletes a property off of an objects after a certain amount of time */
const timedDestroy = async (val, key, ms) => [await (0, exports.sleep)(ms), delete val[key]];
exports.timedDestroy = timedDestroy;
/** If the input is not an array, turns it into a singleton array */
const arrify = (item) => item instanceof Array ? item : [item];
exports.arrify = arrify;
/** NoOp as in No Operation */
const noop = () => { };
exports.noop = noop;
const captialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
exports.captialize = captialize;
