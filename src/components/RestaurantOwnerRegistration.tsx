import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Globe, Instagram, Facebook, Twitter, MapPin, Phone, Clock, Star, Upload, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RestaurantOwnerData {
  // Owner Information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerLanguage: string;
  
  // Restaurant Basic Info
  restaurantName: {
    en: string;
    ja: string;
    zh: string;
    ko: string;
  };
  restaurantDescription: {
    en: string;
    ja: string;
    zh: string;
    ko: string;
  };
  cuisine: string;
  priceRange: string;
  rating: number;
  
  // Location & Contact
  address: {
    en: string;
    ja: string;
    zh: string;
    ko: string;
  };
  latitude: number;
  longitude: number;
  phone: string;
  openingHours: string;
  
  // Online Presence
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  
  // Booking & Services
  externalBookingUrl: string;
  notificationEmail: string;
  notificationLineId: string;
  
  // Images
  restaurantImage: File | null;
  menuImage: File | null;
  
  // Menu Items
  menuItems: Array<{
    id: string;
    name: { en: string; ja: string; zh: string; ko: string };
    description: { en: string; ja: string; zh: string; ko: string };
    price: number;
    category: string;
    image: File | null;
    available: boolean;
    spicy?: boolean;
    vegetarian?: boolean;
    glutenFree?: boolean;
  }>;
}

const RestaurantOwnerRegistration: React.FC = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  
  const [formData, setFormData] = useState<RestaurantOwnerData>({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerLanguage: 'en',
    restaurantName: { en: '', ja: '', zh: '', ko: '' },
    restaurantDescription: { en: '', ja: '', zh: '', ko: '' },
    cuisine: '',
    priceRange: '¥¥',
    rating: 4.0,
    address: { en: '', ja: '', zh: '', ko: '' },
    latitude: 0,
    longitude: 0,
    phone: '',
    openingHours: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    externalBookingUrl: '',
    notificationEmail: '',
    notificationLineId: '',
    restaurantImage: null,
    menuImage: null,
    menuItems: []
  });

  const cuisines = [
    'Italian', 'Japanese', 'Chinese', 'Korean', 'Thai', 'Indian', 'French', 
    'Mexican', 'American', 'Mediterranean', 'Vietnamese', 'Spanish', 'Greek',
    'Turkish', 'Lebanese', 'Moroccan', 'Brazilian', 'Peruvian', 'Other'
  ];

  const priceRanges = ['¥', '¥¥', '¥¥¥', '¥¥¥¥'];

  const categories = [
    'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Soup', 'Salad',
    'Pasta', 'Pizza', 'Sushi', 'Ramen', 'Curry', 'Grill', 'Seafood',
    'Vegetarian', 'Set Menu', 'Special', 'Other'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultilingualChange = (field: string, lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof RestaurantOwnerData] as any,
        [lang]: value
      }
    }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const addMenuItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: { en: '', ja: '', zh: '', ko: '' },
      description: { en: '', ja: '', zh: '', ko: '' },
      price: 0,
      category: '',
      image: null,
      available: true,
      spicy: false,
      vegetarian: false,
      glutenFree: false
    };
    
    setFormData(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, newItem]
    }));
  };

  const updateMenuItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const updateMenuItemMultilingual = (index: number, field: string, lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) => 
        i === index ? { 
          ...item, 
          [field]: { ...item[field as keyof typeof item] as any, [lang]: value }
        } : item
      )
    }));
  };

  const removeMenuItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index)
    }));
  };

  const scrapeFromWebsite = async () => {
    if (!formData.website) {
      alert('Please enter a website URL first');
      return;
    }

    setIsScraping(true);
    try {
      // This would be a backend API call to scrape the website
      // For now, we'll simulate the scraping
      const response = await fetch('/api/scrape-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.website })
      });
      
      if (response.ok) {
        const data = await response.json();
        setScrapedData(data);
        // Auto-fill form with scraped data
        if (data.name) handleInputChange('restaurantName', data.name);
        if (data.description) handleInputChange('restaurantDescription', data.description);
        if (data.address) handleInputChange('address', data.address);
        if (data.phone) handleInputChange('phone', data.phone);
        if (data.openingHours) handleInputChange('openingHours', data.openingHours);
      }
    } catch (error) {
      console.error('Error scraping website:', error);
      alert('Failed to scrape website. Please enter information manually.');
    } finally {
      setIsScraping(false);
    }
  };

  const scrapeFromSocialMedia = async (platform: string) => {
    const url = formData[platform as keyof RestaurantOwnerData] as string;
    if (!url) {
      alert(`Please enter a ${platform} URL first`);
      return;
    }

    setIsScraping(true);
    try {
      // This would be a backend API call to scrape social media
      const response = await fetch('/api/scrape-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, url })
      });
      
      if (response.ok) {
        const data = await response.json();
        setScrapedData(data);
        // Auto-fill form with scraped data
        if (data.description) handleInputChange('restaurantDescription', data.description);
        if (data.images) {
          // Handle scraped images
          console.log('Scraped images:', data.images);
        }
      }
    } catch (error) {
      console.error(`Error scraping ${platform}:`, error);
      alert(`Failed to scrape ${platform}. Please enter information manually.`);
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value);
        } else if (typeof value === 'object' && value !== null) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, String(value));
        }
      });

      // Submit to backend
      const response = await fetch('/api/register-restaurant', {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        alert('Restaurant registered successfully!');
        setIsDialogOpen(false);
        // Reset form
        setFormData({
          ownerName: '',
          ownerEmail: '',
          ownerPhone: '',
          ownerLanguage: 'en',
          restaurantName: { en: '', ja: '', zh: '', ko: '' },
          restaurantDescription: { en: '', ja: '', zh: '', ko: '' },
          cuisine: '',
          priceRange: '¥¥',
          rating: 4.0,
          address: { en: '', ja: '', zh: '', ko: '' },
          latitude: 0,
          longitude: 0,
          phone: '',
          openingHours: '',
          website: '',
          instagram: '',
          facebook: '',
          twitter: '',
          externalBookingUrl: '',
          notificationEmail: '',
          notificationLineId: '',
          restaurantImage: null,
          menuImage: null,
          menuItems: []
        });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Error registering restaurant:', error);
      alert('Failed to register restaurant. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurant Owner Registration</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register Your Restaurant</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="owner" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="owner">Owner Info</TabsTrigger>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="online">Online</TabsTrigger>
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                </TabsList>

                {/* Owner Information Tab */}
                <TabsContent value="owner" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Owner Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ownerName">Owner Name *</Label>
                          <Input
                            id="ownerName"
                            value={formData.ownerName}
                            onChange={(e) => handleInputChange('ownerName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="ownerEmail">Email *</Label>
                          <Input
                            id="ownerEmail"
                            type="email"
                            value={formData.ownerEmail}
                            onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ownerPhone">Phone</Label>
                          <Input
                            id="ownerPhone"
                            value={formData.ownerPhone}
                            onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="ownerLanguage">Preferred Language</Label>
                          <Select
                            value={formData.ownerLanguage}
                            onValueChange={(value) => handleInputChange('ownerLanguage', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Basic Restaurant Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Restaurant Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Restaurant Name (Multilingual) *</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label htmlFor="nameEn" className="text-sm">English</Label>
                            <Input
                              id="nameEn"
                              value={formData.restaurantName.en}
                              onChange={(e) => handleMultilingualChange('restaurantName', 'en', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="nameJa" className="text-sm">日本語</Label>
                            <Input
                              id="nameJa"
                              value={formData.restaurantName.ja}
                              onChange={(e) => handleMultilingualChange('restaurantName', 'ja', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="nameZh" className="text-sm">中文</Label>
                            <Input
                              id="nameZh"
                              value={formData.restaurantName.zh}
                              onChange={(e) => handleMultilingualChange('restaurantName', 'zh', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="nameKo" className="text-sm">한국어</Label>
                            <Input
                              id="nameKo"
                              value={formData.restaurantName.ko}
                              onChange={(e) => handleMultilingualChange('restaurantName', 'ko', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Description (Multilingual)</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label htmlFor="descEn" className="text-sm">English</Label>
                            <Textarea
                              id="descEn"
                              value={formData.restaurantDescription.en}
                              onChange={(e) => handleMultilingualChange('restaurantDescription', 'en', e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="descJa" className="text-sm">日本語</Label>
                            <Textarea
                              id="descJa"
                              value={formData.restaurantDescription.ja}
                              onChange={(e) => handleMultilingualChange('restaurantDescription', 'ja', e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="descZh" className="text-sm">中文</Label>
                            <Textarea
                              id="descZh"
                              value={formData.restaurantDescription.zh}
                              onChange={(e) => handleMultilingualChange('restaurantDescription', 'zh', e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="descKo" className="text-sm">한국어</Label>
                            <Textarea
                              id="descKo"
                              value={formData.restaurantDescription.ko}
                              onChange={(e) => handleMultilingualChange('restaurantDescription', 'ko', e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="cuisine">Cuisine Type *</Label>
                          <Select
                            value={formData.cuisine}
                            onValueChange={(value) => handleInputChange('cuisine', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select cuisine" />
                            </SelectTrigger>
                            <SelectContent>
                              {cuisines.map((cuisine) => (
                                <SelectItem key={cuisine} value={cuisine}>
                                  {cuisine}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priceRange">Price Range</Label>
                          <Select
                            value={formData.priceRange}
                            onValueChange={(value) => handleInputChange('priceRange', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {priceRanges.map((range) => (
                                <SelectItem key={range} value={range}>
                                  {range}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="rating">Rating</Label>
                          <Input
                            id="rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={formData.rating}
                            onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="restaurantImage">Restaurant Image</Label>
                          <Input
                            id="restaurantImage"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('restaurantImage', e.target.files?.[0] || null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="menuImage">Menu Image</Label>
                          <Input
                            id="menuImage"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('menuImage', e.target.files?.[0] || null)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Location & Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Address (Multilingual)</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label htmlFor="addrEn" className="text-sm">English</Label>
                            <Input
                              id="addrEn"
                              value={formData.address.en}
                              onChange={(e) => handleMultilingualChange('address', 'en', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="addrJa" className="text-sm">日本語</Label>
                            <Input
                              id="addrJa"
                              value={formData.address.ja}
                              onChange={(e) => handleMultilingualChange('address', 'ja', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="addrZh" className="text-sm">中文</Label>
                            <Input
                              id="addrZh"
                              value={formData.address.zh}
                              onChange={(e) => handleMultilingualChange('address', 'zh', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="addrKo" className="text-sm">한국어</Label>
                            <Input
                              id="addrKo"
                              value={formData.address.ko}
                              onChange={(e) => handleMultilingualChange('address', 'ko', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="any"
                            value={formData.latitude}
                            onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="any"
                            value={formData.longitude}
                            onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="openingHours">Opening Hours</Label>
                          <Input
                            id="openingHours"
                            placeholder="e.g., 11:00-22:00"
                            value={formData.openingHours}
                            onChange={(e) => handleInputChange('openingHours', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="externalBookingUrl">External Booking URL</Label>
                          <Input
                            id="externalBookingUrl"
                            type="url"
                            placeholder="https://..."
                            value={formData.externalBookingUrl}
                            onChange={(e) => handleInputChange('externalBookingUrl', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="notificationEmail">Notification Email</Label>
                          <Input
                            id="notificationEmail"
                            type="email"
                            value={formData.notificationEmail}
                            onChange={(e) => handleInputChange('notificationEmail', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notificationLineId">LINE ID (for notifications)</Label>
                        <Input
                          id="notificationLineId"
                          value={formData.notificationLineId}
                          onChange={(e) => handleInputChange('notificationLineId', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Online Presence Tab */}
                <TabsContent value="online" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Online Presence & Web Scraping</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="website">Website URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="website"
                              type="url"
                              placeholder="https://..."
                              value={formData.website}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={scrapeFromWebsite}
                              disabled={isScraping}
                            >
                              {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="instagram">Instagram URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="instagram"
                              type="url"
                              placeholder="https://instagram.com/..."
                              value={formData.instagram}
                              onChange={(e) => handleInputChange('instagram', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => scrapeFromSocialMedia('instagram')}
                              disabled={isScraping}
                            >
                              {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Instagram className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="facebook">Facebook URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="facebook"
                              type="url"
                              placeholder="https://facebook.com/..."
                              value={formData.facebook}
                              onChange={(e) => handleInputChange('facebook', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => scrapeFromSocialMedia('facebook')}
                              disabled={isScraping}
                            >
                              {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Facebook className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="twitter">Twitter/X URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="twitter"
                              type="url"
                              placeholder="https://twitter.com/..."
                              value={formData.twitter}
                              onChange={(e) => handleInputChange('twitter', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => scrapeFromSocialMedia('twitter')}
                              disabled={isScraping}
                            >
                              {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Twitter className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {scrapedData && (
                        <Card className="bg-green-50 border-green-200">
                          <CardHeader>
                            <CardTitle className="text-green-800">Scraped Data</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <pre className="text-sm text-green-700 overflow-auto">
                              {JSON.stringify(scrapedData, null, 2)}
                            </pre>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Menu Tab */}
                <TabsContent value="menu" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Menu Items</CardTitle>
                        <Button type="button" onClick={addMenuItem}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Menu Item
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.menuItems.map((item, index) => (
                        <Card key={item.id} className="border-2">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg">Menu Item {index + 1}</CardTitle>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeMenuItem(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Item Name (Multilingual)</Label>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <Label className="text-sm">English</Label>
                                  <Input
                                    value={item.name.en}
                                    onChange={(e) => updateMenuItemMultilingual(index, 'name', 'en', e.target.value)}
                                    placeholder="Item name in English"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">日本語</Label>
                                  <Input
                                    value={item.name.ja}
                                    onChange={(e) => updateMenuItemMultilingual(index, 'name', 'ja', e.target.value)}
                                    placeholder="Item name in Japanese"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">中文</Label>
                                  <Input
                                    value={item.name.zh}
                                    onChange={(e) => updateMenuItemMultilingual(index, 'name', 'zh', e.target.value)}
                                    placeholder="Item name in Chinese"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">한국어</Label>
                                  <Input
                                    value={item.name.ko}
                                    onChange={(e) => updateMenuItemMultilingual(index, 'name', 'ko', e.target.value)}
                                    placeholder="Item name in Korean"
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label>Description (Multilingual)</Label>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <Label className="text-sm">English</Label>
                                  <Textarea
                                    value={item.description.en}
                                    onChange={(e) => updateMenuItemMultilingual(index, 'description', 'en', e.target.value)}
                                    rows={2}
                                    placeholder="Description in English"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">日本語</Label>
                                  <Textarea
                                    value={item.description.ja}
                                    onChange={(e) => updateMenuItemMultilingual(index, 'description', 'ja', e.target.value)}
                                    rows={2}
                                    placeholder="Description in Japanese"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">中文</Label>
                                  <Textarea
                                    value={item.description.zh}
                                    onChange={(e) => updateMenuItemMultilingual(index, 'description', 'zh', e.target.value)}
                                    rows={2}
                                    placeholder="Description in Chinese"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">한국어</Label>
                                  <Textarea
                                    value={item.description.ko}
                                    onChange={(e) => updateMenuItemMultilingual(index, 'description', 'ko', e.target.value)}
                                    rows={2}
                                    placeholder="Description in Korean"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Price (¥)</Label>
                                <Input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => updateMenuItem(index, 'price', parseInt(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label>Category</Label>
                                <Select
                                  value={item.category}
                                  onValueChange={(value) => updateMenuItem(index, 'category', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Item Image</Label>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => updateMenuItem(index, 'image', e.target.files?.[0] || null)}
                                />
                              </div>
                            </div>

                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`available-${index}`}
                                  checked={item.available}
                                  onChange={(e) => updateMenuItem(index, 'available', e.target.checked)}
                                />
                                <Label htmlFor={`available-${index}`}>Available</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`spicy-${index}`}
                                  checked={item.spicy}
                                  onChange={(e) => updateMenuItem(index, 'spicy', e.target.checked)}
                                />
                                <Label htmlFor={`spicy-${index}`}>Spicy</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`vegetarian-${index}`}
                                  checked={item.vegetarian}
                                  onChange={(e) => updateMenuItem(index, 'vegetarian', e.target.checked)}
                                />
                                <Label htmlFor={`vegetarian-${index}`}>Vegetarian</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`glutenFree-${index}`}
                                  checked={item.glutenFree}
                                  onChange={(e) => updateMenuItem(index, 'glutenFree', e.target.checked)}
                                />
                                <Label htmlFor={`glutenFree-${index}`}>Gluten Free</Label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {formData.menuItems.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No menu items added yet. Click "Add Menu Item" to get started.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Register Restaurant
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RestaurantOwnerRegistration; 