import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Store } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
}

const AdminDashboard = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch restaurants");
    } else {
      setRestaurants(data || []);
    }
  };

  const handleAddRestaurant = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("restaurants").insert([
      {
        ...newRestaurant,
        created_by: user.id,
      },
    ]);

    if (error) {
      toast.error("Failed to add restaurant");
    } else {
      toast.success("Restaurant added successfully");
      setIsDialogOpen(false);
      setNewRestaurant({ name: "", description: "", address: "", phone: "" });
      fetchRestaurants();
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    const { error } = await supabase.from("restaurants").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete restaurant");
    } else {
      toast.success("Restaurant deleted");
      fetchRestaurants();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage restaurants and admins</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                  placeholder="The Grand Bistro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRestaurant.description}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                  placeholder="Fine dining experience..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newRestaurant.address}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                  placeholder="123 Main St, City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newRestaurant.phone}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <Button onClick={handleAddRestaurant} className="w-full">
                Add Restaurant
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                    <CardDescription className="text-sm">{restaurant.address}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteRestaurant(restaurant.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>
              {restaurant.phone && (
                <p className="text-sm mt-2 font-medium">{restaurant.phone}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {restaurants.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No restaurants yet. Add your first one!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
