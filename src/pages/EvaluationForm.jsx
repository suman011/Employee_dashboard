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

  // Prepare initial empty answers object based on EVAL_CONFIG
  const initial = {};
  Object.entries(EVAL_CONFIG).forEach(([sec, cfg]) => {
    initial[sec] = {};
    cfg.items.forEach((it) => {
      initial[sec][it.key] = "";
    });
  });

  const [answers, setAnswers] = useState(initial);
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const userRole = sessionStorage.getItem("userRole");
  const formKey = `eval_${participant}`;

  useEffect(() => {
    const saved = localStorage.getItem(formKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.answers) {
        setAnswers(parsed.answers);
        setSubmittedAnswers(parsed.answers);
      }
      if (parsed.submittedBy) setIsSubmitted(true);
    }
  }, [formKey]);

  const handleChange = (sec, item, val, max) => {
    if (val === "") {
      setAnswers((prev) => ({
        ...prev,
        [sec]: { ...prev[sec], [item]: "" },
      }));
      return;
    }
    const cleaned = val.replace(/^0+(?=\d)/, "");
    const number = Number(cleaned);
    if (number <= max && number >= 0) {
      setAnswers((prev) => ({
        ...prev,
        [sec]: { ...prev[sec], [item]: number },
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem(
      formKey,
      JSON.stringify({ answers, submittedBy: userRole })
    );
    setIsSubmitted(true);
    setSubmittedAnswers(answers);
    alert("Submitted! 🎉");
    navigate("/admin-dashboard");
  };

  const handleReset = () => {
    const cleared = {};
    Object.entries(initial).forEach(([sec, items]) => {
      cleared[sec] = {};
      Object.keys(items).forEach((key) => {
        cleared[sec][key] = "";
      });
    });
    setAnswers(cleared);
    setIsSubmitted(false);
    setSubmittedAnswers({});
    localStorage.removeItem(formKey);
    alert("Form has been reset.");
  };

  // Field disable logic:
  // superadmin: always editable
  // employee: always disabled
  // admin: disabled if field already submitted (not empty)
  const isFieldDisabled = (sectionKey, itemKey) => {
    if (userRole === "superadmin") return false;
    if (userRole === "employee") return true;

    if (
      userRole === "admin" &&
      submittedAnswers?.[sectionKey]?.[itemKey] !== undefined &&
      submittedAnswers?.[sectionKey]?.[itemKey] !== ""
    ) {
      return true;
    }
    return false;
  };

  // Submit button disabled for employees and for admins if already submitted
  const isSubmitDisabled =
    userRole === "employee" || (userRole === "admin" && isSubmitted);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: 'url("/images/loginbackground.png")',
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
            height: "100px",
          }}
        >
          <Box sx={{ position: "absolute", left: 45 }}>
            <img
              src="/images/productivelogo.png"
              alt="Logo"
              style={{ width: "80px", height: "auto" }}
            />
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", width: "100%" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "bold", margin: 0 }}>
              Automation Champion Assessment
            </h1>
          </Box>
        </Paper>

        <Button
          variant="contained"
          sx={{ mb: 3 }}
          onClick={() => navigate("/admin-dashboard")}
        >
          ← Back to Dashboard
        </Button>

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
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
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
                      onBlur={(e) => {
                        const cleaned = e.target.value.replace(/^0+(?=\d)/, "");
                        setAnswers((prev) => ({
                          ...prev,
                          [secKey]: { ...prev[secKey], [it.key]: cleaned },
                        }));
                      }}
                      disabled={isFieldDisabled(secKey, it.key)}
                    />
                  </Box>
                ))}
              </Box>
            ))}

            {userRole !== "employee" && (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ mt: 2, mr: 2 }}
                  disabled={isSubmitDisabled}
                >
                  Submit Evaluation
                </Button>

                {userRole === "superadmin" && (
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ mt: 2 }}
                    onClick={handleReset}
                  >
                    Reset Form
                  </Button>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
