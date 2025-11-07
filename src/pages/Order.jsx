import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OrderPage() {
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserAndPackage = async () => {
            try {
                console.log('🔍 Order page: Starting to fetch user and package...');
                
                const currentUser = await base44.auth.me();
                console.log('✅ Order page: User loaded:', currentUser);
                setUser(currentUser);
                
                const storedPackage = localStorage.getItem('selectedPackage');
                console.log('📦 Order page: Raw localStorage data:', storedPackage);
                
                if (storedPackage) {
                    const parsedPkg = JSON.parse(storedPackage);
                    console.log('📦 Order page: Parsed package:', parsedPkg);
                    setPkg(parsedPkg);
                } else {
                    console.error('❌ Order page: No package in localStorage');
                    setError("No package selected. Please go back and choose a package.");
                }
            } catch (err) {
                console.error("❌ Order page: Failed to fetch user:", err);
                setError("Could not load user data. Please try again.");
            }
        };
        fetchUserAndPackage();
    }, []);

    const handleCheckout = async () => {
        console.log('🚀 handleCheckout: Function called!');
        console.log('📦 handleCheckout: pkg =', pkg);
        console.log('👤 handleCheckout: user =', user);
        
        if (!pkg || !user) {
            console.error('❌ handleCheckout: Missing pkg or user');
            setError("Missing order details or user information.");
            return;
        }
        
        if (!pkg.pricingTierId) {
            console.error('❌ handleCheckout: Missing pricingTierId');
            setError("Selected package is missing pricing tier ID. Please go back and pick a package again.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        console.log('💾 handleCheckout: About to call createCheckoutSession with:', {
            pricingTierId: pkg.pricingTierId,
            couponCode: pkg.couponCode || undefined
        });
        
        try {
            console.log('🔄 handleCheckout: Calling base44.functions.invoke...');
            
            const response = await base44.functions.invoke('createCheckoutSession', {
                pricingTierId: pkg.pricingTierId,
                couponCode: pkg.couponCode || undefined
            });

            console.log('✅ handleCheckout: Response received:', response);
            console.log('✅ handleCheckout: Response data:', response?.data);

            const url = response?.data?.checkoutUrl;
            console.log('🔗 handleCheckout: Checkout URL:', url);
            
            if (url) {
                console.log('✅ handleCheckout: Redirecting to Stripe...');
                window.location.href = url;
            } else {
                throw new Error("Checkout session did not return a URL.");
            }
        } catch (err) {
            console.error("❌ handleCheckout: Error caught:", err);
            console.error("❌ handleCheckout: Error message:", err.message);
            console.error("❌ handleCheckout: Error response:", err.response);
            console.error("❌ handleCheckout: Error response data:", err.response?.data);
            console.error("❌ handleCheckout: Full error object:", JSON.stringify(err, null, 2));
            
            setError(
                err?.response?.data?.error ||
                err?.message ||
                "An unexpected error occurred. Please try again."
            );
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-10 text-center p-4">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => navigate(createPageUrl('Credits'))}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }
    
    if (!pkg) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Order Summary</CardTitle>
                    <CardDescription>Review your purchase before proceeding to payment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg">{pkg.title} Package</h3>
                                <p className="text-sm text-gray-600">{pkg.credits} Credits</p>
                            </div>
                            <p className="font-bold text-xl">${(pkg.price / 100).toFixed(2)}</p>
                        </div>
                        
                        {pkg.couponCode && (
                            <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Coupon Applied:</span>
                                    <span className="font-semibold text-green-600">{pkg.couponCode}</span>
                                </div>
                                {pkg.discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-sm mt-1">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="font-semibold text-green-600">
                                            -${(pkg.discountAmount / 100).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-bold text-xl">
                            <span>Total Due Today:</span>
                            <span>${(pkg.price / 100).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full text-lg py-6"
                        onClick={handleCheckout}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <CreditCard className="mr-2 h-5 w-5" />
                        )}
                        {isLoading ? 'Redirecting...' : 'Proceed to Secure Payment'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}