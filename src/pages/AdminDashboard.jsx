import React, { useState, useMemo,useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, TextField, Menu, MenuItem,
  useTheme, useMediaQuery, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { ArrowDownward, ArrowUpward, Edit, Delete } from "@mui/icons-material";
import { EVAL_CONFIG } from "../config/evalConfig";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import Tooltip from '@mui/material/Tooltip';

const FACTORIES = ["AIS", "GIS", "BIC"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [factoryFilter, setFactoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [desc, setDesc] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);

  const userRole = sessionStorage.getItem("userRole");
  const isSuperAdmin = userRole === "superadmin";
  const [participants, setParticipants] = useState([]);
useEffect(() => {
  fetch(`${import.meta.env.VITE_API_BASE_URL}/employees`)
    .then((res) => res.json())
    .then(setParticipants)
    .catch((err) => console.error("Failed to load participants", err));
}, []);


  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: "", factory: "", project: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const isFormValid = newParticipant.name.trim() !== "" && newParticipant.factory.trim() !== "" && newParticipant.project.trim() !== "";

  const handleAddParticipant = async () => {
    if (!isFormValid) return;
    try {
      const method = editIndex !== null ? "PUT" : "POST";
      const endpoint = `${import.meta.env.VITE_API_BASE_URL}/employees${method === "PUT" ? `/${participants[editIndex].id}` : ""}`;
      
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParticipant),
      });
  
      if (!res.ok) throw new Error("Failed to save participant");
  
      // Refetch updated list from server
      const updatedList = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees`).then(r => r.json());
      setParticipants(updatedList);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving the participant.");
    }
  
    setOpenAddDialog(false);
    setNewParticipant({ name: "", factory: "", project: "" });
    setEditIndex(null);
  };
  
  const handleEdit = (index) => {
    setNewParticipant(participants[index]);
    setEditIndex(index);
    setOpenAddDialog(true);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteIndex !== null) {
      const participantToDelete = participants[deleteIndex];
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees/${participantToDelete.id}`, {
          method: "DELETE",
        });
        const updatedList = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees`).then(r => r.json());
        setParticipants(updatedList);
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
    setConfirmDialogOpen(false);
    setDeleteIndex(null);
  };
  

  const rows = useMemo(() => {
    const totalFields = Object.values(EVAL_CONFIG).reduce((sum, sec) => sum + sec.items.length, 0);
    let list = participants.map((e, i) => {
      const answers = e.answers || {};
      let weightedSum = 0, totalWeight = 0;
      Object.entries(EVAL_CONFIG).forEach(([secKey, section]) => {
        const subScores = section.items.map((item) => {
          const val = parseFloat(answers?.[secKey]?.[item.key]);
          return isNaN(val) ? null : (val / item.max) * 10;
        }).filter(v => v !== null);
        const sectionAvg = subScores.length > 0 ? subScores.reduce((s, v) => s + v, 0) / subScores.length : null;
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
          if (val !== null && val !== undefined && val !== "") filled += 1;
        });
      });
      const filling = totalFields > 0 ? Math.round((filled / totalFields) * 100) : 0;
      return { ...e, sr: i + 1, answers, rating, filling };
    });
    const sortedByRating = [...list].filter(p => p.rating > 0).sort((a, b) => b.rating - a.rating);
    const topFiveNames = new Set(sortedByRating.slice(0, 5).map(p => p.name));
    list = list.map(p => ({ ...p, isTop: topFiveNames.has(p.name) }));
    list = list.filter(e => {
      const matchFactory = factoryFilter === "All" || e.factory === factoryFilter;
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.factory.toLowerCase().includes(search.toLowerCase()) ||
        e.project.toLowerCase().includes(search.toLowerCase());
      return matchFactory && matchSearch;
    });
    if (sortKey) {
      list.sort((a, b) => {
        const valA = a[sortKey], valB = b[sortKey];
        if (typeof valA === "boolean" && typeof valB === "boolean") return desc ? valB - valA : valA - valB;
        return desc ? (valB || "").toString().localeCompare((valA || "").toString(), undefined, { numeric: true })
                    : (valA || "").toString().localeCompare((valB || "").toString(), undefined, { numeric: true });
      });
    }
    return list;
  }, [participants, factoryFilter, search, sortKey, desc]);

  const columns = [
    { key: "sr", label: "Sr." },
    { key: "isTop", label: "League Toppers", sortable: true },
    { key: "name", label: "Participant Name" },
    { key: "factory", label: "Factory" },
    { key: "project", label: "Project" },
    ...(userRole === "admin" || userRole === "superadmin" ? [{ key: "fill", label: "Eval Form", sortable: false }] : []),
    { key: "rating", label: "Rating" },
    { key: "report", label: "Report", sortable: false },
    { key: "filling", label: "Filled %" },
    ...(isSuperAdmin ? [{ key: "actions", label: "Actions", sortable: false }] : [])
  ];

  const handleExportCSV = () => {
    const headers = ["Sr.", "Participant Name", "Factory", "Project", "Rating", "Filled %"];
    const csvContent = [headers.join(","), ...rows.map(r => [r.sr, `"${r.name}"`, `"${r.factory}"`, `"${r.project}"`, r.rating.toFixed(1), `${r.filling}%`].join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "evaluation_dashboard.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (key) => {
    if (sortKey === key) setDesc(!desc);
    else { setSortKey(key); setDesc(true); }
  };

  const renderChampionIcon = (isTop) => {
    return isTop ? (
      <Tooltip title="Top 5 Champion">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5 }}>
          <EmojiEventsIcon sx={{ color: "#FFD700" }} />
          <StarIcon sx={{ color: "#FFD700" }} />
        </Box>
      </Tooltip>
    ) : null;
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundImage: 'url("/images/loginbackground.png")', backgroundSize: "cover", py: 4, px: 2 }}>
      <Box sx={{ maxWidth: "1400px", margin: "auto" }}>
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

        {/* Filters and Controls */}
        <Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "column", md: "row" },
    justifyContent: "space-between",
    alignItems: { xs: "stretch", md: "center" },
    gap: 2,
    flexWrap: "wrap",
    mb: 3,
  }}
>
  {/* Left Side: Factory + Search */}
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      gap: 2,
      flex: 1,
      alignItems: "center",
    }}
  >
    <FormControl
      size="small"
      variant="outlined"
      sx={{
        minWidth: 150,
        backgroundColor: "#fff",
        borderRadius: 1,
      }}
    >
      <InputLabel id="factory-label">Factory</InputLabel>
      <Select
        labelId="factory-label"
        id="factory"
        value={factoryFilter}
        label="Factory"
        onChange={(e) => setFactoryFilter(e.target.value)}
        sx={{
          ".MuiSelect-select": {
            display: "flex",
            alignItems: "center",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "#fff",
              color: "#000",
            },
          },
        }}
      >
        <MenuItem value="All">All</MenuItem>
        {FACTORIES.map((f) => (
          <MenuItem key={f} value={f}>
            {f}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <TextField
      fullWidth
      size="small"
      variant="outlined"
      label="Search Participant / Project"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      sx={{
        maxWidth: 500,
        backgroundColor: "#fff",
        borderRadius: 1,
      }}
    />
  </Box>

  {/* Right Side: Buttons */}
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 3,
      justifyContent: { xs: "flex-start", md: "flex-end" },
      alignItems: "center",
    }}
  >
    {userRole === "superadmin" && (
      <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
        Add Participant
      </Button>
    )}
    <Button variant="contained" color="primary" onClick={handleClick}>
      Document Library
    </Button>
    <Button variant="contained" color="success" onClick={handleExportCSV}>
      Export CSV
    </Button>
  </Box>
</Box>

        {/* Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={() => handleNavigate('/evaluation-criteria')}>Evaluation Criteria</MenuItem>
          <MenuItem onClick={() => window.open('/documents/dmaic-methodology.pdf', '_blank')}>DMAIC Methodology</MenuItem>
          <MenuItem onClick={() => handleNavigate('/templates')}>Project Presentation slides</MenuItem>
          <MenuItem onClick={() => handleNavigate('/process-flow')}>Process Flow</MenuItem>
          <MenuItem onClick={() => handleNavigate('/policies')}>Policies</MenuItem>
        </Menu>

        <TableContainer component={Paper} elevation={5} sx={{ height: "65vh", overflowY: "auto", borderRadius: 3 }}>
          <Table stickyHeader sx={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                {columns.map(({ key, label, sortable = true }) => (
                  <TableCell key={key} align="center" sx={{ fontWeight: "bold", fontSize: "1rem", bgcolor: "#1976d2", color: "#fff", position: 'sticky', top: 0, zIndex: 1 }}>
                    <Box sx={{ cursor: sortable ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => sortable && toggleSort(key)}>
                      {label}
                      {sortKey === key && (desc ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />)}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.sr} hover sx={{ "&:hover": { backgroundColor: "#f9f9f9", transition: "background-color 0.3s" } }}>
                  <TableCell align="center">{r.sr}</TableCell>
                  <TableCell align="center">
  {renderChampionIcon(r.isTop)}
</TableCell>


                  <TableCell align="left">{r.name}</TableCell>
                  <TableCell align="center">{r.factory}</TableCell>
                  <TableCell align="left" sx={{ wordBreak: "break-word" }}>{r.project}</TableCell>
                  {(userRole === "admin" || userRole === "superadmin") && (
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
                  {isSuperAdmin && (
                    <TableCell align="center">
                      <Edit onClick={() => handleEdit(i)} style={{ cursor: "pointer", marginRight: 8 }} />
                      <Delete onClick={() => handleDelete(i)} style={{ cursor: "pointer", color: "red" }} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {isSuperAdmin && (
  <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
    <DialogTitle>{editIndex !== null ? "Edit Participant" : "Add Participant"}</DialogTitle>
    <DialogContent dividers>
      <TextField
        required
        label="Participant Name"
        value={newParticipant.name}
        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
        fullWidth sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }} required>
        <InputLabel>Factory</InputLabel>
        <Select
          value={newParticipant.factory}
          label="Factory"
          onChange={(e) => setNewParticipant({ ...newParticipant, factory: e.target.value })}
        >
          {FACTORIES.map((f) => (
            <MenuItem key={f} value={f}>{f}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        required
        label="Project"
        value={newParticipant.project}
        onChange={(e) => setNewParticipant({ ...newParticipant, project: e.target.value })}
        fullWidth
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
      <Button variant="contained" color="success" onClick={handleAddParticipant} disabled={!isFormValid}>Save</Button>
    </DialogActions>
  </Dialog>
)}

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent dividers>Are you sure you want to delete this participant?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      </Box>
    </Box>
  );
}