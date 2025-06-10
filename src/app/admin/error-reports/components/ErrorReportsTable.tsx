
"use client";

import { useState, useEffect, useActionState, startTransition } from 'react';
import type { ErrorReport, ErrorReportStatus } from '@/lib/types';
import { updateErrorStatusAction, type ErrorReportActionResult } from '../actions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2, CheckCircle, AlertTriangle, Clock, CircleSlash, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ErrorReportsTableProps {
  initialErrorReports: ErrorReport[];
}

const initialActionState: ErrorReportActionResult = { success: false };

const statusConfig: Record<ErrorReportStatus, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "Novo", color: "bg-blue-500 hover:bg-blue-600", icon: AlertCircle },
  seen: { label: "Visto", color: "bg-yellow-500 hover:bg-yellow-600", icon: Eye },
  resolved: { label: "Resolvido", color: "bg-green-500 hover:bg-green-600", icon: CheckCircle },
  ignored: { label: "Ignorado", color: "bg-gray-500 hover:bg-gray-600", icon: CircleSlash },
};

export default function ErrorReportsTable({ initialErrorReports }: ErrorReportsTableProps) {
  const [errorReports, setErrorReports] = useState<ErrorReport[]>(initialErrorReports);
  const [updateStatusState, handleUpdateStatusAction, isUpdatePending] = useActionState(updateErrorStatusAction, initialActionState);
  const { toast } = useToast();
  const [selectedReportDetails, setSelectedReportDetails] = useState<ErrorReport | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    setErrorReports(initialErrorReports);
  }, [initialErrorReports]);

  useEffect(() => {
    if (updateStatusState?.message) {
      if (updateStatusState.success && updateStatusState.updatedReport) {
        toast({
          title: "Sucesso!",
          description: updateStatusState.message,
        });
        // Update local state to reflect the change
        setErrorReports(prevReports =>
          prevReports.map(report =>
            report.id === updateStatusState.updatedReport!.id ? updateStatusState.updatedReport! : report
          )
        );
      } else if (!updateStatusState.success && updateStatusState.error) {
        toast({
          title: "Erro",
          description: updateStatusState.error,
          variant: "destructive",
        });
      }
    }
  }, [updateStatusState, toast]);

  const handleStatusChange = (reportId: string, newStatus: ErrorReportStatus) => {
    const formData = new FormData();
    formData.append('reportId', reportId);
    formData.append('newStatus', newStatus);
    startTransition(() => {
      handleUpdateStatusAction(formData);
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  };

  const openDetailsDialog = (report: ErrorReport) => {
    setSelectedReportDetails(report);
    setIsDetailsDialogOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Data/Hora</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead className="hidden md:table-cell">Origem</TableHead>
              <TableHead className="hidden sm:table-cell">Usuário</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errorReports.map((report) => {
              const StatusIcon = statusConfig[report.status].icon;
              return (
                <TableRow key={report.id}>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(report.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[300px] truncate" title={report.message}>
                    {report.message}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs max-w-[200px] truncate" title={report.source || undefined}>
                    {report.source || 'N/A'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs">
                    {report.userName || (report.userId ? report.userId : 'Anônimo')}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default" className={`${statusConfig[report.status].color} text-xs`}>
                      <StatusIcon className="mr-1 h-3.5 w-3.5" />
                      {statusConfig[report.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1 sm:space-x-2">
                    <Button variant="outline" size="xs" onClick={() => openDetailsDialog(report)} title="Ver Detalhes">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Detalhes</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="xs" disabled={isUpdatePending && updateStatusState?.updatedReport?.id === report.id} title="Mudar Status">
                          {isUpdatePending && updateStatusState?.updatedReport?.id === report.id ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Status'
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Mudar Status Para</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(Object.keys(statusConfig) as ErrorReportStatus[]).map((statusKey) => (
                          <DropdownMenuItem
                            key={statusKey}
                            onClick={() => handleStatusChange(report.id, statusKey)}
                            disabled={report.status === statusKey || (isUpdatePending && updateStatusState?.updatedReport?.id === report.id)}
                          >
                            <statusConfig[statusKey].icon className="mr-2 h-4 w-4" />
                            {statusConfig[statusKey].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          {selectedReportDetails && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  Detalhes do Erro: {selectedReportDetails.id}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Revisão detalhada do erro reportado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <ScrollArea className="max-h-[60vh] pr-6">
                <div className="space-y-3 text-sm py-2">
                  <p><strong>Mensagem:</strong> {selectedReportDetails.message}</p>
                  <p><strong>Data/Hora:</strong> {formatDate(selectedReportDetails.timestamp)}</p>
                  <p><strong>Origem:</strong> {selectedReportDetails.source || 'N/A'}</p>
                  <p><strong>Usuário:</strong> {selectedReportDetails.userName || selectedReportDetails.userId || 'Anônimo'}</p>
                  <p><strong>Status:</strong> {statusConfig[selectedReportDetails.status].label}</p>
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 p-2 bg-muted rounded-md text-xs whitespace-pre-wrap break-all overflow-auto max-h-40">
                      {selectedReportDetails.stackTrace || 'Nenhum stack trace fornecido.'}
                    </pre>
                  </div>
                  {selectedReportDetails.userAgent && (
                    <div>
                      <strong>User Agent:</strong>
                      <p className="mt-1 p-2 bg-muted rounded-md text-xs whitespace-pre-wrap break-all">
                        {selectedReportDetails.userAgent}
                      </p>
                    </div>
                  )}
                  {selectedReportDetails.details && Object.keys(selectedReportDetails.details).length > 0 && (
                    <div>
                      <strong>Detalhes Adicionais:</strong>
                      <pre className="mt-1 p-2 bg-muted rounded-md text-xs whitespace-pre-wrap break-all">
                        {JSON.stringify(selectedReportDetails.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <AlertDialogFooter>
                <AlertDialogCancel>Fechar</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
