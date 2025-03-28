
import React from "react";
import { Poll } from "@/components/PollCard";
import StatCard from "./StatCard";
import { BarChart3, CircleUser, Clock, ShieldCheck, User, Vote } from "lucide-react";
import { Profile } from "@/types/profile";

interface StatsProps {
  polls: Poll[];
  profile: Profile | null;
}

const Stats: React.FC<StatsProps> = ({ polls, profile }) => {
  const totalVotes = polls.reduce((acc, poll) => acc + poll.totalVotes, 0);

  const getAccountTypeInfo = () => {
    if (profile?.is_super_admin) {
      return {
        icon: ShieldCheck,
        text: "Super Admin",
        className: "text-primary"
      };
    } else if (profile?.is_admin) {
      return {
        icon: CircleUser,
        text: "Admin",
        className: "text-primary"
      };
    } else {
      return {
        icon: CircleUser,
        text: "Voter",
        className: "text-muted-foreground"
      };
    }
  };

  const accountType = getAccountTypeInfo();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Your Polls" 
        value={polls.length} 
        icon={Vote} 
      />
      <StatCard 
        title="Total Votes" 
        value={totalVotes} 
        icon={User} 
      />
      <StatCard 
        title="Account Type" 
        value={accountType.text} 
        icon={accountType.icon}
        iconColor={accountType.className} 
      />
      <StatCard 
        title="College Verification" 
        value={profile?.college_verified ? 'Verified' : 'Not Verified'} 
        icon={Clock} 
      />
    </div>
  );
};

export default Stats;
