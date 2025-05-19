import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/api/axios";

export default function OtpVerificationModal({ onClose, onSuccess }) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("send"); // "send" or "verify"
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      await api.post("/otp/send-redemption");
      toast.success("Verification code sent to your email");
      setStep("verify");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/otp/verify-redemption", { otp });
      toast.success("Verification successful");
      onSuccess(response.data.redemptionCode);
      onClose();
    } catch (error) {
      const attemptsLeft = error.response?.data?.attemptsLeft;
      if (attemptsLeft !== undefined) {
        setAttemptsLeft(attemptsLeft);
        toast.error(`Invalid code. ${attemptsLeft} attempts left.`);
      } else {
        toast.error(error.response?.data?.message || "Failed to verify code");
        if (error.response?.status === 404) {
          setStep("send"); // Reset to send step if code expired
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Email Verification</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        {step === "send" ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              To redeem this voucher, we'll send a verification code to your
              registered email address.
            </p>
            <Button
              onClick={handleSendOTP}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Verification Code
              </label>
              <Input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code"
                className="w-full"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Please check your email for the verification code.
              </p>
              <p className="text-sm text-muted-foreground">
                {attemptsLeft} attempts remaining
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("send")}
                disabled={isLoading}
              >
                Resend Code
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
