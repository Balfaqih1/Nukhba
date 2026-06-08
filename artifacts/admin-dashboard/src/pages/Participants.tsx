import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  useListParticipants, 
  getListParticipantsQueryKey,
  useDeleteParticipant
} from "@workspace/api-client-react";
import { Search, Plus, Download, Printer, Trash2, Edit, MoreHorizontal, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type StatusFilter = "active" | "expired" | "all";

export default function Participants() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: participants, isLoading } = useListParticipants(
    { search: search || undefined, status: statusFilter === "all" ? undefined : statusFilter },
    { query: { queryKey: getListParticipantsQueryKey({ search: search || undefined, status: statusFilter === "all" ? undefined : statusFilter }) } }
  );

  const deleteMutation = useDeleteParticipant();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح", description: "تم حذف بيانات المشترك" });
          queryClient.invalidateQueries({ queryKey: getListParticipantsQueryKey() });
          setDeleteId(null);
        },
        onError: () => {
          toast({ title: "حدث خطأ", description: "لم نتمكن من حذف المشترك", variant: "destructive" });
        }
      }
    );
  };

  const handleExportCSV = () => {
    if (!participants || participants.length === 0) return;
    
    const headers = [
      "الرقم", "اسم المشترك", "عمر المشترك", "المرحلة الدراسية", "اسم ولي الأمر", 
      "رقم جوال ولي الأمر", "رقم إضافي", "رقم الهوية", "تاريخ التسجيل", "تاريخ الانتهاء",
      "المبلغ المدفوع", "المبلغ المتبقي", "مدة التسجيل", "الحالة"
    ];
    
    const csvContent = [
      headers.join(","),
      ...participants.map(p => [
        p.id, p.name, p.age, p.gradeLevel, p.guardianName,
        p.guardianPhone, p.guardianPhoneAlt || "", p.nationalId, p.registrationDate, p.endDate,
        p.amountPaid, p.amountRemaining, p.registrationDuration, p.status === "active" ? "نشط" : "منتهي"
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `المشتركون_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">المشتركون</h2>
          <p className="text-muted-foreground mt-1">إدارة بيانات جميع المشتركين في نادي النخبة</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            تصدير CSV
          </Button>
          <Button onClick={() => setLocation("/participants/new")} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            إضافة مشترك
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="البحث بالاسم، الهوية، الجوال..." 
                className="pr-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex bg-muted p-1 rounded-lg">
              <Button 
                variant={statusFilter === "all" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "shadow-sm" : ""}
              >
                الكل
              </Button>
              <Button 
                variant={statusFilter === "active" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setStatusFilter("active")}
                className={statusFilter === "active" ? "shadow-sm" : ""}
              >
                نشط
              </Button>
              <Button 
                variant={statusFilter === "expired" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setStatusFilter("expired")}
                className={statusFilter === "expired" ? "shadow-sm" : ""}
              >
                منتهي
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : participants?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">لا يوجد مشتركون</h3>
              <p className="text-muted-foreground">لم يتم العثور على أي بيانات مطابقة لبحثك.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>رقم الهوية</TableHead>
                    <TableHead>ولي الأمر</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.nationalId}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{p.guardianName}</span>
                          <span className="text-xs text-muted-foreground" dir="ltr">{p.guardianPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(p.endDate).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell>
                        {p.status === "active" ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">نشط</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">منتهي</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocation(`/participants/${p.id}/edit`)}>
                              <Edit className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="w-4 h-4 ml-2" />
                              طباعة
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(p.id)}
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف المشترك؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بيانات المشترك من النظام بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
