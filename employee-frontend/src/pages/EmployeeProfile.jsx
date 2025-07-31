import React, { useEffect, useState } from "react";
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
  useMediaQuery,
} from "@mui/material";

import { EVAL_CONFIG } from "../config/evalConfig";


export default function EmployeeProfile() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const id = routeId ?? sessionStorage.getItem("employeeIndex");
  const [participant, setParticipant] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees`);
        const allEmployees = await res.json();
        const index = parseInt(id, 10);
        const selected = allEmployees[index];
        if (selected) {
          setParticipant(selected);
          setAnswers(selected.answers || {});
        }
      } catch (err) {
        console.error("Failed to fetch employee profile", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchParticipant();
  }, [id]);
  

  if (loading) return <Typography sx={{ p: 4 }}>Loading...</Typography>;
  if (!participant) return <Typography sx={{ p: 4 }} color="error">Participant not found.</Typography>;

  let weightedSum = 0;
  let totalWeight = 0;
  const sectionScores = {};

  Object.entries(EVAL_CONFIG).forEach(([sectionKey, { weight, items }]) => {
    const subScores = items
      .map((it) => {
        const val = parseFloat(answers?.[sectionKey]?.[it.key]);
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

  const overallRating = totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(1)) : 0.0;

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
        <Paper elevation={3} sx={{ p: 2, mb: 2, display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Box>
            <img src="/images/productivelogo.png" alt="Logo" style={{ width: "60px", height: "auto" }} />
          </Box>
          <Box sx={{ textAlign: "center", flexGrow: 1 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>Automation Champion Assessment</h1>
          </Box>
        </Paper>

        <Button variant="contained" sx={{ mb: 3 }} onClick={() => navigate(-1)}>
          ← Back to Dashboard
        </Button>

        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Participant Name</TableCell>
                <TableCell colSpan={7}>{participant.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Factory</TableCell>
                <TableCell colSpan={7}>{participant.factory}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
                <TableCell colSpan={3}>{participant.project}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Rating</TableCell>
                <TableCell colSpan={3} sx={{ backgroundColor: "yellow", fontWeight: "bold", textAlign: "center" }}>
                  {overallRating.toFixed(1)} / 10
                </TableCell>
              </TableRow>
              <TableRow>
                {["Sr No", "Evaluation Criteria", "Weight", "Score", "Particulars", "Rating Range", "Sub-Score", "Evaluated By"].map((h) => (
                  <TableCell key={h} align="center" sx={{ fontWeight: "bold" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {Object.entries(EVAL_CONFIG).map(([sectionKey, { title, weight, evaluator, items }], sIdx) =>
                items.map((it, iIdx) => {
                  const subScoreVal = answers?.[sectionKey]?.[it.key];
                  return (
                    <TableRow key={it.key}>
                      {iIdx === 0 && (
                        <>
                          <TableCell rowSpan={items.length} align="center">{sIdx + 1}</TableCell>
                          <TableCell rowSpan={items.length}>{title}</TableCell>
                          <TableCell rowSpan={items.length} align="center">{weight}%</TableCell>
                          <TableCell rowSpan={items.length} align="center">{sectionScores[sectionKey]?.toFixed(1) || "0.0"}</TableCell>
                        </>
                      )}
                      <TableCell>{it.label}</TableCell>
                      <TableCell align="center">0 – {it.max}</TableCell>
                      <TableCell align="center">
                        {subScoreVal !== "" && subScoreVal !== undefined ? Number(subScoreVal).toFixed(2) : "–"}
                      </TableCell>
                      {iIdx === 0 && (
                        <TableCell rowSpan={items.length} align="center">{evaluator}</TableCell>
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