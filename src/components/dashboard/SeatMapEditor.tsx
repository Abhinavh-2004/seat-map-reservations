import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, GripVertical, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  status: string;
  position_x: number;
  position_y: number;
  seats: Seat[];
}

interface Seat {
  id: string;
  seat_number: number;
  status: string;
}

interface SeatMapEditorProps {
  restaurantId: string;
}

const SeatMapEditor = ({ restaurantId }: SeatMapEditorProps) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchTablesAndSeats();

    const channel = supabase
      .channel("seat-editor-changes")
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

  const handleDragStart = (tableId: string) => {
    setDraggedTable(tableId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetTableId: string) => {
    e.preventDefault();
    if (!draggedTable || draggedTable === targetTableId) return;

    const draggedTableData = tables.find((t) => t.id === draggedTable);
    const targetTableData = tables.find((t) => t.id === targetTableId);

    if (!draggedTableData || !targetTableData) return;

    const newTables = tables.map((table) => {
      if (table.id === draggedTable) {
        return { ...table, position_x: targetTableData.position_x, position_y: targetTableData.position_y };
      }
      if (table.id === targetTableId) {
        return { ...table, position_x: draggedTableData.position_x, position_y: draggedTableData.position_y };
      }
      return table;
    });

    setTables(newTables);
    setDraggedTable(null);
    setHasChanges(true);
  };

  const handleTableStatusChange = async (tableId: string, newStatus: string) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
    setHasChanges(true);
  };

  const handleSeatStatusChange = async (tableId: string, seatId: string, newStatus: string) => {
    setTables(tables.map(t => 
      t.id === tableId 
        ? { 
            ...t, 
            seats: t.seats.map(s => s.id === seatId ? { ...s, status: newStatus } : s) 
          } 
        : t
    ));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    try {
      for (const table of tables) {
        await supabase
          .from("tables")
          .update({
            position_x: table.position_x,
            position_y: table.position_y,
            status: table.status as any,
          })
          .eq("id", table.id);

        for (const seat of table.seats) {
          await supabase
            .from("seats")
            .update({ status: seat.status as any })
            .eq("id", seat.id);
        }
      }

      toast.success("Layout saved successfully!");
      setHasChanges(false);
      fetchTablesAndSeats();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success hover:bg-success/80";
      case "occupied":
        return "bg-destructive cursor-not-allowed";
      case "standby":
      case "reserved":
        return "bg-warning cursor-not-allowed";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seat Map Editor</CardTitle>
              <CardDescription>
                Drag tables to reposition, click seats/tables to change status
              </CardDescription>
            </div>
            {hasChanges && (
              <Button onClick={saveChanges} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            )}
          </div>
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
              <span className="text-sm">Standby/Reserved</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => {
              const occupiedSeats = table.seats.filter((s) => s.status === "occupied").length;
              return (
                <Card
                  key={table.id}
                  draggable
                  onDragStart={() => handleDragStart(table.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, table.id)}
                  className="relative cursor-move border-2 hover:border-primary transition-colors"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-lg">Table {table.table_number}</CardTitle>
                      </div>
                      <Select
                        value={table.status}
                        onValueChange={(value) => handleTableStatusChange(table.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="standby">Standby</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Select
                          key={seat.id}
                          value={seat.status}
                          onValueChange={(value) => handleSeatStatusChange(table.id, seat.id, value)}
                        >
                          <SelectTrigger
                            className={`
                              aspect-square rounded-lg flex items-center justify-center
                              text-sm font-medium transition-all h-auto p-0
                              ${getStatusColor(seat.status)}
                            `}
                          >
                            <span className="text-sm font-medium">{seat.seat_number}</span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="occupied">Occupied</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                          </SelectContent>
                        </Select>
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

export default SeatMapEditor;
