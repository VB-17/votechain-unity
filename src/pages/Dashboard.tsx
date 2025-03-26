
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PollCard, { Poll } from "@/components/PollCard";
import VoteChart from "@/components/VoteChart";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  CircleUser,
  Clock,
  Plus,
  ShieldCheck,
  User,
  Vote,
} from "lucide-react";
import CollegeEmailVerification from "@/components/CollegeEmailVerification";
import AdminRequestForm from "@/components/AdminRequestForm";
import AdminRequestsDashboard from "@/components/AdminRequestsDashboard";

const Dashboard: React.FC = () => {
  const { user, profile } = useSupabaseAuth();
  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserPolls = async () => {
      if (!user) return;

      // Simulate loading polls from blockchain
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data - In a real app, we'd fetch from blockchain
      const mockUserPolls: Poll[] = [
        {
          id: "user1",
          title: "Department Representative Election",
          description: "Vote for your preferred department representative",
          creator: profile?.wallet_address || "",
          options: [
            { id: "opt1", text: "Candidate X", votes: 24 },
            { id: "opt2", text: "Candidate Y", votes: 18 },
          ],
          totalVotes: 42,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          isElection: profile?.is_admin || false,
        },
        {
          id: "user2",
          title: "Preferred Study Location",
          description: "Where do you prefer to study on campus?",
          creator: profile?.wallet_address || "",
          options: [
            { id: "opt1", text: "Library", votes: 35 },
            { id: "opt2", text: "Student Center", votes: 22 },
            { id: "opt3", text: "Cafeteria", votes: 18 },
            { id: "opt4", text: "Outdoors", votes: 12 },
          ],
          totalVotes: 87,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          isElection: false,
        },
      ];

      setMyPolls(mockUserPolls);
      setLoading(false);
    };

    loadUserPolls();
  }, [user, profile]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="layout-container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your polls and account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Your Polls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Vote className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{myPolls.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Votes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {myPolls.reduce((acc, poll) => acc + poll.totalVotes, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Account Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {profile?.is_super_admin ? (
                    <>
                      <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                      <span className="text-lg font-medium">Super Admin</span>
                    </>
                  ) : profile?.is_admin ? (
                    <>
                      <CircleUser className="h-5 w-5 text-primary mr-2" />
                      <span className="text-lg font-medium">Admin</span>
                    </>
                  ) : (
                    <>
                      <CircleUser className="h-5 w-5 text-muted-foreground mr-2" />
                      <span className="text-lg font-medium">Voter</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  College Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <span className="text-lg font-medium">
                    {profile?.college_verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="polls" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="polls">Your Polls</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              {profile?.is_super_admin && (
                <TabsTrigger value="admin">Admin Controls</TabsTrigger>
              )}
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="polls">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Polls You've Created</h2>
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Poll
                </Button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-muted/50 rounded-lg h-[350px] animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : myPolls.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium mb-2">No polls created yet</h3>
                  <p className="text-muted-foreground mb-8">
                    Create your first poll to gather votes on topics that matter to you
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Poll
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {myPolls.map((poll) => (
                    <div key={poll.id} className="border rounded-xl p-6 bg-background/50">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <PollCard poll={poll} />
                        </div>
                        <div>
                          <VoteChart poll={poll} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="verification">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CollegeEmailVerification />
                <AdminRequestForm />
              </div>
            </TabsContent>
            
            {profile?.is_super_admin && (
              <TabsContent value="admin">
                <AdminRequestsDashboard />
              </TabsContent>
            )}
            
            <TabsContent value="account">
              <div className="border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Account Information</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                      <p className="font-mono bg-muted p-2 rounded text-sm overflow-auto">
                        {profile?.wallet_address}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                      <div className="flex items-center">
                        {profile?.is_super_admin ? (
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                            Super Admin
                          </span>
                        ) : profile?.is_admin ? (
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                            Admin
                          </span>
                        ) : (
                          <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                            Voter
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
