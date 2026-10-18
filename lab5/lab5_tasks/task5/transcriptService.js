import Student from "./Student.js";
import { calculateGrade } from "./gradeUtils.js";

export function processTranscripts(rawData)
{
    if (typeof rawData !== "string")
    {
        throw new TypeError("JSON input must be a string");
    }
    const data = JSON.parse(rawData); // Malformed JSON par SyntaxError aayega.
    if (!Array.isArray(data))
    {
        throw new TypeError("Transcript data must be an array");
    }

    const ids = new Set();
    const students = [];
    for (const record of data)
    {
        if (!record || typeof record !== "object")
        {
            throw new TypeError("Invalid student record");
        }
        const validId = (typeof record.id === "number" && Number.isFinite(record.id))
            || (typeof record.id === "string" && record.id.trim() !== "");
        if (!validId)
        {
            throw new TypeError("Student ID is required");
        }
        const id = String(record.id).trim(); // 101 aur "101" ko same ID maana hai.
        if (ids.has(id))
        {
            throw new Error("Duplicate student ID: " + id);
        }
        ids.add(id);

        if (typeof record.name !== "string" || !record.name.trim() || !Array.isArray(record.courses))
        {
            throw new TypeError("Student name and courses are required");
        }
        for (const course of record.courses)
        {
            if (!course || typeof course.code !== "string" || !course.code.trim())
            {
                throw new TypeError("Course code is required");
            }
            calculateGrade(course.marks);
        }

        const student = new Student(record.id, record.name, record.courses);
        students.push(student.getTranscript());
    }

    const report = {
        totalStudents: students.length,
        students: students
    };
    return {
        report: report,
        json: JSON.stringify(report, null, 2)
    };
}
