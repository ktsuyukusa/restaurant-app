// AZ Dining Saku photos from web-komachi.com article
// Source: https://www.web-komachi.com/?p=209514

export const azDiningPhotos = {
  // Main exterior photo
  exterior: import.meta.env.VITE_AZ_DINING_EXTERIOR || 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-exterior.jpg',
  
  // Interior photos
  interior: import.meta.env.VITE_AZ_DINING_INTERIOR || 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-interior.jpg',
  
  // Food photos
  carbonara: import.meta.env.VITE_AZ_DINING_CARBONARA || 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-carbonara.jpg',
  truffle: import.meta.env.VITE_AZ_DINING_TRUFFLE || 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-truffle.jpg',
  
  // Card/thumbnail photo
  card: import.meta.env.VITE_AZ_DINING_CARD || 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-card.jpg',
  
  // Menu photos
  menu: import.meta.env.VITE_AZ_DINING_MENU || 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-menu.jpg'
};

// Helper function to get appropriate photo for AZ Dining Saku
export const getAzDiningPhoto = (type: 'exterior' | 'interior' | 'carbonara' | 'truffle' | 'card' | 'menu' = 'card') => {
  return azDiningPhotos[type] || azDiningPhotos.card;
};

// Check if restaurant is AZ Dining Saku
export const isAzDiningSaku = (restaurantName: string) => {
  const azNames = ['AZ DINING Saku', 'AZ DINING 佐久店', 'AZ餐厅佐久', 'AZ 다이닝 사쿠'];
  return azNames.includes(restaurantName);
};