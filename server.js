import express from "express";

// Initialize the Express app
const app = express();

// Use the PORT environment variable if available, otherwise default to 8080
const PORT = process.env.PORT || 8080;

// --- NEW MIDDLEWARE ---
// Allow Express to parse JSON bodies in POST requests
app.use(express.json());

// --- NEW API ENDPOINT ---
// POST endpoint to accept a list of variable names and return their values
app.post('/check-env', (req, res) => {
  console.log(`[${new Date().toISOString()}] /check-env endpoint was called`);

  // Extract the list of variables to look up from the request body
  // Expected JSON format: { "variables": ["PORT", "NODE_ENV", "MY_SECRET"] }
  const varsToLookUp = req.body.variables;

  if (!varsToLookUp || !Array.isArray(varsToLookUp)) {
    return res.status(400).json({ 
      error: "Please provide an array of strings in the 'variables' field." 
    });
  }

  // Create an object containing the requested values
  const responseData = {};
  varsToLookUp.forEach((key) => {
    // Check if the key exists in process.env
    responseData[key] = process.env[key] !== undefined ? process.env[key] : "NOT_SET";
  });

  // Respond with the results
  res.json(responseData);
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
});
