import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
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
        return_url: window.location.origin + '/subscription-success',
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Successful",
        description: "You are now subscribed!",
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
        {isProcessing ? 'Processing...' : 'Subscribe Now'}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("basic"); // "basic", "premium", "vip"
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Create subscription
    setIsLoading(true);
    apiRequest("POST", "/api/get-or-create-subscription", { planType: selectedPlan })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to create subscription');
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error creating subscription:', error);
        setIsLoading(false);
      });
  }, [selectedPlan, user]);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "$9.99",
      period: "per month",
      features: [
        "Unlimited matches",
        "Priority visibility",
        "Read receipts"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: "$19.99",
      period: "per month",
      features: [
        "All Basic features",
        "Video chat",
        "Advanced matching algorithm",
        "See who liked you"
      ]
    },
    {
      id: "vip",
      name: "VIP",
      price: "$29.99",
      period: "per month",
      features: [
        "All Premium features",
        "VIP badge",
        "Priority customer support",
        "Exclusive in-person events",
        "Personality compatibility tests"
      ]
    }
  ];

  if (!user) {
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
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Please sign in</h2>
              <p className="mb-6">You need to be signed in to subscribe to a premium plan.</p>
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
        <div className="px-4 py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold ml-2">Premium Subscription</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-10 w-20" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={selectedPlan === plan.id ? "border-2 border-primary shadow-lg" : ""}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-2xl font-bold">{plan.price}</div>
                <CardDescription>{plan.period}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${selectedPlan === plan.id ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : ''}`}
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Subscription</CardTitle>
            <CardDescription>You've selected the {plans.find(p => p.id === selectedPlan)?.name} plan</CardDescription>
          </CardHeader>
          <CardContent>
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <SubscribeForm />
              </Elements>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}