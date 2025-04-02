
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Trophy, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon,
  Award,
  Users
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Define the interface for election results
interface ElectionResultsType {
  winnerId: string;
  winnerName: string;
  winnerVoteCount: number;
  candidateIds: string[];
  candidateNames: string[];
  voteCounts: number[];
}

const COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", 
  "#d946ef", "#ec4899", "#f43f5e", "#ef4444",
  "#f97316", "#eab308"
];

const ElectionResults = () => {
  const { id } = useParams();
  
  // Fetch election results
  const { data: results, isLoading, error } = useQuery({
    queryKey: ["electionResults", id],
    queryFn: async () => {
      // For demo purposes, simulate API call with demo data
      // In a real app, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo data based on the format provided
      const demoData: ElectionResultsType = {
        winnerId: "candidate1",
        winnerName: "Jane Smith",
        winnerVoteCount: 145,
        candidateIds: ["candidate1", "candidate2", "candidate3", "candidate4"],
        candidateNames: [
          "Jane Smith", 
          "John Doe", 
          "Alice Johnson", 
          "Robert Brown"
        ],
        voteCounts: [145, 120, 89, 56]
      };
      
      return demoData;
    }
  });

  // Prepare data for charts
  const prepareChartData = () => {
    if (!results) return [];
    
    return results.candidateNames.map((name, index) => ({
      name,
      votes: results.voteCounts[index],
      id: results.candidateIds[index]
    }));
  };
  
  // Calculate total votes
  const getTotalVotes = () => {
    if (!results) return 0;
    return results.voteCounts.reduce((sum, count) => sum + count, 0);
  };
  
  // Calculate percentage for a candidate
  const getPercentage = (voteCount: number) => {
    const totalVotes = getTotalVotes();
    if (totalVotes === 0) return 0;
    return ((voteCount / totalVotes) * 100).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="layout-container pt-24 pb-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-xl">Loading election results...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="layout-container pt-24 pb-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-destructive text-xl">
              Error loading election results. Please try again later.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="layout-container pt-24 pb-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-xl">
              No results found for this election.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const totalVotes = getTotalVotes();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="layout-container pt-24 pb-12">
        <div className="mb-6">
          <Link 
            to={`/elections/${id}`} 
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Election
          </Link>
        </div>
        
        <div className="space-y-8">
          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center text-2xl">
                <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                Election Results
              </CardTitle>
              <CardDescription>
                Final results for the election
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium flex items-center">
                      <Award className="h-5 w-5 mr-2 text-yellow-500" />
                      Winner
                    </h3>
                    <div className="text-3xl font-bold text-primary">
                      {results.winnerName}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Votes</div>
                      <div className="text-2xl font-medium">{results.winnerVoteCount}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Percentage</div>
                      <div className="text-2xl font-medium">
                        {getPercentage(results.winnerVoteCount)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Votes Cast</div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div className="text-lg font-medium">{totalVotes}</div>
                    </div>
                  </div>
                </div>
                
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="votes"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name) => [`${value} votes (${getPercentage(value)}%)`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Votes Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer
                    config={{
                      votes: { color: "#3b82f6" }
                    }}
                  >
                    <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 60, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                      />
                      <YAxis />
                      <ChartTooltip 
                        content={(props) => (
                          <ChartTooltipContent 
                            {...props} 
                            formatter={(value: number) => [`${value} votes`, "Votes"]}
                          />
                        )}
                      />
                      <Bar dataKey="votes" name="Votes" fill="var(--color-votes)" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Percentage Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Complete breakdown of election results</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead className="text-right">Votes</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.map((candidate, index) => (
                      <TableRow key={candidate.id} className={candidate.id === results.winnerId ? "bg-primary/5" : ""}>
                        <TableCell className="font-medium flex items-center">
                          {candidate.id === results.winnerId && (
                            <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                          )}
                          {candidate.name}
                        </TableCell>
                        <TableCell className="text-right">{candidate.votes}</TableCell>
                        <TableCell className="text-right">{getPercentage(candidate.votes)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionResults;
