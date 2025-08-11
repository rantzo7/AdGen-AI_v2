import { DollarSign, Eye, MousePointer, Target, MoreVertical, ArrowUp, ArrowDown, Dot } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const kpiData = [
  { title: 'Total Spend', value: '$12,450', change: '+12.5%', changeType: 'increase', icon: <DollarSign className="w-5 h-5" /> },
  { title: 'Impressions', value: '2.1M', change: '+8.2%', changeType: 'increase', icon: <Eye className="w-5 h-5" /> },
  { title: 'Link Clicks (CTR)', value: '45.6k (2.17%)', change: '-1.8%', changeType: 'decrease', icon: <MousePointer className="w-5 h-5" /> },
  { title: 'Conversions (CPA)', value: '1,234 ($10.09)', change: '+5.1%', changeType: 'increase', icon: <Target className="w-5 h-5" /> },
];

const chartData = [
  { name: 'Jan', Spend: 4000, Clicks: 2400, Conversions: 1200 },
  { name: 'Feb', Spend: 3000, Clicks: 1398, Conversions: 1100 },
  { name: 'Mar', Spend: 2000, Clicks: 9800, Conversions: 900 },
  { name: 'Apr', Spend: 2780, Clicks: 3908, Conversions: 850 },
  { name: 'May', Spend: 1890, Clicks: 4800, Conversions: 700 },
  { name: 'Jun', Spend: 2390, Clicks: 3800, Conversions: 950 },
  { name: 'Jul', Spend: 3490, Clicks: 4300, Conversions: 1150 },
];

const deviceData = [
  { name: 'Desktop', value: 65, color: '#2563EB' },
  { name: 'Mobile', value: 25, color: '#3B82F6' },
  { name: 'Tablet', value: 10, color: '#60A5FA' },
];

const campaignData = [
    { name: 'Summer Sale 2024', spend: '$4,500', ctr: '3.1%', conversions: 450, status: 'Active' },
    { name: 'Q2 Brand Awareness', spend: '$2,100', ctr: '1.8%', conversions: 120, status: 'Active' },
    { name: 'Holiday Promo', spend: '$3,200', ctr: '2.5%', conversions: 312, status: 'Paused' },
    { name: 'New Product Launch', spend: '$1,500', ctr: '2.9%', conversions: 210, status: 'Active' },
    { name: 'Q1 Lead Gen', spend: '$1,150', ctr: '1.5%', conversions: 98, status: 'Finished' },
];

const KpiCard = ({ title, value, change, changeType, icon }) => (
  <div className="bg-container p-6 rounded-lg shadow-sm flex flex-col">
    <div className="flex justify-between items-start">
      <div className="flex items-center text-secondary-text">
        {icon}
        <span className="ml-2 text-sm font-medium">{title}</span>
      </div>
      <button className="text-secondary-text hover:text-primary-text">
        <MoreVertical size={20} />
      </button>
    </div>
    <p className="text-3xl font-bold text-primary-text mt-4">{value}</p>
    <div className="flex items-center mt-1 text-sm">
      <span className={`flex items-center font-semibold ${changeType === 'increase' ? 'text-success-green' : 'text-error-red'}`}>
        {changeType === 'increase' ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
        {change}
      </span>
      <span className="text-secondary-text ml-2">vs last month</span>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full flex items-center";
    const statusClasses = {
        Active: "bg-green-100 text-green-800",
        Paused: "bg-yellow-100 text-yellow-800",
        Finished: "bg-gray-200 text-gray-800",
    };
    const dotClasses = {
        Active: "bg-green-500",
        Paused: "bg-yellow-500",
        Finished: "bg-gray-500",
    }
    return (
        <span className={`${baseClasses} ${statusClasses[status]}`}>
            <Dot className={`-ml-1 mr-1 h-4 w-4 ${dotClasses[status]}`} />
            {status}
        </span>
    );
};


const Dashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary-text">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map(item => <KpiCard key={item.title} {...item} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-container p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-primary-text mb-4">Performance Overview</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="Spend" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="Clicks" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="Conversions" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-container p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-primary-text mb-4">Device Breakdown</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                  {deviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-container p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-primary-text mb-4">Campaign Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">Campaign</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">Spend</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">CTR</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">Conversions</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaignData.map((campaign) => (
                <tr key={campaign.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-text">{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">{campaign.spend}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">{campaign.ctr}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">{campaign.conversions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                    <StatusBadge status={campaign.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
