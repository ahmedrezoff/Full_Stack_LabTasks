export function calculateGrade(marks)
{
    if (typeof marks !== "number" || !Number.isFinite(marks))
    {
        throw new TypeError("Marks must be a number");
    }
    if (marks < 0 || marks > 100)
    {
        throw new RangeError("Marks must be 0 to 100");
    }

    // Equal credit hours aur 4-point scale assume ki hai.
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

export function calculateAverage(courses)
{
    if (!Array.isArray(courses))
    {
        throw new TypeError("Courses must be an array");
    }
    let total = 0;
    for (const course of courses)
    {
        calculateGrade(course?.marks); // Marks ki validation bhi ho jayegi.
        total += course.marks;
    }
    return courses.length > 0 ? total / courses.length : 0;
}

export function calculateGPA(courses)
{
    if (!Array.isArray(courses))
    {
        throw new TypeError("Courses must be an array");
    }
    let totalPoints = 0;
    for (const course of courses)
    {
        totalPoints += calculateGrade(course?.marks).gradePoints;
    }
    return courses.length > 0 ? totalPoints / courses.length : 0;
}
