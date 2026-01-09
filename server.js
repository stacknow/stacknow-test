import express from "express";

const app = express();

// Get config from Environment Variables
const PORT = process.env.PORT || 8080;
const INSTANCE_NAME = process.env.INSTANCE_NAME || "Server-Unknown";

app.use(express.json());

// --- API: Check Environment Variables ---
app.post('/check-env', (req, res) => {
  console.log(`[${new Date().toISOString()}] [${INSTANCE_NAME}] /check-env called`);

  const varsToLookUp = req.body.variables;

  if (!varsToLookUp || !Array.isArray(varsToLookUp)) {
    return res.status(400).json({ 
      error: "Please provide an array of strings in the 'variables' field." 
    });
  }

  const responseData = {
    handled_by: INSTANCE_NAME, // Identify which server responded
    env_values: {}
  };

  varsToLookUp.forEach((key) => {
    responseData.env_values[key] = process.env[key] !== undefined ? process.env[key] : "NOT_SET";
  });

  res.json(responseData);
});

// --- API: Root ---
app.get('/', (req, res) => {
  console.log(`[${new Date().toISOString()}] [${INSTANCE_NAME}] Root endpoint called`);
  res.send(`Hello from ${INSTANCE_NAME} on Port ${PORT}!`);
});

app.listen(PORT, () => {
  console.log(`[${INSTANCE_NAME}] is running on port ${PORT}`);
});
