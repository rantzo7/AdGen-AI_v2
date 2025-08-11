import React, { useState } from 'react';
import { X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handleConnectMeta = () => {
    // Simulate Meta OAuth flow
    console.log('Initiating Meta OAuth flow...');
    // In a real app, this would redirect to Meta's OAuth page
    // For now, just move to the next step
    handleNext();
  };

  const handleSelectAdAccount = (account: string) => {
    console.log('Selected Ad Account:', account);
    // In a real app, save this selection
    handleNext();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary-text mb-4">Welcome to Your Dashboard!</h3>
            <p className="text-secondary-text">Let's get you set up to create your first campaign.</p>
          </div>
        );
      case 2:
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary-text mb-4">Connect Your Meta Account</h3>
            <p className="text-secondary-text mb-6">
              To manage your campaigns, please connect your Meta (Facebook/Instagram) advertising account.
            </p>
            <button
              onClick={handleConnectMeta}
              className="bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              Connect your Meta Account
            </button>
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary-text mb-4">Select Your Ad Account</h3>
            <p className="text-secondary-text mb-6">
              Choose the Meta Ad Account you'd like to use for your campaigns.
            </p>
            <div className="w-full max-w-xs mx-auto">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-input-background text-primary-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleSelectAdAccount(e.target.value)}
                defaultValue="account1" // Auto-select if only one
              >
                <option value="account1">Meta Ad Account 1 (Auto-selected)</option>
                <option value="account2">Meta Ad Account 2</option>
                <option value="account3">Meta Ad Account 3</option>
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-success-green mb-4">Setup Complete! 🎉</h3>
            <p className="text-secondary-text mb-6">
              Your Meta account is successfully connected. You're all set to launch your first campaign!
            </p>
            <button
              onClick={handleNext}
              className="bg-green-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-green-700 transition duration-200"
            >
              Create Your First Campaign
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-container p-8 rounded-lg shadow-xl w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-secondary-text hover:text-primary-text">
          <X size={24} />
        </button>
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-secondary-text mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>
              {step === 1 && 'Welcome'}
              {step === 2 && 'Connect Meta Account'}
              {step === 3 && 'Select Ad Account'}
              {step === 4 && 'Success'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
        {renderStepContent()}
        {step < totalSteps && step !== 2 && step !== 4 && ( // Hide next button for Meta connect and Success steps
          <div className="flex justify-end mt-8">
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white py-2 px-5 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
