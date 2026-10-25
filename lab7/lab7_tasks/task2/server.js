const path = require("node:path");
const { createApp } = require("./app.js");

const file = path.join(__dirname, "data", "store.json");
const server = createApp(file);

server.listen(3005, function()
{
    console.log("Task 2: http://localhost:3005/products");
    console.log("Saved data: " + file);
});
