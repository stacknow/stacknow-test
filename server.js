import express from "express";

// Initialize the Express app
const app = express();

// Use the PORT environment variable if available, otherwise default to 8080
const PORT = process.env.PORT || 8080;

// --- NEW API ENDPOINT ---
// Endpoint to test/view environment variables in the browser/client
app.get('/env-test', (req, res) => {
  console.log(`[${new Date().toISOString()}] /env-test endpoint was called`);
  
  // Return the environment variables as JSON
  res.json({
    message: "Environment Variables Debug Info",
    timestamp: new Date().toISOString(),
    variables: process.env
  });
});

// Define the main route
app.get('/', (req, res) => {
  // This is the console log that will run every time the endpoint is called
  console.log(`[${new Date().toISOString()}] "Hello World" endpoint was called!`);
  
  // Send the response to the browser/client
  res.send('Hello World!');
});

// Start the server and listen for requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);

  // --- PRINT ON LOAD ---
  console.log("------------------------------------------------");
  console.log("🚀 APPLICATION STARTED - ENVIRONMENT VARIABLES 🚀");
  console.log("------------------------------------------------");
  
  // Print all environment variables to the console
  // Note: In a real app, you might want to filter out sensitive keys (like passwords)
  Object.keys(process.env).forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
  });
  
  console.log("------------------------------------------------");
});
