import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSheet, generateQuery, generateAppsScript, createCampaign } from '../api';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Zap,
  Code,
  CheckCircle2
} from 'lucide-react';

const OPERATORS = [
  { value: '<', label: 'Less than' },
  { value: '<=', label: 'Less than or equal' },
  { value: '>', label: 'Greater than' },
  { value: '>=', label: 'Greater than or equal' },
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetData, setSheetData] = useState(null);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [filters, setFilters] = useState([{ column: '', operator: '<', value: '' }]);
  const [thresholdCondition, setThresholdCondition] = useState('Any row matches');
  const [generatedQuery, setGeneratedQuery] = useState(null);
  const [appsScript, setAppsScript] = useState('');

  const analyzeSpreadsheet = async () => {
    if (!sheetUrl) {
      toast.error('Please enter a Google Sheets URL');
      return;
    }
    setLoading(true);
    try {
      const data = await analyzeSheet(sheetUrl);
      setSheetData(data);
      toast.success('Sheet analyzed successfully');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to analyze sheet');
    } finally {
      setLoading(false);
    }
  };

  const addFilter = () => {
    setFilters([...filters, { column: '', operator: '<', value: '' }]);
  };

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const generateQueryFormula = async () => {
    const validFilters = filters.filter(f => f.column && f.value);
    if (validFilters.length === 0) {
      toast.error('Please add at least one filter condition');
      return;
    }
    setLoading(true);
    try {
      const result = await generateQuery({
        columns: sheetData.columns,
        filters: validFilters,
        thresholdCondition
      });
      setGeneratedQuery(result);
      toast.success('Query generated successfully');
      setStep(4);
    } catch (error) {
      toast.error('Failed to generate query');
    } finally {
      setLoading(false);
    }
  };

  const generateScript = async () => {
    setLoading(true);
    try {
      const result = await generateAppsScript({
        sheetId: sheetData.sheetId,
        columns: sheetData.headers,
        filters: filters.filter(f => f.column && f.value),
        thresholdFormula: generatedQuery.thresholdFormula,
        webhookUrl: `${import.meta.env.VITE_API_URL}/api/webhook/trigger`
      });
      setAppsScript(result.script);
      toast.success('Apps Script generated');
      setStep(5);
    } catch (error) {
      toast.error('Failed to generate Apps Script');
    } finally {
      setLoading(false);
    }
  };

  const saveCampaign = async () => {
    if (!campaignTitle) {
      toast.error('Please enter a campaign title');
      return;
    }
    setLoading(true);
    try {
      await createCampaign({
        title: campaignTitle,
        sheetId: sheetData.sheetId,
        sheetUrl,
        columns: sheetData.headers,
        filters: filters.filter(f => f.column && f.value),
        thresholdCondition,
        generatedQuery
      });
      toast.success('Campaign created successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    { num: 1, label: 'Connect Sheet' },
    { num: 2, label: 'Campaign Info' },
    { num: 3, label: 'Set Filters' },
    { num: 4, label: 'AI Query' },
    { num: 5, label: 'Apps Script' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Create Campaign</h1>
        <p className="text-[#94a3b8] mt-1">Set up event-driven inventory automation</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.num ? 'text-[#42a5f5]' : 'text-[#64748b]'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > s.num ? 'bg-[#1e88e5] text-white' :
                step === s.num ? 'bg-[#1e88e5]/20 border-2 border-[#1e88e5] text-[#42a5f5]' :
                'bg-[#1e3a5f] border border-[#1e3a5f]'
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${step > s.num ? 'bg-[#1e88e5]' : 'bg-[#1e3a5f]'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#132f4c] border border-[#1e3a5f] rounded-2xl p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Connect Google Sheet</h2>
                <p className="text-sm text-[#94a3b8]">Enter your inventory spreadsheet URL</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#90caf9] mb-2">
                Google Sheets URL
              </label>
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#1e88e5] focus:border-transparent"
              />
              <p className="mt-2 text-xs text-[#64748b]">
                Make sure the sheet is shared with view access or is public
              </p>
            </div>

            <button
              onClick={analyzeSpreadsheet}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e88e5] to-[#1565c0] text-white rounded-xl font-medium hover:from-[#42a5f5] hover:to-[#1e88e5] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Analyze Sheet
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {step === 2 && sheetData && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#1e88e5]/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#42a5f5]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Campaign Information</h2>
                <p className="text-sm text-[#94a3b8]">Name your campaign and review sheet data</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 font-medium">{sheetData.title}</p>
              <p className="text-sm text-[#94a3b8] mt-1">
                {sheetData.rowCount} rows • {sheetData.headers.length} columns
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#90caf9] mb-2">
                Campaign Title
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="e.g., Low Stock Alert Campaign"
                className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#1e88e5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#90caf9] mb-3">
                Available Columns
              </label>
              <div className="flex flex-wrap gap-2">
                {sheetData.columns.map((col) => (
                  <span
                    key={col.name}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      col.type === 'number'
                        ? 'bg-[#1e88e5]/20 text-[#42a5f5] border border-[#1e88e5]/30'
                        : 'bg-[#90caf9]/10 text-[#90caf9] border border-[#90caf9]/30'
                    }`}
                  >
                    {col.name}
                    <span className="ml-1 text-xs opacity-60">({col.type})</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-medium hover:bg-[#1e3a5f]/70 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!campaignTitle}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e88e5] to-[#1565c0] text-white rounded-xl font-medium hover:from-[#42a5f5] hover:to-[#1e88e5] transition-all disabled:opacity-50"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && sheetData && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#90caf9]/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#90caf9]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Set Filter Conditions</h2>
                <p className="text-sm text-[#94a3b8]">Define when to trigger campaign updates</p>
              </div>
            </div>

            <div className="space-y-4">
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center gap-3">
                  <select
                    value={filter.column}
                    onChange={(e) => updateFilter(index, 'column', e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#1e88e5]"
                  >
                    <option value="">Select column</option>
                    {sheetData.headers.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                    className="w-40 px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#1e88e5]"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="w-32 px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#1e88e5]"
                  />
                  {filters.length > 1 && (
                    <button
                      onClick={() => removeFilter(index)}
                      className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addFilter}
              className="flex items-center gap-2 text-[#42a5f5] hover:text-[#90caf9] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add another condition
            </button>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-400">🔄</span>
                <p className="text-white font-medium">Smart State Change Detection</p>
              </div>
              <p className="text-sm text-[#94a3b8]">
                Triggers automatically when the condition state changes - both when it breaks (e.g., stock drops to 0) 
                and when it restores (e.g., stock replenished).
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-medium hover:bg-[#1e3a5f]/70 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={generateQueryFormula}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e88e5] to-[#1565c0] text-white rounded-xl font-medium hover:from-[#42a5f5] hover:to-[#1e88e5] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Query
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 4 && generatedQuery && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#1e88e5]/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#42a5f5]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">AI Generated Query</h2>
                <p className="text-sm text-[#94a3b8]">Review the formulas for your Google Sheet</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#0a1628] border border-[#1e3a5f] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#94a3b8]">Count Formula</span>
                  <button
                    onClick={() => copyToClipboard(generatedQuery.countFormula, 'count')}
                    className="p-1.5 text-[#64748b] hover:text-white transition-colors"
                  >
                    {copied === 'count' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <code className="text-sm text-emerald-400 break-all">{generatedQuery.countFormula}</code>
              </div>

              <div className="p-4 bg-[#0a1628] border border-[#1e3a5f] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#94a3b8]">Filter Formula</span>
                  <button
                    onClick={() => copyToClipboard(generatedQuery.filterFormula, 'filter')}
                    className="p-1.5 text-[#64748b] hover:text-white transition-colors"
                  >
                    {copied === 'filter' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <code className="text-sm text-[#42a5f5] break-all">{generatedQuery.filterFormula}</code>
              </div>

              <div className="p-4 bg-[#0a1628] border border-[#1e3a5f] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#94a3b8]">Threshold Formula</span>
                  <button
                    onClick={() => copyToClipboard(generatedQuery.thresholdFormula, 'threshold')}
                    className="p-1.5 text-[#64748b] hover:text-white transition-colors"
                  >
                    {copied === 'threshold' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <code className="text-sm text-[#90caf9] break-all">{generatedQuery.thresholdFormula}</code>
              </div>

              <div className="p-4 bg-[#1e88e5]/10 border border-[#1e88e5]/30 rounded-xl">
                <p className="text-sm text-[#e2e8f0]">{generatedQuery.explanation}</p>
                <p className="text-sm text-[#42a5f5] mt-2">
                  <strong>Trigger:</strong> {generatedQuery.triggerCondition}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-medium hover:bg-[#1e3a5f]/70 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={generateScript}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e88e5] to-[#1565c0] text-white rounded-xl font-medium hover:from-[#42a5f5] hover:to-[#1e88e5] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Code className="w-5 h-5" />
                    Generate Apps Script
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 5 && appsScript && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Code className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Google Apps Script</h2>
                <p className="text-sm text-[#94a3b8]">Copy this script to your Google Sheet</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => copyToClipboard(appsScript, 'script')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg text-sm hover:bg-[#1e88e5]/50 transition-colors"
                >
                  {copied === 'script' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied === 'script' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 bg-[#0a1628] border border-[#1e3a5f] rounded-xl overflow-x-auto max-h-80">
                <code className="text-sm text-[#e2e8f0]">{appsScript}</code>
              </pre>
            </div>

            <div className="p-4 bg-[#1e88e5]/10 border border-[#1e88e5]/30 rounded-xl">
              <h4 className="font-medium text-[#42a5f5] mb-2">How to install:</h4>
              <ol className="text-sm text-[#e2e8f0] space-y-1 list-decimal list-inside">
                <li>Open your Google Sheet</li>
                <li>Go to Extensions → Apps Script</li>
                <li>Delete any existing code and paste this script</li>
                <li>Save and run the <strong>setup</strong> function</li>
                <li>Authorize the script when prompted</li>
                <li>Run <strong>testWebhook</strong> to test immediately</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-medium hover:bg-[#1e3a5f]/70 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={saveCampaign}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Save Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
