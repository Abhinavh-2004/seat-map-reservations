import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Phone, ChevronRight, Calendar } from "lucide-react";
import BookingDialog from "@/components/booking/BookingDialog";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  image_url: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .order("name");

    if (data) {
      setRestaurants(data);
    }
  };

  const handleBookNow = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setBookingDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Restaurants</h1>
        <p className="text-muted-foreground">Find and book your perfect dining experience</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            className="hover:shadow-xl transition-all group"
          >
            <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
              <Store className="w-16 h-16 text-primary/40" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{restaurant.name}</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">{restaurant.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {restaurant.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{restaurant.address}</span>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{restaurant.phone}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  onClick={() => handleBookNow(restaurant)}
                  className="w-full"
                  size="sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
                <Button
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {restaurants.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No restaurants available yet.</p>
          </CardContent>
        </Card>
      )}

      {selectedRestaurant && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
        />
      )}
    </div>
  );
};

export default UserDashboard;
