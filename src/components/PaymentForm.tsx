"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  CreditCard,
  Lock,
  AlertCircle,
  Loader2,
  Shield,
  CheckCircle,
} from "lucide-react";

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  currency?: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}

export default function PaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
  currency = "NGN",
  userEmail = "",
  userName = "",
  userPhone = "",
}: PaymentFormProps) {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [usePaystackPayment, setUsePaystackPayment] = useState<any>(null);

  // Dynamic import for client-side only
  useEffect(() => {
    const importPaystack = async () => {
      if (typeof window !== "undefined") {
        const { usePaystackPayment: paystackHook } = await import(
          "react-paystack"
        );
        setUsePaystackPayment(() => paystackHook);
      }
    };
    importPaystack();
  }, []);

  // Paystack configuration
  const config = {
    reference: `showpass_${new Date().getTime()}`,
    email: userEmail,
    amount: amount * 100, // Paystack expects amount in kobo (multiply by 100)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    currency: currency as "NGN" | "USD" | "GHS" | "ZAR",
    metadata: {
      custom_fields: [
        {
          display_name: "Name",
          variable_name: "name",
          value: userName,
        },
        {
          display_name: "Phone",
          variable_name: "phone",
          value: userPhone,
        },
      ],
    },
  };

  // Initialize Paystack payment
  const initializePayment = usePaystackPayment
    ? usePaystackPayment(config)
    : null;

  const handlePaystackSuccess = (reference: any) => {
    console.log("Payment successful:", reference);
    setPaymentLoading(false);
    onPaymentSuccess(reference.reference);
  };

  const handlePaystackClose = () => {
    console.log("Payment closed");
    setPaymentLoading(false);
    onPaymentError("Payment was cancelled by user");
  };

  const handlePayment = () => {
    if (!userEmail) {
      onPaymentError("Email is required for payment");
      return;
    }

    if (!config.publicKey) {
      onPaymentError("Payment configuration error. Please contact support.");
      return;
    }

    if (amount <= 0) {
      onPaymentError("Invalid payment amount");
      return;
    }

    if (!initializePayment || !usePaystackPayment) {
      onPaymentError(
        "Payment system not initialized. Please refresh the page."
      );
      return;
    }

    setPaymentLoading(true);

    // Initialize Paystack payment
    initializePayment({
      onSuccess: handlePaystackSuccess,
      onClose: handlePaystackClose,
    });
  };

  const formatAmount = (amount: number) => {
    if (currency === "NGN") {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
          <Lock className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Secure Payment</h3>
          <p className="text-sm text-gray-400">
            Powered by Paystack - Your payment is secure
          </p>
        </div>
      </div>

      {/* Amount Display */}
      <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Amount</span>
          <span className="text-2xl font-bold text-white">
            {formatAmount(amount)}
          </span>
        </div>
      </div>
      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={
          isProcessing || paymentLoading || !userEmail || !usePaystackPayment
        }
        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
      >
        {isProcessing || paymentLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {paymentLoading ? "Initializing Payment..." : "Processing..."}
          </>
        ) : !usePaystackPayment ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Payment System...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Pay {formatAmount(amount)} with Paystack
          </>
        )}
      </button>

      {/* Payment Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By clicking "Pay", you'll be redirected to Paystack's secure payment
          page
        </p>
      </div>
    </div>
  );
}
