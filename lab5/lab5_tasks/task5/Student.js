import { calculateAverage, calculateGPA, calculateGrade } from "./gradeUtils.js";

export default class Student {
  constructor(id, name, courses) {
    this.id = id;
    this.name = name;
    this.courses = courses.map(course => ({ ...course }));
  }
  getTranscript() {
    return {
      id: this.id,
      name: this.name,
      courses: this.courses.map(course => ({ ...course, ...calculateGrade(course.marks) })),
      average: calculateAverage(this.courses),
      gpa: calculateGPA(this.courses)
    };
  }
}
