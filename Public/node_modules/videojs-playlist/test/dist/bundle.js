(function (QUnit,videojs,sinon) {
'use strict';

QUnit = 'default' in QUnit ? QUnit['default'] : QUnit;
videojs = 'default' in videojs ? videojs['default'] : videojs;
sinon = 'default' in sinon ? sinon['default'] : sinon;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof commonjsGlobal !== "undefined") {
    win = commonjsGlobal;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

var window_1 = win;

/**
 * Validates a number of seconds to use as the auto-advance delay.
 *
 * @private
 * @param   {number} s
 *          The number to check
 *
 * @return  {boolean}
 *          Whether this is a valid second or not
 */
var validSeconds = function validSeconds(s) {
  return typeof s === 'number' && !isNaN(s) && s >= 0 && s < Infinity;
};

/**
 * Resets the auto-advance behavior of a player.
 *
 * @param {Player} player
 *        The player to reset the behavior on
 */
var reset = function reset(player) {
  if (player.playlist.autoadvance_.timeout) {
    window_1.clearTimeout(player.playlist.autoadvance_.timeout);
  }

  if (player.playlist.autoadvance_.trigger) {
    player.off('ended', player.playlist.autoadvance_.trigger);
  }

  player.playlist.autoadvance_.timeout = null;
  player.playlist.autoadvance_.trigger = null;
};

/**
 * Sets up auto-advance behavior on a player.
 *
 * @param  {Player} player
 *         the current player
 *
 * @param  {number} delay
 *         The number of seconds to wait before each auto-advance.
 *
 * @return {undefined}
 *         Used to short circuit function logic
 */
var setup = function setup(player, delay) {
  reset(player);

  // Before queuing up new auto-advance behavior, check if `seconds` was
  // called with a valid value.
  if (!validSeconds(delay)) {
    return;
  }

  player.playlist.autoadvance_.trigger = function () {
    player.playlist.autoadvance_.timeout = window_1.setTimeout(function () {
      reset(player);
      player.playlist.next();
    }, delay * 1000);
  };

  player.one('ended', player.playlist.autoadvance_.trigger);
};

/**
 * Used to change the reset function in this module at runtime
 * This should only be used in tests.
 *
 * @param {Function} fn
 *        The function to se the reset to
 */
var setReset_ = function setReset_(fn) {
  reset = fn;
};

/* globals window, HTMLElement */

/**!
 * is
 * the definitive JavaScript type testing library
 *
 * @copyright 2013-2014 Enrico Marino / Jordan Harband
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toStr = objProto.toString;
var symbolValueOf;
if (typeof Symbol === 'function') {
  symbolValueOf = Symbol.prototype.valueOf;
}
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  'boolean': 1,
  number: 1,
  string: 1,
  undefined: 1
};

var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
var hexRegex = /^[A-Fa-f0-9]+$/;

/**
 * Expose `is`
 */

var is = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {Mixed} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a = is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return typeof value !== 'undefined';
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toStr.call(value);
  var key;

  if (type === '[object Array]' || type === '[object Arguments]' || type === '[object String]') {
    return value.length === 0;
  }

  if (type === '[object Object]') {
    for (key in value) {
      if (owns.call(value, key)) {
        return false;
      }
    }
    return true;
  }

  return !value;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {Mixed} value value to test
 * @param {Mixed} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function equal(value, other) {
  if (value === other) {
    return true;
  }

  var type = toStr.call(value);
  var key;

  if (type !== toStr.call(other)) {
    return false;
  }

  if (type === '[object Object]') {
    for (key in value) {
      if (!is.equal(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!is.equal(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }

  if (type === '[object Array]') {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (key--) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if (type === '[object Function]') {
    return value.prototype === other.prototype;
  }

  if (type === '[object Date]') {
    return value.getTime() === other.getTime();
  }

  return false;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {Mixed} value to test
 * @param {Mixed} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.nil / is.null
 * Test if `value` is null.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is.nil = is['null'] = function (value) {
  return value === null;
};

/**
 * is.undef / is.undefined
 * Test if `value` is undefined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undef = is.undefined = function (value) {
  return typeof value === 'undefined';
};

/**
 * Test arguments.
 */

/**
 * is.args
 * Test if `value` is an arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.args = is.arguments = function (value) {
  var isStandardArguments = toStr.call(value) === '[object Arguments]';
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = Array.isArray || function (value) {
  return toStr.call(value) === '[object Array]';
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.args.empty = function (value) {
  return is.args(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.bool(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.bool
 * Test if `value` is a boolean.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.bool = is['boolean'] = function (value) {
  return toStr.call(value) === '[object Boolean]';
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.bool(value) && Boolean(Number(value)) === false;
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.bool(value) && Boolean(Number(value)) === true;
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return toStr.call(value) === '[object Date]';
};

/**
 * is.date.valid
 * Test if `value` is a valid date.
 *
 * @param {Mixed} value value to test
 * @returns {Boolean} true if `value` is a valid date, false otherwise
 */
is.date.valid = function (value) {
  return is.date(value) && !isNaN(Number(value));
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return toStr.call(value) === '[object Error]';
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  if (isAlert) {
    return true;
  }
  var str = toStr.call(value);
  return str === '[object Function]' || str === '[object GeneratorFunction]' || str === '[object AsyncFunction]';
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return toStr.call(value) === '[object Number]';
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.integer
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.integer = is['int'] = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */
is.object = function (value) {
  return toStr.call(value) === '[object Object]';
};

/**
 * is.primitive
 * Test if `value` is a primitive.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a primitive, false otherwise
 * @api public
 */
is.primitive = function isPrimitive(value) {
  if (!value) {
    return true;
  }
  if (typeof value === 'object' || is.object(value) || is.fn(value) || is.array(value)) {
    return false;
  }
  return true;
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return toStr.call(value) === '[object RegExp]';
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return toStr.call(value) === '[object String]';
};

/**
 * Test base64 string.
 */

/**
 * is.base64
 * Test if `value` is a valid base64 encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a base64 encoded string, false otherwise
 * @api public
 */

is.base64 = function (value) {
  return is.string(value) && (!value.length || base64Regex.test(value));
};

/**
 * Test base64 string.
 */

/**
 * is.hex
 * Test if `value` is a valid hex encoded string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a hex encoded string, false otherwise
 * @api public
 */

is.hex = function (value) {
  return is.string(value) && (!value.length || hexRegex.test(value));
};

/**
 * is.symbol
 * Test if `value` is an ES6 Symbol
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a Symbol, false otherise
 * @api public
 */

is.symbol = function (value) {
  return typeof Symbol === 'function' && toStr.call(value) === '[object Symbol]' && typeof symbolValueOf.call(value) === 'symbol';
};

var index$1 = is;

/*!
 * node.extend
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * @fileoverview
 * Port of jQuery.extend that actually works on node.js
 */


var extend$1 = function extend() {
  var target = arguments[0] || {};
  var i = 1;
  var length = arguments.length;
  var deep = false;
  var options, name, src, copy, copyIsArray, clone;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && !index$1.fn(target)) {
    target = {};
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    options = arguments[i];
    if (options != null) {
      if (typeof options === 'string') {
        options = options.split('');
      }
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (deep && copy && (index$1.hash(copy) || (copyIsArray = index$1.array(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && index$1.array(src) ? src : [];
          } else {
            clone = src && index$1.hash(src) ? src : {};
          }

          // Never move original objects, clone them
          target[name] = extend(deep, clone, copy);

        // Don't bring in undefined values
        } else if (typeof copy !== 'undefined') {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

/**
 * @public
 */
extend$1.version = '1.1.3';

/**
 * Exports module.
 */
var extend_1 = extend$1;

var index = extend_1;

var proxy = function proxy(props) {
  var player = index(true, {}, videojs.EventTarget.prototype, {
    play: Function.prototype,
    paused: Function.prototype,
    ended: Function.prototype,
    poster: Function.prototype,
    src: Function.prototype,
    currentSrc: Function.prototype,
    addRemoteTextTrack: Function.prototype,
    removeRemoteTextTrack: Function.prototype,
    remoteTextTracks: Function.prototype,
    playlist: {
      autoadvance_: {},
      currentIndex_: -1,
      autoadvance: Function.prototype,
      contains: Function.prototype,
      currentItem: Function.prototype,
      first: Function.prototype,
      indexOf: Function.prototype,
      next: Function.prototype,
      previous: Function.prototype
    }
  }, props);

  player.constructor = videojs.getComponent('Player');
  player.playlist.player_ = player;

  return player;
};

QUnit.module('auto-advance');

QUnit.test('set up ended listener if one does not exist yet', function (assert) {
  var player = proxy();
  var ones = [];

  player.one = function (type) {
    ones.push(type);
  };

  setup(player, 0);

  assert.equal(ones.length, 1, 'there should have been only one one event added');
  assert.equal(ones[0], 'ended', 'the event we want to one is "ended"');
});

QUnit.test('off previous listener if exists before adding a new one', function (assert) {
  var player = proxy();
  var ones = [];
  var offs = [];

  player.one = function (type) {
    ones.push(type);
  };

  player.off = function (type) {
    offs.push(type);
  };

  setup(player, 0);
  assert.equal(ones.length, 1, 'there should have been only one one event added');
  assert.equal(ones[0], 'ended', 'the event we want to one is "ended"');
  assert.equal(offs.length, 0, 'we should not have off-ed anything yet');

  setup(player, 10);

  assert.equal(ones.length, 2, 'there should have been only two one event added');
  assert.equal(ones[0], 'ended', 'the event we want to one is "ended"');
  assert.equal(ones[1], 'ended', 'the event we want to one is "ended"');
  assert.equal(offs.length, 1, 'there should have been only one off event added');
  assert.equal(offs[0], 'ended', 'the event we want to off is "ended"');
});

QUnit.test('do nothing if timeout is weird', function (assert) {
  var player = proxy();

  var ones = [];
  var offs = [];

  player.one = function (type) {
    ones.push(type);
  };

  player.off = function (type) {
    offs.push(type);
  };

  setup(player, -1);
  setup(player, -100);
  setup(player, null);
  setup(player, {});
  setup(player, []);

  assert.equal(offs.length, 0, 'we did nothing');
  assert.equal(ones.length, 0, 'we did nothing');
});

QUnit.test('reset if timeout is weird after we advance', function (assert) {
  var player = proxy();

  var ones = [];
  var offs = [];

  player.one = function (type) {
    ones.push(type);
  };

  player.off = function (type) {
    offs.push(type);
  };

  setup(player, 0);
  setup(player, -1);
  setup(player, 0);
  setup(player, -100);
  setup(player, 0);
  setup(player, null);
  setup(player, 0);
  setup(player, {});
  setup(player, 0);
  setup(player, []);
  setup(player, 0);
  setup(player, NaN);
  setup(player, 0);
  setup(player, Infinity);
  setup(player, 0);
  setup(player, -Infinity);

  assert.equal(offs.length, 8, 'we reset the advance 8 times');
  assert.equal(ones.length, 8, 'we autoadvanced 8 times');
});

QUnit.test('reset if we have already started advancing', function (assert) {
  var player = proxy();
  var oldClearTimeout = window_1.clearTimeout;
  var clears = 0;

  window_1.clearTimeout = function () {
    clears++;
  };

  // pretend we started autoadvancing
  player.playlist.autoadvance_.timeout = 1;
  setup(player, 0);

  assert.equal(clears, 1, 'we reset the auto advance');

  window_1.clearTimeout = oldClearTimeout;
});

QUnit.test('timeout is given in seconds', function (assert) {
  var player = proxy();
  var oldSetTimeout = window_1.setTimeout;

  player.addEventListener = Function.prototype;

  window_1.setTimeout = function (fn, timeout) {
    assert.equal(timeout, 10 * 1000, 'timeout was given in seconds');
  };

  setup(player, 10);
  player.trigger('ended');

  window_1.setTimeout = oldSetTimeout;
});

/**
 * Removes all remote text tracks from a player.
 *
 * @param  {Player} player
 *         The player to clear tracks on
 */
var clearTracks = function clearTracks(player) {
  var tracks = player.remoteTextTracks();
  var i = tracks && tracks.length || 0;

  // This uses a `while` loop rather than `forEach` because the
  // `TextTrackList` object is a live DOM list (not an array).
  while (i--) {
    player.removeRemoteTextTrack(tracks[i]);
  }
};

/**
 * Plays an item on a player's playlist.
 *
 * @param  {Player} player
 *         The player to play the item on
 *
 * @param  {number} delay
 *         The number of seconds to wait before each auto-advance.
 *
 * @param  {Object} item
 *         A source from the playlist.
 *
 * @return {Player}
 *         The player that is now playing the item
 */
var playItem = function playItem(player, delay, item) {
  var replay = !player.paused() || player.ended();

  player.trigger('beforeplaylistitem', item);
  player.poster(item.poster || '');
  player.src(item.sources);
  clearTracks(player);
  (item.textTracks || []).forEach(player.addRemoteTextTrack.bind(player));
  player.trigger('playlistitem', item);

  if (replay) {
    player.play();
  }

  setup(player, delay);

  return player;
};

QUnit.module('play-item');

QUnit.test('clearTracks will try and remove all tracks', function (assert) {
  var player = proxy();
  var remoteTracks = [1, 2, 3];
  var removedTracks = [];

  player.remoteTextTracks = function () {
    return remoteTracks;
  };

  player.removeRemoteTextTrack = function (tt) {
    removedTracks.push(tt);
  };

  clearTracks(player);

  assert.deepEqual(removedTracks.sort(), remoteTracks.sort(), 'the removed tracks are equivalent to our remote tracks');
});

QUnit.test('will not try to play if paused', function (assert) {
  var player = proxy();
  var tryPlay = false;

  player.paused = function () {
    return true;
  };

  player.play = function () {
    tryPlay = true;
  };

  playItem(player, null, {
    sources: [1, 2, 3],
    textTracks: [4, 5, 6],
    poster: 'http://example.com/poster.png'
  });

  assert.ok(!tryPlay, 'we did not reply on paused');
});

QUnit.test('will try to play if not paused', function (assert) {
  var player = proxy();
  var tryPlay = false;

  player.paused = function () {
    return false;
  };

  player.play = function () {
    tryPlay = true;
  };

  playItem(player, null, {
    sources: [1, 2, 3],
    textTracks: [4, 5, 6],
    poster: 'http://example.com/poster.png'
  });

  assert.ok(tryPlay, 'we replayed on not-paused');
});

QUnit.test('will not try to play if paused and not ended', function (assert) {
  var player = proxy();
  var tryPlay = false;

  player.paused = function () {
    return true;
  };

  player.ended = function () {
    return false;
  };

  player.play = function () {
    tryPlay = true;
  };

  playItem(player, null, {
    sources: [1, 2, 3],
    textTracks: [4, 5, 6],
    poster: 'http://example.com/poster.png'
  });

  assert.ok(!tryPlay, 'we did not replaye on paused and not ended');
});

QUnit.test('will try to play if paused and ended', function (assert) {
  var player = proxy();
  var tryPlay = false;

  player.paused = function () {
    return true;
  };

  player.ended = function () {
    return true;
  };

  player.play = function () {
    tryPlay = true;
  };

  playItem(player, null, {
    sources: [1, 2, 3],
    poster: 'http://example.com/poster.png'
  });

  assert.ok(tryPlay, 'we replayed on not-paused');
});

QUnit.test('fires "beforeplaylistitem" and "playlistitem"', function (assert) {
  var player = proxy();
  var beforeSpy = sinon.spy();
  var spy = sinon.spy();

  player.on('beforeplaylistitem', beforeSpy);
  player.on('playlistitem', spy);

  playItem(player, null, {
    sources: [1, 2, 3],
    poster: 'http://example.com/poster.png'
  });

  assert.strictEqual(beforeSpy.callCount, 1);
  assert.strictEqual(spy.callCount, 1);
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

// Lightweight Object.assign alternative.
var assign = function assign(target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
};

/**
 * Given two sources, check to see whether the two sources are equal.
 * If both source urls have a protocol, the protocols must match, otherwise, protocols
 * are ignored.
 *
 * @private
 * @param {string|Object} source1
 *        The first source
 *
 * @param {string|Object} source2
 *        The second source
 *
 * @return {boolean}
 *         The result
 */
var sourceEquals = function sourceEquals(source1, source2) {
  var src1 = source1;
  var src2 = source2;

  if ((typeof source1 === 'undefined' ? 'undefined' : _typeof(source1)) === 'object') {
    src1 = source1.src;
  }
  if ((typeof source2 === 'undefined' ? 'undefined' : _typeof(source2)) === 'object') {
    src2 = source2.src;
  }

  if (/^\/\//.test(src1)) {
    src2 = src2.slice(src2.indexOf('//'));
  }
  if (/^\/\//.test(src2)) {
    src1 = src1.slice(src1.indexOf('//'));
  }

  return src1 === src2;
};

/**
 * Look through an array of playlist items for a specific `source`;
 * checking both the value of elements and the value of their `src`
 * property.
 *
 * @private
 * @param   {Array} arr
 *          An array of playlist items to look through
 *
 * @param   {string} src
 *          The source to look for
 *
 * @return  {number}
 *          The index of that source or -1
 */
var indexInSources = function indexInSources(arr, src) {
  for (var i = 0; i < arr.length; i++) {
    var sources = arr[i].sources;

    if (Array.isArray(sources)) {
      for (var j = 0; j < sources.length; j++) {
        var source = sources[j];

        if (source && sourceEquals(source, src)) {
          return i;
        }
      }
    }
  }

  return -1;
};

/**
 * Factory function for creating new playlist implementation on the given player.
 *
 * API summary:
 *
 * playlist(['a', 'b', 'c']) // setter
 * playlist() // getter
 * playlist.currentItem() // getter, 0
 * playlist.currentItem(1) // setter, 1
 * playlist.next() // 'c'
 * playlist.previous() // 'b'
 * playlist.first() // 'a'
 * playlist.last() // 'c'
 * playlist.autoadvance(5) // 5 second delay
 * playlist.autoadvance() // cancel autoadvance
 *
 * @param  {Player} player
 *         The current player
 *
 * @param  {Array=} initialList
 *         If given, an initial list of sources with which to populate
 *         the playlist.
 *
 * @param  {number=}  initialIndex
 *         If given, the index of the item in the list that should
 *         be loaded first. If -1, no video is loaded. If omitted, The
 *         the first video is loaded.
 *
 * @return {Function}
 *         Returns the playlist function specific to the given player.
 */
var factory = function factory(player, initialList) {
  var initialIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var list = Array.isArray(initialList) ? initialList.slice() : [];

  /**
   * Get/set the playlist for a player.
   *
   * This function is added as an own property of the player and has its
   * own methods which can be called to manipulate the internal state.
   *
   * @param  {Array} [newList]
   *         If given, a new list of sources with which to populate the
   *         playlist. Without this, the function acts as a getter.
   *
   * @param  {number}  [newIndex]
   *         If given, the index of the item in the list that should
   *         be loaded first. If -1, no video is loaded. If omitted, The
   *         the first video is loaded.
   *
   * @return {Array}
   *         The playlist
   */
  var playlist = player.playlist = function (newList) {
    var newIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (Array.isArray(newList)) {
      list = newList.slice();
      if (newIndex !== -1) {
        playlist.currentItem(newIndex);
      }
      playlist.changeTimeout_ = window_1.setTimeout(function () {
        player.trigger('playlistchange');
      }, 0);
    }

    // Always return a shallow clone of the playlist list.
    return list.slice();
  };

  player.on('loadstart', function () {
    if (playlist.currentItem() === -1) {
      reset(player);
    }
  });

  player.on('dispose', function () {
    window_1.clearTimeout(playlist.changeTimeout_);
  });

  assign(playlist, {
    currentIndex_: -1,
    player_: player,
    autoadvance_: {},
    repeat_: false,

    /**
     * Get or set the current item in the playlist.
     *
     * @param  {number} [index]
     *         If given as a valid value, plays the playlist item at that index.
     *
     * @return {number}
     *         The current item index.
     */
    currentItem: function currentItem(index) {
      if (typeof index === 'number' && playlist.currentIndex_ !== index && index >= 0 && index < list.length) {
        playlist.currentIndex_ = index;
        playItem(playlist.player_, playlist.autoadvance_.delay, list[playlist.currentIndex_]);
      } else {
        playlist.currentIndex_ = playlist.indexOf(playlist.player_.currentSrc() || '');
      }

      return playlist.currentIndex_;
    },


    /**
     * Checks if the playlist contains a value.
     *
     * @param  {string|Object|Array} value
     *         The value to check
     *
     * @return {boolean}
     *         The result
     */
    contains: function contains(value) {
      return playlist.indexOf(value) !== -1;
    },


    /**
     * Gets the index of a value in the playlist or -1 if not found.
     *
     * @param  {string|Object|Array} value
     *         The value to find the index of
     *
     * @return {number}
     *         The index or -1
     */
    indexOf: function indexOf(value) {
      if (typeof value === 'string') {
        return indexInSources(list, value);
      }

      var sources = Array.isArray(value) ? value : value.sources;

      for (var i = 0; i < sources.length; i++) {
        var source = sources[i];

        if (typeof source === 'string') {
          return indexInSources(list, source);
        } else if (source.src) {
          return indexInSources(list, source.src);
        }
      }

      return -1;
    },


    /**
     * Plays the first item in the playlist.
     *
     * @return {Object|undefined}
     *         Returns undefined and has no side effects if the list is empty.
     */
    first: function first() {
      if (list.length) {
        return list[playlist.currentItem(0)];
      }

      playlist.currentIndex_ = -1;
    },


    /**
     * Plays the last item in the playlist.
     *
     * @return {Object|undefined}
     *         Returns undefined and has no side effects if the list is empty.
     */
    last: function last() {
      if (list.length) {
        return list[playlist.currentItem(list.length - 1)];
      }

      playlist.currentIndex_ = -1;
    },


    /**
     * Plays the next item in the playlist.
     *
     * @return {Object|undefined}
     *         Returns undefined and has no side effects if on last item.
     */
    next: function next() {

      var nextIndex = void 0;

      // Repeat
      if (playlist.repeat_) {
        nextIndex = playlist.currentIndex_ + 1;
        if (nextIndex > list.length - 1) {
          nextIndex = 0;
        }

        // Don't go past the end of the playlist.
      } else {
        nextIndex = Math.min(playlist.currentIndex_ + 1, list.length - 1);
      }

      // Make the change
      if (nextIndex !== playlist.currentIndex_) {
        return list[playlist.currentItem(nextIndex)];
      }
    },


    /**
     * Plays the previous item in the playlist.
     *
     * @return {Object|undefined}
     *         Returns undefined and has no side effects if on first item.
     */
    previous: function previous() {

      // Make sure we don't go past the start of the playlist.
      var index = Math.max(playlist.currentIndex_ - 1, 0);

      if (index !== playlist.currentIndex_) {
        return list[playlist.currentItem(index)];
      }
    },


    /**
     * Sets up auto-advance on the playlist.
     *
     * @param {number} delay
     *        The number of seconds to wait before each auto-advance.
     */
    autoadvance: function autoadvance(delay) {
      playlist.autoadvance_.delay = delay;
      setup(playlist.player_, delay);
    },


    /**
     * Sets `repeat` option, which makes the "next" video of the last video in the
     * playlist be the first video in the playlist.
     *
     * @param {boolean=} val
     *        The value to set repeat to
     *
     * @return {boolean}
     *         The current value of repeat
     */
    repeat: function repeat(val) {
      if (val !== undefined) {
        if (typeof val !== 'boolean') {
          videojs.log.error('Invalid value for repeat', val);
        } else {
          playlist.repeat_ = val;
        }
      }
      return playlist.repeat_;
    }
  });

  playlist.currentItem(initialIndex);

  return playlist;
};

var videoList = [{
  sources: [{
    src: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
    type: 'video/mp4'
  }],
  poster: 'http://media.w3.org/2010/05/sintel/poster.png'
}, {
  sources: [{
    src: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
    type: 'video/mp4'
  }],
  poster: 'http://media.w3.org/2010/05/bunny/poster.png'
}, {
  sources: [{
    src: 'http://vjs.zencdn.net/v/oceans.mp4',
    type: 'video/mp4'
  }],
  poster: 'http://www.videojs.com/img/poster.jpg'
}, {
  sources: [{
    src: 'http://media.w3.org/2010/05/bunny/movie.mp4',
    type: 'video/mp4'
  }],
  poster: 'http://media.w3.org/2010/05/bunny/poster.png'
}, {
  sources: [{
    src: 'http://media.w3.org/2010/05/video/movie_300.mp4',
    type: 'video/mp4'
  }],
  poster: 'http://media.w3.org/2010/05/video/poster.png'
}];

QUnit.module('playlist', {
  beforeEach: function beforeEach() {
    this.clock = sinon.useFakeTimers();
  },
  afterEach: function afterEach() {
    this.clock.restore();
  }
});

QUnit.test('playlistMaker takes a player and a list and returns a playlist', function (assert) {
  var playlist = factory(proxy(), []);

  assert.equal(typeof playlist === 'undefined' ? 'undefined' : _typeof(playlist), 'function', 'playlist is a function');
  assert.equal(_typeof(playlist.autoadvance), 'function', 'we have a autoadvance function');

  assert.equal(_typeof(playlist.currentItem), 'function', 'we have a currentItem function');

  assert.equal(_typeof(playlist.first), 'function', 'we have a first function');
  assert.equal(_typeof(playlist.indexOf), 'function', 'we have a indexOf function');
  assert.equal(_typeof(playlist.next), 'function', 'we have a next function');
  assert.equal(_typeof(playlist.previous), 'function', 'we have a previous function');
});

QUnit.test('playlistMaker can either take nothing or an Array as its first argument', function (assert) {
  var playlist1 = factory(proxy());
  var playlist2 = factory(proxy(), 'foo');
  var playlist3 = factory(proxy(), { foo: [1, 2, 3] });

  assert.deepEqual(playlist1(), [], 'if given no initial array, default to an empty array');

  assert.deepEqual(playlist2(), [], 'if given no initial array, default to an empty array');

  assert.deepEqual(playlist3(), [], 'if given no initial array, default to an empty array');
});

QUnit.test('playlist() is a getter and setter for the list', function (assert) {
  var playlist = factory(proxy(), [1, 2, 3]);

  assert.deepEqual(playlist(), [1, 2, 3], 'equal to input list');

  assert.deepEqual(playlist([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5], 'equal to input list, arguments ignored');

  assert.deepEqual(playlist(), [1, 2, 3, 4, 5], 'equal to input list');

  var list = playlist();

  list.unshift(10);

  assert.deepEqual(playlist(), [1, 2, 3, 4, 5], 'changing the list did not affect the playlist');

  assert.notDeepEqual(playlist(), [10, 1, 2, 3, 4, 5], 'changing the list did not affect the playlist');
});

QUnit.test('playlist() should only accept an Array as a new playlist', function (assert) {
  var playlist = factory(proxy(), [1, 2, 3]);

  assert.deepEqual(playlist('foo'), [1, 2, 3], 'when given "foo", it should be treated as a getter');

  assert.deepEqual(playlist({ foo: [1, 2, 3] }), [1, 2, 3], 'when given {foo: [1,2,3]}, it should be treated as a getter');
});

QUnit.test('playlist.currentItem() works as expected', function (assert) {
  var player = proxy();
  var playlist = factory(player, videoList);
  var src = void 0;

  player.src = function (s) {
    if (s) {
      if (typeof s === 'string') {
        src = s;
      } else if (Array.isArray(s)) {
        return player.src(s[0]);
      } else {
        return player.src(s.src);
      }
    }
  };

  player.currentSrc = function () {
    return src;
  };

  src = videoList[0].sources[0].src;

  assert.equal(playlist.currentItem(), 0, 'begin at the first item, item 0');

  assert.equal(playlist.currentItem(2), 2, 'setting to item 2 gives us back the new item index');

  assert.equal(playlist.currentItem(), 2, 'the current item is now 2');
  assert.equal(playlist.currentItem(5), 2, 'cannot change to an out-of-bounds item');
  assert.equal(playlist.currentItem(-1), 2, 'cannot change to an out-of-bounds item');
  assert.equal(playlist.currentItem(null), 2, 'cannot change to an invalid item');
  assert.equal(playlist.currentItem(NaN), 2, 'cannot change to an invalid item');
  assert.equal(playlist.currentItem(Infinity), 2, 'cannot change to an invalid item');
  assert.equal(playlist.currentItem(-Infinity), 2, 'cannot change to an invalid item');
});

QUnit.test('playlist.currentItem() returns -1 with an empty playlist', function (assert) {
  var playlist = factory(proxy(), []);

  assert.equal(playlist.currentItem(), -1, 'we should get a -1 with an empty playlist');
});

QUnit.test('playlist.currentItem() does not change items if same index is given', function (assert) {
  var player = proxy();
  var sources = 0;
  var src = void 0;

  player.src = function (s) {
    if (s) {
      if (typeof s === 'string') {
        src = s;
      } else if (Array.isArray(s)) {
        return player.src(s[0]);
      } else {
        return player.src(s.src);
      }
    }

    sources++;
  };

  player.currentSrc = function () {
    return src;
  };

  var playlist = factory(player, videoList);

  assert.equal(sources, 1, 'we switched to the first playlist item');
  sources = 0;

  assert.equal(playlist.currentItem(), 0, 'we start at index 0');

  playlist.currentItem(0);
  assert.equal(sources, 0, 'we did not try to set sources');

  playlist.currentItem(1);
  assert.equal(sources, 1, 'we did try to set sources');

  playlist.currentItem(1);
  assert.equal(sources, 1, 'we did not try to set sources');
});

QUnit.test('playlistMaker accepts a starting index', function (assert) {
  var player = proxy();
  var src = void 0;

  player.src = function (s) {
    if (s) {
      if (typeof s === 'string') {
        src = s;
      } else if (Array.isArray(s)) {
        return player.src(s[0]);
      } else {
        return player.src(s.src);
      }
    }
  };

  player.currentSrc = function () {
    return src;
  };

  var playlist = factory(player, videoList, 1);

  assert.equal(playlist.currentItem(), 1, 'if given an initial index, load that video');
});

QUnit.test('playlistMaker accepts a starting index', function (assert) {
  var player = proxy();
  var src = void 0;

  player.src = function (s) {
    if (s) {
      if (typeof s === 'string') {
        src = s;
      } else if (Array.isArray(s)) {
        return player.src(s[0]);
      } else {
        return player.src(s.src);
      }
    }
  };

  player.currentSrc = function () {
    return src;
  };

  var playlist = factory(player, videoList, -1);

  assert.equal(playlist.currentItem(), -1, 'if given -1 as initial index, load no video');
});

QUnit.test('playlist.contains() works as expected', function (assert) {
  var player = proxy();
  var playlist = factory(player, videoList);

  player.playlist = playlist;

  assert.ok(playlist.contains('http://media.w3.org/2010/05/sintel/trailer.mp4'), 'we can ask whether it contains a source string');

  assert.ok(playlist.contains(['http://media.w3.org/2010/05/sintel/trailer.mp4']), 'we can ask whether it contains a sources list of strings');

  assert.ok(playlist.contains([{
    src: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
    type: 'video/mp4'
  }]), 'we can ask whether it contains a sources list of objects');

  assert.ok(playlist.contains({
    sources: ['http://media.w3.org/2010/05/sintel/trailer.mp4']
  }), 'we can ask whether it contains a playlist item');

  assert.ok(playlist.contains({
    sources: [{
      src: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
      type: 'video/mp4'
    }]
  }), 'we can ask whether it contains a playlist item');

  assert.ok(!playlist.contains('http://media.w3.org/2010/05/sintel/poster.png'), 'we get false for a non-existent source string');

  assert.ok(!playlist.contains(['http://media.w3.org/2010/05/sintel/poster.png']), 'we get false for a non-existent source list of strings');

  assert.ok(!playlist.contains([{
    src: 'http://media.w3.org/2010/05/sintel/poster.png',
    type: 'video/mp4'
  }]), 'we get false for a non-existent source list of objects');

  assert.ok(!playlist.contains({
    sources: ['http://media.w3.org/2010/05/sintel/poster.png']
  }), 'we can ask whether it contains a playlist item');

  assert.ok(!playlist.contains({
    sources: [{
      src: 'http://media.w3.org/2010/05/sintel/poster.png',
      type: 'video/mp4'
    }]
  }), 'we get false for a non-existent playlist item');
});

QUnit.test('playlist.indexOf() works as expected', function (assert) {
  var player = proxy();
  var playlist = factory(player, videoList);

  var mixedSourcesPlaylist = factory(player, [{
    sources: [{
      src: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
      type: 'video/mp4'
    }, {
      app_name: 'rtmp://example.com/sintel/trailer', // eslint-disable-line
      avg_bitrate: 4255000, // eslint-disable-line
      codec: 'H264',
      container: 'MP4'
    }],
    poster: 'http://media.w3.org/2010/05/sintel/poster.png'
  }]);

  player.playlist = playlist;

  assert.equal(playlist.indexOf('http://media.w3.org/2010/05/sintel/trailer.mp4'), 0, 'sintel trailer is first item');

  assert.equal(playlist.indexOf('//media.w3.org/2010/05/sintel/trailer.mp4'), 0, 'sintel trailer is first item, protocol-relative url considered equal');

  assert.equal(playlist.indexOf(['http://media.w3.org/2010/05/bunny/trailer.mp4']), 1, 'bunny trailer is second item');

  assert.equal(playlist.indexOf([{
    src: 'http://vjs.zencdn.net/v/oceans.mp4',
    type: 'video/mp4'
  }]), 2, 'oceans is third item');

  assert.equal(playlist.indexOf({
    sources: ['http://media.w3.org/2010/05/bunny/movie.mp4']
  }), 3, 'bunny movie is fourth item');

  assert.equal(playlist.indexOf({
    sources: [{
      src: 'http://media.w3.org/2010/05/video/movie_300.mp4',
      type: 'video/mp4'
    }]
  }), 4, 'timer video is fifth item');

  assert.equal(playlist.indexOf('http://media.w3.org/2010/05/sintel/poster.png'), -1, 'poster.png does not exist');

  assert.equal(playlist.indexOf(['http://media.w3.org/2010/05/sintel/poster.png']), -1, 'poster.png does not exist');

  assert.equal(playlist.indexOf([{
    src: 'http://media.w3.org/2010/05/sintel/poster.png',
    type: 'video/mp4'
  }]), -1, 'poster.png does not exist');

  assert.equal(playlist.indexOf({
    sources: ['http://media.w3.org/2010/05/sintel/poster.png']
  }), -1, 'poster.png does not exist');

  assert.equal(playlist.indexOf({
    sources: [{
      src: 'http://media.w3.org/2010/05/sintel/poster.png',
      type: 'video/mp4'
    }]
  }), -1, 'poster.png does not exist');

  assert.equal(mixedSourcesPlaylist.indexOf({
    sources: [{
      src: 'http://media.w3.org/2010/05/bunny/movie.mp4',
      type: 'video/mp4'
    }, {
      app_name: 'rtmp://example.com/bunny/movie', // eslint-disable-line
      avg_bitrate: 4255000, // eslint-disable-line
      codec: 'H264',
      container: 'MP4'
    }],
    poster: 'http://media.w3.org/2010/05/sintel/poster.png'
  }), -1, 'bunny movie does not exist');

  assert.equal(mixedSourcesPlaylist.indexOf({
    sources: [{
      src: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
      type: 'video/mp4'
    }, {
      app_name: 'rtmp://example.com/sintel/trailer', // eslint-disable-line
      avg_bitrate: 4255000, // eslint-disable-line
      codec: 'H264',
      container: 'MP4'
    }],
    poster: 'http://media.w3.org/2010/05/sintel/poster.png'
  }), 0, 'sintel trailer does exist');
});

QUnit.test('playlist.next() works as expected', function (assert) {
  var player = proxy();
  var playlist = factory(player, videoList);
  var src = void 0;

  player.currentSrc = function () {
    return src;
  };

  src = videoList[0].sources[0].src;
  assert.equal(playlist.currentItem(), 0, 'we start on item 0');

  assert.deepEqual(playlist.next(), videoList[1], 'we get back the value of currentItem 2');

  src = videoList[1].sources[0].src;
  assert.equal(playlist.currentItem(), 1, 'we are now on item 1');

  assert.deepEqual(playlist.next(), videoList[2], 'we get back the value of currentItem 3');

  src = videoList[2].sources[0].src;
  assert.equal(playlist.currentItem(), 2, 'we are now on item 2');
  src = videoList[4].sources[0].src;
  assert.equal(playlist.currentItem(4), 4, 'we are now on item 4');

  assert.equal(_typeof(playlist.next()), 'undefined', 'we get nothing back if we try to go out of bounds');
});

QUnit.test('playlist.previous() works as expected', function (assert) {
  var player = proxy();
  var playlist = factory(player, videoList);
  var src = void 0;

  player.currentSrc = function () {
    return src;
  };

  src = videoList[0].sources[0].src;
  assert.equal(playlist.currentItem(), 0, 'we start on item 0');

  assert.equal(_typeof(playlist.previous()), 'undefined', 'we get nothing back if we try to go out of bounds');

  src = videoList[2].sources[0].src;
  assert.equal(playlist.currentItem(), 2, 'we are on item 2');

  assert.deepEqual(playlist.previous(), videoList[1], 'we get back value of currentItem 1');

  src = videoList[1].sources[0].src;
  assert.equal(playlist.currentItem(), 1, 'we are on item 1');

  assert.deepEqual(playlist.previous(), videoList[0], 'we get back value of currentItem 0');

  src = videoList[0].sources[0].src;
  assert.equal(playlist.currentItem(), 0, 'we are on item 0');

  assert.equal(_typeof(playlist.previous()), 'undefined', 'we get nothing back if we try to go out of bounds');
});

QUnit.test('loading a non-playlist video will cancel autoadvance and set index of -1', function (assert) {
  var oldReset = reset;
  var player = proxy();

  var playlist = factory(player, [{
    sources: [{
      src: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
      type: 'video/mp4'
    }],
    poster: 'http://media.w3.org/2010/05/sintel/poster.png'
  }, {
    sources: [{
      src: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
      type: 'video/mp4'
    }],
    poster: 'http://media.w3.org/2010/05/bunny/poster.png'
  }]);

  player.currentSrc = function () {
    return 'http://vjs.zencdn.net/v/oceans.mp4';
  };

  setReset_(function () {
    assert.ok(true, 'autoadvance.reset was called');
  });

  player.trigger('loadstart');

  assert.equal(playlist.currentItem(), -1, 'new currentItem is -1');

  player.currentSrc = function () {
    return 'http://media.w3.org/2010/05/sintel/trailer.mp4';
  };

  setReset_(function () {
    assert.ok(false, 'autoadvance.reset should not be called');
  });

  player.trigger('loadstart');

  setReset_(oldReset);
});

QUnit.test('when loading a new playlist, trigger "playlistchange" on the player', function (assert) {
  var spy = sinon.spy();
  var player = proxy();

  player.on('playlistchange', spy);
  var playlist = factory(player, [1, 2, 3]);

  playlist([4, 5, 6]);
  this.clock.tick(1);

  assert.strictEqual(spy.callCount, 1);
  assert.strictEqual(spy.firstCall.args[0].type, 'playlistchange');
});

QUnit.test('clearTimeout on dispose', function (assert) {
  var player = proxy();
  var playlist = factory(player, [1, 2, 3]);

  playlist([1, 2, 3]);
  var clearSpy = sinon.spy(window_1, 'clearTimeout');

  player.trigger('dispose');

  assert.strictEqual(clearSpy.callCount, 1);
  clearSpy.restore();
});

// Video.js 5/6 cross-compatible.
var registerPlugin = videojs.registerPlugin || videojs.plugin;

/**
 * The video.js playlist plugin. Invokes the playlist-maker to create a
 * playlist function on the specific player.
 *
 * @param {Array} list
 *        a list of sources
 *
 * @param {number} item
 *        The index to start at
 */
var plugin = function plugin(list, item) {
  factory(this, list, item);
};

registerPlugin('playlist', plugin);

QUnit.test('the environment is sane', function (assert) {
  assert.strictEqual(_typeof(Array.isArray), 'function', 'es5 exists');
  assert.strictEqual(typeof sinon === 'undefined' ? 'undefined' : _typeof(sinon), 'object', 'sinon exists');
  assert.strictEqual(typeof videojs === 'undefined' ? 'undefined' : _typeof(videojs), 'function', 'videojs exists');
  assert.strictEqual(typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin), 'function', 'plugin is a function');
});

QUnit.test('registers itself with video.js', function (assert) {
  assert.expect(1);
  assert.strictEqual(_typeof(videojs.getComponent('Player').prototype.playlist), 'function', 'videojs-playlist plugin was registered');
});

}(QUnit,videojs,sinon));
