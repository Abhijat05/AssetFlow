import React from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-[#0b0f19]">
      <Card className="w-full max-w-lg border-slate-200/80 shadow-xl dark:border-slate-800 text-center">
        <CardHeader className="space-y-4 pt-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <HelpCircle className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Error 404
            </span>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Page Not Found
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            The page you are looking for does not exist or has been moved. Please check the URL and try again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-xl">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
