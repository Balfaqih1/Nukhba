import React, { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { getParticipants, deleteParticipant, ParticipantWithStatus } from "@/lib/storage";
import { Search, Plus, Download, Printer, Trash2, Edit, MoreHorizontal, Users } from "lucide-react";
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

type StatusFilter = "all" | "active" | "expired";

export default function Participants() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  const all = getParticipants();

  const participants = all.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.nationalId.includes(q) ||
      p.guardianPhone.includes(q) ||
      (p.guardianPhoneAlt || "").includes(q);
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (deleteId == null) return;
    deleteParticipant(deleteId);
    setDeleteId(null);
    toast({ title: "تم الحذف", description: "تم حذف المشترك بنجاح" });
    refresh();
  };

  const exportCSV = () => {
    const headers = [
      "الاسم", "العمر", "المرحلة الدراسية", "ولي الأمر", "الجوال",
      "رقم إضافي", "رقم الهوية", "تاريخ التسجيل", "تاريخ الانتهاء",
      "المبلغ المدفوع", "المبلغ المتبقي", "مدة التسجيل", "الحالة", "ملاحظات",
    ];
    const rows = participants.map((p) => [
      p.name, p.age, p.gradeLevel, p.guardianName, p.guardianPhone,
      p.guardianPhoneAlt, p.nationalId, p.registrationDate, p.endDate,
      p.amountPaid, p.amountRemaining, p.registrationDuration,
      p.status === "active" ? "نشط" : "منتهي", p.notes,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "مشتركو_نادي_النخبة.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printParticipant = (p: ParticipantWithStatus) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8"/>
        <title>بيانات ${p.name}</title>
        <style>
          body { font-family: Tajawal, Arial, sans-serif; padding: 30px; direction: rtl; }
          h2 { color: #1a4731; } table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          td, th { border: 1px solid #ccc; padding: 8px 12px; text-align: right; }
          th { background: #f0f0e8; }
        </style>
      </head>
      <body>
        <h2>نادي النخبة — بيانات مشترك</h2>
        <table>
          <tr><th>الاسم</th><td>${p.name}</td></tr>
          <tr><th>العمر</th><td>${p.age}</td></tr>
          <tr><th>المرحلة الدراسية</th><td>${p.gradeLevel}</td></tr>
          <tr><th>رقم الهوية</th><td>${p.nationalId}</td></tr>
          <tr><th>ولي الأمر</th><td>${p.guardianName}</td></tr>
          <tr><th>جوال ولي الأمر</th><td dir="ltr">${p.guardianPhone}</td></tr>
          <tr><th>رقم إضافي</th><td dir="ltr">${p.guardianPhoneAlt || "—"}</td></tr>
          <tr><th>تاريخ التسجيل</th><td>${p.registrationDate}</td></tr>
          <tr><th>تاريخ الانتهاء</th><td>${p.endDate}</td></tr>
          <tr><th>مدة التسجيل</th><td>${p.registrationDuration}</td></tr>
          <tr><th>المبلغ المدفوع</th><td>${p.amountPaid} ريال</td></tr>
          <tr><th>المبلغ المتبقي</th><td>${p.amountRemaining} ريال</td></tr>
          <tr><th>الحالة</th><td>${p.status === "active" ? "نشط" : "منتهي"}</td></tr>
          <tr><th>ملاحظات</th><td>${p.notes || "—"}</td></tr>
        </table>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">المشتركون</h2>
          <p className="text-muted-foreground mt-1">إدارة قائمة مشتركي النادي</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setLocation("/participants/new")}>
          <Plus className="w-4 h-4" />
          إضافة مشترك
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              قائمة المشتركين ({participants.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
                <Download className="w-4 h-4" />
                تصدير CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم، الهوية، الجوال..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "active", "expired"] as StatusFilter[]).map((f) => (
                <Button
                  key={f}
                  variant={statusFilter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(f)}
                  className={statusFilter === f ? "bg-primary text-primary-foreground" : ""}
                >
                  {f === "all" ? "الكل" : f === "active" ? "نشط" : "منتهي"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">لا توجد نتائج</p>
              <p className="text-sm mt-1">جرّب تغيير معايير البحث أو الفلترة</p>
            </div>
          ) : (
            <div className="rounded-b-md overflow-hidden">
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
                  {participants.map((p) => (
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
                            <DropdownMenuItem onClick={() => printParticipant(p)}>
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

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المشترك؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
