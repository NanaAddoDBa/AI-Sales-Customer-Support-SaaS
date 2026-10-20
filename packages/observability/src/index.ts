export const loggerOptions = {
  level: "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
      "body.password",
      "body.accessToken",
      "body.refreshToken",
      "body.token",
      "req.body.password",
      "req.body.accessToken",
      "req.body.refreshToken",
      "req.body.token",
      "password",
      "accessToken",
      "refreshToken",
      "credential",
      "credential_envelope",
    ],
    censor: "[REDACTED]",
  },
};
