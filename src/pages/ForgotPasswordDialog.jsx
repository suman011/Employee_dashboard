import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Snackbar, Alert
} from "@mui/material";
import users from "../data/db.json";

export default function ForgotPasswordDialog({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const handleReset = () => {
    if (!email || !newPassword || !confirmPassword) {
      setSnackbar({ open: true, message: "All fields are required.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match.", type: "error" });
      return;
    }

    const userIndex = users.users.findIndex(user => user.username === email);
    if (userIndex !== -1) {
      users.users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users.users)); // mimic saving
      setSnackbar({ open: true, message: "Password updated successfully.", type: "success" });
      setTimeout(() => onClose(), 1000);
    } else {
      setSnackbar({ open: true, message: "Email not found.", type: "error" });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleReset}>Reset Password</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.type} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
