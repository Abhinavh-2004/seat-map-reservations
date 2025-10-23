import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, CheckCircle2 } from "lucide-react";

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  status: string;
  seats: Seat[];
}

interface Seat {
  id: string;
  seat_number: number;
  status: string;
}

interface SeatMapProps {
  restaurantId: string;
  bookingDate?: Date;
  bookingTime?: string;
  onBookingSuccess?: (seatCount: number, tableNumber: number) => void;
}

const SeatMap = ({ restaurantId, bookingDate, bookingTime, onBookingSuccess }: SeatMapProps) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  useEffect(() => {
    fetchTablesAndSeats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("seat-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seats",
        },
        () => {
          fetchTablesAndSeats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
        },
        () => {
          fetchTablesAndSeats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const fetchTablesAndSeats = async () => {
    const { data } = await supabase
      .from("tables")
      .select(`
        *,
        seats(*)
      `)
      .eq("restaurant_id", restaurantId)
      .order("table_number");

    if (data) {
      setTables(data as any);
    }
  };

  const handleSeatClick = (tableId: string, seatId: string, seatStatus: string) => {
    if (seatStatus !== "available") return;

    if (selectedTableId && selectedTableId !== tableId) {
      toast.error("Please select seats from the same table");
      return;
    }

    const newSelected = new Set(selectedSeats);
    if (newSelected.has(seatId)) {
      newSelected.delete(seatId);
      if (newSelected.size === 0) {
        setSelectedTableId(null);
      }
    } else {
      newSelected.add(seatId);
      setSelectedTableId(tableId);
    }
    setSelectedSeats(newSelected);
  };

  const handleBooking = async () => {
    if (selectedSeats.size === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to make a booking");
      return;
    }

    // Use provided date/time or current date
    const bookingDateTime = bookingDate || new Date();

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          user_id: user.id,
          restaurant_id: restaurantId,
          table_id: selectedTableId,
          booking_date: bookingDateTime.toISOString(),
          party_size: selectedSeats.size,
          status: "confirmed",
        },
      ])
      .select()
      .single();

    if (bookingError) {
      toast.error("Failed to create booking");
      return;
    }

    // Create booking seats
    const bookingSeats = Array.from(selectedSeats).map((seatId) => ({
      booking_id: booking.id,
      seat_id: seatId,
    }));

    const { error: seatsError } = await supabase
      .from("booking_seats")
      .insert(bookingSeats);

    if (seatsError) {
      toast.error("Failed to reserve seats");
      return;
    }

    // Update seat statuses
    const { error: updateError } = await supabase
      .from("seats")
      .update({ status: "reserved" })
      .in("id", Array.from(selectedSeats));

    if (updateError) {
      toast.error("Failed to update seat status");
      return;
    }

    // Get table number for success message
    const selectedTable = tables.find(t => t.id === selectedTableId);
    const tableNumber = selectedTable?.table_number || 0;

    if (onBookingSuccess) {
      onBookingSuccess(selectedSeats.size, tableNumber);
    } else {
      toast.success("Booking confirmed!");
    }

    setSelectedSeats(new Set());
    setSelectedTableId(null);
    fetchTablesAndSeats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success hover:bg-success/80";
      case "occupied":
        return "bg-destructive cursor-not-allowed";
      case "reserved":
        return "bg-warning cursor-not-allowed";
      default:
        return "bg-muted";
    }
  };

  const getTableStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-success">Available</Badge>;
      case "occupied":
        return <Badge variant="destructive">Occupied</Badge>;
      case "standby":
        return <Badge className="bg-warning">Standby</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Seat Map</CardTitle>
          <CardDescription>
            Select your preferred seats to make a booking. Green seats are available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-success" />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-destructive" />
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-warning" />
              <span className="text-sm">Reserved</span>
            </div>
          </div>

          {selectedSeats.size > 0 && (
            <div className="mb-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {selectedSeats.size} seat{selectedSeats.size > 1 ? "s" : ""} selected
                </span>
              </div>
              <Button onClick={handleBooking}>Confirm Booking</Button>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => {
              const occupiedSeats = table.seats.filter((s) => s.status === "occupied").length;
              return (
                <Card key={table.id} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Table {table.table_number}</CardTitle>
                      {getTableStatusBadge(table.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {occupiedSeats} / {table.capacity} occupied
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {table.seats.map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(table.id, seat.id, seat.status)}
                          className={`
                            aspect-square rounded-lg flex items-center justify-center
                            text-sm font-medium transition-all
                            ${getStatusColor(seat.status)}
                            ${selectedSeats.has(seat.id) ? "ring-2 ring-primary ring-offset-2" : ""}
                          `}
                          disabled={seat.status !== "available"}
                        >
                          {seat.seat_number}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {tables.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No tables available for this restaurant yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatMap;
