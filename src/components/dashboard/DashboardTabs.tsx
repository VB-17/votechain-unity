
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PollsList from "./PollsList";
import AccountInfo from "./AccountInfo";
import CollegeEmailVerification from "@/components/CollegeEmailVerification";
import AdminRequestForm from "@/components/AdminRequestForm";
import AdminRequestsDashboard from "@/components/AdminRequestsDashboard";
import { Poll } from "@/components/PollCard";
import { Profile } from "@/types/profile";

interface DashboardTabsProps {
  myPolls: Poll[];
  loading: boolean;
  profile: Profile | null;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  myPolls, 
  loading, 
  profile 
}) => {
  return (
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
        <PollsList polls={myPolls} loading={loading} />
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
        <AccountInfo profile={profile} />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
