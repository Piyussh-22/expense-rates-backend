const { app } = require("./app");
const { config } = require("./config/env");
const { ping } = require("./db");

const start = async () => {
  try {
    await ping();
    app.listen(config.port, () => {
      console.log(`server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
