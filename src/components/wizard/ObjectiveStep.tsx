import React from 'react';
import { Globe, Users, DollarSign, MessageSquare, ShoppingCart, Zap } from 'lucide-react';
import { CampaignObjective } from '../../types';

interface ObjectiveStepProps {
  onSelectObjective: (objectiveId: string) => void;
  selectedObjective: string | null;
}

const objectives: CampaignObjective[] = [
  { id: 'website_traffic', title: 'Website Traffic', description: 'Send people to a destination like your website or app.', icon: Globe },
  { id: 'lead_generation', title: 'Lead Generation', description: 'Collect leads for your business or brand.', icon: Users },
  { id: 'sales', title: 'Sales', description: 'Find people likely to purchase your products or services.', icon: ShoppingCart },
  { id: 'engagement', title: 'Engagement', description: 'Get more messages, video views, or post engagement.', icon: MessageSquare },
  { id: 'app_promotion', title: 'App Promotion', description: 'Get more installs, purchases, or engagement for your app.', icon: Zap },
  { id: 'brand_awareness', title: 'Brand Awareness', description: 'Reach a broad audience to increase awareness of your brand.', icon: DollarSign },
];

const ObjectiveStep: React.FC<ObjectiveStepProps> = ({ onSelectObjective, selectedObjective }) => {
  return (
    <div className="p-6 bg-container rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-primary-text mb-6 dark:text-gray-100">Choose Your Campaign Objective</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {objectives.map((obj) => (
          <div
            key={obj.id}
            className={`
              flex flex-col items-center p-6 border rounded-lg cursor-pointer
              transition-all duration-200 ease-in-out
              ${selectedObjective === obj.id
                ? 'border-primary-brand bg-primary-brand bg-opacity-10 text-primary-brand dark:border-blue-400 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-400'
                : 'border-gray-200 bg-white hover:border-primary-brand hover:shadow-lg dark:border-gray-700 dark:bg-gray-700 dark:hover:border-blue-400'
              }
            `}
            onClick={() => onSelectObjective(obj.id)}
          >
            <obj.icon size={48} className="mb-4 text-icon-color dark:text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-primary-text dark:text-gray-100">{obj.title}</h3>
            <p className="text-center text-secondary-text dark:text-gray-300">{obj.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObjectiveStep;
