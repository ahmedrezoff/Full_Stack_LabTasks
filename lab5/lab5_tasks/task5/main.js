import Student from "./Student.js";
import { calculateGrade as grade, calculateAverage, calculateGPA } from "./gradeUtils.js";
import { processTranscripts } from "./transcriptService.js";

const rawData = '[{"id":101,"name":"Ali","courses":[{"code":"CS301","marks":81},{"code":"CS302","marks":74}]}]';
console.log("Task 5", grade(81), calculateAverage([]), calculateGPA([]));
console.log("Default import:", new Student(102, "Sara", []).getTranscript());
const cases = [
  rawData,
  '[]',
  '[{"id":103,"name":"Boundary","courses":[{"code":"CS1","marks":0},{"code":"CS2","marks":100}]}]',
  '{bad json',
  '[{"name":"Missing ID","courses":[]}]',
  '[{"id":1,"name":"Ali","courses":[]},{"id":1,"name":"Sara","courses":[]}]',
  '[{"id":1,"name":"Ali","courses":[{"code":"CS301","marks":101}]}]',
  '[{"id":1,"name":"Ali","courses":[{"code":"CS301","marks":-1}]}]',
  '[{"id":1,"name":"Ali","courses":[{"marks":70}]}]',
  '[{"id":1,"name":"Ali","courses":[{"code":"CS301","marks":"70"}]}]'
];
for (const input of cases) {
  try {
    const result = processTranscripts(input);
    console.log("Report:", result.report);
    console.log("JSON:", result.json);
  } catch (error) {
    console.log(error.name + ": " + error.message);
  } finally {
    console.log("Transcript attempt finished"); // Success/failure dono mein chalega.
  }
}
