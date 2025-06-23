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

    // Step 1. Upload file to Affinda
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

    const documentId = uploadResponse.data.id || uploadResponse.data.identifier;
    if (!documentId) {
      return res.status(500).json({ error: "Failed to get document ID" });
    }

    // 2. Poll for parsing completion (ready = true)
    let ready = false;
    let documentData;

    while (!ready) {
      await new Promise((r) => setTimeout(r, 1000)); // wait 1 second before checking
      const statusResponse = await axios.get(
        `https://api.affinda.com/v3/documents/${documentId}`,
        {
          headers: { Authorization: `Bearer ${AFFINDA_API_KEY}` },
        }
      );
      documentData = statusResponse.data;
      ready = documentData.ready;
    }

    // 3. Confirm the document
    await axios.post(
      `https://api.affinda.com/v3/documents/${documentId}/confirm`,
      {},
      {
        headers: { Authorization: `Bearer ${AFFINDA_API_KEY}` },
      }
    );

    // 4. Get the confirmed document data
    const confirmedResponse = await axios.get(
      `https://api.affinda.com/v3/documents/${documentId}`,
      {
        headers: { Authorization: `Bearer ${AFFINDA_API_KEY}` },
      }
    );

    // Return full parsed resume data
    res.json(confirmedResponse.data);
  } catch (error) {
    console.error("Error parsing or confirming resume:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to parse and confirm resume" });
  }
});

module.exports = router;
