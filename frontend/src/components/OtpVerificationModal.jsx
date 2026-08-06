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
        // First request — trigger email (or demo redirect)
        const response = await api.post(`/vouchers/${voucherId}/redeem`);
        if (response.data.requiresKey) {
          setKeyRequested(true);
          toast.success(response.data.message || "Please check your email for the private key");
        }
      } else {
        try {
          const cleanKey = privateKey.trim();
          const response = await api.post(`/vouchers/${voucherId}/redeem`, { privateKey: cleanKey });

          if (response.data.success) {
            toast.success("Voucher redeemed successfully");
            onSuccess({
              code: response.data.voucher.decryptedCode,
              qrToken: response.data.qrToken,
            });
            onClose();
          } else {
            toast.error(response.data.message || "Verification failed");
          }
        } catch (apiError) {
          toast.error(
            apiError.response?.data?.message ||
              "Please enter the private key exactly as shown in your email."
          );
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Redeem Voucher</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ×
          </button>
        </div>

        <form onSubmit={handleVerifyKey} className="space-y-4">
          {keyRequested ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Enter Private Key</label>
                <Input
                  type="text"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder='{"d":"2753","n":"3233"}'
                  className="w-full font-mono text-sm"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the key exactly as shown in your email, including all quotes and braces.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Redeem"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Click the button below to receive your private key via email. You'll need this key
                to redeem your voucher.
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

