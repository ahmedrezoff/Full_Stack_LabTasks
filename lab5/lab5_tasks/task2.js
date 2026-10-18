// Task 2: map/filter waghera se naya data banega, original change nahi hoga.
export function getGrade(marks) {
  if (typeof marks !== "number" || !Number.isFinite(marks)) throw new TypeError("Marks must be a number");
  if (marks < 0 || marks > 100) throw new RangeError("Marks must be 0 to 100");
  // Grade points sheet mein nahi diye, standard 4-point scale use kiya.
  if (marks >= 85) return { grade: "A", gradePoints: 4 };
  if (marks >= 80) return { grade: "A-", gradePoints: 3.67 };
  if (marks >= 75) return { grade: "B+", gradePoints: 3.33 };
  if (marks >= 70) return { grade: "B", gradePoints: 3 };
  if (marks >= 65) return { grade: "B-", gradePoints: 2.67 };
  if (marks >= 60) return { grade: "C+", gradePoints: 2.33 };
  if (marks >= 50) return { grade: "C", gradePoints: 2 };
  return { grade: "F", gradePoints: 0 };
}

export function analyzeResults(results) {
  if (!Array.isArray(results)) throw new TypeError("Results must be an array");
  const validRange = results.every(student => student && typeof student.marks === "number" && Number.isFinite(student.marks) && student.marks >= 0 && student.marks <= 100);
  const invalid = results.filter(student => !student || typeof student.marks !== "number" || !Number.isFinite(student.marks) || student.marks < 0 || student.marks > 100 || typeof student.name !== "string" || !student.name.trim() || typeof student.department !== "string" || !student.department.trim());
  const processed = results.filter(student => !invalid.includes(student)).map(student => ({
    ...student, ...getGrade(student.marks), status: student.marks >= 50 ? "PASS" : "FAIL"
  }));
  const ranked = [...processed].sort((a, b) => b.marks - a.marks || a.name.localeCompare(b.name));
  const average = processed.length ? processed.reduce((sum, student) => sum + student.marks, 0) / processed.length : null;
  const departments = Object.create(null); // Department names ke liye simple dictionary.
  processed.forEach(student => {
    const name = student.department;
    if (!departments[name]) departments[name] = { students: 0, average: 0, highest: 0, passed: 0 };
    const stats = departments[name];
    stats.students++;
    stats.average += student.marks;
    stats.highest = Math.max(stats.highest, student.marks);
    if (student.status === "PASS") stats.passed++;
  });
  Object.values(departments).forEach(stats => { stats.average /= stats.students; });
  return {
    processed, ranked, departments, average, invalid,
    firstAbove85: processed.find(student => student.marks > 85) ?? null,
    // Index original input array ka hai.
    firstFailedIndex: results.findIndex(student => student && typeof student.marks === "number" && student.marks >= 0 && student.marks < 50),
    anyFailed: processed.some(student => student.status === "FAIL"),
    allMarksValid: validRange,
    aboveAverage: processed.filter(student => student.marks > average),
    topThreeNames: ranked.slice(0, 3).map(student => student.name)
  };
}

const results = [
  { id: 1, name: "Ali", department: "CS", course: "FSWD", marks: 82 },
  { id: 2, name: "Sara", department: "CS", course: "FSWD", marks: 91 },
  { id: 3, name: "Usman", department: "SE", course: "FSWD", marks: 47 },
  { id: 4, name: "Hina", department: "AI", course: "FSWD", marks: 73 },
  { id: 5, name: "Ahmed", department: "SE", course: "FSWD", marks: 64 },
  { id: 6, name: "Zoya", department: "AI", course: "FSWD", marks: 91 }
];
console.log("Task 2", analyzeResults(results));
console.log("Original order:", results.map(student => student.name));
console.log("New department and invalid marks:", analyzeResults([
  { id: 7, name: "Ayesha", department: "DS", marks: 100 },
  { id: 8, name: "Bilal", department: "DS", marks: 0 },
  { id: 9, name: "Invalid", department: "CS", marks: 101 }
]));
console.log("Empty:", analyzeResults([]));
