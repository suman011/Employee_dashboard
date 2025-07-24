import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  useTheme,
  useMediaQuery
} from "@mui/material";

import defaultEmployees from "../data/employees.json";
import { EVAL_CONFIG } from "../config/evalConfig";

// ✅ Load from localStorage (if any added), fallback to employees.json
const getParticipants = () => {
  const saved = localStorage.getItem("participants");
  return saved ? JSON.parse(saved) : defaultEmployees;
};

export default function EmployeeProfile() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const id = routeId ?? sessionStorage.getItem("employeeIndex");
  const idx = parseInt(id, 10);
  const participants = getParticipants();
  const e = participants[idx];

  if (!e) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">Participant not found.</Typography>
        <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </Container>
    );
  }

  const local = localStorage.getItem(`eval_${e.name}`);
  if (local) {
    const parsed = JSON.parse(local);
    e.answers = parsed.answers;
  }

  let weightedSum = 0;
  let totalWeight = 0;
  const sectionScores = {};

  Object.entries(EVAL_CONFIG).forEach(([sectionKey, { weight, items }]) => {
    const subScores = items
      .map((it) => {
        const val = parseFloat(e.answers?.[sectionKey]?.[it.key]);
        return isNaN(val) ? null : (val / it.max) * 10;
      })
      .filter((v) => v !== null);

    const sectionScore =
      subScores.length > 0 ? subScores.reduce((sum, v) => sum + v, 0) / subScores.length : 0;

    sectionScores[sectionKey] = sectionScore;

    if (subScores.length > 0) {
      weightedSum += sectionScore * weight;
      totalWeight += weight;
    }
  });

  const allSectionScores = Object.values(sectionScores).filter((score) => score > 0);
  const overallRating =
    allSectionScores.length > 0
      ? parseFloat((allSectionScores.reduce((sum, v) => sum + v, 0) / allSectionScores.length).toFixed(1))
      : 0.0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: 'url("/images/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Responsive Header */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-start" },
            gap: 2
          }}
        >
          <Box>
            <img src="/images/productivelogo.png" alt="Logo" style={{ width: "60px", height: "auto" }} />
          </Box>

          <Box sx={{ textAlign: { xs: "center" }, width: "100%" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
              Automation Champion Assessment
            </h1>
          </Box>
        </Paper>

        <Button variant="contained" sx={{ mb: 3 }} onClick={() => navigate(-1)}>
          ← Back to Dashboard
        </Button>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 800 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Participant Name</TableCell>
                <TableCell colSpan={7}>{e.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Factory</TableCell>
                <TableCell colSpan={7}>{e.factory}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
                <TableCell colSpan={3}>{e.project}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Rating</TableCell>
                <TableCell colSpan={3} sx={{ backgroundColor: "yellow", fontWeight: "bold", textAlign: "center" }}>
                  {overallRating.toFixed(1)} / 10
                </TableCell>
              </TableRow>
              <TableRow>
                {[
                  "Sr No",
                  "Evaluation Criteria",
                  "Weight",
                  "Score",
                  "Particulars",
                  "Rating Range",
                  "Sub-Score",
                  "Evaluated By"
                ].map((h) => (
                  <TableCell key={h} align="center" sx={{ fontWeight: "bold" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {Object.entries(EVAL_CONFIG).map(([sectionKey, { title, weight, evaluator, items }], sIdx) =>
                items.map((it, iIdx) => {
                  const subScoreVal = e.answers?.[sectionKey]?.[it.key];
                  return (
                    <TableRow key={it.key}>
                      {iIdx === 0 && (
                        <>
                          <TableCell rowSpan={items.length} align="center">
                            {sIdx + 1}
                          </TableCell>
                          <TableCell rowSpan={items.length}>{title}</TableCell>
                          <TableCell rowSpan={items.length} align="center">
                            {weight}%
                          </TableCell>
                          <TableCell rowSpan={items.length} align="center">
                            {sectionScores[sectionKey]?.toFixed(1) || "0.0"}
                          </TableCell>
                        </>
                      )}
                      <TableCell>{it.label}</TableCell>
                      <TableCell align="center">0 – {it.max}</TableCell>
                      <TableCell align="center">
                        {subScoreVal !== "" && subScoreVal !== undefined ? Number(subScoreVal).toFixed(2) : "–"}
                      </TableCell>
                      {iIdx === 0 && (
                        <TableCell rowSpan={items.length} align="center">
                          {evaluator}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
