
import React from "react";
import { Profile } from "@/types/profile";

interface AccountInfoProps {
  profile: Profile | null;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ profile }) => {
  return (
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
  );
};

export default AccountInfo;
