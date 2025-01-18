const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const hf_token = process.env.HF_TOKEN;

const app = express();
const port = 3000;

app.use(
  fileUpload({
    useTempFiles: false, // Process files in memory
  })
);

// Enable CORS
app.use(cors());
// Route to handle image upload and classification
app.post("/classify-face-shape", async (req, res) => {
  try {
    // Check if an image was uploaded
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageFile = req.files.image;

    // Convert the image to base64 (required for Hugging Face API)
    const imageBase64 = imageFile.data.toString("base64");

    // Call Hugging Face API (replace with your model URL or endpoint)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/metadome/face_shape_classification",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hf_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: imageBase64,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res
        .status(response.status)
        .json({ message: error.error || "Error from Hugging Face API" });
    }

    // extract the most probable result from the array of classifications
    const classification = (await response.json())[0];

    // Send the classification response back to the client
    return res.json(classification);
  } catch (error) {
    console.error("Error classifying the image:", error.message);
    return res.status(500).json({ error: "Error processing the image" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
