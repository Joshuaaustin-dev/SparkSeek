const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const auth = require("../middleware/authMiddleware");
const FormData = require("form-data");
const ResumeModel = require("../models/resumeModel");

//Multer disk storage
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uploadDir = "uploads/";
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    let filename = `${originalName}${ext}`;
    let counter = 1;

    // Check if file exists and increment suffix until it's unique
    while (fs.existsSync(path.join(uploadDir, filename))) {
      filename = `${originalName}(${counter})${ext}`;
      counter++;
    }

    cb(null, filename);
  },
});

const upload = multer({ storage }); 

//env variables to use Affinda
const AFFINDA_API_KEY = process.env.AFFINDA_API_KEY;
const AFFINDA_WORKSPACE_ID = process.env.AFFINDA_WORKSPACE_ID;

router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const fileBuffer = fs.readFileSync(filePath);

    const form = new FormData();

    form.append("file", fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });

    form.append("workspace", AFFINDA_WORKSPACE_ID);

    //Upload to Affinda
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


    //Handle parsed data
    const parsed = uploadResponse.data.data;

    if(!parsed) {
      return res.status(500).json({ error: "Affinda returned not data"});
    }

    const userId = req.user.id; // Use a valid ObjectId from your User collection
    const extractField = (field) => field?.[0]?.parsed || field?.[0]?.raw || "";

    const resume = new ResumeModel({
      user: userId,
      filePath: req.file.path,
      originalName: fileName,
      parsed: {
        name: parsed.candidateName?.[0]?.raw || "",
        email: parsed.email?.[0]?.parsed || parsed.email?.[0]?.raw || "",
        phone:
          typeof parsed.phoneNumber?.[0]?.parsed === "string"
            ? parsed.phoneNumber[0].parsed
            : parsed.phoneNumber?.[0]?.parsed?.rawText ||
              parsed.phoneNumber?.[0]?.raw ||
              "",
        summary: parsed.summary?.parsed || "",
        totalYearsWorked: parsed.totalYearsExperience?.parsed || "",
        skills:
          parsed.skill?.map((s) => s.raw).filter(Boolean).map((s) => s.trim()) || [],
        education:
          parsed.education?.map((e) => e.raw || "").filter(Boolean) || [],
        experience:
          parsed.workExperience?.map((e) => e.raw || "").filter(Boolean) || [],
      },
    });

    const saved = await resume.save();
    console.log("✅ Resume saved:", saved._id);
    res.status(200).json({ message: "Resume uploaded and saved", data: parsed });
    console.log("Upload response data:", JSON.stringify(uploadResponse.data, null, 2));

  } catch (error) {
    console.error("Error during upload:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to upload document" });
  }
});


//GET route to retrieve resumes of the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const resumes = await ResumeModel.find({ user: userId }).sort({ createdAt: -1 });

    res.json(resumes); // these should already include originalName and createdAt
  } catch (error) {
    console.error("Error fetching resumes:", error.message);
    res.status(500).json({ error: "Failed to load resumes" });
  }
});

//Get route to retreive the preview of the file
router.get("/:id/preview", auth, async (req, res) => {
  try {
    const resume = await ResumeModel.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const absolutePath = path.resolve(resume.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.sendFile(absolutePath);
  } catch (err) {
    console.error("Error fetching resume preview:", err.message);
    res.status(500).json({ error: "Failed to preview resume" });
  }
});

module.exports = router;
