const express = require("express");
const multer = require("multer");
const {
  uploadCertificate,
  getUserCertificates,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
} = require("../controllers/certificateController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Multer memory storage for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and PDF files are allowed!"), false);
    }
  },
});

// Routes
router.post("/", auth, upload.single("certificateFile"), uploadCertificate);
router.get("/", auth, getUserCertificates);
router.get("/:id", auth, getCertificateById);
router.put("/:id", auth, upload.single("certificateFile"), updateCertificate); // ✅ allow file updates
router.delete("/:id", auth, deleteCertificate);

module.exports = router;
