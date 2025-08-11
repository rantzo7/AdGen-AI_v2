import React from 'react';
import { Home, BarChart2, Settings, LogOut, Users, DollarSign, Bell, PlusCircle } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Import supabase client

interface SidebarProps {
  setCurrentPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setCurrentPage }) => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <aside className="w-64 bg-sidebar-background text-sidebar-text flex flex-col p-4 shadow-lg dark:bg-gray-800 dark:text-gray-200">
      <div className="text-2xl font-bold text-primary-brand mb-8 dark:text-blue-400">
        AdPilot AI
      </div>
      <nav className="flex-1">
        <ul>
          <li className="mb-4">
            <a
              href="#"
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center p-2 rounded-md hover:bg-sidebar-hover transition-colors duration-200 dark:hover:bg-gray-700"
            >
              <Home size={20} className="mr-3 text-icon-color dark:text-gray-400" />
              Dashboard
            </a>
          </li>
          <li className="mb-4">
            <a
              href="#"
              onClick={() => setCurrentPage('campaigns')} // Placeholder for campaigns list
              className="flex items-center p-2 rounded-md hover:bg-sidebar-hover transition-colors duration-200 dark:hover:bg-gray-700"
            >
              <BarChart2 size={20} className="mr-3 text-icon-color dark:text-gray-400" />
              Campaigns
            </a>
          </li>
          <li className="mb-4">
            <a
              href="#"
              onClick={() => setCurrentPage('create-campaign')}
              className="flex items-center p-2 rounded-md hover:bg-sidebar-hover transition-colors duration-200 dark:hover:bg-gray-700"
            >
              <PlusCircle size={20} className="mr-3 text-icon-color dark:text-gray-400" />
              Create Campaign
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md hover:bg-sidebar-hover transition-colors duration-200 dark:hover:bg-gray-700">
              <Users size={20} className="mr-3 text-icon-color dark:text-gray-400" />
              Audiences
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md hover:bg-sidebar-hover transition-colors duration-200 dark:hover:bg-gray-700">
              <DollarSign size={20} className="mr-3 text-icon-color dark:text-gray-400" />
              Billing
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md hover:bg-sidebar-hover transition-colors duration-200 dark:hover:bg-gray-700">
              <Bell size={20} className="mr-3 text-icon-color dark:text-gray-400" />
              Notifications
            </a>
          </li>
        </ul>
      </nav>
      <div className="mt-auto">
        <ul>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md hover:bg-sidebar-hover transition-colors duration-200 dark:hover:bg-gray-700">
              <Settings size={20} className="mr-3 text-icon-color dark:text-gray-400" />
              Settings
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={handleLogout}
              className="flex items-center p-2 rounded-md text-red-400 hover:bg-red-900 hover:bg-opacity-20 transition-colors duration-200 dark:text-red-300 dark:hover:bg-red-900"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
