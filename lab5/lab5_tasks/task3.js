// Task 3 - Safe profile update
function isObject(value)
{
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function updateProfile(student, update = {})
{
    if (!isObject(student) || !isObject(update))
    {
        throw new TypeError("Student and update must be objects");
    }

    for (const key of ["address", "contact"])
    {
        if ((student[key] !== undefined && !isObject(student[key]))
            || (update[key] !== undefined && !isObject(update[key])))
        {
            throw new TypeError("Invalid " + key);
        }
    }

    // Object rest se baqi fields alag kar li hain.
    const { address = {}, contact = {}, ...otherFields } = update;
    return {
        ...student,
        ...otherFields,
        address: {
            ...student.address,
            ...address
        },
        contact: {
            ...student.contact,
            ...contact
        }
    };
}

// Rest parameters se aik se zyada updates bhi de sakte hain.
function applyUpdates(student, ...updates)
{
    let result = updateProfile(student);
    for (const update of updates)
    {
        result = updateProfile(result, update);
    }
    return result;
}

const student = {
    id: 101,
    name: "Ali",
    marks: 0,
    scholarship: false,
    address: {
        city: "Islamabad",
        sector: "F-10"
    },
    contact: {
        email: "ali@university.edu"
    }
};
const update = {
    name: "Ali Khan",
    address: {
        city: "Rawalpindi"
    },
    contact: {
        phone: "03001234567"
    }
};
const updated = applyUpdates(student, update);

// Renaming, nested destructuring aur defaults.
const {
    name: studentName,
    marks = 0,
    scholarship = false,
    address: { city, sector = "Unknown" } = {}
} = updated;
const [firstName, lastName = ""] = studentName.split(" ");
const phone = updated.contact?.phone ?? "No phone";

console.log(updated);
console.log({ studentName, marks, scholarship, city, sector, firstName, lastName, phone });
// Teenon false hain kyun ke object, address aur contact ki alag copies banayi hain.
console.log("Same object:", student === updated);
console.log("Same address:", student.address === updated.address);
console.log("Same contact:", student.contact === updated.contact);
console.log("Original:", student);
console.log("Falsy values:", updateProfile(student, { name: "", marks: 0, scholarship: false }));
console.log("No update:", updateProfile(student));

try
{
    updateProfile(student, { address: null });
}
catch (error)
{
    console.log("Invalid update:", error.message);
}
