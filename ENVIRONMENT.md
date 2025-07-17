# Environment Variables

This project uses environment variables to configure various settings. Create a `.env` file in the root directory with the following variables:

## Required Environment Variables

### Supabase Configuration
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Optional Environment Variables

### Application Configuration
- `VITE_APP_NAME`: Application name (defaults to "Navikko")
- `VITE_LOGO_URL`: URL for the application logo

### Map Configuration
- `VITE_DEFAULT_LATITUDE`: Default latitude for maps (defaults to 36.248)
- `VITE_DEFAULT_LONGITUDE`: Default longitude for maps (defaults to 138.248)
- `VITE_MAP_BBOX_OFFSET`: Map bounding box offset (defaults to 0.01)

### External Photo URLs (AZ Dining)
- `VITE_AZ_DINING_EXTERIOR`: Exterior photo URL for AZ Dining
- `VITE_AZ_DINING_INTERIOR`: Interior photo URL for AZ Dining
- `VITE_AZ_DINING_CARBONARA`: Carbonara dish photo URL
- `VITE_AZ_DINING_TRUFFLE`: Truffle dish photo URL
- `VITE_AZ_DINING_CARD`: Card/thumbnail photo URL
- `VITE_AZ_DINING_MENU`: Menu photo URL

# Payment Integration
- `VITE_KOMOJU_API_KEY`: KOMOJU API key for payment processing
- `VITE_PAYJP_API_KEY`: PAY.JP API key for payment processing

## Example .env file

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_NAME=Navikko
VITE_LOGO_URL=https://your-cdn.com/logo.png

# Map Configuration
VITE_DEFAULT_LATITUDE=36.248
VITE_DEFAULT_LONGITUDE=138.248
VITE_MAP_BBOX_OFFSET=0.01

# External Photo URLs (AZ Dining)
VITE_AZ_DINING_EXTERIOR=https://example.com/exterior.jpg
VITE_AZ_DINING_INTERIOR=https://example.com/interior.jpg
VITE_AZ_DINING_CARBONARA=https://example.com/carbonara.jpg
VITE_AZ_DINING_TRUFFLE=https://example.com/truffle.jpg
VITE_AZ_DINING_CARD=https://example.com/card.jpg
VITE_AZ_DINING_MENU=https://example.com/menu.jpg

# Payment Integration
VITE_KOMOJU_API_KEY=your-komoju-api-key-here
VITE_PAYJP_API_KEY=your-payjp-api-key-here
```

## Notes

- All environment variables must be prefixed with `VITE_` to be accessible in the frontend
- The application will fall back to hardcoded defaults if environment variables are not provided
- The `.env` file is ignored by git for security reasons
- Create a `.env.example` file with your actual values for team reference 