// Task 8 - Concurrent dashboard and timeout
const apiData = {
    "/users": [
        {
            id: 1,
            name: "Ali",
            department: "CS"
        },
        {
            id: 2,
            name: "Sara",
            department: "SE"
        }
    ],
    "/courses": [
        {
            code: "CS301"
        }
    ],
    "/results": [
        {
            studentId: 1,
            code: "CS301",
            marks: 85
        },
        {
            studentId: 2,
            code: "CS301",
            marks: 40
        }
    ]
};

async function fakeFetch(url, options = {})
{
    const signal = options.signal;
    let delay = 10;
    if (url === "/slow")
    {
        delay = 150;
    }

    await new Promise(function(resolve, reject)
    {
        if (signal?.aborted)
        {
            return reject(new DOMException("Request aborted", "AbortError"));
        }
        const timer = setTimeout(function()
        {
            signal?.removeEventListener("abort", abortRequest);
            resolve();
        }, delay);

        function abortRequest()
        {
            clearTimeout(timer);
            signal.removeEventListener("abort", abortRequest);
            reject(new DOMException("Request aborted", "AbortError"));
        }
        signal?.addEventListener("abort", abortRequest, { once: true });
    });

    if (url === "/network-error")
    {
        throw new TypeError("Network connection failed");
    }
    let status = 200;
    if (url === "/server-error")
    {
        status = 500;
    }
    else if (!Object.hasOwn(apiData, url) && url !== "/slow" && url !== "/invalid-json")
    {
        status = 404;
    }

    return {
        ok: status === 200,
        status: status,
        async json()
        {
            if (url === "/invalid-json")
            {
                throw new SyntaxError("Invalid JSON response");
            }
            return JSON.parse(JSON.stringify(apiData[url] ?? []));
        }
    };
}

async function getJSON(url, fetchImplementation)
{
    const response = await fetchImplementation(url);
    if (!response.ok)
    {
        const error = new Error("HTTP " + response.status + " for " + url);
        error.name = "HTTPError";
        throw error;
    }
    return await response.json(); // Network aur JSON errors bhi caller tak jayenge.
}

async function fetchWithTimeout(url, milliseconds, fetchImplementation = fakeFetch)
{
    if (!Number.isFinite(milliseconds) || milliseconds < 0)
    {
        throw new RangeError("Invalid timeout");
    }
    const controller = new AbortController();
    const timer = setTimeout(function()
    {
        controller.abort();
    }, milliseconds);

    try
    {
        return await getJSON(url, function(requestedURL)
        {
            return fetchImplementation(requestedURL, { signal: controller.signal });
        });
    }
    catch (error)
    {
        if (controller.signal.aborted && error.name === "AbortError")
        {
            const timeoutError = new Error("Request timed out: " + url);
            timeoutError.name = "TimeoutError";
            throw timeoutError;
        }
        throw error;
    }
    finally
    {
        clearTimeout(timer); // Success aur failure dono mein timer saaf hoga.
    }
}

async function loadDashboard(fetchImplementation = fakeFetch)
{
    // Teenon calls pehle start hongi, phir un sab ka wait hoga.
    const [users, courses, results] = await Promise.all([
        getJSON("/users", fetchImplementation),
        getJSON("/courses", fetchImplementation),
        getJSON("/results", fetchImplementation)
    ]);
    if (!Array.isArray(users) || !Array.isArray(courses) || !Array.isArray(results))
    {
        throw new TypeError("API data must contain arrays");
    }

    const ids = new Set();
    for (const user of users)
    {
        if (!user || user.id === null || user.id === undefined || ids.has(user.id)
            || typeof user.name !== "string" || !user.name.trim()
            || typeof user.department !== "string" || !user.department.trim())
        {
            throw new TypeError("Invalid or duplicate student");
        }
        ids.add(user.id);
    }
    let totalMarks = 0;
    for (const result of results)
    {
        if (!result || !ids.has(result.studentId) || !courses.some(function(course)
        {
            return course && course.code === result.code;
        }))
        {
            throw new TypeError("Unknown student or course");
        }
        if (typeof result.marks !== "number" || !Number.isFinite(result.marks)
            || result.marks < 0 || result.marks > 100)
        {
            throw new RangeError("Marks must be a number from 0 to 100");
        }
        totalMarks += result.marks;
    }

    let highest = null;
    let failedStudents = 0;
    const departments = Object.create(null);
    for (const user of users)
    {
        const marks = results.filter(function(result)
        {
            return result.studentId === user.id;
        });
        const total = marks.reduce(function(sum, result)
        {
            return sum + result.marks;
        }, 0);
        const average = marks.length > 0 ? total / marks.length : null;
        const failed = marks.some(function(result)
        {
            return result.marks < 50;
        });

        // Multiple courses hon to student ke average se highest decide hoga.
        if (average !== null && (highest === null || average > highest.average))
        {
            highest = { id: user.id, name: user.name, average: average };
        }
        if (!departments[user.department])
        {
            departments[user.department] = {
                students: 0,
                total: 0,
                results: 0,
                failed: 0
            };
        }
        const stats = departments[user.department];
        stats.students++;
        stats.total += total;
        stats.results += marks.length;
        if (failed)
        {
            failedStudents++; // Aik student ko sirf aik baar count kiya.
            stats.failed++;
        }
    }
    for (const stats of Object.values(departments))
    {
        stats.average = stats.results > 0 ? stats.total / stats.results : null;
        delete stats.total;
        delete stats.results;
    }

    return {
        totalStudents: users.length,
        totalCourses: courses.length,
        overallAverage: results.length > 0 ? totalMarks / results.length : null,
        highestPerformingStudent: highest,
        failedStudents: failedStudents,
        departments: departments
    };
}

async function main()
{
    console.dir(await loadDashboard(), { depth: null });
    const urls = ["/users", "/missing", "/server-error", "/network-error", "/invalid-json", "/slow"];
    for (const url of urls)
    {
        try
        {
            console.log(url, await fetchWithTimeout(url, 50));
        }
        catch (error)
        {
            console.log(url, error.name, error.message);
        }
    }
    console.log("Enough time:", await fetchWithTimeout("/slow", 250));
    // Khali API arrays wali boundary.
    console.log("Empty dashboard:", await loadDashboard(async function()
    {
        return {
            ok: true,
            json: async function()
            {
                return [];
            }
        };
    }));
}

main().catch(function(error)
{
    console.error("Unexpected error:", error);
    process.exitCode = 1;
});
