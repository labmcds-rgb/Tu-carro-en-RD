export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  description: string | null; // descripción en español (opcional)
  description_en: string | null; // descripción en inglés (opcional)
  color_name: string | null; // color en palabras (ej. "Blanco")
  price_per_day: number;
  seats: number;
  transmission: string;
  fuel: string;
  rating: number;
  trips_count: number;
  location: string;
  zone: string;
  body_color: string;
  body_color_2: string;
  scene_1: string;
  scene_2: string;
  features: string[];
  is_active: boolean;
  image_url: string | null; // foto principal (= images[0]), para listados/miniaturas
  images: string[] | null; // todas las fotos del carro
  plate: string | null; // matrícula (uso interno del admin)
};

export type BookingStatus = 'active' | 'past' | 'cancelled';

export type BookingExtra = { id: string; name: string; price: number; per: boolean };

export type Booking = {
  id: string;
  code: string;
  user_id: string;
  car_id: string;
  pickup_date: string; // ISO date
  return_date: string;
  pickup_time: string;
  return_time: string;
  days: number;
  price_per_day: number;
  extras: BookingExtra[];
  subtotal: number;
  total: number;
  location: string | null;
  status: BookingStatus;
  payment_method: 'efectivo' | 'zelle';
  payment_status: 'pendiente' | 'pagado';
  created_at: string;
  car?: Car; // join opcional
  profile?: { full_name: string | null; phone: string | null; email: string | null } | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_initials: string | null;
  level: string;
  rating: number;
  trips_count: number;
  role: 'customer' | 'admin';
};
