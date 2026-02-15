export const productsData = {
  featured: {
    id: 1,
    name: 'Bouquet de Rosas Deluxe',
    category: 'Bouquets Premium',
    description: 'Hermoso arreglo con rosas premium importadas, peluche de lujo y chocolates gourmet. Perfecto para ocasiones especiales y expresar amor verdadero.',
    price: 65000,
    rating: 5.0,
    reviews: 127,
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80',
    badge: '⭐ Más Vendido',
    type: 'bouquets'
  },
  
  cajas: [
    {
      id: 2,
      name: 'Caja Sorpresa Love',
      category: 'Cajas • Personalizable',
      price: 55000,
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80',
      badge: 'Nuevo',
      type: 'cajas'
    },
    {
      id: 3,
      name: 'Caja Explosiva Fotos',
      category: 'Cajas • Multi-nivel',
      price: 70000,
      image: 'https://images.unsplash.com/photo-1606495673763-7a74cbac9da3?w=400&q=80',
      badge: 'Especial',
      type: 'cajas'
    },
    {
      id: 4,
      name: 'Desayuno Sorpresa',
      category: 'Cajas • Romántico',
      price: 52000,
      image: 'https://images.unsplash.com/photo-1556909190-4e3fbe0c42fc?w=400&q=80',
      badge: '💕',
      type: 'cajas'
    }
  ],

  arreglos: [
    {
      id: 5,
      name: 'Arreglo Garden',
      category: 'Arreglos • Con globo',
      price: 50000,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80',
      badge: 'Elegante',
      type: 'arreglos'
    },
    {
      id: 6,
      name: 'Arreglo Temático',
      category: 'Arreglos • Personalizado',
      price: 60000,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1587814969489-d2f3285a57a4?w=400&q=80',
      badge: 'Único',
      type: 'arreglos'
    }
  ],

  bouquets: [
    {
      id: 7,
      name: 'Mini Bouquet',
      category: 'Bouquets • Compacto',
      price: 25000,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&q=80',
      badge: 'Económico',
      type: 'bouquets'
    },
    {
      id: 8,
      name: 'Bouquet Deluxe Mix',
      category: 'Bouquets • Mixtas',
      price: 65000,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80',
      badge: 'Premium',
      type: 'bouquets'
    }
  ],

  graduacion: [
    {
      id: 9,
      name: 'Graduado Favorito',
      category: 'Graduación • Con birrete',
      price: 58000,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&q=80',
      type: 'graduacion'
    },
    {
      id: 10,
      name: 'Caja Graduación Pro',
      category: 'Graduación • Temática',
      price: 65000,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=300&q=80',
      type: 'graduacion'
    }
  ],

  spotify: [
    {
      id: 11,
      name: 'Placa Spotify Acrílica',
      category: 'Spotify • Con QR',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&q=80',
      badge: 'Tendencia',
      type: 'spotify'
    },
    {
      id: 12,
      name: 'Placa Spotify LED',
      category: 'Spotify • RGB',
      price: 48000,
      image: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=400&q=80',
      badge: 'Premium',
      type: 'spotify'
    }
  ],

  regalos: [
    {
      id: 13,
      name: 'Gift Box Premium',
      category: 'Especiales • A tu gusto',
      price: 40000,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80',
      badge: 'Popular',
      type: 'regalos'
    },
    {
      id: 14,
      name: 'Eternos Comestibles',
      category: 'Especiales • Snacks',
      price: 38000,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
      badge: 'Delicioso',
      type: 'regalos'
    }
  ]
}

export const categories = [
  { id: 'todos', name: 'Todos' },
  { id: 'bouquets', name: 'Bouquets' },
  { id: 'cajas', name: 'Cajas' },
  { id: 'arreglos', name: 'Arreglos' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'graduacion', name: 'Graduación' }
]

export const WHATSAPP_NUMBER = '573000000000'

export const formatPrice = (price) => {
  return `$${price.toLocaleString('es-CO')}`
}

export const contactWhatsApp = (productName, productPrice) => {
  const message = `Hola LisArt! Me interesa:\n*${productName}*\nPrecio: ${formatPrice(productPrice)} 🎁`
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
