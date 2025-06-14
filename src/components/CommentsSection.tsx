
"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

// The CommentsSection component has been simplified as the full comment system
// relied on Server Actions which are not compatible with `output: 'export'`.
// For a static site, comments would typically be handled by a third-party service
// or a custom backend API.

export default function CommentsSection() {
  return (
    <div className="space-y-6 pt-6 border-t mt-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        Comentários
      </h3>
      <p className="text-muted-foreground">
        A funcionalidade de comentários está temporariamente indisponível.
        Para interagir, por favor, <Link href="/login" className="text-primary hover:underline">faça login</Link> ou tente mais tarde.
      </p>
      {/* 
        Placeholder for where comments might be displayed if using a client-side solution.
        Example:
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">Nenhum comentário ainda.</p>
        </div> 
      */}
    </div>
  );
}
