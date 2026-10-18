// Task 6: sirf error-first callbacks, Promise ya async/await nahi.
let students = [
  { id: 101, completed: ["CS301"], registered: [] },
  { id: 102, completed: [], registered: [] },
  { id: 103, completed: ["CS301"], registered: ["CS401"] }
];
let courses = [
  { code: "CS401", prerequisite: "CS301", seats: 2 },
  { code: "CS402", prerequisite: "CS301", seats: 0 }
];

export function loadStudent(id, callback) {
  setTimeout(() => {
    const student = students.find(student => student.id === id);
    if (!student) return callback(new Error("Student does not exist"));
    callback(null, student);
  }, 10);
}
export function checkPrerequisites(student, code, callback) {
  setTimeout(() => {
    if (!student || !Array.isArray(student.completed)) return callback(new TypeError("Invalid student data"));
    const course = courses.find(course => course.code === code);
    if (!course) return callback(new Error("Course does not exist"));
    if (!student.completed.includes(course.prerequisite)) return callback(new Error("Prerequisite not completed"));
    callback(null, { student, course });
  }, 10);
}
export function checkAvailableSeats(data, callback) {
  setTimeout(() => {
    if (!data?.course || typeof data.course.seats !== "number") return callback(new TypeError("Invalid course data"));
    if (data.course.seats <= 0) return callback(new Error("Course is full"));
    callback(null, data);
  }, 10);
}
export function registerCourse(data, callback) {
  setTimeout(() => {
    const student = students.find(student => student.id === data?.student?.id);
    const course = courses.find(course => course.code === data?.course?.code);
    if (!student || !course) return callback(new TypeError("Invalid registration data"));
    if (student.registered.includes(course.code)) return callback(new Error("Student already registered"));
    // Dobara seats check: pichle check ke baad koi aur register ho sakta hai.
    if (course.seats <= 0) return callback(new Error("Course is full"));
    // Naye records banaye, purane objects mutate nahi kiye.
    students = students.map(item => item.id === student.id ? { ...item, registered: [...item.registered, course.code] } : item);
    courses = courses.map(item => item.code === course.code ? { ...item, seats: item.seats - 1 } : item);
    callback(null, { studentId: student.id, course: course.code, status: "REGISTERED" });
  }, 10);
}

export function register(id, code, callback) {
  loadStudent(id, (error, student) => {
    if (error) return callback(error);
    checkPrerequisites(student, code, (error, data) => {
      if (error) return callback(error);
      checkAvailableSeats(data, (error, checkedData) => {
        if (error) return callback(error);
        registerCourse(checkedData, callback);
      });
    });
  });
}
function showResult(error, confirmation) {
  if (error) console.log("Registration failed:", error.message);
  else console.log("Success:", confirmation);
}
console.log("Task 6");
register(101, "CS401", showResult);
register(999, "CS401", showResult);
register(102, "CS401", showResult);
register(101, "CS402", showResult);
register(103, "CS401", showResult);
register(101, "UNKNOWN", showResult);
// Har async boundary pe error check hai. Return ki wajah se callback dobara nahi chalta.
// Steps barhne se nesting gehri hoti hai aur error checks baar baar likhne parte hain.
