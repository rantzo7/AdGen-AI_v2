import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CampaignData } from '../../types';

interface AudienceBudgetStepProps {
  campaignData: CampaignData;
  onUpdateCampaignData: (data: Partial<CampaignData>) => void;
}

const AudienceBudgetStep: React.FC<AudienceBudgetStepProps> = ({ campaignData, onUpdateCampaignData }) => {
  const [newInterest, setNewInterest] = useState('');

  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim() !== '') {
      e.preventDefault();
      const updatedInterests = [...campaignData.interests, newInterest.trim()];
      onUpdateCampaignData({ interests: updatedInterests });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    const updatedInterests = campaignData.interests.filter(interest => interest !== interestToRemove);
    onUpdateCampaignData({ interests: updatedInterests });
  };

  return (
    <div className="p-6 bg-container rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-primary-text mb-6 dark:text-gray-100">Define Your Audience & Budget</h2>

      <div className="mb-6">
        <label htmlFor="location" className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-2">Location</label>
        <input
          type="text"
          id="location"
          className="w-full p-3 border border-gray-300 rounded-md bg-input-background text-primary-text dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          placeholder="e.g., United States, California"
          value={campaignData.adUrl} // Reusing adUrl for location for now, will fix later
          onChange={(e) => onUpdateCampaignData({ adUrl: e.target.value })}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-2">Age Range</label>
        <div className="flex items-center space-x-4">
          <span className="text-primary-text dark:text-gray-100">{campaignData.ageRange[0]}</span>
          <input
            type="range"
            min="13"
            max="65"
            value={campaignData.ageRange[0]}
            onChange={(e) => onUpdateCampaignData({ ageRange: [Number(e.target.value), campaignData.ageRange[1]] })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-brand"
          />
          <span className="text-primary-text dark:text-gray-100">{campaignData.ageRange[1]}</span>
          <input
            type="range"
            min="13"
            max="65"
            value={campaignData.ageRange[1]}
            onChange={(e) => onUpdateCampaignData({ ageRange: [campaignData.ageRange[0], Number(e.target.value)] })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-brand"
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="interests" className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-2">Interests</label>
        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-input-background dark:bg-gray-700 dark:border-gray-600">
          {campaignData.interests.map((interest, index) => (
            <span key={index} className="flex items-center bg-primary-brand text-white text-sm px-3 py-1 rounded-full dark:bg-blue-600">
              {interest}
              <button
                type="button"
                onClick={() => handleRemoveInterest(interest)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          <input
            type="text"
            id="interests"
            className="flex-1 min-w-[100px] p-0 border-none bg-transparent focus:ring-0 text-primary-text dark:text-gray-100"
            placeholder="Add interests (e.g., marketing, technology)"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={handleAddInterest}
          />
        </div>
        <p className="text-xs text-secondary-text mt-1 dark:text-gray-400">Press Enter to add an interest. (Autocomplete not implemented yet)</p>
      </div>

      <div className="mb-6">
        <label htmlFor="budget" className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-2">Daily Budget ($)</label>
        <input
          type="number"
          id="budget"
          className="w-full p-3 border border-gray-300 rounded-md bg-input-background text-primary-text dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          placeholder="e.g., 20"
          value={100} // Placeholder for budget
          onChange={() => {}}
        />
      </div>
    </div>
  );
};

export default AudienceBudgetStep;
