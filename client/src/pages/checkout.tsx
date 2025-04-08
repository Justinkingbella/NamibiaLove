import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/premium-success',
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="py-4" />
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-400"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [planType, setPlanType] = useState("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    setIsLoading(true);
    apiRequest("POST", "/api/create-payment-intent", { planType })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to create payment intent');
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error creating payment intent:', error);
        setIsLoading(false);
      });
  }, [planType]);

  const handlePlanChange = (type: string) => {
    setPlanType(type);
  };

  const prices = {
    monthly: 99,
    yearly: 899
  };

  if (!clientSecret && isLoading) {
    return (
      <MainLayout>
        <div className="px-4 py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold ml-2">Premium Subscription</h1>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-4 mb-8">
                <Skeleton className="h-20 w-36" />
                <Skeleton className="h-20 w-36" />
              </div>
              <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Premium Subscription</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Unlock Premium Features</CardTitle>
            <CardDescription>Choose a plan that works for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button
                variant={planType === 'monthly' ? 'default' : 'outline'}
                className={`w-full sm:w-auto px-6 py-8 ${planType === 'monthly' ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : ''}`}
                onClick={() => handlePlanChange('monthly')}
              >
                <div className="text-left">
                  <div className="text-xl font-bold">Monthly</div>
                  <div className="text-2xl font-bold">$9.99</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">per month</div>
                </div>
              </Button>
              
              <Button
                variant={planType === 'yearly' ? 'default' : 'outline'}
                className={`w-full sm:w-auto px-6 py-8 ${planType === 'yearly' ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : ''}`}
                onClick={() => handlePlanChange('yearly')}
              >
                <div className="text-left">
                  <div className="text-xl font-bold">Yearly</div>
                  <div className="text-2xl font-bold">$89.99</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">per year (save 25%)</div>
                </div>
              </Button>
            </div>
            
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <CheckoutForm />
              </Elements>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 space-y-4">
          <div className="text-xl font-semibold">Premium Benefits</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unlimited Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Connect with as many people as you want without any restrictions.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Priority Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Get seen first by potential matches in your area.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Connect face to face with video calls before meeting in person.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Unlock our advanced compatibility algorithm for better matches.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}