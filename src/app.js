require("dotenv").config();
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const MySQLStore = require("express-mysql-session");
const { config } = require("./config/env");
const { passport } = require("./config/passport");
const rateRoutes = require("./routes/rateRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "id",
        expires: "expires",
        data: "data",
      },
    },
  },
  {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port,
  }
);

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: "expense-rates.sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: config.nodeEnv === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("src/public"));

app.get("/login", (req, res) => {
  res.sendFile("index.html", { root: "src/public" });
});

app.use("/auth", authRoutes);
app.use("/api", rateRoutes);
app.use("/api/user", userRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = { app };
