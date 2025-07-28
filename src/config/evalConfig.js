// src/config/evalConfig.js

export const EVAL_CONFIG = {
    upskilling: {
      title: "Upskilling",
      evaluator: "IGTR",
      weight: 20,
      items: [
        { key: "attendance", label: "Attendance", max: 10 },
        { key: "exam", label: "Exam Score", max: 10 },
      ],
    },
    projectExecution: {
      title: "Project Execution",
      evaluator: "Department Head",
      weight: 40,
      items: [
        { key: "define", label: "Define & Measure", max: 10 },
        { key: "analyze", label: "Analyze & Improve", max: 20 },
        { key: "control", label: "Control", max: 10 },
      ],
    },
    valueAddition: {
      title: "Value Addition",
      evaluator: "BE Team",
      weight: 20,
      items: [
        { key: "ideas", label: "New Ideas", max: 10 },
        { key: "design", label: "Concept & Design", max: 10 },
      ],
    },
    teamWork: {
      title: "Team Work",
      evaluator: "Team Lead & Mentor",
      weight: 20,
      items: [
        { key: "communication", label: "Communication", max: 10 },
        { key: "accountability", label: "Accountability & Reliability", max: 10 },
      ],
    },
  };
  