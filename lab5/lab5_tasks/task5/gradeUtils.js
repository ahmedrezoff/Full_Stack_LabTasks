export function calculateGrade(marks) {
  if (typeof marks !== "number" || !Number.isFinite(marks)) throw new TypeError("Marks must be a number");
  if (marks < 0 || marks > 100) throw new RangeError("Marks must be 0 to 100");
  // Har grade ke points 4-point scale par rakhe hain.
  if (marks >= 85) return { grade: "A", gradePoints: 4 };
  if (marks >= 80) return { grade: "A-", gradePoints: 3.67 };
  if (marks >= 75) return { grade: "B+", gradePoints: 3.33 };
  if (marks >= 70) return { grade: "B", gradePoints: 3 };
  if (marks >= 65) return { grade: "B-", gradePoints: 2.67 };
  if (marks >= 60) return { grade: "C+", gradePoints: 2.33 };
  if (marks >= 50) return { grade: "C", gradePoints: 2 };
  return { grade: "F", gradePoints: 0 };
}

export function calculateAverage(courses) {
  if (!Array.isArray(courses)) throw new TypeError("Courses must be an array");
  // Khali transcript ka average aur GPA 0 maana hai.
  if (courses.length === 0) return 0;
  courses.forEach(course => calculateGrade(course?.marks));
  return courses.reduce((sum, course) => sum + course.marks, 0) / courses.length;
}

export function calculateGPA(courses) {
  if (!Array.isArray(courses)) throw new TypeError("Courses must be an array");
  if (courses.length === 0) return 0;
  // Credit hours nahi diye, is liye har course ka equal weight hai.
  return courses.reduce((sum, course) => sum + calculateGrade(course?.marks).gradePoints, 0) / courses.length;
}
