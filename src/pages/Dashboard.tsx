import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import HotelAdminDashboard from "@/components/dashboard/HotelAdminDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Get user role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .order("role", { ascending: true });

      if (roles && roles.length > 0) {
        // Priority: admin > hotel_admin > user
        const roleHierarchy = ['admin', 'hotel_admin', 'user'];
        const highestRole = roleHierarchy.find(r => roles.some(role => role.role === r));
        setUserRole(highestRole || 'user');
      }

      setIsLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {userRole === 'admin' && <AdminDashboard />}
        {userRole === 'hotel_admin' && <HotelAdminDashboard />}
        {userRole === 'user' && <UserDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
