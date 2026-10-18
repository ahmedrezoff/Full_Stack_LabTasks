// Task 6 - Error-first callbacks
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

function loadStudent(id, callback)
{
    setTimeout(function()
    {
        const student = students.find(function(item)
        {
            return item.id === id;
        });
        if (!student)
        {
            return callback(new Error("Student does not exist"));
        }
        callback(null, student);
    }, 10);
}

function checkPrerequisites(student, code, callback)
{
    setTimeout(function()
    {
        if (!student || !Array.isArray(student.completed))
        {
            return callback(new TypeError("Invalid student data"));
        }
        const course = courses.find(function(item)
        {
            return item.code === code;
        });
        if (!course)
        {
            return callback(new Error("Course does not exist"));
        }
        if (!student.completed.includes(course.prerequisite))
        {
            return callback(new Error("Prerequisite not completed"));
        }
        callback(null, { student: student, course: course });
    }, 10);
}

function checkAvailableSeats(data, callback)
{
    setTimeout(function()
    {
        if (!data?.course || typeof data.course.seats !== "number")
        {
            return callback(new TypeError("Invalid course data"));
        }
        if (data.course.seats <= 0)
        {
            return callback(new Error("Course is full"));
        }
        callback(null, data);
    }, 10);
}

function registerCourse(data, callback)
{
    setTimeout(function()
    {
        if (!data?.student || !Array.isArray(data.student.registered) || !data.course)
        {
            return callback(new TypeError("Invalid registration data"));
        }
        if (data.student.registered.includes(data.course.code))
        {
            return callback(new Error("Student already registered"));
        }
        // Confirmation banayi hai, source records ko change nahi kiya.
        callback(null, {
            studentId: data.student.id,
            course: data.course.code,
            status: "REGISTERED"
        });
    }, 10);
}

function register(id, code, callback)
{
    loadStudent(id, function(error, student)
    {
        if (error)
        {
            return callback(error);
        }
        checkPrerequisites(student, code, function(error, data)
        {
            if (error)
            {
                return callback(error);
            }
            checkAvailableSeats(data, function(error, checkedData)
            {
                if (error)
                {
                    return callback(error);
                }
                registerCourse(checkedData, callback);
            });
        });
    });
}

function showResult(error, result)
{
    if (error)
    {
        console.log("Failed:", error.message);
    }
    else
    {
        console.log("Success:", result);
    }
}

register(101, "CS401", showResult);
register(999, "CS401", showResult);
register(102, "CS401", showResult);
register(101, "CS402", showResult); // Zero seats wali boundary.
register(103, "CS401", showResult);
register(101, "UNKNOWN", showResult);
// Return se error ke baad agla step nahi chalta aur callback aik baar aata hai.
// Steps barhne se nesting aur repeated error checks maintain karna mushkil hota hai.
