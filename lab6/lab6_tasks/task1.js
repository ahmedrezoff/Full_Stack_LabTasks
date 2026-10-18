// Task 1 - API se valid user fetch karna
async function fetchUser(id)
{
    const response = await fetch("https://jsonplaceholder.typicode.com/users/" + id);
    if (!response.ok)
    {
        throw new Error("User fetch failed: HTTP " + response.status);
    }

    const user = await response.json();
    if (!user || !Number.isInteger(user.id) || user.id <= 0
        || typeof user.name !== "string" || !user.name.trim()
        || typeof user.email !== "string" || !user.email.trim())
    {
        throw new Error("Invalid user data");
    }
    return user;
}

async function showUser(id)
{
    try
    {
        const user = await fetchUser(id);
        console.log("User:", user);
    }
    catch (error)
    {
        // HTTP, network aur JSON errors yahan handle honge.
        console.log("Error:", error.message);
    }
}

showUser(1);
showUser(999); // Ye user exist nahi karta.
