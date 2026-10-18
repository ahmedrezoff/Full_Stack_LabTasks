import { calculateAverage, calculateGPA } from "./gradeUtils.js";

export default class Student
{
    constructor(id, name, courses)
    {
        this.id = id;
        this.name = name;
        this.courses = courses.map(function(course)
        {
            return { ...course };
        });
    }

    getTranscript()
    {
        return {
            id: this.id,
            name: this.name,
            average: calculateAverage(this.courses),
            gpa: calculateGPA(this.courses)
        };
    }
}
