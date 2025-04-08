import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/main-layout';
import { CheckCircle, Home, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [paymentType, setPaymentType] = useState<'subscription' | 'one-time'>('subscription');
  
  // Determine if this was a subscription or one-time payment based on URL path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('subscription-success')) {
      setPaymentType('subscription');
    } else {
      setPaymentType('one-time');
    }
  }, []);

  // Fetch user subscription status
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['/api/user/subscription'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <MainLayout>
        <div className="px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Please sign in</h2>
              <p className="mb-6">You need to be signed in to view your payment status.</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setLocation('/login')}>
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => setLocation('/register')}>
                  Register
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="px-4 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="justify-center">
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 py-8 max-w-md mx-auto">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-12 w-12 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-2xl font-bold">
                {paymentType === 'subscription' ? 'Subscription Activated!' : 'Payment Successful!'}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {paymentType === 'subscription' 
                  ? 'Your premium features are now unlocked' 
                  : 'Thank you for your purchase'}
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CardContent className="pt-6 pb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                {paymentType === 'subscription' ? (
                  <div>
                    <div className="font-semibold mb-1">
                      {(subscriptionData as any)?.plan || 'Premium'} Plan
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Next billing date: {(subscriptionData as any)?.nextBillingDate || 'N/A'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold mb-1">
                      One-time Premium Access
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Valid until: {(subscriptionData as any)?.validUntil || 'N/A'}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-yellow-500 mr-3 shrink-0 mt-0.5" />
                  <span>Unlimited matches and messages</span>
                </div>
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-yellow-500 mr-3 shrink-0 mt-0.5" />
                  <span>Priority visibility in search results</span>
                </div>
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-yellow-500 mr-3 shrink-0 mt-0.5" />
                  <span>Advanced compatibility features</span>
                </div>
                {paymentType === 'subscription' && (
                  <div className="flex items-start">
                    <Star className="h-5 w-5 text-yellow-500 mr-3 shrink-0 mt-0.5" />
                    <span>Access to exclusive events and experiences</span>
                  </div>
                )}
              </div>
            </CardContent>
          
            <CardFooter className="flex justify-center">
              <Button 
                className="bg-gradient-to-r from-yellow-500 to-orange-400"
                onClick={() => setLocation('/discover')}
              >
                <Home className="mr-2 h-4 w-4" />
                Start Exploring
              </Button>
            </CardFooter>
          </motion.div>
        </Card>
      </div>
    </MainLayout>
  );
}