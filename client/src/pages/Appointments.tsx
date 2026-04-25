import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import AppShell from "@/components/AppShell";
import { Calendar, CheckCircle2, Clock, MapPin, Plus, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", color: "bg-green-50 text-green-700 border-green-200" },
  completed: { label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function Appointments() {
  const [showBooking, setShowBooking] = useState(false);
  const [form, setForm] = useState({
    childId: "",
    clinicName: "",
    clinicAddress: "",
    appointmentDate: "",
    preferredTime: "",
    notes: "",
    guardianName: "",
    guardianPhone: "",
  });

  const { data: appointments = [], isLoading } = trpc.appointments.list.useQuery();
  const { data: children = [] } = trpc.children.list.useQuery();
  const utils = trpc.useUtils();

  const bookAppt = trpc.appointments.book.useMutation({
    onSuccess: () => {
      toast.success("Appointment booked successfully!");
      setShowBooking(false);
      setForm({ childId: "", clinicName: "", clinicAddress: "", appointmentDate: "", preferredTime: "", notes: "", guardianName: "", guardianPhone: "" });
      utils.appointments.list.invalidate();
    },
    onError: () => toast.error("Failed to book appointment"),
  });

  const cancelAppt = trpc.appointments.cancel.useMutation({
    onSuccess: () => {
      toast.success("Appointment cancelled");
      utils.appointments.list.invalidate();
    },
    onError: () => toast.error("Failed to cancel appointment"),
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.childId || !form.clinicName || !form.appointmentDate || !form.preferredTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    bookAppt.mutate({
      childId: parseInt(form.childId),
      clinicName: form.clinicName,
      clinicAddress: form.clinicAddress || undefined,
      appointmentDate: form.appointmentDate,
      preferredTime: form.preferredTime,
      notes: form.notes || undefined,
      guardianName: form.guardianName || "Parent",
      guardianPhone: form.guardianPhone || "N/A",
    });
  };

  const upcoming = appointments.filter((a) => a.status === "pending" || a.status === "confirmed");
  const past = appointments.filter((a) => a.status === "completed" || a.status === "cancelled");

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-normal text-foreground mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Appointments
            </h1>
            <p className="text-muted-foreground">Book and manage your child's clinic appointments.</p>
          </div>
          <Button onClick={() => setShowBooking(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : appointments.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No appointments yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Book your first appointment with a nearby clinic.</p>
              <Button onClick={() => setShowBooking(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Upcoming ({upcoming.length})
                </h2>
                <div className="space-y-3">
                  {upcoming.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appt={appt}
                      onCancel={() => cancelAppt.mutate({ id: appt.id })}
                    />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Past ({past.length})
                </h2>
                <div className="space-y-3 opacity-70">
                  {past.map((appt) => (
                    <AppointmentCard key={appt.id} appt={appt} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book an Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBook} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Child <span className="text-destructive">*</span></Label>
              <Select value={form.childId} onValueChange={(v) => setForm((f) => ({ ...f, childId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Clinic Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g., Philippine Children's Medical Center"
                value={form.clinicName}
                onChange={(e) => setForm((f) => ({ ...f, clinicName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Clinic Address</Label>
              <Input
                placeholder="Full address"
                value={form.clinicAddress}
                onChange={(e) => setForm((f) => ({ ...f, clinicAddress: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.appointmentDate}
                  onChange={(e) => setForm((f) => ({ ...f, appointmentDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Time <span className="text-destructive">*</span></Label>
                <Select value={form.preferredTime} onValueChange={(v) => setForm((f) => ({ ...f, preferredTime: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any special instructions or concerns..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={bookAppt.isPending}>
                {bookAppt.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowBooking(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function AppointmentCard({
  appt,
  onCancel,
}: {
  appt: {
    id: number;
    clinicName: string;
    clinicAddress?: string | null;
    appointmentDate: string | Date;
    preferredTime: string;
    status: string;
    purpose?: string | null;
    notes?: string | null;
    childId: number;
  };
  onCancel?: () => void;
}) {
  const config = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
  const isPast = appt.status === "completed" || appt.status === "cancelled";

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-foreground text-sm truncate">{appt.clinicName}</h3>
                <Badge variant="outline" className={`text-xs ${config.color}`}>
                  {config.label}
                </Badge>
              </div>
              {appt.clinicAddress && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  {appt.clinicAddress}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(appt.appointmentDate).toLocaleDateString("en-PH", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {appt.preferredTime}
                </span>
              </div>
              {appt.purpose && (
                <div className="text-xs text-muted-foreground mt-1">Purpose: {appt.purpose}</div>
              )}
            </div>
          </div>
          {!isPast && onCancel && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 flex-shrink-0"
              onClick={onCancel}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
