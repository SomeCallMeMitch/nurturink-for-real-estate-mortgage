import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";

export default function SelectedClientsBar({
  totalSelected,
  initializing,
  onClearSelection,
  onStartWorkflow,
}) {
  if (!totalSelected) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white z-40">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">{totalSelected}</span> client{totalSelected === 1 ? "" : "s"} selected
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClearSelection} className="gap-2">
            <X className="w-4 h-4" />
            Clear
          </Button>

          <Button size="sm" onClick={onStartWorkflow} disabled={initializing} className="gap-2">
            {initializing ? "Starting..." : "Next"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}