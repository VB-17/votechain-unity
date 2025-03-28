
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Poll } from "@/components/PollCard";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import Stats from "@/components/dashboard/Stats";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

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

          <Stats polls={myPolls} profile={profile} />
          <DashboardTabs myPolls={myPolls} loading={loading} profile={profile} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
