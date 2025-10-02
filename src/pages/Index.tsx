import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ChefHat, Calendar, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Smart Restaurant Booking</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Book Your Perfect{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dining Experience
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Visualize your table, select your seats, and book instantly. Just like booking movie tickets, but for dining.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="text-lg" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="text-lg" onClick={() => navigate("/dashboard")}>
                Browse Restaurants
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose TableBooker?</h2>
            <p className="text-lg text-muted-foreground">
              The most intuitive way to book restaurant tables with real-time seat visualization
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Visual Seat Selection</h3>
              <p className="text-muted-foreground">
                See exactly where you'll sit with our interactive table map. Pick your perfect spot just like cinema booking.
              </p>
            </div>
            
            <div className="group rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-lg bg-success/10 p-3">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Real-Time Availability</h3>
              <p className="text-muted-foreground">
                Know exactly how many people are seated and which tables are available in real-time.
              </p>
            </div>
            
            <div className="group rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-lg bg-warning/10 p-3">
                <ChefHat className="h-6 w-6 text-warning" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Browse Menus</h3>
              <p className="text-muted-foreground">
                Explore restaurant menus before you book. Plan your perfect meal ahead of time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Start Booking?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of diners who love our seamless booking experience
            </p>
            <Button size="lg" className="text-lg" onClick={() => navigate("/auth")}>
              Sign Up Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
