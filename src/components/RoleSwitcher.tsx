import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Store, Crown } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserRole } from '@/contexts/AppContextDefinition';

const RoleSwitcher: React.FC = () => {
  const { userRole, setUserRole, isCustomer, isRestaurantOwner, isAdmin } = useAppContext();
  const { t } = useLanguage();

  const roles: Array<{
    id: Exclude<UserRole, null>;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    features: string[];
  }> = [
    {
      id: 'customer',
      name: 'Customer',
      description: 'Browse restaurants and place orders',
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      features: ['Browse restaurants', 'Place orders', 'View cart', 'User profile']
    },
    {
      id: 'restaurant_owner',
      name: 'Restaurant Owner',
      description: 'Manage restaurant, menus, and orders',
      icon: Store,
      color: 'bg-green-100 text-green-800',
      features: ['Dashboard', 'Order management', 'Menu management', 'Restaurant view']
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full system access and management',
      icon: Crown,
      color: 'bg-purple-100 text-purple-800',
      features: ['All restaurant owner features', 'User management', 'Reservation management', 'System settings']
    }
  ];

  const currentRole = roles.find(role => role.id === userRole);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-navikko-secondary mb-2">
          Role Switcher
        </h1>
        <p className="text-gray-600">
          Switch between different user roles to test the application
        </p>
      </div>

      {/* Current Role Display */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentRole && React.createElement(currentRole.icon, { className: "h-5 w-5" })}
            Current Role: {currentRole?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={currentRole?.color}>
              {currentRole?.name}
            </Badge>
            <p className="text-gray-600">{currentRole?.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Role Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = userRole === role.id;
          
          return (
            <Card 
              key={role.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isActive ? 'ring-2 ring-navikko-primary' : 'hover:border-navikko-primary/50'
              }`}
              onClick={() => setUserRole(role.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {role.name}
                  {isActive && (
                    <Badge className="bg-navikko-primary text-white">
                      Active
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{role.description}</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Features:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-navikko-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className={`w-full mt-4 ${
                    isActive 
                      ? 'bg-navikko-primary hover:bg-navikko-primary/90' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={isActive}
                >
                  {isActive ? 'Current Role' : 'Switch to ' + role.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.location.reload()}
            >
              <Users className="h-4 w-4" />
              Refresh App
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                setUserRole('customer');
                window.location.reload();
              }}
            >
              <Store className="h-4 w-4" />
              Reset to Customer
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              <Crown className="h-4 w-4" />
              Clear All Data
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                // Add some test data
                console.log('Adding test data...');
              }}
            >
              <Users className="h-4 w-4" />
              Add Test Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSwitcher; 