/**
 * Flexible test function for various comparison and validation operations.
 * Supports multiple test types with optional parameters for customization.
 *
 * @param {string} type - The type of test to perform. Examples: 
 *   "equals", "notEquals", "greaterThan", "lessThan", "greaterOrEqual", "lessOrEqual",
 *   "isType", "contains", "startsWith", "endsWith", "isArray", "isFunction",
 *   "isTruthy", "isFalsy", "inRange", "lengthEquals", "lengthGreaterThan",
 *   "lengthLessThan", "regexTest", "asyncFunction", "promiseResolved",
 *   "containsKeys", "hasOwnKeys", "custom"
 * @param {*} actual - The actual value to test.
 * @param {*} expected - The expected value or parameter for the test.
 *   For example, for "inRange" pass [min, max], for "custom" pass a function.
 * @param {Object} [options] - Optional settings object to customize behavior.
 * @param {boolean} [options.ignoreCase] - Case-insensitive string comparisons.
 * @param {number} [options.tolerance] - Numeric tolerance for approximate equality.
 * @param {boolean} [options.deep] - Perform deep equality checks for objects/arrays.
 * @returns {boolean} - Result of the test: true if passes, false otherwise.
 */
function test(type, actual, expected, options = {}) {
  const isArray = v => Array.isArray(v);
  const isFunction = v => typeof v === "function";
  const isNumber = v => typeof v === "number" && !isNaN(v);
  const isString = v => typeof v === "string";
  const isObject = v => v && typeof v === "object" && !isArray(v);
  const toLower = str => isString(str) ? str.toLowerCase() : str;
  const almostEqual = (a, b, tol = 1e-10) => Math.abs(a - b) <= tol;
  const deepEqual = (a, b, seen = new WeakSet()) => {
    if (a === b) return true;
    if (isNumber(a) && isNumber(b) && options.tolerance !== undefined)
      return Math.abs(a - b) <= options.tolerance;
    if (typeof a !== typeof b) return false;
    if (a && b && typeof a === "object") {
      if (seen.has(a)) return true;
      seen.add(a);
      if (isArray(a) && isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((v,i) => deepEqual(v, b[i], seen));
      }
      if (isObject(a) && isObject(b)) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(k => deepEqual(a[k], b[k], seen));
      }
      return false;
    }
    return false;
  };

  const ops = {
    equals: () => options.deep ? deepEqual(actual, expected) : actual === expected,
    notEquals: () => options.deep ? !deepEqual(actual, expected) : actual !== expected,
    greaterThan: () => isNumber(actual) && isNumber(expected) && actual > expected,
    lessThan: () => isNumber(actual) && isNumber(expected) && actual < expected,
    greaterOrEqual: () => isNumber(actual) && isNumber(expected) && actual >= expected,
    lessOrEqual: () => isNumber(actual) && isNumber(expected) && actual <= expected,
    isType: () => {
      if (expected === "array") return isArray(actual);
      if (expected === "null") return actual === null;
      if (expected === "nan") return Number.isNaN(actual);
      if (expected === "object") return isObject(actual);
      return typeof actual === expected;
    },
    contains: () => {
      if (isString(actual) && isString(expected)) {
        const a = options.ignoreCase ? toLower(actual) : actual;
        const e = options.ignoreCase ? toLower(expected) : expected;
        return a.includes(e);
      }
      if (isArray(actual)) {
        return actual.some(el => options.deep ? deepEqual(el, expected) : el === expected);
      }
      return false;
    },
    startsWith: () => {
      if (!isString(actual) || !isString(expected)) return false;
      const a = options.ignoreCase ? toLower(actual) : actual;
      const e = options.ignoreCase ? toLower(expected) : expected;
      return a.startsWith(e);
    },
    endsWith: () => {
      if (!isString(actual) || !isString(expected)) return false;
      const a = options.ignoreCase ? toLower(actual) : actual;
      const e = options.ignoreCase ? toLower(expected) : expected;
      return a.endsWith(e);
    },
    isArray: () => isArray(actual),
    isFunction: () => isFunction(actual),
    isTruthy: () => Boolean(actual),
    isFalsy: () => !Boolean(actual),
    inRange: () => {
      if (!isNumber(actual) || !isArray(expected) || expected.length !== 2) return false;
      const [min, max] = expected;
      return actual >= min && actual <= max;
    },
    lengthEquals: () => {
      if (actual == null || expected == null) return false;
      if ("length" in actual) return actual.length === expected;
      return false;
    },
    lengthGreaterThan: () => ("length" in actual) && actual.length > expected,
    lengthLessThan: () => ("length" in actual) && actual.length < expected,
    regexTest: () => {
      if (!(expected instanceof RegExp)) return false;
      if (!isString(actual)) return false;
      return expected.test(actual);
    },
    asyncFunction: () => {
      if (!isFunction(actual)) return false;
      return actual.constructor.name === "AsyncFunction";
    },
    promiseResolved: () => {
      if (!actual || !isFunction(actual.then)) return false;
      return actual.then ? true : false;
    },
    containsKeys: () => {
      if (!isObject(actual) || !isArray(expected)) return false;
      return expected.every(key => key in actual);
    },
    hasOwnKeys: () => {
      if (!isObject(actual) || !isArray(expected)) return false;
      return expected.every(key => Object.prototype.hasOwnProperty.call(actual, key));
    },
    custom: () => isFunction(expected) ? expected(actual, options) : false
  };

  return Boolean(ops[type]?.());
}

/**
 * Complex conditional execution function mimicking 'if-else' logic without using 'if' statements.
 * Supports multiple chained conditions, fallback values, and optional pre/post hooks.
 * Uses bitwise, logical operators, array indexing, and ternary expressions internally.
 * 
 * @param {*} condition - The condition to evaluate (truthy/falsy).
 * @param {Function|*} onTrue - Function to execute or value to return if condition is truthy.
 * @param {Function|*} [onFalse] - Function or value if condition is falsy (optional).
 * @param {Object} [options] - Optional hooks and chaining options.
 * @param {Function} [options.pre] - Function to run before main execution; receives condition.
 * @param {Function} [options.post] - Function to run after main execution; receives result.
 * @param {Array} [options.chain] - Array of further conditions with handlers, supports multiple if-else if chains.
 *                                 Format: [{ cond: Boolean, onTrue: Fn|val, onFalse: Fn|val }]
 * @returns {*} Result of the matched handler or fallback.
 */
function lopif(condition, onTrue, onFalse, options = {}) {
  const isFn = v => typeof v === "function";
  const exec = val => isFn(val) ? val() : val;

  const runPre = () => options.pre ? options.pre(condition) : null;
  const runPost = res => options.post ? options.post(res) : res;

  const chainMatch = () => {
    if (!Array.isArray(options.chain)) return undefined;
    for (let i = 0; i < options.chain.length; i++) {
      const c = options.chain[i];
      const cCond = !!c.cond;
      const cTrue = c.onTrue;
      const cFalse = c.onFalse === undefined ? undefined : c.onFalse;

      const result = [exec(cFalse), exec(cTrue)][cCond | 0];
      if (cCond) return result;
    }
    return undefined;
  };

  runPre();

  const baseResult = [exec(onFalse === undefined ? undefined : onFalse), exec(onTrue)][(!!condition) | 0];

  const chainResult = chainMatch();

  const finalResult = chainResult === undefined ? baseResult : chainResult;

  return runPost(finalResult);
}

/**
 * Deeply merges multiple objects/arrays into one, with options for customizing behavior.
 *
 * @param {...Object|Array} sources - Two or more objects or arrays to merge deeply.
 * @param {Object} [options] - Optional settings for the merge operation.
 * @param {boolean} [options.arrayConcat=true] - Whether to concatenate arrays or overwrite.
 * @param {boolean} [options.clone=true] - Whether to clone values to avoid mutation.
 * @param {Function} [options.customizer] - A function (targetVal, sourceVal, key, target, source) => mergedValue.
 *                                          If returns undefined, default merge applies.
 * @returns {Object|Array} - A new deeply merged object or array.
 */
function deepMerge(...args) {
  const options = typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1]) && !(args[args.length - 1] instanceof Function) ? args.pop() : {};
  const { arrayConcat = true, clone = true, customizer } = options;

  const isObject = val => val && typeof val === 'object' && !Array.isArray(val);
  const isArray = Array.isArray;

  const cloneValue = val => {
    if (!clone) return val;
    if (isArray(val)) return val.map(cloneValue);
    if (isObject(val)) return deepMerge({}, val, options);
    return val;
  };

  const merge = (target, source) => {
    if (!isObject(target) && !isArray(target)) return cloneValue(source);
    if (!isObject(source) && !isArray(source)) return cloneValue(source);

    if (isArray(target) && isArray(source)) {
      if (arrayConcat) return [...target, ...source].map(cloneValue);
      else return source.map(cloneValue);
    }

    const result = isArray(target) ? [] : {};

    const keys = new Set([...Object.keys(target), ...Object.keys(source)]);
    keys.forEach(key => {
      const tVal = target[key];
      const sVal = source[key];
      if (customizer) {
        const customResult = customizer(tVal, sVal, key, target, source);
        if (customResult !== undefined) {
          result[key] = cloneValue(customResult);
          return;
        }
      }
      if (sVal === undefined) {
        result[key] = cloneValue(tVal);
      } else if (tVal === undefined) {
        result[key] = cloneValue(sVal);
      } else {
        result[key] = merge(tVal, sVal);
      }
    });

    return result;
  };

  if (args.length < 2) return args[0];

  return args.reduce((acc, curr) => merge(acc, curr));
}

/**
 * Parses, validates, and formats dates flexibly with fallback, timezone, and formatting options.
 * Supports ISO strings, timestamps, Date objects, custom formats, and relative date calculations.
 *
 * @param {*} input - The input date value: string, number, Date, or null/undefined.
 * @param {Object} [options] - Configuration for parsing and formatting.
 * @param {string} [options.format="iso"] - Output format: "iso", "locale", "timestamp", or custom function(date).
 * @param {boolean} [options.strict=false] - Strict mode: invalid dates throw error if true, else return fallback.
 * @param {*} [options.fallback=null] - Value to return if input is invalid or parsing fails.
 * @param {string} [options.timezone="local"] - Timezone handling: "local", "utc", or offset like "+0300".
 * @param {boolean} [options.relative=false] - Return relative time string like "3 days ago" if true.
 * @param {number} [options.adjustDays=0] - Add/subtract days from parsed date.
 * @returns {string|number|Date|null} - Formatted date output or fallback.
 */
function flexibleDate(input, options = {}) {
  const {
    format = "iso",
    strict = false,
    fallback = null,
    timezone = "local",
    relative = false,
    adjustDays = 0,
  } = options;

  const isValidDate = d => d instanceof Date && !isNaN(d);

  let date;

  if (input instanceof Date) {
    date = new Date(input.getTime());
  } else if (typeof input === "number") {
    date = new Date(input);
  } else if (typeof input === "string") {
    date = new Date(input);
  } else {
    date = null;
  }

  if (!isValidDate(date)) {
    if (strict) throw new Error("Invalid date input");
    return fallback;
  }

  if (adjustDays !== 0) {
    date.setDate(date.getDate() + adjustDays);
  }

  if (timezone !== "local") {
    if (timezone === "utc") {
      date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    } else if (/^[+-]\d{4}$/.test(timezone)) {
      const sign = timezone[0] === "+" ? 1 : -1;
      const hours = parseInt(timezone.slice(1, 3), 10);
      const minutes = parseInt(timezone.slice(3, 5), 10);
      const offset = sign * (hours * 60 + minutes);
      date = new Date(date.getTime() + (date.getTimezoneOffset() + offset) * 60000);
    }
  }

  if (relative) {
    const diffMs = Date.now() - date.getTime();
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return days + " day" + (days > 1 ? "s" : "") + " ago";
    if (hours > 0) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
    if (minutes > 0) return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
    return "just now";
  }

  if (typeof format === "function") return format(date);

  switch (format) {
    case "iso":
      return date.toISOString();
    case "locale":
      return date.toLocaleString();
    case "timestamp":
      return date.getTime();
    default:
      return date.toString();
  }
}

/**
 * Advanced throttling function with customizable delay, leading/trailing calls,
 * max call limit, and cancellation support.
 *
 * @param {Function} func - The function to throttle.
 * @param {number} delay - Delay in milliseconds between allowed calls.
 * @param {Object} [options] - Configuration options.
 * @param {boolean} [options.leading=true] - Whether to invoke at the start of the delay.
 * @param {boolean} [options.trailing=true] - Whether to invoke at the end of the delay.
 * @param {number} [options.maxCalls=Infinity] - Maximum allowed calls before throttling disables.
 * @returns {Function & { cancel: Function, flush: Function }} - Throttled function with control methods.
 */
function advancedThrottle(func, delay, options = {}) {
  let lastCallTime = 0,
    timeoutId = null,
    callCount = 0,
    lastArgs,
    lastThis;

  const {
    leading = true,
    trailing = true,
    maxCalls = Infinity,
  } = options;

  function invoke(time) {
    lastCallTime = time;
    callCount++;
    func.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
  }

  function throttled(...args) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;

    if (callCount >= maxCalls) return;

    if (!lastCallTime && !leading) lastCallTime = now;

    const remaining = delay - (now - lastCallTime);

    if (remaining <= 0 || remaining > delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      invoke(now);
    } else if (trailing && !timeoutId) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        invoke(Date.now());
      }, remaining);
    }
  }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = lastThis = null;
    callCount = 0;
    lastCallTime = 0;
  };

  throttled.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      invoke(Date.now());
      timeoutId = null;
    }
  };

  return throttled;
}

/**
 * Deep clones any value including objects, arrays, maps, sets, dates, regexps, and handles circular references.
 *
 * @param {*} value - The value to deep clone.
 * @param {WeakMap} [cache=new WeakMap()] - Internal cache for circular reference handling.
 * @returns {*} - Deep cloned value.
 */
function deepClone(value, cache = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (cache.has(value)) return cache.get(value);

  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (value instanceof Map) {
    const clonedMap = new Map();
    cache.set(value, clonedMap);
    value.forEach((v, k) => clonedMap.set(deepClone(k, cache), deepClone(v, cache)));
    return clonedMap;
  }

  if (value instanceof Set) {
    const clonedSet = new Set();
    cache.set(value, clonedSet);
    value.forEach(v => clonedSet.add(deepClone(v, cache)));
    return clonedSet;
  }

  if (Array.isArray(value)) {
    const clonedArr = [];
    cache.set(value, clonedArr);
    value.forEach((v, i) => clonedArr[i] = deepClone(v, cache));
    return clonedArr;
  }

  const clonedObj = {};
  cache.set(value, clonedObj);
  Object.keys(value).forEach(key => {
    clonedObj[key] = deepClone(value[key], cache);
  });
  return clonedObj;
}

module.exports = {
    test,
    lopif,
    deepMerge,
    flexibleDate,
    advancedThrottle,
    deepClone
}
//empty
