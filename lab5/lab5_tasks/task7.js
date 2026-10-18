// Task 7 - Promise-based registration
const students = [
    {
        id: 101,
        completed: ["CS301"],
        registered: []
    },
    {
        id: 102,
        completed: [],
        registered: []
    },
    {
        id: 103,
        completed: ["CS301"],
        registered: ["CS401"]
    }
];
const courses = [
    {
        code: "CS401",
        prerequisite: "CS301",
        seats: 1
    },
    {
        code: "CS402",
        prerequisite: "CS301",
        seats: 0
    }
];

function getStudent(id)
{
    const student = students.find(function(item)
    {
        return item.id === id;
    });
    if (!student)
    {
        return Promise.reject(new Error("Student does not exist"));
    }
    return Promise.resolve(student);
}

function getCourse(code)
{
    const course = courses.find(function(item)
    {
        return item.code === code;
    });
    if (!course)
    {
        return Promise.reject(new Error("Course does not exist"));
    }
    return Promise.resolve(course);
}

function checkPrerequisites(data)
{
    if (!data?.student || !Array.isArray(data.student.completed) || !data.course)
    {
        return Promise.reject(new TypeError("Invalid prerequisite data"));
    }
    if (!data.student.completed.includes(data.course.prerequisite))
    {
        return Promise.reject(new Error("Prerequisite not completed"));
    }
    return Promise.resolve(data);
}

function checkSeats(data)
{
    if (!data?.course || typeof data.course.seats !== "number")
    {
        return Promise.reject(new TypeError("Invalid course data"));
    }
    if (data.course.seats <= 0)
    {
        return Promise.reject(new Error("Course is full"));
    }
    return Promise.resolve(data);
}

function registerStudent(data)
{
    if (!data?.student || !Array.isArray(data.student.registered) || !data.course)
    {
        return Promise.reject(new TypeError("Invalid registration data"));
    }
    if (data.student.registered.includes(data.course.code))
    {
        return Promise.reject(new Error("Student already registered"));
    }
    return Promise.resolve({
        studentId: data.student.id,
        course: data.course.code,
        status: "REGISTERED"
    });
}

function sendEmail(confirmation)
{
    return Promise.resolve("Email sent to " + confirmation.studentId);
}

function sendSMS(confirmation)
{
    return Promise.reject(new Error("SMS failed for " + confirmation.studentId));
}

function writeAuditLog(confirmation)
{
    return Promise.resolve("Audit saved for " + confirmation.studentId);
}

function register(id, code)
{
    return getStudent(id)
        .then(function(student)
        {
            return getCourse(code).then(function(course)
            {
                return { student: student, course: course };
            });
        })
        .then(checkPrerequisites)
        .then(checkSeats)
        .then(registerStudent)
        .then(function(confirmation)
        {
            // allSettled se aik service fail hone par bhi sab ke results milenge.
            return Promise.allSettled([
                sendEmail(confirmation),
                sendSMS(confirmation),
                writeAuditLog(confirmation)
            ]).then(function(results)
            {
                const names = ["Email", "SMS", "Audit"];
                const services = results.map(function(result, index)
                {
                    return { service: names[index], status: result.status };
                });
                return { confirmation: confirmation, services: services };
            });
        })
        .catch(function(error)
        {
            return { error: error.message };
        })
        .finally(function()
        {
            console.log("Registration attempt finished:", id, code);
        });
}
// Har then ka return agle step ko data aur Promise ka wait deta hai.

function courseServer(name, shouldFail, delay)
{
    return new Promise(function(resolve, reject)
    {
        setTimeout(function()
        {
            if (shouldFail)
            {
                return reject(new Error(name + " is down"));
            }
            resolve({ server: name, code: "CS401" });
        }, delay);
    });
}

// any pehli success lega. race pehli failure par bhi ruk sakta hai.
Promise.any([
    courseServer("Server A", true, 5),
    courseServer("Server B", false, 20)
]).then(function(course)
{
    console.log("First successful server:", course);
}).catch(function(error)
{
    console.log("All servers failed:", error.message);
});

// all se independent test attempts ke tamam results ka wait kiya.
Promise.all([
    register(101, "CS401"),
    register(999, "CS401"),
    register(102, "CS401"),
    register(101, "CS402"),
    register(103, "CS401"),
    register(101, "UNKNOWN")
]).then(function(reports)
{
    console.dir(reports, { depth: null });
}).catch(function(error)
{
    console.log("Unexpected error:", error.message);
});
