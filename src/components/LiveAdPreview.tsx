import React from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { CampaignData } from '../types';

interface LiveAdPreviewProps {
  campaignData: CampaignData;
}

const LiveAdPreview: React.FC<LiveAdPreviewProps> = ({ campaignData }) => {
  const currentCopy = campaignData.adCopies[0] || { headline: 'Your Headline Here', primaryText: 'Your primary text will appear here. This is where you describe your product or service.' };

  return (
    <div className="sticky top-8 p-6 bg-container rounded-lg shadow-md dark:bg-gray-800">
      <h3 className="text-xl font-bold text-primary-text mb-4 dark:text-gray-100">Live Ad Preview</h3>

      <div className="space-y-6">
        {/* Facebook Feed Ad Preview */}
        <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <div className="flex items-center mb-3">
            <Facebook size={20} className="text-blue-600 mr-2" />
            <span className="font-semibold text-primary-text dark:text-gray-100">Facebook Feed</span>
          </div>
          <div className="flex items-center mb-3">
            <img src="https://via.placeholder.com/32" alt="Profile" className="w-8 h-8 rounded-full mr-2" />
            <div>
              <p className="font-semibold text-primary-text dark:text-gray-100">Your Page Name</p>
              <p className="text-xs text-secondary-text dark:text-gray-400">Sponsored</p>
            </div>
          </div>
          <p className="text-sm text-primary-text mb-3 dark:text-gray-100">{currentCopy.primaryText}</p>
          {campaignData.selectedImage ? (
            <img src={campaignData.selectedImage} alt="Ad Creative" className="w-full h-auto rounded-md mb-3" />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md mb-3 dark:bg-gray-700">
              <span className="text-secondary-text dark:text-gray-400">Image Preview</span>
            </div>
          )}
          <div className="text-sm font-semibold text-primary-text dark:text-gray-100 mb-1">{currentCopy.headline}</div>
          <div className="text-xs text-secondary-text dark:text-gray-400 mb-3">{campaignData.adUrl || 'yourwebsite.com'}</div>
          <button className="w-full bg-primary-brand text-white py-2 rounded-md text-sm font-semibold dark:bg-blue-600">Learn More</button>
        </div>

        {/* Instagram Feed Ad Preview */}
        <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <div className="flex items-center mb-3">
            <Instagram size={20} className="text-pink-600 mr-2" />
            <span className="font-semibold text-primary-text dark:text-gray-100">Instagram Feed</span>
          </div>
          <div className="flex items-center mb-3">
            <img src="https://via.placeholder.com/28" alt="Profile" className="w-7 h-7 rounded-full mr-2" />
            <p className="font-semibold text-primary-text dark:text-gray-100">your_page_name</p>
          </div>
          {campaignData.selectedImage ? (
            <img src={campaignData.selectedImage} alt="Ad Creative" className="w-full h-auto rounded-md mb-3" />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md mb-3 dark:bg-gray-700">
              <span className="text-secondary-text dark:text-gray-400">Image Preview</span>
            </div>
          )}
          <p className="text-sm text-primary-text mb-1 dark:text-gray-100">
            <span className="font-semibold">your_page_name</span> {currentCopy.primaryText}
          </p>
          <div className="text-xs text-secondary-text dark:text-gray-400">View Profile</div>
        </div>
      </div>
    </div>
  );
};

export default LiveAdPreview;
