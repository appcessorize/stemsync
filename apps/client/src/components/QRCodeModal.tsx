"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { QrCode, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QRCodeModalProps {
  roomId: string;
}

export function QRCodeModal({ roomId }: QRCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const roomUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      toast.success("Room URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="text-xs text-neutral-400 hover:text-white transition-colors"
      >
        <QrCode size={14} className="mr-1.5" />
        QR Code
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Room {roomId}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                value={roomUrl}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 200 200`}
              />
            </div>
            <div className="w-full space-y-2">
              <p className="text-sm text-muted-foreground text-center break-all">
                {roomUrl}
              </p>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copy URL
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}