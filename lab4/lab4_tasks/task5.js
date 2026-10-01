/*
  TASK 5 — absMe(), ceilMe(), floorMe()
  -------------------------------------
  "Implement the following methods just like in Task 4" means: abs, ceil,
  and floor should all behave the exact same way roundMe() did -
    0 args    -> returns 0
    1 arg     -> returns a single number
    2+ args   -> returns an array of results

  Instead of copy-pasting the same 0/1/many logic three separate times
  (once for abs, once for ceil, once for floor - which is messy and means
  fixing a bug means fixing it in 3 places), we write ONE shared helper
  function that does that repeating logic, and tell it WHICH math
  operation to apply by passing that operation in as a function itself.

  This is a genuinely important JS idea: functions are "first-class
  values" in JS, meaning a function can be stored in a variable, and
  passed INTO another function as an argument, just like a number or a
  string can. Math.abs, Math.ceil, and Math.floor are themselves just
  functions, so we can hand them directly to our helper.
*/

// ---------- The shared helper (this is the "just like Task 4" part) ----------
function applyToArgs(mathFn, args) {
  if (args.length === 0) {
    return 0;
  }
  if (args.length === 1) {
    return mathFn(args[0]);
  }
  return args.map(function (num) {
    return mathFn(num);
  });
}

// ---------- The three required methods, each just a thin wrapper ----------
function absMe(...args) {
  return applyToArgs(Math.abs, args);
}

function ceilMe(...args) {
  return applyToArgs(Math.ceil, args);
}

function floorMe(...args) {
  return applyToArgs(Math.floor, args);
}

// ---------- Test all three ----------
console.log(absMe());              // 0
console.log(absMe(-4.7));          // 4.7   (abs only removes the negative sign, it does not round)
console.log(absMe(-4.7, 3, -9));   // [4.7, 3, 9]

console.log(ceilMe());             // 0
console.log(ceilMe(4.1));          // 5     (ceil always rounds UP)
console.log(ceilMe(4.1, 4.9));     // [5, 5]

console.log(floorMe());            // 0
console.log(floorMe(4.9));         // 4     (floor always rounds DOWN)
console.log(floorMe(4.9, 4.1));    // [4, 4]
