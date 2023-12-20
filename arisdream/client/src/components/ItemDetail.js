import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import './ItemDetail.scss';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
// https://cloudinary.com/blog/add-a-responsive-image-carousel-to-your-react-app

export default function MediaCard({ record }) {
  const images = JSON.parse(record.images);
  return (
    <Card sx={{ maxWidth: 800, minWidth: 800, marginBottom: '16px' }}>
      <CardContent>
        <div className='box'>
          <Carousel useKeyboardArrows={true}>
            {images.map((URL, index) => (
              <div className='slide' key={index}>
                <img alt='' src={URL.url} />
              </div>
            ))}
          </Carousel>
        </div>
      </CardContent>
    </Card>
  );
}
