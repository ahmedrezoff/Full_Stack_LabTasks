/*
  TASK 4 — roundMe()
  ------------------
  roundMe() can work on 0 to N arguments (any number of arguments at all):
    roundMe()           // returns 0
    roundMe(4.7)        // returns 5          (a single rounded number)
    roundMe(4.7, 4.4)   // returns [5, 4]     (an array, one per argument)

  The key new JS idea here is "rest parameters": ...args
  Writing ...args as a function's parameter means "collect EVERY argument
  the function was called with, no matter how many, into one real array
  called args". This is exactly what lets one function handle 0, 1, or
  100 arguments without you writing a different function for each case.
*/

function roundMe(...args) {
  // Case 1: called with zero arguments at all.
  if (args.length === 0) {
    return 0;
  }

  // Case 2: called with exactly one argument - return a single number,
  // not an array (matches the required example: roundMe(4.7) === 5).
  if (args.length === 1) {
    return Math.round(args[0]);
  }

  // Case 3: called with two or more arguments - return an array of
  // every argument, individually rounded. .map() builds that new array
  // by running Math.round on each item in args, one at a time.
  return args.map(function (num) {
    return Math.round(num);
  });
}

// ---------- Test it exactly like the lab sheet examples ----------
console.log(roundMe());            // 0
console.log(roundMe(4.7));         // 5
console.log(roundMe(4.7, 4.4));    // [5, 4]
console.log(roundMe(1.5, 2.49, 9.99, 0.2)); // extra test, 4+ arguments
