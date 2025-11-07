import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XCircle, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Payment Canceled</CardTitle>
                    <CardDescription className="text-lg text-gray-600 pt-2">
                        Your order was not completed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500 mb-6">
                        It looks like you've canceled the payment process. You have not been charged.
                    </p>
                    <Link to={createPageUrl('Credits')}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Credit Packages
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}