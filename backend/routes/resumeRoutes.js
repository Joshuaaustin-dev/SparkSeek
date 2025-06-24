const router = require("express").Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const upload = multer();

const AFFINDA_API_KEY = process.env.AFFINDA_API_KEY;
const AFFINDA_WORKSPACE_ID = process.env.AFFINDA_WORKSPACE_ID;

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;

    const form = new FormData();
    form.append("file", fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });
    form.append("workspace", AFFINDA_WORKSPACE_ID);

    console.log("Uploading file to Affinda...");
    const uploadResponse = await axios.post(
      "https://api.affinda.com/v3/documents",
      form,
      {
        headers: {
          Authorization: `Bearer ${AFFINDA_API_KEY}`,
          ...form.getHeaders(),
        },
      }
    );

    console.log("Upload response data:", JSON.stringify(uploadResponse.data, null, 2));

    // Return the full response for frontend to display
    res.json(uploadResponse.data);

  } catch (error) {
    console.error("Error during upload:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

module.exports = router;
