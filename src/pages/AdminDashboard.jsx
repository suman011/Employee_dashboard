import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, TextField, Menu, MenuItem,
  useTheme, useMediaQuery, Select, InputLabel, FormControl
} from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import employees from "../data/employees.json";
import { EVAL_CONFIG } from "../config/evalConfig";

const FACTORIES = ["All", "AIS", "GIS", "BIC"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [factoryFilter, setFactoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [desc, setDesc] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("jwt-token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const rows = useMemo(() => {
    const totalFields = Object.values(EVAL_CONFIG).reduce((sum, sec) => sum + sec.items.length, 0);
    let list = employees.map((e, i) => {
      const local = localStorage.getItem(`eval_${e.name}`);
      let answers = {};
      if (local) {
        try {
          const parsed = JSON.parse(local);
          answers = parsed?.answers || {};
        } catch {
          answers = {};
        }
      }

      let weightedSum = 0;
      let totalWeight = 0;

      Object.entries(EVAL_CONFIG).forEach(([secKey, section]) => {
        const subScores = section.items.map((item) => {
          const val = parseFloat(answers?.[secKey]?.[item.key]);
          return isNaN(val) ? null : (val / item.max) * 10;
        }).filter((v) => v !== null);
        const sectionAvg = subScores.length > 0 ? subScores.reduce((sum, v) => sum + v, 0) / subScores.length : null;
        if (sectionAvg !== null) {
          weightedSum += sectionAvg;
          totalWeight += 1;
        }
      });

      const rating = totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(1)) : 0;
      let filled = 0;
      Object.entries(EVAL_CONFIG).forEach(([sectionKey, section]) => {
        section.items.forEach((item) => {
          const val = answers?.[sectionKey]?.[item.key];
          if (val !== null && val !== undefined && val !== "") {
            filled += 1;
          }
        });
      });

      const filling = totalFields > 0 ? Math.round((filled / totalFields) * 100) : 0;

      return { ...e, sr: i + 1, answers, rating, filling };
    });

    list = list.filter((e) => {
      const matchesFactory = factoryFilter === "All" || e.factory === factoryFilter;
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase())
        || e.factory.toLowerCase().includes(search.toLowerCase())
        || e.project.toLowerCase().includes(search.toLowerCase());
      return matchesFactory && matchesSearch;
    });

    if (sortKey) {
      list.sort((a, b) =>
        desc
          ? (b[sortKey] || "").toString().localeCompare((a[sortKey] || "").toString(), undefined, { numeric: true })
          : (a[sortKey] || "").toString().localeCompare((b[sortKey] || "").toString(), undefined, { numeric: true })
      );
    }
    return list;
  }, [factoryFilter, search, sortKey, desc]);

  const toggleSort = (key) => {
    if (sortKey === key) setDesc(!desc);
    else { setSortKey(key); setDesc(true); }
  };

  const columns = [
    { key: "sr", label: "Sr." },
    { key: "name", label: "Participant Name" },
    { key: "factory", label: "Factory" },
    { key: "project", label: "Project" },
    ...(sessionStorage.getItem("userRole") === "admin"
      ? [{ key: "fill", label: "Eval Form", sortable: false }] : []),
    { key: "rating", label: "Rating" },
    { key: "report", label: "Report", sortable: false },
    { key: "filling", label: "Filled %" }
  ];

  const handleExportCSV = () => {
    const headers = ["Sr.", "Participant Name", "Factory", "Project", "Rating", "Filled %"];
    const csvContent = [
      headers.join(","), ...rows.map((r) => [
        r.sr, r.name, r.factory, `"${r.project}"`, r.rating.toFixed(1), `${r.filling}%`
      ].join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "evaluation_dashboard.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundImage: 'url("/images/loginbackground.png")',
      backgroundSize: "cover",
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: "1400px", margin: "auto" }}>
        {/* Header */}
        <Paper elevation={5} sx={{ p: 2, mb: 3, position: "relative", display: "flex", alignItems: "center", height: "110px", justifyContent: "center", borderRadius: 3 }}>
          <Box sx={{ position: "absolute", left: 20 }}>
            <img src="/images/productivelogo.png" alt="Logo" style={{ width: "65px", height: "auto" }} />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>Automation Champion Assessment</h1>
          </Box>
          <Box sx={{ position: "absolute", right: 20, top: "60%" }}>
            <Button variant="contained" color="error" onClick={handleLogout}>LOGOUT</Button>
          </Box>
        </Paper>

        {/* Filters */}
        <Box sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          gap: 2,
        }}>
          <Box sx={{ minWidth: "150px" }}>
            <FormControl fullWidth size="small" sx={{ backgroundColor: "#fff", borderRadius: 1 }}>
              <InputLabel shrink>Factory</InputLabel>
              <Select
                value={factoryFilter}
                label="Factory"
                onChange={(e) => setFactoryFilter(e.target.value)}
                MenuProps={{ PaperProps: { sx: { backgroundColor: "#fff", color: "#000" } } }}
              >
                {FACTORIES.map((f) => (
                  <MenuItem key={f} value={f}>{f}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: 1, maxWidth: "500px" }}>
            <TextField
              fullWidth
              size="small"
              label="Search Participant / Project"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ backgroundColor: "#fff", borderRadius: 1 }}
            />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "flex-end", alignItems: "center" }}>
            <Button variant="contained" color="primary" onClick={handleClick}>DOCUMENT LIBRARY</Button>
            <Button variant="contained" color="success" onClick={handleExportCSV}>EXPORT CSV</Button>
          </Box>
        </Box>

        {/* Menu with updated DMAIC */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={() => handleNavigate('/evaluation-criteria')}>Evaluation Criteria</MenuItem>
          <MenuItem onClick={() => window.open('/documents/dmaic-methodology.pdf', '_blank')}>DMAIC Methodology</MenuItem>
          <MenuItem onClick={() => handleNavigate('/templates')}>Project Presentation slides</MenuItem>
          <MenuItem onClick={() => handleNavigate('/process-flow')}>Process Flow</MenuItem>
          <MenuItem onClick={() => handleNavigate('/policies')}>Policies</MenuItem>
        </Menu>

        {/* Table */}
        <TableContainer component={Paper} elevation={5} sx={{ height: "65vh", overflowY: "auto", borderRadius: 3 }}>
          <Table stickyHeader sx={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                {columns.map(({ key, label, sortable = true }) => (
                  <TableCell key={key} align="center" sx={{
                    fontWeight: "bold", fontSize: "1rem",
                    bgcolor: "#1976d2", color: "#fff", position: 'sticky', top: 0, zIndex: 1
                  }}>
                    <Box sx={{ cursor: sortable ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => sortable && toggleSort(key)}
                    >
                      {label}
                      {sortKey === key && (desc ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />)}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.sr} hover sx={{ "&:hover": { backgroundColor: "#f9f9f9", transition: "background-color 0.3s" } }}>
                  <TableCell align="center">{r.sr}</TableCell>
                  <TableCell align="left">{r.name}</TableCell>
                  <TableCell align="center">{r.factory}</TableCell>
                  <TableCell align="left" sx={{ wordBreak: "break-word" }}>{r.project}</TableCell>
                  {sessionStorage.getItem("userRole") === "admin" && (
                    <TableCell align="center">
                      <Button size="small" variant="contained" color="warning"
                        onClick={() => {
                          const formWindow = window.open(`/evaluate?name=${encodeURIComponent(r.name)}`, "_blank", "width=1200,height=800");
                          const interval = setInterval(() => {
                            if (formWindow.closed) {
                              clearInterval(interval);
                              window.location.reload();
                            }
                          }, 1000);
                        }}>FILL FORM</Button>
                    </TableCell>
                  )}
                  <TableCell align="center" sx={{ color: r.rating < 7 ? "red" : "inherit" }}>{r.rating.toFixed(1)}</TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined" onClick={() => navigate(`/employee/${r.sr - 1}`)}>VIEW</Button>
                  </TableCell>
                  <TableCell align="center">{r.filling}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
