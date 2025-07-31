import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "error" });

  const [userData, setUserData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);

  const navigate = useNavigate();

  // ✅ Fetch user and employee data from public/data
  useEffect(() => {
    Promise.all([
      fetch("/data/db.json").then((res) => res.json()),
      fetch("/data/employees.json").then((res) => res.json()),
    ])
      .then(([usersResp, employeesResp]) => {
        setUserData(usersResp.users || []);
        setEmployeeData(employeesResp || []);
      })
      .catch((err) => console.error("Failed to load login data", err));
  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      setSnackbar({ open: true, message: "Both fields are required!", type: "error" });
      return;
    }

    // ✅ 1. Check in admin/superadmin users
    const user = userData.find((u) => u.username === email && u.password === password);

    if (user) {
      sessionStorage.setItem("userEmail", user.username);
      sessionStorage.setItem("userRole", user.role);
      setSnackbar({ open: true, message: "Logged in successfully!", type: "success" });

      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1000);
      return;
    }

    // ✅ 2. Check in employees
    const employee = employeeData.find((e) => e.username === email && e.password === password);

    if (employee) {
      const empIndex = employeeData.findIndex((e) => e.username === email);
      sessionStorage.setItem("userEmail", employee.username);
      sessionStorage.setItem("userRole", "employee");
      sessionStorage.setItem("employeeIndex", empIndex);
      setSnackbar({ open: true, message: "Logged in successfully!", type: "success" });

      setTimeout(() => {
        navigate("/employee-dashboard");
      }, 1000);
      return;
    }

    // ❌ No match
    setSnackbar({ open: true, message: "Invalid credentials!", type: "error" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url("/images/loginbackground.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
          Login to Continue
        </Typography>

        <TextField
          label="Email"
          fullWidth
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2, py: 1.2, fontWeight: "bold" }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
