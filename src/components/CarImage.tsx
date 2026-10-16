import type { Car } from '../types/db';
import CarArt from './CarArt';

const imgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

/** Muestra la foto real del carro si tiene `image_url`; si no, el dibujo vectorial. */
export default function CarImage({ car }: { car: Car }) {
  if (car.image_url) {
    return <img src={car.image_url} alt={`${car.brand} ${car.model}`} style={imgStyle} loading="lazy" />;
  }
  return <CarArt car={car} />;
}
