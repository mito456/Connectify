// Handle file uploads
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // Return the file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      msg: "File uploaded successfully",
      fileUrl: fileUrl,
      filename: req.file.filename
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Error uploading file" });
  }
};

// Handle multiple files upload
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: "No files uploaded" });
    }

    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ 
      msg: "Files uploaded successfully",
      fileUrls: fileUrls
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Error uploading files" });
  }
};
