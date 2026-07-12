import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-lg border border-hairline shadow-2xl text-center">
        <CardHeader className="space-y-4 pt-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/20 text-red-400 border border-red-900/20">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-semibold tracking-wider text-red-500 uppercase">
              Error 403
            </span>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
              Access Denied
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-slate-300 max-w-md mx-auto">
            You do not have the required permissions to access this page. This resource is restricted to authorized roles.
          </p>
          {user && (
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-2 px-4 py-1.5 text-xs text-slate-400">
              <span>Logged in as:</span>
              <span className="font-bold text-foreground">{user.email}</span>
              <span className="h-1 w-1 rounded-full bg-hairline"></span>
              <span>Role:</span>
              <span className="font-bold text-foreground uppercase">{user.role}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-hairline p-6 bg-surface-2/40 rounded-b-lg">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto text-slate-400 hover:text-red-500" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Switch Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
