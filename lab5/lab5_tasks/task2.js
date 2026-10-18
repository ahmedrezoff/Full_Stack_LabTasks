// Task 2 - Academic results
function getGrade(marks)
{
    if (typeof marks !== "number" || !Number.isFinite(marks) || marks < 0 || marks > 100)
    {
        throw new RangeError("Marks must be a number from 0 to 100");
    }

    // Sheet mein points nahi diye, is liye 4-point scale use kiya.
    if (marks >= 85)
    {
        return { grade: "A", gradePoints: 4 };
    }
    else if (marks >= 80)
    {
        return { grade: "A-", gradePoints: 3.67 };
    }
    else if (marks >= 75)
    {
        return { grade: "B+", gradePoints: 3.33 };
    }
    else if (marks >= 70)
    {
        return { grade: "B", gradePoints: 3 };
    }
    else if (marks >= 65)
    {
        return { grade: "B-", gradePoints: 2.67 };
    }
    else if (marks >= 60)
    {
        return { grade: "C+", gradePoints: 2.33 };
    }
    else if (marks >= 50)
    {
        return { grade: "C", gradePoints: 2 };
    }
    else
    {
        return { grade: "F", gradePoints: 0 };
    }
}

function validMarks(student)
{
    return student !== null && typeof student === "object"
        && typeof student.marks === "number" && Number.isFinite(student.marks)
        && student.marks >= 0 && student.marks <= 100;
}

function analyzeResults(results)
{
    if (!Array.isArray(results))
    {
        throw new TypeError("Results must be an array");
    }

    const valid = results.filter(function(student)
    {
        return validMarks(student) && typeof student.name === "string"
            && student.name.trim() !== "" && typeof student.department === "string"
            && student.department.trim() !== "";
    });
    const processed = valid.map(function(student)
    {
        let status = "FAIL";
        if (student.marks >= 50)
        {
            status = "PASS";
        }
        return { ...student, ...getGrade(student.marks), status: status };
    });

    // sort original array ko change karta hai, is liye pehle copy banayi.
    const ranked = processed.slice().sort(function(a, b)
    {
        if (a.marks === b.marks)
        {
            return a.name.localeCompare(b.name);
        }
        return b.marks - a.marks;
    });
    const total = processed.reduce(function(sum, student)
    {
        return sum + student.marks;
    }, 0);
    const average = processed.length > 0 ? total / processed.length : null;
    const departments = Object.create(null); // Naya department bhi khud add hoga.

    processed.forEach(function(student)
    {
        if (!departments[student.department])
        {
            departments[student.department] = {
                students: 0,
                average: 0,
                highest: 0,
                passed: 0
            };
        }
        const stats = departments[student.department];
        stats.students++;
        stats.average += student.marks;
        stats.highest = Math.max(stats.highest, student.marks);
        if (student.marks >= 50)
        {
            stats.passed++;
        }
    });
    Object.values(departments).forEach(function(stats)
    {
        stats.average = stats.average / stats.students;
    });

    return {
        processed: processed,
        invalidCount: results.length - valid.length,
        ranked: ranked,
        average: average,
        departments: departments,
        firstAbove85: processed.find(function(student)
        {
            return student.marks > 85;
        }),
        firstFailedIndex: results.findIndex(function(student)
        {
            return validMarks(student) && student.marks < 50;
        }),
        anyFailed: processed.some(function(student)
        {
            return student.marks < 50;
        }),
        allMarksValid: results.every(validMarks),
        aboveAverage: processed.filter(function(student)
        {
            return student.marks > average;
        }),
        topThreeNames: ranked.slice(0, 3).map(function(student)
        {
            return student.name;
        })
    };
}

const results = [
    {
        id: 1,
        name: "Ali",
        department: "CS",
        course: "FSWD",
        marks: 82
    },
    {
        id: 2,
        name: "Sara",
        department: "CS",
        course: "FSWD",
        marks: 91
    },
    {
        id: 3,
        name: "Usman",
        department: "SE",
        course: "FSWD",
        marks: 47
    },
    {
        id: 4,
        name: "Hina",
        department: "AI",
        course: "FSWD",
        marks: 73
    },
    {
        id: 5,
        name: "Ahmed",
        department: "SE",
        course: "FSWD",
        marks: 64
    },
    {
        id: 6,
        name: "Zoya",
        department: "AI",
        course: "FSWD",
        marks: 91
    }
];

console.dir(analyzeResults(results), { depth: null });
// 0, 100, invalid marks aur naya department check kiya.
console.dir(analyzeResults([
    { ...results[0], department: "DS", marks: 0 },
    { ...results[1], department: "DS", marks: 100 },
    { ...results[2], marks: 101 }
]), { depth: null });
console.log("Empty list:", analyzeResults([]));
