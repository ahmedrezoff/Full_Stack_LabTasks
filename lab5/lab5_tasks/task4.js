// Task 4 - University users
class Person
{
    constructor(name, email)
    {
        if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim())
        {
            throw new TypeError("Name and email are required");
        }
        this.name = name; // this new se banne wale object ko refer karta hai.
        this.email = email;
    }

    introduce()
    {
        return "I am " + this.name + ". Email: " + this.email;
    }
}

class Student extends Person
{
    constructor(name, email, rollNo, marks)
    {
        super(name, email); // Parent constructor se common fields aa gayi hain.
        if (typeof rollNo !== "string" || !rollNo.trim())
        {
            throw new TypeError("Roll number is required");
        }
        if (typeof marks !== "number" || !Number.isFinite(marks) || marks < 0 || marks > 100)
        {
            throw new RangeError("Marks must be 0 to 100");
        }
        this.rollNo = rollNo;
        this.marks = marks;
    }

    introduce()
    {
        return super.introduce() + ". Student roll number: " + this.rollNo;
    }

    getResult()
    {
        if (this.marks >= 50)
        {
            return "PASS";
        }
        else
        {
            return "FAIL";
        }
    }
}

class FacultyMember extends Person
{
    constructor(name, email, employeeId, department)
    {
        super(name, email);
        if (typeof employeeId !== "string" || !employeeId.trim()
            || typeof department !== "string" || !department.trim())
        {
            throw new TypeError("Employee ID and department are required");
        }
        this.employeeId = employeeId;
        this.department = department;
    }

    introduce()
    {
        return super.introduce() + ". Faculty ID: " + this.employeeId + ", department: " + this.department;
    }
}

const student = new Student("Ali", "ali@au.edu.pk", "CS101", 82);
const users = [
    student,
    new Student("Sara", "sara@au.edu.pk", "CS102", 50),
    new FacultyMember("Dr. Hina", "hina@au.edu.pk", "F01", "CS"),
    new FacultyMember("Dr. Usman", "usman@au.edu.pk", "F02", "SE")
];

// Polymorphism: actual object ke mutabiq overridden method chalega.
users.forEach(function(user)
{
    console.log(user.introduce());
});
console.log("Results:", student.getResult(), users[1].getResult());
console.log("Student:", student instanceof Student);
console.log("Person:", student instanceof Person);
console.log("Faculty:", users[2] instanceof FacultyMember);

const guest = {
    name: "Dr. Ahmed",
    email: "ahmed@example.com"
};
console.log(Person.prototype.introduce.call(guest)); // call mein this guest hai.

const fn = student.introduce;
try
{
    fn(); // Detached method mein this undefined hai.
}
catch (error)
{
    console.log("Detached method:", error.name);
}

const boundFn = student.introduce.bind(student);
console.log(boundFn()); // bind ne this ko student ke saath fix kar diya.
try
{
    new Student("Ali", "ali@au.edu.pk", "CS103", -1);
}
catch (error)
{
    console.log("Invalid student:", error.message);
}
