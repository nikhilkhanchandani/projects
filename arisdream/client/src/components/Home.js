import React from 'react';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import axios from '../myAxios';
import MenuBar from './MenuBar';
import Alert from '@mui/material/Alert';
import Item from './Item';

function Home() {
  const navigate = useNavigate();
  const [valid, setValid] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [userInfo, setUserInfo] = React.useState(null);
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [state, setState] = React.useState({
    count: 0,
    results: [],
  });

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
    axios.get('/api/upload/view').then((data) => {
      if (!data.data.status) {
        setError(data.data.error);
        setLoading(false);
        return;
      }
      setState({
        results: data.data.results,
        count: data.data.count,
      });
      setLoading(false);
      setIsAvailable(true);
    });
  }, [valid]);

  return (
    <div>
      <MenuBar userInfo={userInfo} />
      <div style={{ padding: 20, marginTop: '50px' }}>
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

        {isAvailable && state.results.length === 0 && (
          <div>
            <Alert severity='warning'>No Record Found.</Alert>
          </div>
        )}

        {state.count > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {state.results.map((rec) => {
              return <Item key={rec.postId} record={rec} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
