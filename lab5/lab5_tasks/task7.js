// Task 7: har service Promise return karti hai.
let students = [
  { id: 101, completed: ["CS301"], registered: [] },
  { id: 102, completed: [], registered: [] },
  { id: 103, completed: ["CS301"], registered: ["CS401"] }
];
let courses = [
  { code: "CS401", prerequisite: "CS301", seats: 2 },
  { code: "CS402", prerequisite: "CS301", seats: 0 }
];

export function getStudent(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = students.find(student => student.id === id);
      if (!student) return reject(new Error("Student does not exist"));
      resolve(student);
    }, 10);
  });
}
export function getCourse(code) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const course = courses.find(course => course.code === code);
      if (!course) return reject(new Error("Course does not exist"));
      resolve(course);
    }, 10);
  });
}
export function checkPrerequisites(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!data?.student || !Array.isArray(data.student.completed) || !data.course) return reject(new TypeError("Invalid prerequisite data"));
      if (!data.student.completed.includes(data.course.prerequisite)) return reject(new Error("Prerequisite not completed"));
      resolve(data);
    }, 10);
  });
}
export function checkSeats(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!data?.course || typeof data.course.seats !== "number") return reject(new TypeError("Invalid course data"));
      if (data.course.seats <= 0) return reject(new Error("Course is full"));
      resolve(data);
    }, 10);
  });
}
export function registerStudent(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = students.find(student => student.id === data?.student?.id);
      const course = courses.find(course => course.code === data?.course?.code);
      if (!student || !course) return reject(new TypeError("Invalid registration data"));
      if (student.registered.includes(course.code)) return reject(new Error("Student already registered"));
      if (course.seats <= 0) return reject(new Error("Course is full"));
      // Current state dobara check ki, phir copied records se update kiya.
      students = students.map(item => item.id === student.id ? { ...item, registered: [...item.registered, course.code] } : item);
      courses = courses.map(item => item.code === course.code ? { ...item, seats: item.seats - 1 } : item);
      resolve({ studentId: student.id, course: course.code, status: "REGISTERED" });
    }, 10);
  });
}
export function sendEmail(confirmation) {
  return new Promise(resolve => {
    setTimeout(() => resolve("Email sent to " + confirmation.studentId), 15);
  });
}
export function sendSMS(confirmation) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("SMS service unavailable for " + confirmation.studentId)), 10);
  });
}
export function writeAuditLog(confirmation) {
  return new Promise(resolve => {
    setTimeout(() => resolve("Audit saved for " + confirmation.studentId), 20);
  });
}

export function register(id, code) {
  return getStudent(id)
    .then(student => {
      // Return zaroori hai, warna next then course ka wait nahi karega.
      return getCourse(code).then(course => ({ student, course }));
    })
    .then(data => checkPrerequisites(data))
    .then(data => checkSeats(data))
    .then(data => registerStudent(data))
    .then(confirmation => {
      // Ye teen independent hain, aik fail ho to baqi ke results bhi chahiye.
      return Promise.allSettled([sendEmail(confirmation), sendSMS(confirmation), writeAuditLog(confirmation)])
        .then(results => {
          const names = ["Email", "SMS", "Audit"];
          const services = results.map((result, index) => ({
            service: names[index], status: result.status,
            detail: result.status === "fulfilled" ? result.value : result.reason.message
          }));
          return { confirmation, services };
        });
    })
    .catch(error => {
      console.log("Registration failed:", error.message);
      return { error: error.message };
    })
    .finally(() => console.log("Registration attempt finished:", id, code));
}

function courseServer(server, shouldFail, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) return reject(new Error(server + " failed"));
      resolve({ server, code: "CS401", title: "Advanced JavaScript" });
    }, delay);
  });
}
console.log("Task 7");
// any pehli success leta hai. race pehli failure pe bhi settle ho jata.
Promise.any([courseServer("Server A", true, 5), courseServer("Server B", false, 20)])
  .then(course => console.log("First successful server:", course))
  .catch(error => console.log("All servers failed:", error.message));
Promise.any([courseServer("Server A", true, 5), courseServer("Server B", true, 10)])
  .catch(error => console.log("Both servers down:", error.name));
// all yahan sahi hai: tamam independent test attempts ka result chahiye.
Promise.all([
  register(101, "CS401"), register(999, "CS401"), register(102, "CS401"),
  register(101, "CS402"), register(103, "CS401"), register(101, "UNKNOWN")
]).then(reports => reports.forEach(report => console.log(report)))
  .catch(error => console.log("Unexpected error:", error.message));
