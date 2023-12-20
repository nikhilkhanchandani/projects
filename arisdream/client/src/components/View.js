import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import axios from '../myAxios';
import MenuBar from './MenuBar';
import Alert from '@mui/material/Alert';
import Item from './ItemDetail';
import Button from '@mui/material/Button';

function View() {
  const navigate = useNavigate();
  const params = useParams();
  const [valid, setValid] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [userInfo, setUserInfo] = React.useState(null);
  const [state, setState] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    axios.get('/api/auth/validate').then((data) => {
      if (!data.data.status) {
        navigate('/login');
        setLoading(false);
        return;
      }
      const uI = localStorage.getItem('userInfo');
      if (uI) {
        setUserInfo(JSON.parse(uI));
      }
      setValid(true);
    });
  }, [navigate]);
  React.useEffect(() => {
    if (!valid) return;
    axios.get(`/api/upload/view/${params.id}`).then((data) => {
      if (!data.data.status) {
        setError(data.data.error);
        setLoading(false);
        return;
      }
      setState(data.data.result);
      setLoading(false);
    });
  }, [valid, params.id]);

  return (
    <div>
      <MenuBar userInfo={userInfo} />
      <div style={{ padding: 20, maxWidth: '1600px' }}>
        <Button
          variant='contained'
          onClick={() => {
            navigate('/');
          }}
        >
          Back
        </Button>
        {loading && (
          <Box sx={{ display: 'flex' }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <div>
            <Alert severity='error'>{error}</Alert>
          </div>
        )}
        {state && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <Item record={state} />
            <div
              style={{
                fontSize: 18,
                flex: 1,
                whiteSpace: 'pre-wrap',
                marginTop: '15px',
              }}
            >
              {state.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default View;
