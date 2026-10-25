// Task 1: Sir ke memory API ko chaar modules ke CRUD tak extend kiya.
const http = require("node:http");

function fail(status, message)
{
    const error = new Error(message);
    error.status = status;
    throw error;
}

function sendJSON(res, status, value)
{
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(value));
}

async function readBody(req)
{
    const contentType = String(req.headers["content-type"] || "").split(";")[0].trim();
    if (contentType.toLowerCase() !== "application/json")
    {
        fail(415, "Content-Type must be application/json");
    }

    const chunks = [];
    let size = 0;
    for await (const chunk of req)
    {
        size += chunk.length;
        if (size > 65536)
        {
            fail(413, "Request body too large");
        }
        chunks.push(chunk);
    }

    let value;
    try
    {
        value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    }
    catch
    {
        fail(400, "Invalid JSON");
    }

    if (!value || typeof value !== "object" || Array.isArray(value))
    {
        fail(400, "A JSON object is required");
    }
    return value;
}

function positiveId(value)
{
    const id = Number(value);
    if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(id))
    {
        fail(400, "ID must be a positive integer");
    }
    return id;
}

function validate(resource, body, students)
{
    const fields = {
        students: ["name", "department"],
        teachers: ["name", "subject"],
        attendance: ["studentId", "date", "status"],
        marks: ["studentId", "subject", "obtainedMarks", "totalMarks"]
    };

    // ID server banata hai; client sirf allowed fields bhej sakta hai.
    const allowed = fields[resource];
    if (Object.keys(body).some(key => !allowed.includes(key)))
    {
        fail(400, "Allowed fields: " + allowed.join(", "));
    }

    const result = {};
    for (const field of allowed)
    {
        if (["studentId", "obtainedMarks", "totalMarks"].includes(field))
        {
            if (typeof body[field] !== "number" || !Number.isFinite(body[field]))
            {
                fail(400, field + " must be a number");
            }
            result[field] = body[field];
        }
        else
        {
            if (typeof body[field] !== "string" || body[field].trim() === "")
            {
                fail(400, field + " is required");
            }
            result[field] = body[field].trim();
        }
    }

    if (resource === "attendance" || resource === "marks")
    {
        positiveId(result.studentId);
        if (!students.some(student => student.id === result.studentId))
        {
            fail(404, "Student not found");
        }
    }

    if (resource === "attendance")
    {
        const date = new Date(result.date + "T00:00:00Z");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(result.date)
            || Number.isNaN(date.getTime())
            || date.toISOString().slice(0, 10) !== result.date)
        {
            fail(400, "Use a valid date in YYYY-MM-DD format");
        }
        if (!["present", "absent"].includes(result.status))
        {
            fail(400, "Status must be present or absent");
        }
    }

    if (resource === "marks")
    {
        if (result.totalMarks <= 0 || result.obtainedMarks < 0
            || result.obtainedMarks > result.totalMarks)
        {
            fail(400, "Total marks must be positive; obtained marks must be between 0 and total");
        }
    }
    return result;
}

function createApp()
{
    // Ye arrays RAM mein hain. Server restart hone par records khatam ho jayenge.
    const data = { students: [], teachers: [], attendance: [], marks: [] };
    const nextId = { students: 1, teachers: 1, attendance: 1, marks: 1 };

    return http.createServer(async function(req, res)
    {
        try
        {
            const url = new URL(req.url, "http://localhost");
            if (url.pathname === "/health" && req.method === "GET")
            {
                sendJSON(res, 200, { status: "ok", storage: "memory" });
                return;
            }

            const parts = url.pathname.split("/");
            const resource = parts[1];
            if (!["students", "teachers", "attendance", "marks"].includes(resource)
                || parts.length < 2 || parts.length > 3 || parts[2] === "")
            {
                fail(404, "Route not found");
            }

            const records = data[resource];
            let id = null;
            if (parts.length === 3)
            {
                id = positiveId(parts[2]);
            }

            if (req.method === "GET")
            {
                if (id === null)
                {
                    sendJSON(res, 200, records);
                    return;
                }
                const record = records.find(item => item.id === id);
                if (!record)
                {
                    fail(404, "Record not found");
                }
                sendJSON(res, 200, record);
                return;
            }

            if (req.method === "POST" && id === null)
            {
                const fields = validate(resource, await readBody(req), data.students);
                const record = { id: nextId[resource]++, ...fields };
                records.push(record);
                sendJSON(res, 201, record);
                return;
            }

            if ((req.method === "PUT" || req.method === "DELETE") && id !== null)
            {
                let fields;
                if (req.method === "PUT")
                {
                    fields = validate(resource, await readBody(req), data.students);
                }
                // Body aane ke baad current array mein record dobara dhoondhna hai.
                const index = records.findIndex(item => item.id === id);
                if (index === -1)
                {
                    fail(404, "Record not found");
                }

                if (req.method === "PUT")
                {
                    // PUT ke liye record ki saari editable fields deni hain.
                    records[index] = { id: id, ...fields };
                    sendJSON(res, 200, records[index]);
                    return;
                }

                if (resource === "students"
                    && (data.attendance.some(item => item.studentId === id)
                        || data.marks.some(item => item.studentId === id)))
                {
                    fail(409, "Delete this student's attendance and marks first");
                }
                records.splice(index, 1);
                res.writeHead(204);
                res.end();
                return;
            }
            fail(405, "Method not allowed for this route");
        }
        catch (error)
        {
            if (!error.status)
            {
                console.error(error);
            }
            sendJSON(res, error.status || 500, { error: error.status ? error.message : "Server error" });
        }
    });
}

if (require.main === module)
{
    const server = createApp();
    server.listen(3004, function()
    {
        console.log("Task 1: http://localhost:3004/students");
    });
}

module.exports = { createApp };
