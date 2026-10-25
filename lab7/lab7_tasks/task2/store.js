// Sir ke persistent store jaisa: JSON file aur ek write queue.
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

function createStore(file)
{
    let writeQueue = Promise.resolve();

    async function load()
    {
        return JSON.parse(await fs.readFile(file, "utf8"));
    }

    async function read()
    {
        await writeQueue;
        return load();
    }

    function edit(change)
    {
        // Ek waqt mein ek edit hoti hai, taake requests ek doosre ka data overwrite na karein.
        const operation = writeQueue.then(async function()
        {
            const data = await load();
            const result = change(data);
            const temporaryFile = file + "." + randomUUID() + ".tmp";

            try
            {
                await fs.mkdir(path.dirname(file), { recursive: true });
                await fs.writeFile(temporaryFile, JSON.stringify(data, null, 4) + "\n", "utf8");
                await fs.rename(temporaryFile, file);
            }
            finally
            {
                await fs.rm(temporaryFile, { force: true });
            }
            return result;
        });

        // Failed request ke baad bhi agli request save ho sakti hai.
        writeQueue = operation.catch(function()
        {
            return undefined;
        });
        return operation;
    }

    return { read, edit };
}

module.exports = { createStore };
