// Central config — set REACT_APP_BACKEND_URL in your deployment env vars
// e.g. https://your-backend.onrender.com  (no trailing slash)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export { BACKEND_URL };
