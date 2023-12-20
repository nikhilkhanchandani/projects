import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import axios from '../myAxios';

export default function SignIn() {
  const navigate = useNavigate();
  const [state, setState] = React.useState({
    username: '',
    password: '',
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
        throw new Error('Username is missing.');
      }
      if (!state.password) {
        throw new Error('Password is missing.');
      }

      // data submit
      const data = {
        username: state.username,
        password: state.password,
      };

      const user = await axios.post('/api/auth/login', data);

      const userData = user.data;
      if (!userData.status) {
        setError(userData.error);
        setLoading(false);
        return;
      }

      localStorage.setItem('userInfo', JSON.stringify(user.data));

      setLoading(false);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Container component='main' maxWidth='xs'>
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Sign In
        </Typography>
        <Box component='form' noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item md={12}>
              <TextField
                autoComplete='given-name'
                required
                fullWidth
                label='Username'
                autoFocus
                value={state.username}
                onChange={(e) => {
                  handleChange('username', e.target.value);
                }}
              />
            </Grid>

            <Grid item md={12}>
              <TextField
                required
                fullWidth
                label='Password'
                type='password'
                autoComplete='new-password'
                value={state.password}
                onChange={(e) => {
                  handleChange('password', e.target.value);
                }}
              />
            </Grid>
          </Grid>
          <br />
          {error && <Alert severity='error'>{error}</Alert>}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container justifyContent='flex-end'>
            <Grid item>
              <Link to='/register' variant='body2'>
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
