import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads folder if it doesn't exist
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads");  // ✅ saves to backend/uploads folder
  },
  filename: function (req, file, callback) {
    // adds timestamp to avoid duplicate filenames
    const uniqueName = Date.now() + "-" + file.originalname;
    callback(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

export default upload;