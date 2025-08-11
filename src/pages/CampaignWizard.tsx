import React, { useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import ObjectiveStep from '../components/wizard/ObjectiveStep';
import AudienceBudgetStep from '../components/wizard/AudienceBudgetStep';
import AdCreativeCopyStep from '../components/wizard/AdCreativeCopyStep';
import LiveAdPreview from '../components/LiveAdPreview';
import { CampaignData } from '../types';

const totalSteps = 3;
const stepLabels = ['Objective', 'Audience & Budget', 'Creative & Copy', 'Review'];

const CampaignWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    objective: null,
    ageRange: [18, 65],
    interests: [],
    adUrl: '',
    selectedImage: null,
    adCopies: [{ headline: '', primaryText: '' }],
  });

  const handleUpdateCampaignData = (data: Partial<CampaignData>) => {
    setCampaignData(prevData => ({ ...prevData, ...data }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      // Handle final submission
      console.log('Campaign Data Submitted:', campaignData);
      alert('Campaign Created Successfully! (Check console for data)');
      // Optionally reset or redirect
      setCurrentStep(1);
      setCampaignData({
        objective: null,
        ageRange: [18, 65],
        interests: [],
        adUrl: '',
        selectedImage: null,
        adCopies: [{ headline: '', primaryText: '' }],
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ObjectiveStep
            onSelectObjective={(id) => handleUpdateCampaignData({ objective: id })}
            selectedObjective={campaignData.objective}
          />
        );
      case 2:
        return (
          <AudienceBudgetStep
            campaignData={campaignData}
            onUpdateCampaignData={handleUpdateCampaignData}
          />
        );
      case 3:
        return (
          <AdCreativeCopyStep
            campaignData={campaignData}
            onUpdateCampaignData={handleUpdateCampaignData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} labels={stepLabels} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-8"> {/* Main content area */}
          {renderStep()}
        </div>
        <div className="w-96 flex-shrink-0 overflow-y-auto"> {/* Sticky Ad Preview */}
          <LiveAdPreview campaignData={campaignData} />
        </div>
      </div>

      <div className="flex justify-between mt-8 p-4 bg-container rounded-lg shadow-md dark:bg-gray-800">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 rounded-md text-primary-text hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-primary-brand text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {currentStep === totalSteps ? 'Review & Launch' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default CampaignWizard;
