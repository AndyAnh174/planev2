"use client";

import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CardDetailPage() {
  const params = useParams();
  const cardId = params.cardId as string;

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
        </DialogHeader>
        <div>
          <p>Card ID: {cardId}</p>
          {/* TODO: Implement card details view */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

