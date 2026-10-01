/*
  TASK 6 — Sum of Multiples
  -------------------------
  Find the sum of all the multiples of x or y, below z.

  Example given in the lab sheet:
  All natural numbers below 10 that are multiples of 3 or 5:
    3, 5, 6, 9
  Sum = 3 + 5 + 6 + 9 = 23

  "Multiple of x" means a number you get by multiplying x by a whole
  number (3, 6, 9, 12... are all multiples of 3). The easiest way to
  check if "n is a multiple of x" in code is: n % x === 0
  (the remainder of n divided by x is exactly 0, nothing left over).

  "x or y" means we count the number if it's a multiple of EITHER one -
  that's why we use the || (OR) operator below, not && (AND).
*/

function sumMultiples(x, y, z) {
  let sum = 0;

  // Go through every natural number from 1 up to (but not including) z.
  for (let n = 1; n < z; n++) {
    if (n % x === 0 || n % y === 0) {
      sum += n; // same as: sum = sum + n;
    }
  }

  return sum;
}

// ---------- Test it exactly like the lab sheet example ----------
console.log(sumMultiples(3, 5, 10)); // 23 (3 + 5 + 6 + 9)

// A couple of extra tests to be sure the logic generalizes correctly:
console.log(sumMultiples(3, 5, 1000)); // classic "Project Euler problem 1" answer: 233168
console.log(sumMultiples(4, 6, 20));   // multiples of 4 or 6 below 20
