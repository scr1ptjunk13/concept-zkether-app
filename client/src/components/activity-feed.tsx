import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed() {
  const { data: activity = [] } = useQuery({
    queryKey: ["/api/activity"],
    refetchInterval: 30000,
  });

  const getActivityIcon = (type: string, status: string) => {
    if (type === "deposit") {
      return status === "committed" ? "bg-accent" : "bg-yellow-500";
    }
    return status === "completed" ? "bg-accent" : "bg-yellow-500";
  };

  const getActivityText = (type: string, status: string) => {
    if (type === "deposit") {
      return status === "committed" ? "Deposit completed" : "Deposit pending";
    }
    return status === "completed" ? "Withdrawal completed" : "Withdrawal pending";
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 fade-in">
      <h3 className="font-mono font-medium mb-3">Recent Activity</h3>
      
      <div className="space-y-3" data-testid="activity-list">
        {activity.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </div>
        ) : (
          activity.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-3 text-sm">
              <div className={`w-2 h-2 rounded-full pulse-dot ${getActivityIcon(item.type, item.status)}`}></div>
              <span className="text-muted-foreground" data-testid={`activity-${index}`}>
                {getActivityText(item.type, item.status)} {formatDistanceToNow(new Date(item.timestamp))} ago
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
