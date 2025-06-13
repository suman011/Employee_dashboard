import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  Divider,
} from "@mui/material";
import { EVAL_CONFIG } from "../config/evalConfig";

function useQueryParam(key) {
  return new URLSearchParams(useLocation().search).get(key) || "";
}

export default function EvaluationForm() {
  const navigate = useNavigate();
  const participant = decodeURIComponent(useQueryParam("name"));

  const initial = {};
  Object.entries(EVAL_CONFIG).forEach(([sec, cfg]) => {
    initial[sec] = {};
    cfg.items.forEach((it) => {
      initial[sec][it.key] = "";
    });
  });

  const [answers, setAnswers] = useState(initial);

  useEffect(() => {
    const saved = localStorage.getItem(`eval_${participant}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.answers) setAnswers(parsed.answers);
    }
  }, [participant]);

  const handleChange = (sec, item, val, max) => {
    const number = Number(val);
    if (number <= max && number >= 0) {
      setAnswers((prev) => ({
        ...prev,
        [sec]: { ...prev[sec], [item]: number },
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem(`eval_${participant}`, JSON.stringify({ answers }));
    alert("Submitted! 🎉");
    navigate("/admin-dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: 'url("/images/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: 4,
      }}
    >
      <Container maxWidth="md">
         <Paper
           elevation={3}
           sx={{
             p: 2,
             mb: 2,
             position: "relative",
             display: "flex",
             alignItems: "center",
             height: "100px"
           }}
         >
           {/* Logo - Left aligned */}
           <Box sx={{ position: "absolute", left: 45 }}>
             <img
               src="/images/productivelogo.png"
               alt="Logo"
               style={{ width: "80px", height: "auto" }}
             />
           </Box>
         
           {/* Title - Centered */}
           <Box
             sx={{
               flex: 1,
               textAlign: "center",
               width: "100%",
             }}
           >
             <h1 style={{ fontSize: "26px", fontWeight: "bold", margin: 0 }}>
               Automation Champion Assessment
             </h1>
           </Box>
         </Paper>
         

        <Paper elevation={3} sx={{ p: 4, backgroundColor: "white" }}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            Evaluate: {participant}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {Object.entries(EVAL_CONFIG).map(([secKey, section], idx) => (
              <Box key={secKey} sx={{ mb: 5 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {idx + 1}. {section.title}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Evaluated by: {section.evaluator}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {section.items.map((it) => (
                  <Box key={it.key} sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      label={`${it.label} (0–${it.max})`}
                      inputProps={{ min: 0, max: it.max }}
                      value={answers[secKey]?.[it.key] ?? ""}
                      onChange={(e) =>
                        handleChange(secKey, it.key, e.target.value, it.max)
                      }
                    />
                  </Box>
                ))}
              </Box>
            ))}

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
            >
              Submit Evaluation
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}