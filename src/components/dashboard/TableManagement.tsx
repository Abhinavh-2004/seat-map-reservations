import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  status: string;
  position_x: number;
  position_y: number;
}

interface TableManagementProps {
  restaurantId: string;
}

const TableManagement = ({ restaurantId }: TableManagementProps) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    table_number: "",
    capacity: "4",
    status: "available",
  });

  useEffect(() => {
    fetchTables();
  }, [restaurantId]);

  const fetchTables = async () => {
    const { data } = await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("table_number");

    if (data) {
      setTables(data);
    }
  };

  const handleAddTable = async () => {
    const { error } = await supabase.from("tables").insert([
      {
        restaurant_id: restaurantId,
        table_number: parseInt(newTable.table_number),
        capacity: parseInt(newTable.capacity),
        status: newTable.status as "available" | "occupied" | "standby",
      },
    ]);

    if (error) {
      toast.error("Failed to add table");
    } else {
      // Auto-create seats for the table
      const { data: tableData } = await supabase
        .from("tables")
        .select("id")
        .eq("restaurant_id", restaurantId)
        .eq("table_number", parseInt(newTable.table_number))
        .single();

      if (tableData) {
        const seats = Array.from({ length: parseInt(newTable.capacity) }, (_, i) => ({
          table_id: tableData.id,
          seat_number: i + 1,
          status: "available" as const,
        }));

        await supabase.from("seats").insert(seats);
      }

      toast.success("Table added successfully");
      setIsDialogOpen(false);
      setNewTable({ table_number: "", capacity: "4", status: "available" });
      fetchTables();
    }
  };

  const handleDeleteTable = async (id: string) => {
    const { error } = await supabase.from("tables").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete table");
    } else {
      toast.success("Table deleted");
      fetchTables();
    }
  };

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    const { error } = await supabase
      .from("tables")
      .update({ status: newStatus as "available" | "occupied" | "standby" })
      .eq("id", tableId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchTables();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Table Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="table-number">Table Number</Label>
                <Input
                  id="table-number"
                  type="number"
                  value={newTable.table_number}
                  onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Seats)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                  placeholder="4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={newTable.status}
                  onValueChange={(value) => setNewTable({ ...newTable, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="standby">Standby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTable} className="w-full">
                Add Table
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <Card key={table.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Table {table.table_number}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTable(table.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-medium">{table.capacity} seats</span>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Select
                  value={table.status}
                  onValueChange={(value) => handleStatusChange(table.id, value)}
                >
                  <SelectTrigger className={`
                    ${table.status === 'available' ? 'border-success text-success' : ''}
                    ${table.status === 'occupied' ? 'border-destructive text-destructive' : ''}
                    ${table.status === 'standby' ? 'border-warning text-warning' : ''}
                  `}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="standby">Standby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TableManagement;
