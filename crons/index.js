// index.js
console.log("------------------------------------------------");
console.log(`[START] Cron Job Initiated at: ${new Date().toISOString()}`);

// 1. Test Environment Variables
const envTest = process.env.MY_TEST_VAR || "No Env Var Set";
console.log(`[INFO] Environment Config: ${envTest}`);

// 2. Simulate a Task (e.g., database cleanup, email sending)
console.log("[INFO] Simulating processing task (5 seconds)...");

setTimeout(() => {
    // 3. Task Complete
    console.log(`[FINISH] Task completed successfully at: ${new Date().toISOString()}`);
    console.log("------------------------------------------------");
    
    // Exit with success code 0. 
    // If you wanted to simulate failure, you would use process.exit(1)
    process.exit(0);
}, 5000);
