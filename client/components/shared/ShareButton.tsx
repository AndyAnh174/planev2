"use client";

import { useState } from "react";
import { Share2, Copy, Check, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { copyToClipboard, generateEmbedCode } from "@/lib/utils";

interface ShareButtonProps {
  slug: string;
  pageTitle?: string;
}

export function ShareButton({ slug, pageTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);

  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${slug}` : "";

  const handleCopyLink = async () => {
    const success = await copyToClipboard(pageUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyEmbed = async () => {
    const embedCode = generateEmbedCode(slug);
    const success = await copyToClipboard(embedCode);
    if (success) {
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    }
  };

  const embedCode = generateEmbedCode(slug);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Chia sẻ
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Đã sao chép
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Sao chép liên kết
            </>
          )}
        </DropdownMenuItem>
        <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Code className="mr-2 h-4 w-4" />
              Mã nhúng
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mã nhúng</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                <pre className="overflow-x-auto text-sm">
                  <code>{embedCode}</code>
                </pre>
              </div>
              <Button onClick={handleCopyEmbed} variant="outline" className="w-full">
                {embedCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Sao chép mã
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

