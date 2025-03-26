
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import { ArrowRight, Check, Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="layout-container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Transparent. Secure. Decentralized.</h2>
              <p className="text-muted-foreground">
                VoteChain makes voting more accessible and secure than ever before with cutting-edge blockchain technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-xl p-6 shadow-subtle border transition-all duration-300 hover:shadow-soft">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Tamper-Proof Voting</h3>
                <p className="text-muted-foreground mb-4">
                  Every vote is permanently recorded on the blockchain, ensuring complete transparency and preventing manipulation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-sm">Immutable vote records</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-sm">Public verification</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-background rounded-xl p-6 shadow-subtle border transition-all duration-300 hover:shadow-soft">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Fingerprint className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Identity Verification</h3>
                <p className="text-muted-foreground mb-4">
                  Secure identity verification ensures that each person can only vote once in formal elections.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-sm">Email authentication</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-sm">Facial recognition (for admins)</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-background rounded-xl p-6 shadow-subtle border transition-all duration-300 hover:shadow-soft">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <LockKeyhole className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Role-Based Access</h3>
                <p className="text-muted-foreground mb-4">
                  Different permission levels ensure that only authorized users can create official elections.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-sm">Super admin controls</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-sm">Admin election creation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="layout-container">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Whether you're organizing a college election or just want to poll your friends, VoteChain makes it simple and secure.
              </p>
              <Button size="lg" asChild>
                <Link to="/polls">
                  Explore Polls <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8">
        <div className="layout-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xs">VC</span>
              </div>
              <span className="font-medium">VoteChain</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; 2023 VoteChain. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
