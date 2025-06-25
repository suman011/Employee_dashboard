import React, { useRef } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
// eslint-disable-next-line
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom"; // <-- You forgot this import

const EVAL_DETAILS = [
  {
    title: "1. Upskilling",
    weight: "20%",
    evaluatedBy: "IGTR",
    criteria: [
      { label: "Attendance", range: "0-10" },
      { label: "Exam Score", range: "0-10" },
    ],
  },
  {
    title: "2. Project Execution",
    weight: "40%",
    evaluatedBy: "Department Head",
    criteria: [
      { label: "Define & Measure", range: "0-10" },
      { label: "Analyze & Improve", range: "0-20" },
      { label: "Control", range: "0-10" },
    ],
  },
  {
    title: "3. Value Addition",
    weight: "20%",
    evaluatedBy: "BE Team",
    criteria: [
      { label: "New Ideas", range: "0-10" },
      { label: "Concept & Design", range: "0-10" },
    ],
  },
  {
    title: "4. Team Work",
    weight: "20%",
    evaluatedBy: "Team Lead and Mentor",
    criteria: [
      { label: "Communication", range: "0-10" },
      { label: "Accountability & Reliability", range: "0-10" },
    ],
  },
];

export default function EvaluationCriteria() {
  const pdfRef = useRef();
  const navigate = useNavigate();  // <-- This is the missing piece

  const handleDownload = () => {
    html2pdf().from(pdfRef.current).save("EvaluationCriteria.pdf");
  };

  return (
    <Box p={4}>
      <Button variant="contained" sx={{ mb: 3 }} onClick={() => navigate("/admin-dashboard")}>
        ← Back to Dashboard
      </Button>

      <Typography variant="h3" gutterBottom textAlign="center">
        Evaluation Criteria
      </Typography>

      <Paper elevation={2} sx={{ p: 3 }} ref={pdfRef}>
        {EVAL_DETAILS.map((section, idx) => (
          <Box key={idx} mb={4}>
            <Typography variant="h6" fontWeight="bold">{section.title}</Typography>
            <Typography><strong>Weight:</strong> {section.weight}</Typography>
            <Typography><strong>Evaluated By:</strong> {section.evaluatedBy}</Typography>
            <Box mt={1} pl={2}>
              {section.criteria.map((item, i) => (
                <Typography key={i}>
                  - {item.label} ({item.range})
                </Typography>
              ))}
            </Box>
          </Box>
        ))}
      </Paper>

      <Box mt={2} textAlign="center">
        <Button variant="contained" onClick={handleDownload}>Download PDF</Button>
      </Box>
    </Box>
  );
}
