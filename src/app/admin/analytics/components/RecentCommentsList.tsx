
"use server";

// import type { RecentCommentInfo } from '@/lib/types';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import Link from 'next/link';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { UserCircle, MessageSquare } from 'lucide-react';

// interface RecentCommentsListProps {
//   comments: RecentCommentInfo[];
// }

// export default function RecentCommentsList({ comments }: RecentCommentsListProps) {
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('pt-BR', {
//       year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
//     });
//   };

//   return (
//     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
//       {comments.length > 0 ? (
//         comments.map((comment) => (
//           <div key={comment.id} className="p-3 border rounded-lg bg-muted/20 shadow-sm hover:shadow-md transition-shadow">
//             <div className="flex items-start gap-3">
//                <Link href={`/profile/${comment.userId}`} passHref>
//                 <Avatar className="h-8 w-8 cursor-pointer">
//                   {/* Assuming user avatars are not directly in comment, so fallback or generic */}
//                   <AvatarFallback>
//                     <UserCircle className="h-5 w-5" />
//                   </AvatarFallback>
//                 </Avatar>
//               </Link>
//               <div className="flex-grow">
//                 <div className="flex items-center justify-between text-xs mb-0.5">
//                    <Link href={`/profile/${comment.userId}`} className="font-semibold text-primary hover:underline">
//                     {comment.userName}
//                   </Link>
//                   <p className="text-muted-foreground">{formatDate(comment.createdAt)}</p>
//                 </div>
//                 <p className="text-sm text-foreground line-clamp-2 mb-1">{comment.text}</p>
//                 <Link href={`/accessory/${comment.accessoryId}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
//                   Em: <span className="italic">{comment.accessoryName}</span>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         ))
//       ) : (
//         <div className="flex flex-col items-center justify-center py-10 text-center">
//             <MessageSquare className="h-10 w-10 text-muted-foreground mb-3"/>
//             <p className="text-muted-foreground">Nenhum comentário recente para exibir.</p>
//         </div>
//       )}
//     </div>
//   );
// }
