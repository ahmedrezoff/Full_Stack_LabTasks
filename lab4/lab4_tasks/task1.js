/*
  TASK 1 — Biography
  -------------------
  Requirements from the lab sheet:
  1. Write a biography about yourself and print it on the console.
  2. Use 'var' to store your biography in variables, using the correct
     primitive type for each piece of info (string, number, boolean...).
  3. Create a JS Object for the same biography, with at least 4-5 keys,
     and nested objects inside it for things like address and degreeProgram.
  4. Print the biography using the object, but WITHOUT just dumping the
     whole object as-is (so no plain console.log(myBio) as the final answer).

  NOTE on 'var': this lab specifically asks for 'var' here. 'var' is the
  OLDEST way JS had to declare a variable, before 'let' and 'const' existed.
  It still works, but it behaves a bit differently (explained fully in the
  big JS guide doc) - for now, just know 'var' creates a variable the same
  basic way 'let' does, you can reassign it, and it's a normal keyword.
*/

// ---------- Part 2: plain 'var' primitive variables ----------
// A "primitive type" just means a basic single value, not an object/array.
// JS primitives are: string, number, boolean, undefined, null, bigint, symbol.

var fullName = "Ahmed Raza Baig";      // string
var age = 20;                          // number
var city = "Rawalpindi";               // string
var isStudent = true;                  // boolean
var cgpa = 3.4;                        // number (decimal)

// ---------- Part 3: the same info, but as a JS Object ----------
// An "object" in JS is just a collection of key: value pairs, written
// between curly braces { }. You do NOT need a class to make one - this
// is called an "object literal", and it's the most common way objects
// are made in everyday JS code.

var biography = {
  name: fullName,
  age: age,
  isStudent: isStudent,
  cgpa: cgpa,

  // nested object #1 - an object INSIDE another object
  address: {
    city: city,
    country: "Pakistan"
  },

  // nested object #2
  degreeProgram: {
    title: "BS Computer Science",
    university: "Air University",
    startYear: 2024,
    expectedGraduation: 2028
  }
};

// ---------- Part 1 & 4: print the biography on the console ----------
// We are NOT allowed to just do console.log(biography) as the final
// answer (that would just dump the raw object). Instead we pull specific
// values out of it using dot notation (object.key) and build a readable
// sentence with a template literal (the backtick string with ${ } inside).

console.log(
  `${biography.name} is a ${biography.age}-year-old student living in ` +
  `${biography.address.city}, ${biography.address.country}. ` +
  `${biography.name} is currently enrolled in the ${biography.degreeProgram.title} ` +
  `program at ${biography.degreeProgram.university} (${biography.degreeProgram.startYear} - ` +
  `${biography.degreeProgram.expectedGraduation}), with a current CGPA of ${biography.cgpa}.`
);
