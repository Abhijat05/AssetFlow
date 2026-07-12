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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-[#0b0f19]">
      <Card className="w-full max-w-lg border-slate-200/80 shadow-xl dark:border-slate-800 text-center">
        <CardHeader className="space-y-4 pt-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-semibold tracking-wider text-red-600 dark:text-red-400 uppercase">
              Error 403
            </span>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Access Denied
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            You do not have the required permissions to access this page. This resource is restricted to authorized roles.
          </p>
          {user && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Logged in as:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{user.email}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span>Role:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{user.role}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-xl">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Switch Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
