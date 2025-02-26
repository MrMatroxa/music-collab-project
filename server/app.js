require("dotenv").config();

require("./db");

const express = require("express");

const app = express();

require("./config")(app);

const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const projectsRoutes = require("./routes/projects.routes");
app.use("/api/projects", projectsRoutes)

const soundsRoutes = require("./routes/sounds.routes");
app.use("/sounds", soundsRoutes)

require("./error-handling")(app);

module.exports = app;
