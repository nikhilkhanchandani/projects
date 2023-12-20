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

export default function SignUp() {
  const navigate = useNavigate();
  const [state, setState] = React.useState({
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    images: [],
  });
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [image, setImage] = React.useState(null);

  const handleChange = (name, value) => {
    setState((prev) => {
      return { ...prev, [name]: value };
    });
  };

  console.log('state: ', state);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (!state.username) {
        throw new Error('Username is missing.');
      }
      if (!state.email) {
        throw new Error('Email is missing.');
      }
      if (!state.name) {
        throw new Error('Name is missing.');
      }
      if (!state.password) {
        throw new Error('Password is missing.');
      }
      if (state.password !== state.confirmPassword) {
        throw new Error('Password does not match with confirm password.');
      }
      if (state.images.length === 0) {
        throw new Error('Choose Profile Picture.');
      }

      // data submit
      const data = {
        username: state.username,
        email: state.email,
        name: state.name,
        password: state.password,
        profilePic: state.profilePic,
      };

      const user = await axios.post('/api/auth/register', data);

      const userData = user.data;
      if (!userData.status) {
        setError(userData.error);
        setLoading(false);
        return;
      }
      const formData = new FormData();
      for (let image of state.images) {
        formData.append('file', image);
      }

      const files = await axios.post(
        '/api/upload/fileUpload?dir=' + encodeURIComponent(userData.dir),
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const profilePicRet = await axios.post('/api/auth/updateProfilePic', {
        profilePic: files.data.files[0].url,
      });

      localStorage.setItem('userInfo', JSON.stringify(profilePicRet.data));

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
          Sign up
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
                label='Email Address'
                autoComplete='email'
                value={state.email}
                onChange={(e) => {
                  handleChange('email', e.target.value);
                }}
              />
            </Grid>
            <Grid item md={12}>
              <TextField
                autoComplete='given-name'
                required
                fullWidth
                label='Name'
                value={state.name}
                onChange={(e) => {
                  handleChange('name', e.target.value);
                }}
              />
            </Grid>
            <Grid item md={6}>
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
            <Grid item md={6}>
              <TextField
                required
                fullWidth
                label='Confirm Password'
                type='password'
                autoComplete='new-password'
                value={state.confirmPassword}
                onChange={(e) => {
                  handleChange('confirmPassword', e.target.value);
                }}
              />
            </Grid>
            <Grid item md={6}>
              <label style={{ marginRight: '16px', fontWeight: 700 }}>
                Profile Picture
              </label>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const tmp = Array.from(e.target.files);
                  handleChange('images', tmp);
                  for (let file of tmp) {
                    const reader = new FileReader();
                    reader.onload = function (r) {
                      const binaryStr = r.target.result;
                      const str =
                        'data:' + file.type + ';base64,' + btoa(binaryStr);
                      setImage(str);
                    };
                    reader.readAsBinaryString(file);
                  }
                }}
              />
            </Grid>
            {image && (
              <Grid item md={6}>
                <img
                  src={image}
                  alt=''
                  style={{
                    maxWidth: '300px',
                    width: '100%',
                    objectFit: 'cover',
                    border: '1px solid black',
                    borderRadius: 10,
                  }}
                />
              </Grid>
            )}
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
            Sign Up
          </Button>
          <Grid container justifyContent='flex-end'>
            <Grid item>
              <Link to='/login' variant='body2'>
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
