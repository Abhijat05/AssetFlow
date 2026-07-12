import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { AlertCircle, Calendar, User, Clock } from "lucide-react";
import type { OverdueReturnItem, UpcomingReturnItem } from "../types";

interface ReturnsListProps {
  overdue: OverdueReturnItem[];
  upcoming: UpcomingReturnItem[];
}

export const ReturnsList: React.FC<ReturnsListProps> = ({ overdue, upcoming }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white h-full flex flex-col">
      <CardHeader className="p-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#050038]">Returns Monitor</CardTitle>
          <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-full bg-slate-100 uppercase tracking-wider">
            7 Days window
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex-1 min-h-0 flex flex-col">
        <Tabs defaultValue="overdue" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1 mb-4 flex-shrink-0">
            <TabsTrigger
              value="overdue"
              className="rounded-lg text-xs py-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#050038] text-slate-500"
            >
              Overdue
              {overdue.length > 0 && (
                <span className="ml-1.5 bg-[#d9383a] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                  {overdue.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="rounded-lg text-xs py-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#050038] text-slate-500"
            >
              Upcoming
              {upcoming.length > 0 && (
                <span className="ml-1.5 bg-[#4262ff] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {upcoming.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overdue Returns Tab */}
          <TabsContent value="overdue" className="flex-1 min-h-0 overflow-y-auto mt-0">
            {overdue.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 h-full min-h-[160px]">
                <span className="h-9 w-9 rounded-xl bg-emerald-50 text-[#25a244] flex items-center justify-center mb-2">
                  ✓
                </span>
                <p className="text-xs text-slate-400 font-bold">No Overdue Returns</p>
                <p className="text-[10px] text-slate-400 mt-0.5">All asset handovers are on schedule.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdue.map((item) => (
                  <div
                    key={item.allocationId}
                    className="p-3.5 rounded-xl border border-[#d9383a]/25 bg-[#d9383a]/[0.02] flex flex-col space-y-2 hover:bg-[#d9383a]/[0.04] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/assets/${item.assetId}`}
                          className="text-xs font-bold text-slate-700 hover:text-[#d9383a] hover:underline truncate block"
                        >
                          {item.assetName}
                        </Link>
                        <span className="text-[9px] text-slate-400 font-bold mt-0.5 block">
                          Tag: {item.assetTag}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#d9383a] bg-[#d9383a]/10 px-2 py-0.5 rounded-full shrink-0">
                        <AlertCircle className="h-3 w-3" />
                        {item.daysOverdue}d overdue
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100 gap-y-1">
                      <span className="flex items-center gap-1 truncate max-w-[150px]">
                        <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.employeeName}</span>
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>Due: {formatDate(item.expectedReturnDate)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Upcoming Returns Tab */}
          <TabsContent value="upcoming" className="flex-1 min-h-0 overflow-y-auto mt-0">
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 h-full min-h-[160px]">
                <Clock className="h-9 w-9 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 font-bold">No Upcoming Returns</p>
                <p className="text-[10px] text-slate-400 mt-0.5">No assets due for return in the next 7 days.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((item) => (
                  <div
                    key={item.allocationId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col space-y-2 hover:border-slate-300 hover:bg-slate-50 transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/assets/${item.assetId}`}
                          className="text-xs font-bold text-slate-700 hover:text-[#4262ff] hover:underline truncate block"
                        >
                          {item.assetName}
                        </Link>
                        <span className="text-[9px] text-slate-400 font-bold mt-0.5 block">
                          Tag: {item.assetTag}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-[#4262ff] bg-[#4262ff]/10 px-2 py-0.5 rounded-full shrink-0">
                        Due soon
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100 gap-y-1">
                      <span className="flex items-center gap-1 truncate max-w-[150px]">
                        <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.employeeName}</span>
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>Due: {formatDate(item.expectedReturnDate)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
export default ReturnsList;
