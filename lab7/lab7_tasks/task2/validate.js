function fail(status, message)
{
    const error = new Error(message);
    error.status = status;
    throw error;
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

function text(value, field)
{
    if (typeof value !== "string" || value.trim() === "")
    {
        fail(400, field + " is required");
    }
    return value.trim();
}

function onlyFields(body, allowed)
{
    if (Object.keys(body).some(key => !allowed.includes(key)))
    {
        fail(400, "Allowed fields: " + allowed.join(", "));
    }
}

function productFields(body)
{
    onlyFields(body, ["name", "description", "price"]);
    const name = text(body.name, "Name");
    const description = text(body.description, "Description");
    if (typeof body.price !== "number" || !Number.isFinite(body.price)
        || body.price <= 0 || body.price > 1000000
        || Math.abs(body.price * 100 - Math.round(body.price * 100)) > 0.000001)
    {
        fail(400, "Price must be between 0.01 and 1000000, with at most 2 decimal places");
    }
    return { name, description, price: body.price };
}

function quantity(value)
{
    if (!Number.isInteger(value) || value < 1 || value > 99)
    {
        fail(400, "Quantity must be an integer between 1 and 99");
    }
    return value;
}

function credentials(body, register)
{
    let allowed = ["email", "password"];
    if (register)
    {
        allowed = ["name", "email", "password"];
    }
    onlyFields(body, allowed);
    const email = text(body.email, "Email").toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    {
        fail(400, "A valid email is required");
    }
    if (typeof body.password !== "string" || body.password.trim() === ""
        || body.password.length < 6 || body.password.length > 128)
    {
        fail(400, "Password must contain 6 to 128 characters");
    }
    const result = { email, password: body.password };
    if (register)
    {
        result.name = text(body.name, "Name");
    }
    return result;
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

module.exports = { fail, positiveId, text, onlyFields, productFields, quantity, credentials, readBody };
