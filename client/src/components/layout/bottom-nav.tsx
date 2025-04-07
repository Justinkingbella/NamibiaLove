import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, Heart, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav: React.FC = () => {
  const [location] = useLocation();

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      href: '/',
      active: location === '/',
    },
    {
      icon: Search,
      label: 'Discover',
      href: '/discover',
      active: location === '/discover',
    },
    {
      icon: Heart,
      label: '',
      href: '/discover',
      active: false,
      special: true,
    },
    {
      icon: MessageSquare,
      label: 'Chat',
      href: '/chat',
      active: location.startsWith('/chat'),
    },
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      active: location.startsWith('/profile'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item, index) => (
          <Link href={item.href} key={index}>
            {item.special ? (
              <div className="flex flex-col items-center p-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-400 flex items-center justify-center -mt-5 shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
            ) : (
              <div 
                className={cn(
                  "flex flex-col items-center p-2",
                  item.active ? "text-primary" : "text-gray-500 hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
