require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const morgan = require("morgan");

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 5002;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const EMAIL_CONFIG = {
  host: "smtpout.secureserver.net",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
};

app.use(
  cors({
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allow all common methods
    allowedHeaders: ["Content-Type", "Authorization"] // Add 'Authorization' if using tokens
  })
);
app.options("*", cors()); // Preflight support for all routes

app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

// Email Transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Verify email configuration on startup
transporter.verify((error) => {
  if (error) {
    console.error("Error with email configuration:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Helper Functions
const getCurrentDate = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const generateFieldRow = (label, value) => {
  return `
    <div class="field-row">
      <div class="field-label">${label}</div>
      <div class="field-value">${value || "Not provided"}</div>
    </div>
  `;
};

const generateEmailHTML = (formData, courseId) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Course Registration Confirmation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 680px;
      margin: 30px auto;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                  0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .email-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.1;
      background-image: radial-gradient(#ffffff 1px, transparent 1px);
      background-size: 15px 15px;
    }
    .header-content {
      position: relative;
      z-index: 2;
    }
    .logo-placeholder {
      display: inline-block;
      margin-bottom: 15px;
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 1px;
    }
    .email-header h1 {
      margin: 0;
      font-weight: 700;
      font-size: 28px;
      letter-spacing: -0.5px;
    }
    .header-date {
      margin-top: 12px;
      font-weight: 400;
      opacity: 0.9;
      font-size: 15px;
    }
    .email-body {
      padding: 0;
      background-color: white;
    }
    .welcome-section {
      padding: 30px;
      text-align: center;
      border-bottom: 1px solid #f1f5f9;
    }
    .welcome-icon {
      font-size: 48px;
      margin-bottom: 20px;
      color: #3b82f6;
    }
    .welcome-text {
      font-size: 18px;
      line-height: 1.5;
      color: #64748b;
      max-width: 80%;
      margin: 0 auto;
    }
    .section {
      padding: 30px;
      border-bottom: 1px solid #f1f5f9;
    }
    .section-title {
      color: #1e40af;
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    .section-title-icon {
      margin-right: 10px;
      font-size: 20px;
    }
    .field-grid {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 15px;
    }
    @media (max-width: 600px) {
      .field-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
    .field-row {
      margin-bottom: 15px;
    }
    .field-label {
      font-weight: 500;
      color: #475569;
      font-size: 15px;
    }
    .field-value {
      font-weight: 400;
      color: #1e293b;
      word-break: break-word;
    }
    .motivation-section {
      background-color: #f8fafc;
      padding: 30px;
    }
    .motivation-text {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
      font-style: italic;
      color: #334155;
      line-height: 1.7;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .footer {
      text-align: center;
      padding: 25px;
      font-size: 13px;
      color: #64748b;
      background-color: #f1f5f9;
    }
    .footer-links {
      margin-top: 15px;
    }
    .footer-link {
      color: #3b82f6;
      text-decoration: none;
      margin: 0 10px;
    }
    .badge {
      display: inline-block;
      background-color: #e0e7ff;
      color: #3b82f6;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      margin-left: 10px;
    }
    .course-highlight {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      text-align: center;
    }
    .course-title {
      font-size: 22px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .course-details {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    .course-detail-item {
      display: flex;
      align-items: center;
    }
    .course-detail-icon {
      margin-right: 8px;
      color: #3b82f6;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="header-pattern"></div>
      <div class="header-content">
        <div class="logo-placeholder">GLI</div>
        <h1>Registration Confirmed</h1>
        <div class="header-date">
          ${getCurrentDate()}
        </div>
      </div>
    </div>

    <div class="email-body">
      <div class="welcome-section">
        <div class="welcome-icon">🎉</div>
        <p class="welcome-text">
          Thank you for registering with German Language Institute.
          We're excited to have you join our ${courseId || "course"} program.
        </p>
      </div>

      <div class="course-highlight">
        <div class="course-title">${courseId || "German Language Course"}</div>
        <div class="course-details">
          <div class="course-detail-item">
            <span class="course-detail-icon">📅</span>
            <span>${formData.timeSlot || "To be scheduled"}</span>
          </div>
          <div class="course-detail-item">
            <span class="course-detail-icon">🏛️</span>
            <span>Online/On-Campus</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">
          <span class="section-title-icon">👤</span>
          Personal Information
        </h2>

        <div class="field-grid">
          ${generateFieldRow("Full Name", formData.fullName)}
          ${generateFieldRow(
            "Father/Husband Name",
            formData.fatherOrHusbandName
          )}
          ${generateFieldRow("Date of Birth", formData.dateOfBirth)}
          ${generateFieldRow("Place of Birth", formData.placeOfBirth)}
          ${generateFieldRow("Nationality", formData.nationality)}
          ${generateFieldRow("CNIC/Passport", formData.cnic)}
          <div class="field-row">
            <div class="field-label">Gender</div>
            <div class="field-value">
              ${formData.gender || "Not provided"}
              ${formData.gender ? '<span class="badge">Verified</span>' : ""}
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">
          <span class="section-title-icon">📱</span>
          Contact Information
        </h2>

        <div class="field-grid">
          ${generateFieldRow("Email Address", formData.email)}
          ${generateFieldRow("WhatsApp Number", formData.whatsappNumber)}
          ${generateFieldRow("Emergency Contact", formData.emergencyNumber)}
          <div class="field-row">
            <div class="field-label">Complete Address</div>
            <div class="field-value">
              ${
                formData.address
                  ? formData.address.replace(/\n/g, "<br>")
                  : "Not provided"
              }
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">
          <span class="section-title-icon">🎓</span>
          Education Details
        </h2>

        <div class="field-grid">
          ${generateFieldRow("Education Level", formData.education)}
        </div>
      </div>

      <div class="motivation-section">
        <h2 class="section-title">
          <span class="section-title-icon">💡</span>
          Your Motivation
        </h2>
        <div class="motivation-text">
          ${
            formData.learnGermanReason
              ? formData.learnGermanReason.replace(/\n/g, "<br>")
              : "Not provided"
          }
        </div>
      </div>
    </div>

    <div class="footer">
      <p>This email confirms your registration with German Language Institute.</p>
      <div class="footer-links">
        <a href="#" class="footer-link">Website</a>
        <a href="#" class="footer-link">Contact Us</a>
        <a href="#" class="footer-link">FAQs</a>
      </div>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} German Language Institute. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the German Language Institute API");
});

app.post("/submit-form", async (req, res) => {
  try {
    const { formData, courseId } = req.body;

    if (!formData || !formData.fullName) {
      return res.status(400).json({
        success: false,
        message: "Invalid form data: fullName is required"
      });
    }

    console.log("Received form data:", formData);

    const mailOptions = {
      from: `"Course Registration" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New ${courseId || "Course"} Registration - ${
        formData.fullName
      }`,
      html: generateEmailHTML(formData, courseId)
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    res.status(200).json({
      success: true,
      message: "Form submitted successfully",
      info: info
    });
  } catch (error) {
    console.error("Error processing form submission:", error);
    res.status(500).json({
      success: false,
      message: "Error processing form submission",
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS configured for frontend: ${FRONTEND_URL}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
