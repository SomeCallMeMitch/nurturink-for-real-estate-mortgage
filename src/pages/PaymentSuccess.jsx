import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function PaymentSuccessPage() {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Get session_id from URL
    const sessionId = new URLSearchParams(location.search).get("session_id");

    useEffect(() => {
        loadUserData();
        
        // Clear selectedPackage from localStorage after a short delay
        setTimeout(() => {
            try {
                localStorage.removeItem("selectedPackage");
            } catch (e) {
                console.error("Failed to clear selectedPackage:", e);
            }
        }, 1000);
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            
            // Load current user
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            
            // Load organization if user belongs to one
            if (currentUser.orgId) {
                const orgList = await base44.entities.Organization.filter({ 
                    id: currentUser.orgId 
                });
                if (orgList && orgList.length > 0) {
                    setOrganization(orgList[0]);
                }
            }
            
            setLoading(false);
        } catch (error) {
            console.error("Failed to load user data:", error);
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadUserData();
        setRefreshing(false);
    };

    // Get current credit balance
    const getCurrentBalance = () => {
        if (organization && user?.appRole === 'organization_owner') {
            return organization.creditBalance || 0;
        }
        return user?.creditBalance || 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Finalizing your purchase…</h1>
                <p className="text-gray-600 mt-2">Please wait while we confirm your payment</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="flex items-center justify-between mb-4">
                    <Link to={createPageUrl("Credits")}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Credits
                        </Button>
                    </Link>
                </div>

                <Card className="w-full shadow-lg">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-center">Payment Successful!</CardTitle>
                        <CardDescription className="text-center text-base mt-2">
                            Your credits have been added to your account.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Current Balance Display */}
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-600 mb-2">Your Current Balance</p>
                            <p className="text-4xl font-bold text-indigo-600">
                                {getCurrentBalance()} Credits
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="mt-3"
                            >
                                {refreshing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                )}
                                Refresh Balance
                            </Button>
                        </div>

                        {/* Session Info (for debugging) */}
                        {sessionId && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-xs text-gray-500 font-mono break-all">
                                    Session ID: {sessionId}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to={createPageUrl("FindClients")} className="flex-1">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    Send a Card
                                </Button>
                            </Link>
                            <Link to={createPageUrl("Credits")} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    View Credit History
                                </Button>
                            </Link>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Credits are typically applied within a few seconds. 
                                If you don't see your balance updated, click "Refresh Balance" above or 
                                check back in a moment.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}