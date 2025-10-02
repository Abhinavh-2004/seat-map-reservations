import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "lucide-react";
import MenuManagement from "./MenuManagement";
import TableManagement from "./TableManagement";

interface Restaurant {
  id: string;
  name: string;
}

const HotelAdminDashboard = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  useEffect(() => {
    fetchManagedRestaurants();
  }, []);

  const fetchManagedRestaurants = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("restaurant_admins")
      .select("restaurant_id, restaurants(id, name)")
      .eq("user_id", user.id);

    if (data) {
      const restaurantList = data.map((item: any) => item.restaurants).filter(Boolean);
      setRestaurants(restaurantList);
      if (restaurantList.length > 0) {
        setSelectedRestaurant(restaurantList[0].id);
      }
    }
  };

  if (restaurants.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">You are not assigned to any restaurants yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Contact an admin to get access.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hotel Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your restaurant's tables and menu</p>
      </div>

      <div className="grid gap-4">
        <div className="flex gap-2 flex-wrap">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRestaurant === restaurant.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {restaurant.name}
            </button>
          ))}
        </div>

        {selectedRestaurant && (
          <Tabs defaultValue="tables" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tables">Tables & Seats</TabsTrigger>
              <TabsTrigger value="menu">Menu Items</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tables" className="mt-6">
              <TableManagement restaurantId={selectedRestaurant} />
            </TabsContent>
            
            <TabsContent value="menu" className="mt-6">
              <MenuManagement restaurantId={selectedRestaurant} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default HotelAdminDashboard;
