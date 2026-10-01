/*
  TASK 2 — Next Prime Number
  --------------------------
  Requirement: given ANY prime number (hardcoded, no user input needed),
  print the prime number that comes right after it.
  Example: given 11, the answer is 13.

  This task is specifically about practicing JS loops and the 'let' keyword.
  'let' is the modern way to declare a variable that you plan to change/
  reassign later (like a counter going up in a loop) - this is different
  from 'const', which can never be reassigned after its first value.
*/

// A "prime number" is a whole number greater than 1 that has no divisors
// other than 1 and itself (2, 3, 5, 7, 11, 13, 17, 19, 23...).

// ---------- Helper function: is a given number prime? ----------
function isPrime(num) {
  if (num < 2) return false; // 0 and 1 are not prime, by definition

  // Check every possible divisor from 2 up to num - 1.
  // If ANY of them divides num evenly (remainder 0), it's not prime.
  for (let divisor = 2; divisor < num; divisor++) {
    if (num % divisor === 0) {
      return false; // found a divisor, so num is NOT prime
    }
  }

  return true; // no divisors found, so num IS prime
}

// ---------- Main logic: find the next prime after a given one ----------
function nextPrime(givenPrime) {
  let candidate = givenPrime + 1; // start checking from the very next number

  // Keep moving forward, one number at a time, until we land on a prime.
  // This loop is a great example of using 'let' - 'candidate' changes
  // (increases) every single time through the loop.
  while (!isPrime(candidate)) {
    candidate++;
  }

  return candidate;
}

// ---------- Run it (hardcoded prime number, as the lab allows) ----------
let givenPrime = 11;
let result = nextPrime(givenPrime);

console.log(`The given prime number is ${givenPrime}.`);
console.log(`The next prime number after ${givenPrime} is ${result}.`);

// Try changing givenPrime above to test more cases:
// givenPrime = 2  -> next prime is 3
// givenPrime = 13 -> next prime is 17
// givenPrime = 97 -> next prime is 101
