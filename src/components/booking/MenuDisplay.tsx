import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
}

interface MenuDisplayProps {
  restaurantId: string;
}

const MenuDisplay = ({ restaurantId }: MenuDisplayProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_available", true)
      .order("category");

    if (data) {
      setMenuItems(data);
    }
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Menu</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="text-2xl font-bold mb-4 text-primary">{category}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div className="flex items-center gap-1 text-primary font-bold text-lg">
                          <DollarSign className="w-5 h-5" />
                          <span>{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {menuItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No menu items available at the moment.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuDisplay;
