const required = (name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return process.env[name];
};

const optional = (name, fallback) => process.env[name] || fallback;

const config = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", "3000")),
  clientUrl: optional("CLIENT_URL", "http://localhost:5173"),
  sessionSecret: required("SESSION_SECRET"),
  google: {
    clientId: required("GOOGLE_CLIENT_ID"),
    clientSecret: required("GOOGLE_CLIENT_SECRET"),
    callbackUrl: required("GOOGLE_CALLBACK_URL"),
  },
  mysql: {
    host: required("MYSQL_HOST"),
    user: required("MYSQL_USER"),
    password: required("MYSQL_PASSWORD"),
    database: required("MYSQL_DATABASE"),
    port: Number(optional("MYSQL_PORT", "3306")),
  },
  apis: {
    currencyApiKey: required("CURRENCY_API_KEY"),
    goldApiKey: required("GOLD_API_KEY"),
  },
};

module.exports = { config };
