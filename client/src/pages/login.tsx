import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
    } catch (error) {
      // Error is handled in the useAuth hook
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-400 flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-sans">{APP_NAME}</h1>
          <p className="text-gray-600 mt-2">Connect with singles in Namibia</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Login to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-400 hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="w-full border-t border-gray-200 pt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
