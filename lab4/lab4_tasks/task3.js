/**
 * TASK 3 — Array to Phone Number
 * ------------------------------
 * Function takes an array of 10 numbers (each digit 0-9) and returns
 * @param {array of numbers} numbers
 * @returns string in following format: "(123) 456-7890"
 */
function createPhoneNumber(numbers) {
  // Step 1: turn every number in the array into a single-character string.
  // .map() walks through the array and builds a NEW array where every
  // item has been run through the function we gave it - here, String(n)
  // just converts a number like 5 into the text "5".
  var digits = numbers.map(function (n) {
    return String(n);
  });

  // Step 2: .slice(start, end) pulls out a smaller piece of an array,
  // from "start" up to (but NOT including) "end". We use it three times
  // to grab the 3 chunks of a phone number: first 3 digits, next 3, last 4.
  var areaCode = digits.slice(0, 3).join("");   // digits[0], [1], [2]
  var firstPart = digits.slice(3, 6).join("");  // digits[3], [4], [5]
  var secondPart = digits.slice(6, 10).join(""); // digits[6], [7], [8], [9]

  // Step 3: glue the three pieces together in the required format,
  // using a template literal (backtick string with ${ } placeholders).
  return `(${areaCode}) ${firstPart}-${secondPart}`;
}

// ---------- Test it exactly like the lab sheet example ----------
console.log(createPhoneNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
// Expected output: "(123) 456-7890"
