const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const hf_token = process.env.HF_TOKEN;

const app = express();
const port = 3000;

// Configure Multer
const upload = multer({ dest: "uploads/" });

// Enable CORS
app.use(cors());
// Route to handle image upload and classification
app.post("/classify-face-shape", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Read the uploaded file
    const image = fs.readFileSync(req.file.path);

    // Call Hugging Face API (replace with your model URL or endpoint)
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/metadome/face_shape_classification",
      image,
      {
        headers: {
          Authorization: `Bearer ${hf_token}`,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    //     [
    //   { label: 'Oblong', score: 0.9984318614006042 },
    //   { label: 'Square', score: 0.34341850876808167 },
    //   { label: 'Round', score: 0.22939534485340118 },
    //   { label: 'Oval', score: 0.16609622538089752 },
    //   { label: 'Heart', score: 0.11046089231967926 }
    // ]

    // extract the most probable result from the array of classifications
    const classification = response.data[0];

    // Send the classification response back to the client
    return res.json(classification);
  } catch (error) {
    console.error("Error classifying the image:", error.message);
    return res.status(500).json({ error: "Error processing the image" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
