import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar,
  Crown,
  Store,
  LogOut
} from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Profile: React.FC = () => {
  const { user, userRole, logout } = useAppContext();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="p-4 sm:p-8 text-center bg-white rounded-lg shadow-sm border-navikko-primary/20 border">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-navikko-secondary">Profile</h2>
        <p className="text-navikko-secondary text-sm sm:text-base">No user data available.</p>
      </div>
    );
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <Crown className="h-5 w-5 text-purple-600" />;
      case 'restaurant_owner':
        return <Store className="h-5 w-5 text-green-600" />;
      default:
        return <User className="h-5 w-5 text-blue-600" />;
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'restaurant_owner':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleName = () => {
    switch (userRole) {
      case 'restaurant_owner':
        return 'Restaurant Owner';
      default:
        return 'Customer';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navikko-secondary mb-2">
          Profile
        </h1>
        <p className="text-navikko-secondary">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-navikko-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-navikko-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-navikko-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navikko-secondary">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getRoleIcon()}
                    <Badge className={getRoleColor()}>
                      {getRoleName()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-navikko-secondary">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-navikko-secondary">{user.phone}</p>
                  </div>
                </div>
              </div>

              {user.createdAt && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium text-navikko-secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Restaurant Information (if applicable) */}
        {user.restaurantInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-navikko-primary" />
                Restaurant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Restaurant Name</p>
                  <p className="font-medium text-navikko-secondary">
                    {user.restaurantInfo.name}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-navikko-secondary">
                      {user.restaurantInfo.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Restaurant Phone</p>
                    <p className="font-medium text-navikko-secondary">
                      {user.restaurantInfo.phone}
                    </p>
                  </div>
                </div>

                {user.restaurantInfo.cuisine && (
                  <div>
                    <p className="text-sm text-gray-600">Cuisine Type</p>
                    <Badge variant="outline" className="text-navikko-primary">
                      {user.restaurantInfo.cuisine}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {/* TODO: Edit profile */}}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {/* TODO: Change password */}}
            >
              <Mail className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {/* TODO: Notification settings */}}
            >
              <Mail className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
            
            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;  