"use client";

import React from 'react';
import Background from '@/components/Background';
import Header from '@/components/Header';
import AgentDashboard from '@/components/AgentDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black relative">
      <Background />
      <Header />
      
      <main className="relative z-10 pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AgentDashboard />
        </div>
      </main>
    </div>
  );
}
