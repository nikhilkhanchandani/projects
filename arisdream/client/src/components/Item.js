import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../myAxios';

export default function MediaCard({ record }) {
  const navigate = useNavigate();
  const images = JSON.parse(record.images);
  return (
    <Card sx={{ maxWidth: 345, minWidth: 345, marginBottom: '16px' }}>
      <CardMedia
        sx={{ height: 250, backgroundSize: 'contain !important' }}
        image={images[0].url}
        title='green iguana'
      />

      <CardActions>
        <Button
          size='small'
          onClick={() => {
            navigate(`/view/${record.postId}`);
          }}
        >
          View Detail
        </Button>
        <Button
          size='small'
          onClick={async () => {
            axios.delete(`/api/upload/delete/${record.postId}`).then((data) => {
              if (!data.data.status) {
                console.log('delete error: ', data.data.error);
              }
              window.location.reload();
            });
          }}
        >
          <DeleteIcon />
        </Button>
      </CardActions>
    </Card>
  );
}
