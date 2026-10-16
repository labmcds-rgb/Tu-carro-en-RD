import type { Lang } from '../i18n/translations';

export type LegalSection = { h: string; p: string[] };
export type LegalDoc = { updated: string; intro: string; sections: LegalSection[] };

const UPDATED_ES = '10 de octubre de 2026';
const UPDATED_EN = 'October 10, 2026';

export const TERMS: Record<Lang, LegalDoc> = {
  es: {
    updated: UPDATED_ES,
    intro:
      'Bienvenido a TU CARRO EN RD. Al reservar un vehículo a través de nuestra aplicación, aceptas estos Términos y Condiciones. Léelos con atención.',
    sections: [
      {
        h: '1. Sobre el servicio',
        p: [
          'TU CARRO EN RD es un servicio de alquiler de vehículos en la República Dominicana. A través de la app puedes ver la flota disponible, reservar un vehículo por fechas y coordinar la entrega.',
        ],
      },
      {
        h: '2. Requisitos para alquilar',
        p: [
          'Para retirar un vehículo debes presentar: (1) licencia de conducir vigente, (2) documento de residencia o ciudadanía válido, y (3) firmar el contrato de alquiler al momento de la entrega.',
          'La entrega es personal y presencial. No entregamos vehículos a familiares ni a terceros: la persona que reserva es quien recibe y firma.',
        ],
      },
      {
        h: '3. Reservas',
        p: [
          'El alquiler mínimo es de 5 días. Al reservar seleccionas las fechas, la hora de recogida y de devolución, y los extras que desees.',
          'Una reserva confirmada bloquea el vehículo para esas fechas. La disponibilidad se muestra en tiempo real; un vehículo ya reservado no estará disponible en las fechas ocupadas.',
        ],
      },
      {
        h: '4. Precios y pagos',
        p: [
          'Los precios se muestran en dólares estadounidenses (US$). El total incluye el precio por día, los extras seleccionados y, si aplica, la entrega en aeropuerto.',
          'Aceptamos pago en efectivo o por Zelle. Cuando pagas por Zelle, debes incluir tu código de reserva en la nota y enviarnos el comprobante por WhatsApp. La reserva se considera pagada cuando confirmamos haber recibido el pago.',
        ],
      },
      {
        h: '5. Extras',
        p: [
          'Ofrecemos extras opcionales como seguro full cover (por día) y entrega en aeropuerto (Santiago, Santo Domingo o Punta Cana), con el precio indicado al momento de reservar.',
        ],
      },
      {
        h: '6. Cancelaciones',
        p: [
          'Puedes cancelar una reserva activa desde la sección "Mis reservas". Para condiciones específicas de reembolso según el método y momento del pago, contáctanos por WhatsApp.',
        ],
      },
      {
        h: '7. Uso del vehículo',
        p: [
          'El vehículo debe usarse de forma responsable y conforme a las leyes de tránsito de la República Dominicana. El cliente es responsable de multas, infracciones, peajes y de cualquier daño ocurrido durante el período de alquiler.',
          'El vehículo se entrega y debe devolverse en las mismas condiciones y con el mismo nivel de combustible, salvo acuerdo distinto.',
        ],
      },
      {
        h: '8. Responsabilidad',
        p: [
          'No nos hacemos responsables por objetos personales dejados en el vehículo ni por perjuicios derivados del uso indebido del mismo. En caso de accidente o avería, debes notificarnos de inmediato.',
        ],
      },
      {
        h: '9. Calificaciones',
        p: [
          'Al finalizar un alquiler puedes calificar el vehículo. Las calificaciones ayudan a otros clientes y deben reflejar tu experiencia real.',
        ],
      },
      {
        h: '10. Cambios a estos términos',
        p: [
          'Podemos actualizar estos Términos y Condiciones en cualquier momento. El uso continuado de la app implica la aceptación de la versión vigente.',
        ],
      },
      {
        h: '11. Contacto',
        p: [
          'Para cualquier duda sobre tu reserva o estos términos, escríbenos por WhatsApp al +1 (484) 828-2792 o en Instagram @tucarroenrd01.',
        ],
      },
    ],
  },
  en: {
    updated: UPDATED_EN,
    intro:
      'Welcome to TU CARRO EN RD. By booking a vehicle through our app, you accept these Terms and Conditions. Please read them carefully.',
    sections: [
      {
        h: '1. About the service',
        p: [
          'TU CARRO EN RD is a car rental service in the Dominican Republic. Through the app you can browse the available fleet, book a vehicle by dates, and coordinate pickup.',
        ],
      },
      {
        h: '2. Rental requirements',
        p: [
          'To pick up a vehicle you must present: (1) a valid driver’s license, (2) a valid residency or citizenship document, and (3) sign the rental contract at pickup.',
          'Pickup is personal and in person. We do not deliver vehicles to relatives or third parties: the person who books is the one who receives and signs.',
        ],
      },
      {
        h: '3. Bookings',
        p: [
          'The minimum rental is 5 days. When booking you select the dates, the pickup and return times, and any extras you want.',
          'A confirmed booking holds the vehicle for those dates. Availability is shown in real time; a vehicle already booked will not be available on the taken dates.',
        ],
      },
      {
        h: '4. Prices and payments',
        p: [
          'Prices are shown in US dollars (US$). The total includes the daily price, the selected extras, and, if applicable, airport delivery.',
          'We accept cash or Zelle. When paying by Zelle, include your booking code in the note and send us the receipt via WhatsApp. A booking is considered paid once we confirm the payment was received.',
        ],
      },
      {
        h: '5. Extras',
        p: [
          'We offer optional extras such as full cover insurance (per day) and airport delivery (Santiago, Santo Domingo, or Punta Cana), at the price shown at booking time.',
        ],
      },
      {
        h: '6. Cancellations',
        p: [
          'You can cancel an active booking from the "My bookings" section. For specific refund conditions based on payment method and timing, contact us via WhatsApp.',
        ],
      },
      {
        h: '7. Use of the vehicle',
        p: [
          'The vehicle must be used responsibly and in accordance with the traffic laws of the Dominican Republic. The customer is responsible for fines, violations, tolls, and any damage that occurs during the rental period.',
          'The vehicle is delivered and must be returned in the same condition and with the same fuel level, unless otherwise agreed.',
        ],
      },
      {
        h: '8. Liability',
        p: [
          'We are not responsible for personal belongings left in the vehicle or for harm resulting from misuse of it. In case of accident or breakdown, you must notify us immediately.',
        ],
      },
      {
        h: '9. Ratings',
        p: [
          'After a rental ends you can rate the vehicle. Ratings help other customers and should reflect your real experience.',
        ],
      },
      {
        h: '10. Changes to these terms',
        p: [
          'We may update these Terms and Conditions at any time. Continued use of the app implies acceptance of the current version.',
        ],
      },
      {
        h: '11. Contact',
        p: [
          'For any questions about your booking or these terms, message us on WhatsApp at +1 (484) 828-2792 or on Instagram @tucarroenrd01.',
        ],
      },
    ],
  },
};

export const PRIVACY: Record<Lang, LegalDoc> = {
  es: {
    updated: UPDATED_ES,
    intro:
      'En TU CARRO EN RD respetamos tu privacidad. Esta política explica qué datos recopilamos, cómo los usamos y qué derechos tienes.',
    sections: [
      {
        h: '1. Datos que recopilamos',
        p: [
          'Recopilamos los datos que nos proporcionas al crear tu cuenta y reservar: nombre, correo electrónico, número de teléfono, y los detalles de tus reservas (fechas, vehículo, extras, método de pago).',
          'También guardamos tus favoritos y las calificaciones que dejas.',
        ],
      },
      {
        h: '2. Cómo usamos tus datos',
        p: [
          'Usamos tus datos para gestionar tu cuenta, procesar y coordinar tus reservas, comunicarnos contigo (por ejemplo por WhatsApp para la entrega), y mejorar el servicio.',
        ],
      },
      {
        h: '3. Almacenamiento',
        p: [
          'Tus datos se almacenan de forma segura en nuestra infraestructura (Supabase). El acceso está restringido mediante reglas de seguridad: cada usuario solo puede ver sus propios datos, salvo el personal administrador del negocio.',
        ],
      },
      {
        h: '4. Con quién compartimos',
        p: [
          'No vendemos tus datos. Solo el equipo administrador de TU CARRO EN RD accede a la información necesaria para gestionar tus reservas. Para coordinar la entrega o el pago, la comunicación se realiza por WhatsApp, usando la información que tú compartas allí.',
        ],
      },
      {
        h: '5. Notificaciones',
        p: [
          'Si instalas la app (Android) y activas las notificaciones, podemos enviarte avisos sobre tus reservas (confirmaciones, cambios de estado y recordatorios). Puedes desactivarlas desde Ajustes o desde tu teléfono.',
        ],
      },
      {
        h: '6. Tus derechos',
        p: [
          'Puedes editar tu información desde "Editar perfil" en cualquier momento. También puedes eliminar tu cuenta desde Ajustes → Eliminar cuenta; al hacerlo se borran tus datos (perfil y reservas) de forma permanente.',
        ],
      },
      {
        h: '7. Seguridad',
        p: [
          'Aplicamos medidas razonables para proteger tus datos. Aun así, ningún sistema es 100% infalible; te recomendamos usar una contraseña segura y no compartirla.',
        ],
      },
      {
        h: '8. Menores',
        p: [
          'El servicio está dirigido a personas con edad y documentación válidas para alquilar un vehículo. No está destinado a menores de edad.',
        ],
      },
      {
        h: '9. Cambios a esta política',
        p: [
          'Podemos actualizar esta Política de Privacidad. Publicaremos la versión vigente en la app con su fecha de actualización.',
        ],
      },
      {
        h: '10. Contacto',
        p: [
          'Para ejercer tus derechos o resolver dudas sobre tu privacidad, escríbenos por WhatsApp al +1 (484) 828-2792 o en Instagram @tucarroenrd01.',
        ],
      },
    ],
  },
  en: {
    updated: UPDATED_EN,
    intro:
      'At TU CARRO EN RD we respect your privacy. This policy explains what data we collect, how we use it, and what rights you have.',
    sections: [
      {
        h: '1. Data we collect',
        p: [
          'We collect the data you provide when creating your account and booking: name, email, phone number, and the details of your bookings (dates, vehicle, extras, payment method).',
          'We also store your favorites and the ratings you leave.',
        ],
      },
      {
        h: '2. How we use your data',
        p: [
          'We use your data to manage your account, process and coordinate your bookings, communicate with you (for example via WhatsApp for pickup), and improve the service.',
        ],
      },
      {
        h: '3. Storage',
        p: [
          'Your data is stored securely in our infrastructure (Supabase). Access is restricted by security rules: each user can only see their own data, except the business’s administrators.',
        ],
      },
      {
        h: '4. Who we share with',
        p: [
          'We do not sell your data. Only the TU CARRO EN RD admin team accesses the information needed to manage your bookings. To coordinate pickup or payment, communication happens via WhatsApp, using the information you share there.',
        ],
      },
      {
        h: '5. Notifications',
        p: [
          'If you install the app (Android) and enable notifications, we may send you alerts about your bookings (confirmations, status changes, and reminders). You can turn them off from Settings or from your phone.',
        ],
      },
      {
        h: '6. Your rights',
        p: [
          'You can edit your information from "Edit profile" at any time. You can also delete your account from Settings → Delete account; doing so permanently erases your data (profile and bookings).',
        ],
      },
      {
        h: '7. Security',
        p: [
          'We apply reasonable measures to protect your data. Even so, no system is 100% foolproof; we recommend using a strong password and not sharing it.',
        ],
      },
      {
        h: '8. Minors',
        p: [
          'The service is intended for people with valid age and documentation to rent a vehicle. It is not intended for minors.',
        ],
      },
      {
        h: '9. Changes to this policy',
        p: [
          'We may update this Privacy Policy. We will post the current version in the app with its update date.',
        ],
      },
      {
        h: '10. Contact',
        p: [
          'To exercise your rights or resolve privacy questions, message us on WhatsApp at +1 (484) 828-2792 or on Instagram @tucarroenrd01.',
        ],
      },
    ],
  },
};
