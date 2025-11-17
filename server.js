import express from "express";

// Initialize the Express app
const app = express();

// Use the PORT environment variable if available, otherwise default to 8080
const PORT = process.env.PORT || 8080;

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