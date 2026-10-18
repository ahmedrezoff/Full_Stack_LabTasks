// Task 4: parent ki common cheezen subclasses mein reuse hoti hain.
export class Person {
  constructor(name, email) {
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) throw new TypeError("Name and email are required");
    this.name = name; // this us object ko refer karta hai jo new se bana.
    this.email = email;
  }
  introduce() {
    return "I am " + this.name + ". Email: " + this.email;
  }
}

export class Student extends Person {
  constructor(name, email, rollNo, marks) {
    super(name, email); // Parent constructor pehle chalta hai.
    if (typeof rollNo !== "string" || !rollNo.trim()) throw new TypeError("Roll number required");
    if (typeof marks !== "number" || !Number.isFinite(marks)) throw new TypeError("Marks must be a number");
    if (marks < 0 || marks > 100) throw new RangeError("Marks must be 0 to 100");
    this.rollNo = rollNo;
    this.marks = marks;
  }
  introduce() {
    return super.introduce() + ". Student roll number: " + this.rollNo;
  }
  getResult() {
    return { rollNo: this.rollNo, marks: this.marks, status: this.marks >= 50 ? "PASS" : "FAIL" };
  }
}

export class FacultyMember extends Person {
  constructor(name, email, employeeId, department) {
    super(name, email);
    if (typeof employeeId !== "string" || !employeeId.trim() || typeof department !== "string" || !department.trim()) throw new TypeError("Employee ID and department required");
    this.employeeId = employeeId;
    this.department = department;
  }
  introduce() {
    return super.introduce() + ". Faculty: " + this.employeeId + ", " + this.department;
  }
}

const student = new Student("Ali", "ali@au.edu.pk", "CS101", 82);
const users = [student, new Student("Sara", "sara@au.edu.pk", "CS102", 50), new FacultyMember("Dr. Hina", "hina@au.edu.pk", "F01", "CS"), new FacultyMember("Dr. Usman", "usman@au.edu.pk", "F02", "SE")];
console.log("Task 4");
// Runtime polymorphism: har object ka apna overridden method chalega.
users.forEach(user => console.log(user.introduce()));
console.log(student.getResult(), users[1].getResult());
console.log("Student and Person:", student instanceof Student, student instanceof Person);
console.log("Faculty:", users[2] instanceof FacultyMember);
const guest = { name: "Dr. Ahmed", email: "ahmed@example.com" };
console.log(Person.prototype.introduce.call(guest)); // call mein this guest hoga.
const fn = student.introduce;
try {
  fn(); // ES modules strict hain, detached call mein this undefined hai.
} catch (error) {
  console.log("Detached method:", error.name, error.message);
}
const boundIntroduction = student.introduce.bind(student);
console.log("Bound:", boundIntroduction()); // bind this ko student pe fix karta hai.
try {
  new Student("Ali", "ali@au.edu.pk", "CS103", -1);
} catch (error) {
  console.log("Invalid:", error.message);
}
