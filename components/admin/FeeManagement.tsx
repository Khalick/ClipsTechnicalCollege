import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/Spinner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FeeManagement() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const { toast } = useToast();

  // Form states
  const [bulkFeeAmount, setBulkFeeAmount] = useState('');
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/admin/students');
        const result = await response.json();
        if (result.success) {
          setStudents(result.data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  // Fetch fees data
  const fetchFees = async () => {
    setLoading(true);
    try {
      const url = selectedSemester 
        ? `/api/admin/fees?semester=${selectedSemester}`
        : '/api/admin/fees';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setFees(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch fees data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [selectedSemester]);

  const handleToggleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === fees.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(fees.map(fee => fee.student_id));
    }
  };

  const handleBulkFeeSubmit = async () => {
    if (!selectedSemester || !bulkFeeAmount || selectedStudents.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a semester, enter fee amount, and select students",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/fees', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk_bill',
          data: {
            student_ids: selectedStudents,
            semester: selectedSemester,
            total_fee: parseFloat(bulkFeeAmount),
            due_date: bulkDueDate || null
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Billed ${selectedStudents.length} students successfully`,
        });
        setShowBulkDialog(false);
        fetchFees();
        // Reset form
        setBulkFeeAmount('');
        setBulkDueDate('');
        setSelectedStudents([]);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to process bulk billing",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error during bulk billing:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    }
  };

  const handleRecordPayment = async () => {
    if (!currentStudent || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Missing Information",
        description: "Please select a student and enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: currentStudent.student_id,
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          semester: selectedSemester || null,
          notes: paymentNotes
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Payment of ${paymentAmount} recorded successfully`,
        });
        setShowPaymentDialog(false);
        fetchFees();
        // Reset form
        setPaymentAmount('');
        setReferenceNumber('');
        setPaymentNotes('');
        setCurrentStudent(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to record payment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    }
  };

  const openPaymentDialog = (student) => {
    setCurrentStudent(student);
    setShowPaymentDialog(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fee Management</h1>
        <div className="flex gap-4">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Semesters</SelectItem>
              <SelectItem value="2024-Semester-1">2024 - Semester 1</SelectItem>
              <SelectItem value="2024-Semester-2">2024 - Semester 2</SelectItem>
              <SelectItem value="2025-Semester-1">2025 - Semester 1</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => fetchFees()}>
            Refresh
          </Button>
          
          <Button variant="default" onClick={() => setShowBulkDialog(true)}>
            Bulk Bill Students
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Student Fees</CardTitle>
            <CardDescription>
              Manage student fee records and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedStudents.length > 0 && selectedStudents.length === fees.length} 
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Reg. Number</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Total Billed</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">No fee records found</TableCell>
                  </TableRow>
                ) : (
                  fees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.includes(fee.student_id)}
                          onChange={() => handleToggleSelectStudent(fee.student_id)}
                        />
                      </TableCell>
                      <TableCell>{fee.students.name}</TableCell>
                      <TableCell>{fee.students.registration_number}</TableCell>
                      <TableCell>{fee.semester}</TableCell>
                      <TableCell>KES {fee.total_fee.toLocaleString()}</TableCell>
                      <TableCell>KES {fee.amount_paid?.toLocaleString() || 0}</TableCell>
                      <TableCell>KES {(fee.total_fee - (fee.amount_paid || 0)).toLocaleString()}</TableCell>
                      <TableCell>{fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'Not set'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openPaymentDialog(fee)}>
                            Record Payment
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Bulk Billing Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Bill Students</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester} className="col-span-3">
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-Semester-1">2024 - Semester 1</SelectItem>
                  <SelectItem value="2024-Semester-2">2024 - Semester 2</SelectItem>
                  <SelectItem value="2025-Semester-1">2025 - Semester 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fee-amount" className="text-right">Fee Amount</Label>
              <Input
                id="fee-amount"
                type="number"
                value={bulkFeeAmount}
                onChange={(e) => setBulkFeeAmount(e.target.value)}
                placeholder="Enter fee amount"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due-date" className="text-right">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={bulkDueDate}
                onChange={(e) => setBulkDueDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Selected {selectedStudents.length} students for bulk billing
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleBulkFeeSubmit}>Bill Students</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {currentStudent && (
              <div className="text-sm mb-2">
                <p><strong>Student:</strong> {currentStudent.students.name}</p>
                <p><strong>Reg Number:</strong> {currentStudent.students.registration_number}</p>
                <p><strong>Balance:</strong> KES {(currentStudent.total_fee - (currentStudent.amount_paid || 0)).toLocaleString()}</p>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-amount" className="text-right">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} className="col-span-3">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">Reference Number</Label>
              <Input
                id="reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Enter reference number"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Input
                id="notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Add payment notes"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
