import Student from "./Student.js";
import { calculateGrade } from "./gradeUtils.js";

export function processTranscripts(rawData) {
  if (typeof rawData !== "string") throw new TypeError("JSON input must be a string");
  // Malformed JSON pe JSON.parse khud SyntaxError throw karega.
  const data = JSON.parse(rawData);
  if (!Array.isArray(data)) throw new TypeError("Transcript data must be an array");
  const ids = new Set();
  const students = data.map(item => {
    if (!item || typeof item !== "object") throw new TypeError("Invalid student");
    if (!((typeof item.id === "number" && Number.isFinite(item.id)) || (typeof item.id === "string" && item.id.trim()))) throw new TypeError("Student ID required");
    // 101 aur '101' ko aik hi ID maana hai.
    const key = String(item.id).trim();
    if (ids.has(key)) throw new Error("Duplicate student ID: " + key);
    ids.add(key);
    if (typeof item.name !== "string" || !item.name.trim()) throw new TypeError("Student name required");
    if (!Array.isArray(item.courses)) throw new TypeError("Courses must be an array");
    item.courses.forEach(course => {
      if (!course || typeof course.code !== "string" || !course.code.trim()) throw new TypeError("Course code required");
      calculateGrade(course.marks); // Invalid type aur range yahan check hoti hai.
    });
    return new Student(item.id, item.name, item.courses).getTranscript();
  });
  const report = { totalStudents: students.length, students };
  return { report, json: JSON.stringify(report, null, 2) };
}
