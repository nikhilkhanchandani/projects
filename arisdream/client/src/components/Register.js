import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "./myAxios";

export default function SignUp() {
  const [state, setState] = React.useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleChange = (name, value) => {
    setState((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (!state.username) {
        throw new Error("Username is missing.");
      }
      if (!state.email) {
        throw new Error("Email is missing.");
      }
      if (!state.name) {
        throw new Error("Name is missing.");
      }
      if (!state.password) {
        throw new Error("Password is missing.");
      }
      if (state.password !== state.confirmPassword) {
        throw new Error("Password does not match with confirm password. ");
      }
      const dt = new Date();
      //data submission portion
      const data = {
        username: state.username,
        email: state.email,
        name: state.name,
        password: state.password,
        createdAt: dt.toISOString(),
        updatedAt: dt.toISOString(),
      };
      console.log("data is ", data);
      const user = await axios.post("", data, { withCredentials: true });
      console.log("user is ", user);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item md={12}>
              <TextField
                autoComplete="given-name"
                required
                fullWidth
                label="Username"
                autoFocus
                value={state.username}
                onChange={(e) => {
                  handleChange("username", e.target.value);
                }}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                value={state.email}
                onChange={(e) => {
                  handleChange("email", e.target.value);
                }}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                autoComplete="given-name"
                required
                fullWidth
                label="Name"
                value={state.name}
                onChange={(e) => {
                  handleChange("name", e.target.value);
                }}
              />
            </Grid>
            <Grid item md={6}>
              <TextField
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="new-password"
                value={state.password}
                onChange={(e) => {
                  handleChange("password", e.target.value);
                }}
              />
            </Grid>
            <Grid item md={6}>
              <TextField
                required
                fullWidth
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                value={state.confirmPassword}
                onChange={(e) => {
                  handleChange("confirmPassword", e.target.value);
                }}
              />
            </Grid>
          </Grid>
          <br />
          {error && <Alert severity="error">{error}</Alert>}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
