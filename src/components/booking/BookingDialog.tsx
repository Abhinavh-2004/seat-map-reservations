import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import SeatMap from "./SeatMap";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  restaurantName: string;
}

const BookingDialog = ({ open, onOpenChange, restaurantId, restaurantName }: BookingDialogProps) => {
  const [step, setStep] = useState<"datetime" | "seats" | "success">("datetime");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [bookingDetails, setBookingDetails] = useState<{
    seats: number;
    tableNumber: number;
  } | null>(null);

  const timeSlots = [
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
    "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM",
  ];

  const handleContinueToSeats = () => {
    if (selectedDate && selectedTime) {
      setStep("seats");
    }
  };

  const handleBookingSuccess = (seatCount: number, tableNumber: number) => {
    setBookingDetails({ seats: seatCount, tableNumber });
    setStep("success");
  };

  const handleClose = () => {
    setStep("datetime");
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setBookingDetails(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === "datetime" && `Book a Table at ${restaurantName}`}
            {step === "seats" && "Select Your Seats"}
            {step === "success" && "Booking Confirmed!"}
          </DialogTitle>
        </DialogHeader>

        {step === "datetime" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Select Date
                </Label>
                <Card>
                  <CardContent className="p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border-0"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Select Time
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      className="h-12"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleContinueToSeats}
              disabled={!selectedDate || !selectedTime}
              className="w-full h-12 text-base"
              size="lg"
            >
              Continue to Seat Selection
            </Button>
          </div>
        )}

        {step === "seats" && selectedDate && selectedTime && (
          <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Selected Date & Time:</span>
                  <span className="text-primary font-semibold">
                    {format(selectedDate, "MMMM dd, yyyy")} at {selectedTime}
                  </span>
                </div>
              </CardContent>
            </Card>
            <SeatMap
              restaurantId={restaurantId}
              bookingDate={selectedDate}
              bookingTime={selectedTime}
              onBookingSuccess={handleBookingSuccess}
            />
          </div>
        )}

        {step === "success" && bookingDetails && selectedDate && selectedTime && (
          <div className="py-8">
            <Card className="border-success bg-success/5">
              <CardContent className="p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-success" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-success">Booking Successful!</h3>
                  <p className="text-muted-foreground">
                    Your table has been reserved successfully
                  </p>
                </div>

                <div className="bg-background rounded-lg p-6 space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Restaurant</p>
                      <p className="font-semibold">{restaurantName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Table Number</p>
                      <p className="font-semibold">Table {bookingDetails.tableNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{format(selectedDate, "MMMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold">{selectedTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Party Size</p>
                      <p className="font-semibold">{bookingDetails.seats} {bookingDetails.seats === 1 ? 'person' : 'people'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold text-success">Confirmed</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleClose} size="lg" className="w-full">
                    Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
