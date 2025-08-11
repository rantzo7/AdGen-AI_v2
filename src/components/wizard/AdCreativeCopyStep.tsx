import React, { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { AdCreative, AdCopy, CampaignData } from '../../types';

interface AdCreativeCopyStepProps {
  campaignData: CampaignData;
  onUpdateCampaignData: (data: Partial<CampaignData>) => void;
}

const AdCreativeCopyStep: React.FC<AdCreativeCopyStepProps> = ({ campaignData, onUpdateCampaignData }) => {
  const [urlInput, setUrlInput] = useState(campaignData.adUrl || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scrapedImages, setScrapedImages] = useState<AdCreative[]>([]);
  const [activeCopyTab, setActiveCopyTab] = useState(0);

  const handleGenerateFromLink = async () => {
    setIsGenerating(true);
    // Simulate API call for scraping
    await new Promise(resolve => setTimeout(resolve, 2000));
    const dummyImages: AdCreative[] = [
      { id: 'img1', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isSelected: false },
      { id: 'img2', imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8ed6d218fd5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isSelected: false },
      { id: 'img3', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isSelected: false },
      { id: 'img4', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isSelected: false },
    ];
    setScrapedImages(dummyImages);
    onUpdateCampaignData({ adUrl: urlInput, selectedImage: dummyImages[0]?.imageUrl || null }); // Select first image by default
    setIsGenerating(false);

    // Simulate AI copy generation
    const dummyCopies: AdCopy[] = [
      { headline: 'Boost Your Business Online!', primaryText: 'Reach new customers and grow your sales with our powerful AI-driven ad platform. Get started today!' },
      { headline: 'Unlock Your Ad Potential', primaryText: 'Transform your marketing with intelligent ad creation. Maximize ROI effortlessly.' },
      { headline: 'Smart Ads, Real Results', primaryText: 'Leverage AI to craft compelling ad campaigns that convert. Simple, fast, effective.' },
    ];
    onUpdateCampaignData({ adCopies: dummyCopies });
  };

  const handleImageSelect = (imageId: string) => {
    const selectedImg = scrapedImages.find(img => img.id === imageId);
    if (selectedImg) {
      onUpdateCampaignData({ selectedImage: selectedImg.imageUrl });
    }
  };

  const handleCopyChange = (field: 'headline' | 'primaryText', value: string) => {
    const updatedCopies = [...campaignData.adCopies];
    if (updatedCopies[activeCopyTab]) {
      updatedCopies[activeCopyTab] = {
        ...updatedCopies[activeCopyTab],
        [field]: value,
      };
      onUpdateCampaignData({ adCopies: updatedCopies });
    }
  };

  return (
    <div className="p-6 bg-container rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-primary-text mb-6 dark:text-gray-100">Ad Creative & Copy</h2>

      <div className="mb-6">
        <label htmlFor="adUrl" className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-2">Website URL</label>
        <div className="flex space-x-3">
          <input
            type="url"
            id="adUrl"
            className="flex-1 p-3 border border-gray-300 rounded-md bg-input-background text-primary-text dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            placeholder="e.g., https://yourwebsite.com"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button
            onClick={handleGenerateFromLink}
            className="px-6 py-3 bg-primary-brand text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
            disabled={isGenerating || urlInput.trim() === ''}
          >
            {isGenerating ? 'Generating...' : 'Generate from Link'}
          </button>
        </div>
        {isGenerating && <p className="text-sm text-secondary-text mt-2 dark:text-gray-400">Scraping images and generating copy...</p>}
      </div>

      {scrapedImages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary-text mb-3 dark:text-gray-100">Select Image</h3>
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {scrapedImages.map((image) => (
              <div
                key={image.id}
                className={`
                  relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden cursor-pointer border-2
                  ${campaignData.selectedImage === image.imageUrl
                    ? 'border-primary-brand ring-2 ring-primary-brand dark:border-blue-400 dark:ring-blue-400'
                    : 'border-gray-300 dark:border-gray-600'
                  }
                `}
                onClick={() => handleImageSelect(image.id)}
              >
                <img src={image.imageUrl} alt="Scraped Ad Creative" className="w-full h-full object-cover" />
                {campaignData.selectedImage === image.imageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary-brand bg-opacity-50 dark:bg-blue-800 dark:bg-opacity-50">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            <button className="flex-shrink-0 w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg text-secondary-text hover:border-primary-brand hover:text-primary-brand transition-colors duration-200 dark:border-gray-500 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400">
              <Upload size={24} className="mb-2" />
              Upload Image
            </button>
          </div>
        </div>
      )}

      {campaignData.adCopies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary-text mb-3 dark:text-gray-100">Ad Copy Variations</h3>
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            {campaignData.adCopies.map((_, index) => (
              <button
                key={index}
                className={`
                  px-4 py-2 text-sm font-medium
                  ${activeCopyTab === index
                    ? 'border-b-2 border-primary-brand text-primary-brand dark:border-blue-400 dark:text-blue-400'
                    : 'text-secondary-text hover:text-primary-text dark:text-gray-400 dark:hover:text-gray-100'
                  }
                `}
                onClick={() => setActiveCopyTab(index)}
              >
                Variation {index + 1}
              </button>
            ))}
          </div>
          {campaignData.adCopies[activeCopyTab] && (
            <div className="space-y-4">
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-2">Headline</label>
                <input
                  type="text"
                  id="headline"
                  className="w-full p-3 border border-gray-300 rounded-md bg-input-background text-primary-text dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={campaignData.adCopies[activeCopyTab].headline}
                  onChange={(e) => handleCopyChange('headline', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="primaryText" className="block text-sm font-medium text-secondary-text dark:text-gray-300 mb-2">Primary Text</label>
                <textarea
                  id="primaryText"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md bg-input-background text-primary-text dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  value={campaignData.adCopies[activeCopyTab].primaryText}
                  onChange={(e) => handleCopyChange('primaryText', e.target.value)}
                ></textarea>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdCreativeCopyStep;
