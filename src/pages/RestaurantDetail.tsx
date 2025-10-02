import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ArrowLeft, Loader2 } from "lucide-react";
import SeatMap from "@/components/booking/SeatMap";
import MenuDisplay from "@/components/booking/MenuDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
}

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      navigate("/dashboard");
    } else {
      setRestaurant(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Restaurants
        </Button>

        <Card className="mb-8">
          <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg" />
          <CardHeader>
            <CardTitle className="text-3xl">{restaurant.name}</CardTitle>
            <p className="text-muted-foreground">{restaurant.description}</p>
            <div className="flex flex-col gap-2 pt-4">
              {restaurant.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{restaurant.address}</span>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="seats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seats">Seat Map & Booking</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
          </TabsList>
          
          <TabsContent value="seats" className="mt-6">
            <SeatMap restaurantId={restaurant.id} />
          </TabsContent>
          
          <TabsContent value="menu" className="mt-6">
            <MenuDisplay restaurantId={restaurant.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantDetail;
