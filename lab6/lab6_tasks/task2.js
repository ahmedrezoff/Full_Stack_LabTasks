// Task 2 - Do async operations ko Promise.all se combine karna
async function getJSON(url)
{
    const response = await fetch(url);
    if (!response.ok)
    {
        throw new Error("Fetch failed: HTTP " + response.status);
    }
    return await response.json();
}

async function fetchUser(id)
{
    const user = await getJSON("https://jsonplaceholder.typicode.com/users/" + id);
    if (!user || !Number.isInteger(user.id) || user.id <= 0
        || typeof user.name !== "string" || !user.name.trim()
        || typeof user.email !== "string" || !user.email.trim())
    {
        throw new Error("Invalid user data");
    }
    return user;
}

async function fetchTodo(id)
{
    const todo = await getJSON("https://jsonplaceholder.typicode.com/todos/" + id);
    if (!todo || !Number.isInteger(todo.id) || todo.id <= 0
        || !Number.isInteger(todo.userId) || todo.userId <= 0
        || typeof todo.title !== "string" || !todo.title.trim()
        || typeof todo.completed !== "boolean")
    {
        throw new Error("Invalid todo data");
    }
    return todo; // completed false bhi valid hai.
}

function fetchDetails(userId, todoId)
{
    // Dono calls saath start hongi. Koi bhi reject ho to main Promise reject hoga.
    return Promise.all([
        fetchUser(userId),
        fetchTodo(todoId)
    ]);
}

fetchDetails(1, 1)
    .then(function([user, todo])
    {
        console.log("Both results are valid:");
        console.log("User:", user);
        console.log("Todo:", todo);
    })
    .catch(function(error)
    {
        console.log("Main Promise rejected:", error.message);
    });

fetchDetails(999, 1)
    .then(function(results)
    {
        console.log(results);
    })
    .catch(function(error)
    {
        console.log("Invalid case:", error.message);
    });
