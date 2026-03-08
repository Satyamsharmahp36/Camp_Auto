import { useState, useEffect } from 'react';
import { getTriggers } from '../api';
import { Zap, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export default function Triggers() {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTriggers();
  }, []);

  const loadTriggers = async () => {
    setLoading(true);
    try {
      const data = await getTriggers();
      setTriggers(data);
    } catch (error) {
      console.error('Failed to load triggers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Webhook Triggers</h1>
          <p className="text-[#94a3b8] mt-1">History of all inventory threshold triggers</p>
        </div>
        <button
          onClick={loadTriggers}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#1e88e5]/50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-[#132f4c] border border-[#1e3a5f] rounded-2xl overflow-hidden">
        {triggers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-[#64748b]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No triggers yet</h3>
            <p className="text-[#94a3b8]">Triggers will appear here when inventory thresholds are breached</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e3a5f]">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="px-6 py-5 hover:bg-[#1e3a5f]/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mt-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{trigger.id}</p>
                      <p className="text-sm text-[#94a3b8] mt-1">
                        {trigger.conditionsMet || 'Inventory threshold breached'}
                      </p>
                      {trigger.affectedRows && (
                        <p className="text-sm text-[#42a5f5] mt-1">
                          {trigger.affectedRows} rows affected
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[#64748b]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(trigger.receivedAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                      {trigger.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
