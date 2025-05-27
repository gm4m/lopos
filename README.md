# lopos

Lopos is a powerful utility library for advanced conditional testing, flexible date handling, deep merging, throttling, cloning, and conditional logic — all packed with extensive options and without relying on native `if` statements in some parts.  

Ideal for developers who want flexible, readable, and highly customizable utility functions in JavaScript.

---

## Installation

```bash
npm install lopos
```

---

## Importing

```js
const { 
  test, 
  lopif, 
  deepMerge, 
  flexibleDate, 
  advancedThrottle, 
  deepClone 
} = require("lopos");
```

---

## Functions

### `test(type, actual, expected, options)`

Flexible test function for many types of comparisons and validations, including deep equality, string checks, array contents, regex, async functions, and custom predicates.

- **type**: String key defining the test type.  
- **actual**: Value to test.  
- **expected**: Value or parameter used in the test.  
- **options**: Optional flags such as `ignoreCase`, `tolerance`, or `deep` for customizing behavior.  
- **returns**: `boolean` result of the test.

**Example:**

```js
test("equals", 5, 5); // true
test("contains", "Hello World", "world", { ignoreCase: true }); // true
test("inRange", 10, [5, 15]); // true
```

---

### `lopif(condition, onTrue, onFalse, options)`

Conditional execution mimicking `if-else` logic without using `if` statements. Supports chained conditions, hooks before and after execution, and flexible handlers.

- **condition**: Boolean or truthy/falsy value.  
- **onTrue/onFalse**: Values or functions executed based on condition.  
- **options**: Optional hooks (`pre`, `post`) and chaining of multiple conditionals.  
- **returns**: Result of executed handler or fallback.

**Example:**

```js
lopif(
  10 > 5, 
  () => "Yes", 
  () => "No", 
  { pre: cond => console.log("Checking:", cond), post: res => console.log("Result:", res) }
);
// Logs: Checking: true
// Logs: Result: Yes
// Returns: "Yes"
```

---

### `deepMerge(...sources, options)`

Deeply merges multiple objects or arrays with customizable behavior such as array concatenation, cloning, and custom merge strategies.

- **sources**: Two or more objects or arrays.  
- **options**: Controls like `arrayConcat`, `clone`, and `customizer` function.  
- **returns**: A new deeply merged object or array.

**Example:**

```js
deepMerge(
  { a: 1, b: { c: 2 } }, 
  { b: { d: 3 }, e: 4 }, 
  { arrayConcat: false }
);
// Result: { a: 1, b: { c: 2, d: 3 }, e: 4 }
```

---

### `flexibleDate(input, options)`

Parse, validate, adjust, and format dates flexibly. Supports strings, timestamps, Date objects, relative time, timezone offsets, strict mode, and custom output formatting.

- **input**: Date input (string, number, Date, null).  
- **options**: Settings like `format`, `strict`, `fallback`, `timezone`, `relative`, `adjustDays`.  
- **returns**: Formatted date string, timestamp, Date object, or fallback.

**Example:**

```js
flexibleDate("2023-01-01T12:00:00Z", { format: "locale", timezone: "utc" });
// Might return: "1/1/2023, 12:00:00 PM"

flexibleDate(null, { fallback: "Invalid Date" });
// Returns: "Invalid Date"
```

---

### `advancedThrottle(func, delay, options)`

Throttle a function with advanced controls like leading/trailing call, max call limits, cancellation, and flushing.

- **func**: Function to throttle.  
- **delay**: Delay in milliseconds.  
- **options**: `leading`, `trailing`, `maxCalls`.  
- **returns**: Throttled function with `cancel` and `flush` methods.

**Example:**

```js
const throttled = advancedThrottle(() => console.log("Called!"), 1000, { leading: true });
throttled();
throttled.cancel();
throttled.flush();
```

---

### `deepClone(value)`

Deeply clones any value including complex types like objects, arrays, maps, sets, dates, regexps, with support for circular references.

- **value**: Any JavaScript value to clone.  
- **returns**: Deep cloned copy of the value.

**Example:**

```js
const obj = { a: 1, b: { c: 2 } };
const clone = deepClone(obj);
clone.b.c = 3;
console.log(obj.b.c); // 2 (original unchanged)
```

---

Made with ❤️ for developers who want advanced, clean, and expressive utility functions in JavaScript.

*Feel free to contribute or open issues!*
