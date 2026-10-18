// Task 8: fake API se testing repeatable hai, internet ki zaroorat nahi.
const apiData = {
  "/users": [
    { id: 1, name: "Ali", department: "CS" },
    { id: 2, name: "Sara", department: "CS" },
    { id: 3, name: "Usman", department: "SE" }
  ],
  "/courses": [{ code: "CS301" }, { code: "CS302" }],
  "/results": [
    { studentId: 1, code: "CS301", marks: 80 },
    { studentId: 1, code: "CS302", marks: 60 },
    { studentId: 2, code: "CS301", marks: 90 },
    { studentId: 3, code: "CS302", marks: 40 }
  ]
};

export function fakeFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const signal = options.signal;
    if (signal?.aborted) return reject(new DOMException("Request aborted", "AbortError"));
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abortRequest);
      if (url === "/network-error") return reject(new TypeError("Network connection failed"));
      const status = url === "/server-error" ? 500 : Object.hasOwn(apiData, url) || url === "/slow" || url === "/invalid-json" ? 200 : 404;
      resolve({
        ok: status >= 200 && status < 300,
        status,
        async json() {
          if (url === "/invalid-json") throw new SyntaxError("Invalid JSON response");
          // JSON copy taake API ka source data mutate na ho.
          return JSON.parse(JSON.stringify(apiData[url] ?? { message: "Response received" }));
        }
      });
    }, url === "/slow" ? 150 : 15);
    function abortRequest() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abortRequest);
      reject(new DOMException("Request aborted", "AbortError"));
    }
    signal?.addEventListener("abort", abortRequest, { once: true });
  });
}

export async function getJSON(url, fetchImplementation) {
  const response = await fetchImplementation(url);
  if (!response.ok) {
    const error = new Error("HTTP " + response.status + " for " + url);
    error.name = "HTTPError";
    throw error;
  }
  return await response.json(); // Network aur JSON errors caller tak jate hain.
}

// Optional third argument se isi function ko real fetch ke saath bhi chala sakte hain.
export async function fetchWithTimeout(url, milliseconds, fetchImplementation = fakeFetch) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) throw new RangeError("Invalid timeout");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), milliseconds);
  try {
    // getJSON ko signal wala fetch diya hai.
    return await getJSON(url, requestedURL => fetchImplementation(requestedURL, { signal: controller.signal }));
  } catch (error) {
    if (controller.signal.aborted && error.name === "AbortError") {
      const timeoutError = new Error("Request timed out: " + url);
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer); // Success, HTTP error, abort: har case mein cleanup.
  }
}

export async function loadDashboard(fetchImplementation = fakeFetch) {
  const [users, courses, results] = await Promise.all([
    getJSON("/users", fetchImplementation),
    getJSON("/courses", fetchImplementation),
    getJSON("/results", fetchImplementation)
  ]); // Teenon requests pehle start, phir aik saath wait.
  if (![users, courses, results].every(Array.isArray)) throw new TypeError("API data must contain arrays");
  const ids = new Set();
  users.forEach(user => {
    if (!user || user.id == null || ids.has(user.id) || typeof user.name !== "string" || !user.name.trim() || typeof user.department !== "string" || !user.department.trim()) throw new TypeError("Invalid or duplicate user");
    ids.add(user.id);
  });
  courses.forEach(course => {
    if (!course || typeof course.code !== "string" || !course.code.trim()) throw new TypeError("Invalid course");
  });
  results.forEach(result => {
    if (!result || !ids.has(result.studentId) || !courses.some(course => course.code === result.code)) throw new TypeError("Unknown student or course in results");
    if (typeof result.marks !== "number" || !Number.isFinite(result.marks)) throw new TypeError("Invalid marks");
    if (result.marks < 0 || result.marks > 100) throw new RangeError("Marks must be 0 to 100");
  });
  const studentResults = users.map(user => {
    const marks = results.filter(result => result.studentId === user.id);
    return {
      ...user,
      average: marks.length ? marks.reduce((sum, result) => sum + result.marks, 0) / marks.length : null,
      failed: marks.some(result => result.marks < 50)
    };
  });
  // Multiple courses hon to highest student uske average se decide hoga.
  const ranked = studentResults.filter(student => student.average !== null)
    .sort((a, b) => b.average - a.average || a.name.localeCompare(b.name));
  const departments = Object.create(null);
  studentResults.forEach(student => {
    if (!departments[student.department]) departments[student.department] = { students: 0, average: null, highest: null, failed: 0 };
    const stats = departments[student.department];
    stats.students++;
    if (student.failed) stats.failed++;
    if (student.average !== null) stats.highest = stats.highest === null ? student.average : Math.max(stats.highest, student.average);
  });
  Object.keys(departments).forEach(department => {
    const marks = results.filter(result => users.find(user => user.id === result.studentId).department === department);
    departments[department].average = marks.length ? marks.reduce((sum, result) => sum + result.marks, 0) / marks.length : null;
  });
  return {
    totalStudents: users.length,
    totalCourses: courses.length,
    overallAverage: results.length ? results.reduce((sum, result) => sum + result.marks, 0) / results.length : null,
    highestPerformingStudent: ranked[0] ?? null,
    // Aik student kai courses mein fail ho tab bhi sirf aik baar count hoga.
    failedStudents: studentResults.filter(student => student.failed).length,
    departments
  };
}

async function demo() {
  console.log("Task 8");
  try {
    console.log("Dashboard:", await loadDashboard());
  } catch (error) {
    console.log(error.name, error.message);
  }
  for (const url of ["/users", "/not-found", "/server-error", "/network-error", "/invalid-json", "/slow"]) {
    try {
      console.log(url, await fetchWithTimeout(url, 50));
    } catch (error) {
      console.log(url, error.name, error.message);
    }
  }
  console.log("Slow request with enough time:", await fetchWithTimeout("/slow", 250));
  const emptyFetch = async () => ({ ok: true, status: 200, json: async () => [] });
  console.log("Empty dashboard:", await loadDashboard(emptyFetch));
  try {
    await fetchWithTimeout("/users", -1);
  } catch (error) {
    console.log("Invalid timeout:", error.name, error.message);
  }
}
demo().catch(error => { console.error("Unexpected error:", error); process.exitCode = 1; });
