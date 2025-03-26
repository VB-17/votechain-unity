
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Wallet } from "lucide-react";

interface WalletButtonProps {
  compact?: boolean;
}

const WalletButton: React.FC<WalletButtonProps> = ({ compact = false }) => {
  const { status, user, connect, disconnect } = useAuth();

  if (status === "disconnected") {
    return (
      <Button
        onClick={() => connect()}
        className="font-medium"
        size={compact ? "sm" : "default"}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {!compact && "Connect Wallet"}
      </Button>
    );
  }

  if (status === "connecting") {
    return (
      <Button disabled className="font-medium" size={compact ? "sm" : "default"}>
        <span className="animate-pulse-slow">Connecting...</span>
      </Button>
    );
  }

  // Format the wallet address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="font-medium border-primary/20 hover:bg-primary/5"
          size={compact ? "sm" : "default"}
        >
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            {formatAddress(user?.address || "")}
            {user?.isSuperAdmin && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                Super Admin
              </span>
            )}
            {user?.isAdmin && !user?.isSuperAdmin && (
              <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Connected as:
        </div>
        <div className="px-2 py-1.5 text-sm font-mono break-all">
          {user?.address}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;
