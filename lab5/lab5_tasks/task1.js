// Task 1 - Admission processing
function processAdmissions(applicants)
{
    if (!Array.isArray(applicants))
    {
        throw new TypeError("Applicants must be an array");
    }

    const processed = [];
    let totalMerit = 0;
    const summary = {
        validCount: 0,
        invalidCount: 0,
        highestMeritApplicant: null,
        lowestMerit: null,
        averageMerit: null,
        programCounts: {
            BSCS: 0,
            BSSE: 0,
            BSAI: 0
        }
    };

    for (const applicant of applicants)
    {
        if (!applicant || typeof applicant !== "object" || Array.isArray(applicant))
        {
            processed.push({ status: "INVALID DATA" });
            summary.invalidCount++;
            continue;
        }

        const values = [applicant.age, applicant.matricMarks, applicant.intermediateMarks, applicant.entryTest];
        // Khali string ko 0 samajhne se bachana hai.
        const validNumbers = values.every(function(value)
        {
            return (typeof value === "string" || typeof value === "number")
                && String(value).trim() !== ""
                && Number.isFinite(Number(value));
        });

        const age = Number(applicant.age);
        const matric = Number(applicant.matricMarks);
        const inter = Number(applicant.intermediateMarks);
        const entry = Number(applicant.entryTest);
        const validAge = age >= 17 && age <= 30;
        const validMarks = matric >= 0 && matric <= 100 && inter >= 0 && inter <= 100 && entry >= 0 && entry <= 100;
        const validName = typeof applicant.name === "string" && applicant.name.trim() !== "";
        const validId = typeof applicant.id === "string" && applicant.id.trim() !== "";
        const validFee = [true, false, "true", "false"].includes(applicant.feePaid);
        let supportedProgram = false;

        switch (applicant.program)
        {
            case "BSCS":
            case "BSSE":
            case "BSAI":
                supportedProgram = true;
                break;
        }

        if (!validNumbers || !validAge || !validMarks || !validName || !validId || !validFee || !supportedProgram)
        {
            processed.push({ id: applicant.id, status: "INVALID DATA" });
            summary.invalidCount++;
            continue;
        }

        const merit = matric * 0.20 + inter * 0.30 + entry * 0.50;
        // Boolean("false") true hota hai, is liye seedha compare kiya.
        const feePaid = applicant.feePaid === true || applicant.feePaid === "true";
        let status;

        if (merit < 70 || entry < 60 || inter < 60)
        {
            status = "REJECTED";
        }
        else if (feePaid)
        {
            status = "SELECTED";
        }
        else
        {
            status = "WAITING"; // Eligible hai lekin fee abhi paid nahi.
        }

        const result = {
            ...applicant,
            age: age,
            matricMarks: matric,
            intermediateMarks: inter,
            entryTest: entry,
            feePaid: feePaid,
            merit: merit,
            status: status
        };
        processed.push(result);
        summary.validCount++;
        totalMerit += merit;
        summary.programCounts[applicant.program]++; // Sirf valid applicants count kiye.

        if (summary.highestMeritApplicant === null || merit > summary.highestMeritApplicant.merit)
        {
            summary.highestMeritApplicant = result;
        }

        if (summary.lowestMerit === null || merit < summary.lowestMerit)
        {
            summary.lowestMerit = merit;
        }
    }

    summary.averageMerit = summary.validCount > 0 ? totalMerit / summary.validCount : null;
    return { applicants: processed, summary: summary };
}

const applicant = {
    id: "A101",
    name: "Sara Khan",
    age: "19",
    matricMarks: "91",
    intermediateMarks: "87",
    entryTest: "78",
    program: "BSCS",
    feePaid: "true"
};

// Normal, boundary aur invalid cases. Copy banayi hai, original change nahi kiya.
const applicants = [
    applicant,
    {
        ...applicant,
        id: "A102",
        age: "17",
        matricMarks: "100",
        intermediateMarks: "60",
        entryTest: "64",
        feePaid: "false"
    },
    {
        ...applicant,
        id: "A103",
        entryTest: "59"
    },
    {
        ...applicant,
        id: "A104",
        intermediateMarks: ""
    }
];

console.dir(processAdmissions(applicants), { depth: null });
