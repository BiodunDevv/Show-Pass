"use client";

import React, { useState, useEffect } from "react";
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

// Extend Window interface to include PaystackPop
declare global {
  interface Window {
    PaystackPop: any;
  }
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
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [error, setError] = useState("");

  // Check if Paystack script is loaded
  useEffect(() => {
    const checkPaystackLoaded = () => {
      if (typeof window !== "undefined" && window.PaystackPop) {
        setPaystackLoaded(true);
      } else {
        // Keep checking until Paystack is loaded
        setTimeout(checkPaystackLoaded, 100);
      }
    };
    checkPaystackLoaded();
  }, []);

  const handlePayment = async () => {
    setError("");
    if (!paystackLoaded || paymentLoading || isProcessing) return;

    // Validate amount
    if (!amount || amount <= 0) {
      setError("Invalid payment amount.");
      onPaymentError("Invalid payment amount.");
      return;
    }

    if (!userEmail) {
      setError("Email is required for payment");
      onPaymentError("Email is required for payment");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setError("Payment configuration error. Please contact support.");
      onPaymentError("Payment configuration error. Please contact support.");
      return;
    }

    // Ensure amount is a valid number and convert to integer for Paystack
    const paystackAmount = Math.round(amount * 100);
    if (isNaN(paystackAmount) || paystackAmount <= 0) {
      setError("Invalid payment amount format.");
      onPaymentError("Invalid payment amount format.");
      return;
    }

    console.log("Payment amount validation:", {
      originalAmount: amount,
      paystackAmount: paystackAmount,
      isInteger: Number.isInteger(paystackAmount),
    });

    setPaymentLoading(true);
    const reference = `showpass_${Date.now()}`;

    try {
      // Check if Paystack is loaded
      if (!window.PaystackPop) {
        throw new Error("Paystack not loaded");
      }

      const paystackPop = window.PaystackPop;

      const handler = paystackPop.setup({
        key: publicKey,
        email: userEmail,
        amount: paystackAmount, // Use the validated integer amount
        currency: currency as "NGN" | "USD" | "GHS" | "ZAR",
        ref: reference,
        firstname: userName.split(" ")[0] || "",
        lastname: userName.split(" ").slice(1).join(" ") || "",
        callback: function (response: { reference: string }) {
          console.log("Paystack callback received:", response);

          // Handle the payment success
          const handlePaymentSuccess = async () => {
            try {
              setPaymentLoading(false);
              onPaymentSuccess(response.reference);
            } catch (err) {
              console.error("Error handling payment success:", err);
              setError(
                "Payment succeeded but failed to process. Please contact support."
              );
              onPaymentError(
                "Payment succeeded but failed to process. Please contact support."
              );
            }
          };

          // Call the async function
          handlePaymentSuccess();
        },
        onClose: function () {
          console.log("Paystack popup closed");
          setPaymentLoading(false);
          onPaymentError("Payment was cancelled by user");
        },
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
      });

      if (handler) {
        console.log("Opening Paystack iframe");
        handler.openIframe();
      } else {
        throw new Error("Failed to setup Paystack handler");
      }
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      setError(
        err.message || "Failed to initialize payment. Please try again."
      );
      onPaymentError(
        err.message || "Failed to initialize payment. Please try again."
      );
      setPaymentLoading(false);
    }
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

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
          isProcessing || paymentLoading || !userEmail || !paystackLoaded
        }
        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
      >
        {isProcessing || paymentLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {paymentLoading ? "Initializing Payment..." : "Processing..."}
          </>
        ) : !paystackLoaded ? (
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
