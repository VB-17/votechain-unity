
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, Vote } from "lucide-react";

const Hero: React.FC = () => {
  const { user, connect, status } = useAuth();

  return (
    <div className="min-h-[90vh] flex flex-col justify-center pt-20 pb-10">
      <div className="layout-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col order-2 md:order-1 animate-in-up">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm border bg-background/50 backdrop-blur-sm mb-6 max-w-fit animate-in-delay-1">
              <span className="text-primary font-medium">Blockchain Powered</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-in-delay-1">
              Secure Voting for
              <span className="text-primary block mt-2">The Digital Age</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md animate-in-delay-2">
              VoteChain combines blockchain technology with elegant design to provide transparent, 
              tamper-proof voting for both informal polls and formal elections.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-in-delay-3">
              {!user ? (
                <Button 
                  size="lg" 
                  onClick={connect} 
                  disabled={status === "connecting"}
                  className="font-medium text-base"
                >
                  {status === "connecting" ? "Connecting..." : "Connect Wallet to Start"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="font-medium text-base"
                  asChild
                >
                  <Link to="/polls">
                    Browse Polls <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                className="bg-white/80 backdrop-blur-sm font-medium text-base"
                asChild
              >
                <Link to="/polls">
                  Explore Polls
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10 text-sm animate-fade-in">
              <div className="flex items-start">
                <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="ml-2">Transparent Results</span>
              </div>
              <div className="flex items-start">
                <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="ml-2">Tamper-Proof Votes</span>
              </div>
              <div className="flex items-start">
                <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="ml-2">Identity Verification</span>
              </div>
              <div className="flex items-start">
                <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="ml-2">Real-Time Analytics</span>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 animate-in-delay-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3 scale-95 blur-sm"></div>
              <div className="glass-panel rounded-3xl p-6 sm:p-8 bg-white/80 shadow-soft border border-primary/10 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 text-primary mr-2" />
                    <h3 className="font-medium">Latest Election</h3>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold mb-4">College President 2023</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span>Candidate A</span>
                      <span className="font-medium">58%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "58%" }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span>Candidate B</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: "42%" }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total Votes: 234</span>
                  <span>Ends in 2 days</span>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button className="w-full">
                    <Vote className="mr-2 h-4 w-4" />
                    Cast Your Vote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
