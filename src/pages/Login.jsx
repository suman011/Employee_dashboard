import React, { useState } from "react";
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
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import users from "../data/db.js";
import employees from "../data/employees.js";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "error" });
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password) {
      setSnackbar({ open: true, message: "Both fields are required!", type: "error" });
      return;
    }

    // 1. Check in admin users (from db.json)
    const user = users.users.find((u) => u.username === email && u.password === password);

    if (user) {
      sessionStorage.setItem("userEmail", user.username);
      sessionStorage.setItem("userRole", user.role);
      setSnackbar({ open: true, message: "Logged in successfully!", type: "success" });

      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1000);
      return;
    }

    // 2. Check in employees
    const employee = employees.find((e) => e.username === email && e.password === password);

    if (employee) {
      const empIndex = employees.findIndex((e) => e.username === email);
      sessionStorage.setItem("userEmail", employee.username);
      sessionStorage.setItem("userRole", "employee");
      sessionStorage.setItem("employeeIndex", empIndex);
      setSnackbar({ open: true, message: "Logged in successfully!", type: "success" });

      setTimeout(() => {
        navigate("/employee-dashboard");
      }, 1000);
      return;
    }

    // If neither matched
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
      {/* <Box sx={{ position: "absolute", top: 24, left: 24 }}>
        <img src="/images/productivelogo.png" alt="Logo" style={{ width: "80px" }} />
      </Box> */}

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

        {/* <Box display="flex" justifyContent="flex-end" mt={1}>
          <Link href="#" underline="hover" color="primary" fontSize={14}>
            Forgot password?
          </Link>
        </Box> */}

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
