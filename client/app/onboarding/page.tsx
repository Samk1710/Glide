"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Background from '@/components/Background';
import Header from '@/components/Header';
import AgentWalletStep from '@/components/onboarding/AgentWalletStep';
import TelegramStep from '@/components/onboarding/TelegramStep';
import ActiveWalletsStep from '@/components/onboarding/ActiveWalletsStep';
import CompletionStep from '@/components/onboarding/CompletionStep';
import { OnboardingData } from '@/types/onboarding';
import { saveOnboardingProgress, loadOnboardingProgress } from '@/utils/onboarding';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    agentWallet: {
      restrictions: '',
      notes: '',
      isConnected: false
    },
    telegram: {
      phoneNumber: '',
      isVerified: false,
      otpCode: '',
      selectedChatRooms: []
    },
    activeWallets: []
  });

  // Load saved progress on component mount
  useEffect(() => {
    const savedData = loadOnboardingProgress();
    if (savedData) {
      setOnboardingData(savedData.data || onboardingData);
      setCurrentStep(savedData.currentStep || 1);
    }
  }, []);

  // Save progress whenever data changes
  useEffect(() => {
    saveOnboardingProgress({ data: onboardingData, currentStep });
  }, [onboardingData, currentStep]);

  const steps = [
    { id: 1, title: 'Agent Wallet Setup', component: AgentWalletStep },
    { id: 2, title: 'Telegram Integration', component: TelegramStep },
    { id: 3, title: 'Active Wallets', component: ActiveWalletsStep },
    { id: 4, title: 'Complete Setup', component: CompletionStep }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateOnboardingData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background Component */}
      <Background color="red" />

      {/* Header */}
      <Header />

      {/* Onboarding Content */}
      <div className="relative z-20 min-h-screen pt-28 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">Agent Onboarding</h1>
              <span className="text-sm text-white/60">Step {currentStep} of {steps.length}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      currentStep >= step.id 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className={`text-xs mt-1 transition-all duration-300 ${
                    currentStep >= step.id ? 'text-white' : 'text-white/60'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                {currentStepData?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {CurrentStepComponent && (
                <CurrentStepComponent
                  data={onboardingData}
                  updateData={updateOnboardingData}
                  onNext={nextStep}
                />
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
                
                {currentStep < steps.length ? (
                  <Button
                    onClick={nextStep}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      // Handle completion
                      console.log('Onboarding completed:', onboardingData);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Complete Setup
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
