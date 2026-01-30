"use client";

import { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { useSession } from "next-auth/react";
import type { ExtendedSession } from "@/app/types/auth";

export default function FanSupport({ artistId, artistName }: { artistId: string; artistName: string }) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const user = session?.user;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState<string | null>(null);

  const sendTip = () => {
    // mock tipping flow
    setMessage(`Thank you${user ? `, ${user.name}` : ''}! Sent ${amount} MWK to ${artistName}.`);
    setTimeout(() => setOpen(false), 1200);
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-3 py-2 bg-emerald-400 text-black rounded">Support {artistName}</button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Support ${artistName}`}>
        <div className="space-y-3">
          <p className="text-zinc-400 text-sm">Send a tip to support this artist directly. This is a mock flow for demo purposes.</p>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Amount (MWK)</label>
            <Input type="number" value={String(amount)} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Message (optional)</label>
            <Input placeholder="Say something encouraging" />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={sendTip}>Send Tip</Button>
          </div>
          {message && <div className="text-sm text-emerald-300">{message}</div>}
        </div>
      </Modal>
    </div>
  );
}
