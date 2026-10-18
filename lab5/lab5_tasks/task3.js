// Task 3: nested objects ko bhi copy karna hai.
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function updateProfile(student, update = {}) {
  if (!isObject(student) || !isObject(update)) throw new TypeError("Student and update must be objects");
  for (const key of ["address", "contact"]) {
    if (student[key] !== undefined && !isObject(student[key])) throw new TypeError("Invalid original " + key);
    if (update[key] !== undefined && !isObject(update[key])) throw new TypeError("Invalid update " + key);
  }
  const { address = {}, contact = {}, ...otherFields } = update;
  return { ...student, ...otherFields, address: { ...student.address, ...address }, contact: { ...student.contact, ...contact } };
}

// Rest parameters se multiple updates aik aik karke lag rahe hain.
function applyUpdates(student, ...updates) {
  let result = updateProfile(student);
  for (const update of updates) result = updateProfile(result, update);
  return result;
}

const student = { id: 101, name: "Ali", marks: 0, scholarship: false, address: { city: "Islamabad", sector: "F-10" }, contact: { email: "ali@university.edu" } };
const update = { name: "Ali Khan", address: { city: "Rawalpindi" }, contact: { phone: "03001234567" } };
const updated = applyUpdates(student, update);
const { name: studentName, marks = 0, scholarship = false, address: { city, sector = "Unknown" } = {} } = updated;
const [firstName, lastName = ""] = studentName.split(" ");
const phone = updated.contact?.phone ?? "No phone";
console.log("Task 3", updated);
console.log({ studentName, marks, scholarship, city, sector, firstName, lastName, phone });
console.log("Same object?", student === updated); // false: spread se naya object.
console.log("Same address?", student.address === updated.address); // false: address bhi copy kiya.
console.log("Same contact?", student.contact === updated.contact); // false: contact bhi copy kiya.
console.log("Original:", student);
console.log("Falsy values:", updateProfile(student, { name: "", marks: 0, scholarship: false }));
console.log("No updates:", updateProfile(student));
try {
  updateProfile(student, { address: null });
} catch (error) {
  console.log("Invalid:", error.message);
}
