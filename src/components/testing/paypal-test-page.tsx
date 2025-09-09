import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestPriceData {
  region: 'in' | 'intl';
  currency: 'INR' | 'USD';
  amount: number;
  display: string;
  earlyBird: boolean;
  couponApplied?: {
    code: string;
    type: string;
    value: number;
  };
}

export function PayPalTestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState<TestPriceData | null>(null);
  const [testParams, setTestParams] = useState({
    region: 'intl' as 'in' | 'intl',
    earlyBird: false,
    coupon: '',
    email: user?.email || 'test@example.com'
  });

  const fetchTestPrice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pay-price', {
        body: {
          email: testParams.email,
          regionOverride: testParams.region,
          earlyOverride: testParams.earlyBird,
          coupon: testParams.coupon || undefined
        }
      });

      if (error) throw error;
      
      setPriceData(data);
      toast({
        title: "Price fetched successfully",
        description: `${data.display} (${data.region.toUpperCase()})`,
      });
    } catch (error) {
      console.error('Price fetch error:', error);
      toast({
        title: "Error fetching price",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initiatePayPalPayment = async () => {
    if (!priceData) {
      toast({
        title: "No price data",
        description: "Please fetch price first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-create-order', {
        body: {
          email: testParams.email,
          regionOverride: testParams.region,
          coupon: testParams.coupon || undefined,
          pricingType: 'regular',
          courseId: null
        }
      });

      if (error) throw error;
      
      if (data?.approvalUrl) {
        // Redirect in same tab for reliability
        window.location.href = data.approvalUrl;
        toast({
          title: "PayPal order created",
          description: "Redirecting to PayPal",
        });
      } else {
        throw new Error('No approval URL returned from PayPal');
      }
    } catch (error) {
      console.error('PayPal order creation error:', error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('non-2xx status code')) {
          errorMessage = 'PayPal configuration error - Please check if PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are configured in Supabase Edge Functions settings';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error creating PayPal order",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">PayPal Payment Testing</h1>
      
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ PayPal Configuration Required</h2>
        <p className="text-yellow-700 dark:text-yellow-300 mb-2">
          For PayPal payments to work, the following secrets must be configured in Supabase Edge Functions:
        </p>
        <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
          <li><code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">PAYPAL_CLIENT_ID</code></li>
          <li><code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">PAYPAL_CLIENT_SECRET</code></li>
          <li><code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">PAYPAL_ENV</code> (sandbox or live)</li>
        </ul>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Test Page Access</h2>
        <p className="text-blue-700 dark:text-blue-300">
          This page is available at: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">/test/paypal</code>
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
          Use this page to test PayPal payments with different configurations before implementing in your main payment flow.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Email</label>
              <Input
                type="email"
                value={testParams.email}
                onChange={(e) => setTestParams(prev => ({ ...prev, email: e.target.value }))}
                placeholder="test@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Region Override</label>
              <Select
                value={testParams.region}
                onValueChange={(value: 'in' | 'intl') => 
                  setTestParams(prev => ({ ...prev, region: value }))
                }
              >
                <option value="intl">International (USD)</option>
                <option value="in">India (INR)</option>
              </Select>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={testParams.earlyBird}
                  onChange={(e) => setTestParams(prev => ({ ...prev, earlyBird: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium">Force Early Bird Pricing</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Test Coupon Code</label>
              <Input
                type="text"
                value={testParams.coupon}
                onChange={(e) => setTestParams(prev => ({ ...prev, coupon: e.target.value }))}
                placeholder="Enter coupon code"
              />
            </div>

            <Button 
              onClick={fetchTestPrice} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Fetching...' : 'Fetch Test Price'}
            </Button>
          </div>
        </Card>

        {/* Price Display & Payment */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Testing</h2>
          
          {priceData ? (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Price Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Region:</span>
                    <span className="font-medium">{priceData.region.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currency:</span>
                    <span className="font-medium">{priceData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">{priceData.display}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Early Bird:</span>
                    <span className="font-medium">{priceData.earlyBird ? 'Yes' : 'No'}</span>
                  </div>
                  {priceData.couponApplied && (
                    <div className="flex justify-between">
                      <span>Coupon:</span>
                      <span className="font-medium">
                        {priceData.couponApplied.code} ({priceData.couponApplied.type}: {priceData.couponApplied.value})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={initiatePayPalPayment} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Creating PayPal Order...' : 'Test PayPal Payment'}
              </Button>

              <div className="text-xs text-muted-foreground">
                <p><strong>⚠️ WARNING:</strong> This will create a REAL PayPal order in LIVE mode.</p>
                <p>Real money will be charged. Use this for actual payment testing only.</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Configure test parameters and fetch price to begin testing</p>
            </div>
          )}
        </Card>
      </div>

      {/* Test Scenarios */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Common Test Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">Indian User Tests:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Set region to "India (INR)"</li>
              <li>• Test with/without early bird</li>
              <li>• Test with Indian coupon codes</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">International User Tests:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Set region to "International (USD)"</li>
              <li>• Test with/without early bird</li>
              <li>• Test with international coupon codes</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}