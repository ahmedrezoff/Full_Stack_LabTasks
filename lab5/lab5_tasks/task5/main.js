// Task 5 - ES modules and JSON
import Student from "./Student.js";
import { calculateGrade as getGrade, calculateAverage, calculateGPA } from "./gradeUtils.js";
import { processTranscripts } from "./transcriptService.js";

const rawData = `[
    {
        "id": 101,
        "name": "Ali",
        "courses": [
            { "code": "CS301", "marks": 81 },
            { "code": "CS302", "marks": 74 }
        ]
    }
]`;

console.log("Ali's grade:", getGrade(81));
console.log("Empty courses:", calculateAverage([]), calculateGPA([]));
console.log("Default import:", new Student(102, "Sara", []).getTranscript());

// Sample ki copies se invalid cases banaye, poora data dobara nahi likha.
const sample = JSON.parse(rawData)[0];
const cases = [
    rawData,
    "[]",
    "{bad json",
    JSON.stringify([{ ...sample, id: null }]),
    JSON.stringify([sample, sample]),
    JSON.stringify([{ ...sample, courses: [{ code: "CS301", marks: -1 }] }]),
    JSON.stringify([{ ...sample, courses: [{ code: "CS301", marks: 101 }] }]),
    JSON.stringify([{ ...sample, courses: [{ marks: 70 }] }]),
    JSON.stringify([{ ...sample, courses: [{ code: "CS301", marks: 0 }, { code: "CS302", marks: 100 }] }])
];

for (const input of cases)
{
    try
    {
        const result = processTranscripts(input);
        console.log("Report:", result.report);
        console.log("JSON:", result.json);
    }
    catch (error)
    {
        console.log(error.name + ": " + error.message);
    }
    finally
    {
        console.log("Transcript attempt finished"); // Har attempt ke baad chalega.
    }
}
