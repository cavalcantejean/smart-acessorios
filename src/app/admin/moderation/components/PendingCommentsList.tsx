
"use client";

// This component is largely unused due to the removal of the comment system
// for static export compatibility. It's kept as a placeholder.

import { MessageSquare } from 'lucide-react';

export default function PendingCommentsList() {
  return (
    <div className="text-center py-10">
      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">A moderação de comentários está desativada para exportação estática.</p>
    </div>
  );
}
