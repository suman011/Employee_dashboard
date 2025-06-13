import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  TextField,
  useTheme,
  useMediaQuery
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

  const rows = useMemo(() => {
    const totalFields = Object.values(EVAL_CONFIG).reduce(
      (sum, sec) => sum + sec.items.length,
      0
    );

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
        const subScores = section.items
          .map((item) => {
            const val = parseFloat(answers?.[secKey]?.[item.key]);
            return isNaN(val) ? null : (val / item.max) * 10;
          })
          .filter((v) => v !== null);

        const sectionAvg =
          subScores.length > 0
            ? subScores.reduce((sum, v) => sum + v, 0) / subScores.length
            : null;

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

      return {
        ...e,
        sr: i + 1,
        answers,
        rating,
        filling
      };
    });

    list = list.filter((e) => {
      const matchesFactory = factoryFilter === "All" || e.factory === factoryFilter;
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.factory.toLowerCase().includes(search.toLowerCase()) ||
        e.project.toLowerCase().includes(search.toLowerCase());
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
    else {
      setSortKey(key);
      setDesc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Sr.", "Participant Name", "Factory", "Project", "Rating", "Filled %"];
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        [r.sr, r.name, r.factory, `"${r.project}"`, r.rating.toFixed(1), `${r.filling}%`].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "evaluation_dashboard.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const handleReset = () => {
  //   if (window.confirm("Are you sure you want to reset all evaluation data?")) {
  //     setFactoryFilter("All");
  //     setSearch("");
  //     setSortKey(null);
  //     setDesc(true);

  //     employees.forEach((emp) => {
  //       localStorage.removeItem(`eval_${emp.name}`);
  //     });
  //   }
  // };

  const columns = [
    { key: "sr", label: "Sr." },
    { key: "name", label: "Participant Name" },
    { key: "factory", label: "Factory" },
    { key: "project", label: "Project" },
    ...(sessionStorage.getItem("userRole") === "admin"
      ? [{ key: "fill", label: "Eval Form", sortable: false }]
      : []),
    { key: "rating", label: "Rating" },
    { key: "report", label: "Report", sortable: false },
    { key: "filling", label: "Filled %" }
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundImage: 'url("/images/loginbackground.png")', backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", py: 4 }}>
      <Grid container justifyContent="center">
        <Grid xs={12}>
          <Paper elevation={3} sx={{ p: 2, mb: 2, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 2 }}>
            <Box><img src="/images/productivelogo.png" alt="Logo" style={{ width: "60px", height: "auto" }} /></Box>
            <Box sx={{ textAlign: { xs: "center", sm: "center" }, width: "100%" }}>
              <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>Automation Champion Assessment</h1>
            </Box>
          </Paper>

          <Grid container spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1}}>
                {FACTORIES.map((f) => (
                  <Button key={f} variant={factoryFilter === f ? "contained" : "outlined"} onClick={() => setFactoryFilter(f)}
                    sx={{
                      backgroundColor: factoryFilter === f ? "#1976d2" : "#fff",
                      color: factoryFilter === f ? "#fff" : "#1976d2",
                      borderColor: "#1976d2",
                      "&:hover": { backgroundColor: factoryFilter === f ? "#1565c0" : "#f0f0f0" }
                    }}>
                    {f}
                  </Button>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-end", gap: 1 }}>
                <TextField variant="outlined" size="small" label="Search by name, factory or project" value={search} onChange={(e) => setSearch(e.target.value)}
                  sx={{ minWidth: 200, backgroundColor: "#fff", borderRadius: 1 }} />
                <Button variant="contained" color="primary" onClick={() => navigate("/evaluation-criteria")}>EVALUATION CRITERIA</Button>
                {/* <Button variant="outlined" onClick={handleReset} style={{ backgroundColor: "#fff" }}>RESET</Button> */}
                <Button variant="contained" onClick={handleExportCSV}>EXPORT CSV</Button>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <TableContainer component={Paper} elevation={3} sx={{ minWidth: "100%" }}>
              <Table sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow>
                    {columns.map(({ key, label, sortable = true }) => (
                      <TableCell key={key} align="center" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                        <Box sx={{ cursor: sortable ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onClick={() => sortable && toggleSort(key)}>
                          {label}
                          {sortKey === key && (desc ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />)}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.sr} hover>
                      <TableCell align="center">{r.sr}</TableCell>
                      <TableCell align="left">{r.name}</TableCell>   {/* Left aligned */}
                      <TableCell align="center">{r.factory}</TableCell>
                      <TableCell align="left">{r.project}</TableCell> {/* Left aligned */}

                      {sessionStorage.getItem("userRole") === "admin" && (
                        <TableCell align="center">
                          <Button size="small" variant="contained" color="warning"
                            onClick={() => {
                              const formWindow = window.open(
                                `/evaluate?name=${encodeURIComponent(r.name)}`,
                                "_blank",
                                "width=1200,height=800"
                              );
                              const interval = setInterval(() => {
                                if (formWindow.closed) {
                                  clearInterval(interval);
                                  window.location.reload();
                                }
                              }, 1000);
                            }}>
                            FILL FORM
                          </Button>
                        </TableCell>
                      )}

                      <TableCell align="center" sx={{ color: r.rating < 7 ? "red" : "inherit" }}>
                        {r.rating.toFixed(1)}
                      </TableCell>

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
        </Grid>
      </Grid>
    </Box>
  );
}
