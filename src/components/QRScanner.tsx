"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, Flashlight, FlashlightOff, Upload } from "lucide-react";
import { useEventStore } from "@/store/useEventStore";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { verifyQRCode, isLoading } = useEventStore();

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setIsScanning(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setFlashlightOn(false);
  };

  const toggleFlashlight = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];

      try {
        // Try to access torch capability (may not be available on all devices)
        const capabilities = track.getCapabilities() as any;

        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !flashlightOn } as any],
          });
          setFlashlightOn(!flashlightOn);
        } else {
          setError("Flashlight not available on this device");
        }
      } catch (err) {
        console.error("Error toggling flashlight:", err);
        setError("Could not toggle flashlight");
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // In a real implementation, you'd use a QR code library to decode the image
          // For now, we'll simulate extracting QR data
          try {
            // This would be replaced with actual QR code reading logic
            const mockQRData = result; // Placeholder
            onScan(mockQRData);
          } catch (err) {
            setError("Could not read QR code from image");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock QR code detection (in real app, use a QR code library like qr-scanner)
  const detectQRCode = () => {
    // This would be replaced with actual QR code detection
    // For demo purposes, we'll create a mock detection
    if (videoRef.current && isScanning) {
      // Simulate QR code detection
      setTimeout(() => {
        const mockQRData = JSON.stringify({
          bookingId: "booking-123",
          eventId: "event-456",
          reference: "REF-789",
          generatedAt: new Date().toISOString(),
        });
        onScan(mockQRData);
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-slate-800 rounded-t-lg p-4 flex items-center justify-between">
          <h3 className="text-white font-semibold">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black aspect-square">
          {hasPermission === false ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
              <Camera className="h-12 w-12 mb-4 text-gray-400" />
              <p className="text-center mb-4">
                Camera access is required to scan QR codes
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
              >
                Enable Camera
              </button>
            </div>
          ) : hasPermission === null ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={detectQRCode}
              />

              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 border-2 border-purple-500 rounded-lg opacity-75">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-lg"></div>
                  </div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-purple-500 animate-pulse"></div>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <button
                  onClick={toggleFlashlight}
                  className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                >
                  {flashlightOn ? (
                    <FlashlightOff className="h-6 w-6" />
                  ) : (
                    <Flashlight className="h-6 w-6" />
                  )}
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                >
                  <Upload className="h-6 w-6" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-3 text-center text-sm">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-800 rounded-b-lg p-4 text-center text-gray-300 text-sm">
          <p>Position the QR code within the frame to scan automatically</p>
          <p className="mt-1">Or tap the upload button to select an image</p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}

// Manual QR Code Entry Component
interface ManualQREntryProps {
  onSubmit: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function ManualQREntry({
  onSubmit,
  onClose,
  isOpen,
}: ManualQREntryProps) {
  const [qrData, setQrData] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [eventId, setEventId] = useState("");
  const [reference, setReference] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (qrData.trim()) {
      onSubmit(qrData.trim());
    } else if (bookingId && eventId && reference) {
      const manualData = JSON.stringify({
        bookingId,
        eventId,
        reference,
        generatedAt: new Date().toISOString(),
      });
      onSubmit(manualData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-md">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-white font-semibold">Manual QR Entry</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              QR Code Data (JSON)
            </label>
            <textarea
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder='{"bookingId":"...","eventId":"...","reference":"..."}'
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>

          <div className="text-center text-gray-400 text-sm">OR</div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Booking ID
              </label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter booking ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Event ID
              </label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter event ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Reference
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter reference"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !qrData.trim() && (!bookingId || !eventId || !reference)
              }
              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
