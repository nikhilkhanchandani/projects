import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import './AddPost.scss';
import AddPostProgress from './AddPostProgress';
import axios from '../myAxios';

function AddPost() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = React.useState(null);
  const [state, setState] = React.useState({
    images: [],
    text: '',
  });
  const [showImages, setShowImages] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [percentage, setPercentage] = React.useState(0);

  const handleChange = (name, value) => {
    setState((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleImage = (value) => {
    setState((prev) => {
      return { ...prev, images: [...prev.images, ...value] };
    });
  };

  const uploadProgress = (event) => {
    setPercentage(Math.round((100 * event.loaded) / event.total));
  };
  const handleSubmit = async () => {
    try {
      setError(null);

      if (!state.text) {
        throw new Error('Please add text');
      }
      if (state.images.length === 0) {
        throw new Error('Please add atleast one image');
      }
      const formData = new FormData();
      for (let image of state.images) {
        formData.append('file', image);
      }
      formData.append('text', state.text);

      await axios.post('/api/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: uploadProgress,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  React.useEffect(() => {
    if (percentage >= 100) {
      setState({ images: [], text: '' });
      setShowImages([]);
      navigate('/');
    }
  }, [percentage, navigate]);

  React.useEffect(() => {
    const uI = localStorage.getItem('userInfo');
    if (uI) {
      setUserInfo(JSON.parse(uI));
    }
  }, []);

  return (
    <div>
      <MenuBar userInfo={userInfo} />
      <div style={{ padding: 20 }}>
        <h1>Add Post</h1>
        <div
          id='main'
          style={{
            display: 'flex',
            gap: 16,
            width: '100%',
          }}
        >
          <div style={{ width: 600 }}>
            <div className='fileUpload'>
              <div className='wrapper'>
                <div className='file-upload'>
                  <input
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={(e) => {
                      const tmp = Array.from(e.target.files);
                      handleImage(tmp);
                      for (let file of tmp) {
                        const reader = new FileReader();
                        reader.onload = function (r) {
                          const binaryStr = r.target.result;
                          const str =
                            'data:' + file.type + ';base64,' + btoa(binaryStr);
                          setShowImages((prev) => {
                            return [...prev, str];
                          });
                        };
                        reader.readAsBinaryString(file);
                      }
                    }}
                  />
                  <ArrowUpwardIcon sx={{ fontSize: 80, fontWeight: '700' }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <TextField
                label='Text (Description)'
                multiline
                rows={4}
                fullWidth
                value={state.text}
                onChange={(e) => {
                  handleChange('text', e.target.value);
                }}
              />
            </div>
            {percentage > 0 && (
              <div style={{ marginTop: 20 }}>
                <AddPostProgress progress={percentage} />
              </div>
            )}

            {error && (
              <div style={{ marginTop: 20 }}>
                <Alert severity='error'>{error}</Alert>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <Button variant='contained' fullWidth onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
          <div
            id='right'
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              gap: 5,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {showImages.map((img, idx) => {
              return (
                <img
                  alt=''
                  key={idx}
                  src={img}
                  style={{
                    maxWidth: '300px',
                    width: '100%',
                    objectFit: 'cover',
                    border: '1px solid black',
                    borderRadius: 10,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPost;
