import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns, getTriggers, deleteCampaign } from '../api';
import { 
  PlusCircle, 
  Zap, 
  Trash2, 
  ExternalLink, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [campaignsData, triggersData] = await Promise.all([
        getCampaigns(),
        getTriggers()
      ]);
      setCampaigns(campaignsData);
      setTriggers(triggersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await deleteCampaign(id);
      toast.success('Campaign deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1e88e5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-[#94a3b8] mt-1">Monitor your inventory-based campaign automations</p>
        </div>
        <Link
          to="/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1e88e5] to-[#1565c0] text-white rounded-xl font-medium hover:from-[#42a5f5] hover:to-[#1e88e5] transition-all shadow-lg shadow-blue-500/25"
        >
          <PlusCircle className="w-5 h-5" />
          New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#132f4c] border border-[#1e3a5f] rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1e88e5]/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#42a5f5]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{campaigns.length}</p>
              <p className="text-sm text-[#94a3b8]">Active Campaigns</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#132f4c] border border-[#1e3a5f] rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{triggers.length}</p>
              <p className="text-sm text-[#94a3b8]">Total Triggers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#132f4c] border border-[#1e3a5f] rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#90caf9]/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#90caf9]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {triggers.length > 0 ? 'Just now' : 'N/A'}
              </p>
              <p className="text-sm text-[#94a3b8]">Last Trigger</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#132f4c] border border-[#1e3a5f] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e3a5f]">
          <h2 className="text-lg font-semibold text-white">Campaigns</h2>
        </div>
        
        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#64748b]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No campaigns yet</h3>
            <p className="text-[#94a3b8] mb-6">Create your first inventory-based campaign automation</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e88e5] text-white rounded-xl font-medium hover:bg-[#42a5f5] transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#1e3a5f]">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#1e3a5f]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${campaign.status === 'active' ? 'bg-emerald-500' : 'bg-[#64748b]'}`} />
                  <div>
                    <h3 className="font-medium text-white">{campaign.title}</h3>
                    <p className="text-sm text-[#94a3b8]">
                      {campaign.filters?.length || 0} filters • {campaign.triggerCount} triggers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#64748b]">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 text-[#64748b] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {triggers.length > 0 && (
        <div className="bg-[#132f4c] border border-[#1e3a5f] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e3a5f] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Triggers</h2>
            <Link to="/triggers" className="text-sm text-[#42a5f5] hover:text-[#90caf9]">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#1e3a5f]">
            {triggers.slice(0, 5).map((trigger) => (
              <div key={trigger.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-white">{trigger.id}</p>
                    <p className="text-xs text-[#94a3b8]">{trigger.conditionsMet || 'Threshold breached'}</p>
                  </div>
                </div>
                <span className="text-xs text-[#64748b]">
                  {new Date(trigger.receivedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
