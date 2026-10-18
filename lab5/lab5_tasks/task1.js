// Task 1: pehle data check karo, phir merit nikalo.
function readNumber(value, field) {
  if ((typeof value !== "string" && typeof value !== "number") || String(value).trim() === "") {
    throw new TypeError(field + " is missing or not a number");
  }
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(field + " is not a valid number");
  return number;
}

export function processApplicant(applicant) {
  try {
    if (!applicant || typeof applicant !== "object") throw new TypeError("Applicant must be an object");
    if (typeof applicant.id !== "string" || !applicant.id.trim()) throw new Error("ID is required");
    if (typeof applicant.name !== "string" || !applicant.name.trim()) throw new Error("Name is required");
    const age = readNumber(applicant.age, "Age");
    const matricMarks = readNumber(applicant.matricMarks, "Matric marks");
    const intermediateMarks = readNumber(applicant.intermediateMarks, "Intermediate marks");
    const entryTest = readNumber(applicant.entryTest, "Entry test");
    if (age < 17 || age > 30) throw new RangeError("Age must be 17 to 30");
    for (const marks of [matricMarks, intermediateMarks, entryTest]) {
      if (marks < 0 || marks > 100) throw new RangeError("Marks must be 0 to 100");
    }
    const program = typeof applicant.program === "string" ? applicant.program.trim().toUpperCase() : "";
    switch (program) {
      case "BSCS":
      case "BSSE":
      case "BSAI":
        break;
      default:
        throw new Error("Unsupported program");
    }
    // Boolean('false') bhi true hota hai, is liye explicitly check kiya.
    if (![true, false, "true", "false"].includes(applicant.feePaid)) throw new TypeError("Invalid feePaid");
    const feePaid = applicant.feePaid === true || applicant.feePaid === "true";
    const merit = matricMarks * 0.2 + intermediateMarks * 0.3 + entryTest * 0.5;
    const eligible = merit >= 70 && entryTest >= 60 && intermediateMarks >= 60;
    // Apna rule: eligible + fee paid = selected, eligible + unpaid = waiting.
    let status;
    if (!eligible) status = "REJECTED";
    else status = feePaid ? "SELECTED" : "WAITING";
    return { ...applicant, name: applicant.name.trim(), program, age, matricMarks, intermediateMarks, entryTest, feePaid, merit, status };
  } catch (error) {
    return { id: applicant?.id ?? null, status: "INVALID DATA", error: error.message };
  }
}

export function processAdmissions(applicants) {
  if (!Array.isArray(applicants)) throw new TypeError("Applicants must be an array");
  const processed = applicants.map(processApplicant);
  const valid = processed.filter(applicant => applicant.status !== "INVALID DATA");
  let highest = null;
  let lowest = null;
  let total = 0;
  const programCounts = { BSCS: 0, BSSE: 0, BSAI: 0 };
  for (const applicant of valid) {
    total += applicant.merit;
    if (highest === null || applicant.merit > highest.merit) highest = applicant;
    if (lowest === null || applicant.merit < lowest) lowest = applicant.merit;
    programCounts[applicant.program]++;
  }
  return {
    applicants: processed,
    summary: {
      validApplicants: valid.length,
      invalidApplicants: processed.length - valid.length,
      highestMeritApplicant: highest,
      lowestMerit: lowest,
      averageMerit: valid.length ? total / valid.length : null,
      programCounts // Sirf valid applications count ho rahi hain.
    }
  };
}

const applicants = [
  { id: "A101", name: "Sara Khan", age: "19", matricMarks: "91", intermediateMarks: "87", entryTest: "78", program: "BSCS", feePaid: "true" },
  { id: "A102", name: "Ahmed Ali", age: "twenty", matricMarks: "88", intermediateMarks: "", entryTest: "72", program: "BSSE", feePaid: "false" },
  { id: "A103", name: "Hassan", age: "18", matricMarks: "76", intermediateMarks: "83", entryTest: "91", program: "BSAI", feePaid: "true" }
];
console.log("Task 1", processAdmissions(applicants));
console.log("Boundary, waiting:", processApplicant({ ...applicants[0], age: "17", matricMarks: "100", intermediateMarks: "60", entryTest: "64", feePaid: "false" }));
console.log("Rejected:", processApplicant({ ...applicants[0], entryTest: "59" }));
console.log("Bad marks:", processApplicant({ ...applicants[0], entryTest: "101" }));
console.log("Unsupported:", processApplicant({ ...applicants[0], program: "XYZ" }));
console.log("Empty:", processAdmissions([]));
