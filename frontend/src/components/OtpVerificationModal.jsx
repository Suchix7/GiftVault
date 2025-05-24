import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/api/axios";

export default function KeyVerificationModal({
  onClose,
  onSuccess,
  voucherId,
}) {
  const [privateKey, setPrivateKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyRequested, setKeyRequested] = useState(false);

  const handleVerifyKey = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!keyRequested) {
        // First request - get private key
        const response = await api.post(`/vouchers/${voucherId}/redeem`);
        if (response.data.requiresKey) {
          setKeyRequested(true);
          toast.success("Please check your email for the private key");
        }
      } else {
        try {
          // Clean up the key string and send it as is
          const cleanKey = privateKey.trim();
          console.log("Raw key input:", cleanKey);

          // Send the request with the key exactly as provided
          const payload = { privateKey: cleanKey };
          console.log("Sending request payload:", payload);

          try {
            const response = await api.post(
              `/vouchers/${voucherId}/redeem`,
              payload
            );
            console.log("Server response:", response.data);

            if (response.data.success) {
              toast.success("Voucher redeemed successfully");
              onSuccess(response.data.voucher.decryptedCode);
              onClose();
            } else {
              toast.error(response.data.message || "Verification failed");
            }
          } catch (apiError) {
            console.error("API Error Details:", {
              status: apiError.response?.status,
              statusText: apiError.response?.statusText,
              data: apiError.response?.data,
              headers: apiError.response?.headers,
              config: {
                url: apiError.config?.url,
                method: apiError.config?.method,
                data: apiError.config?.data,
                headers: apiError.config?.headers,
              },
            });
            throw apiError;
          }
        } catch (error) {
          console.error("Key verification error:", error);
          console.error("Failed with key:", privateKey);
          toast.error(
            error.response?.data?.message ||
              "Please enter the private key exactly as shown in your email."
          );
        }
      }
    } catch (error) {
      console.error("Full error details:", {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage =
        error.response?.data?.message || "Failed to process request";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Redeem Voucher</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleVerifyKey} className="space-y-4">
          {keyRequested ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enter Private Key
                </label>
                <Input
                  type="text"
                  value={privateKey}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log("Input change:", value);
                    setPrivateKey(value);
                  }}
                  placeholder='{"d":"2753","n":"3233"}'
                  className="w-full font-mono text-sm"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the key exactly as shown in your email, including all
                  quotes and braces.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Redeem"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Click the button below to receive your private key via email.
                You'll need this key to redeem your voucher.
              </p>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Private Key"}
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
