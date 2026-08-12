import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
  Clock,
  Database,
  BarChart2,
  Calendar,
  X,
  Sparkles,
  AlertCircle,
  Table,
} from 'lucide-react';
import { InspectionReport, BackupSchedule, GoogleSheetsSyncStatus } from '../types';
import { googleSignIn, logoutGoogle, initAuth } from '../utils/firebaseAuth';
import {
  findOrCreateSpreadsheet,
  appendValuationToSheet,
  syncBatchValuationsToSheet,
  getStoredSheetsStatus,
  saveStoredSheetsStatus,
} from '../utils/googleSheets';

interface GoogleSheetsBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReport?: InspectionReport | null;
  historyReports: InspectionReport[];
}

export const GoogleSheetsBackupModal: React.FC<GoogleSheetsBackupModalProps> = ({
  isOpen,
  onClose,
  currentReport,
  historyReports,
}) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<GoogleSheetsSyncStatus>(getStoredSheetsStatus());
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboard_preview' | 'schedule'>('overview');

  useEffect(() => {
    initAuth(
      (user, token) => {
        setUserEmail(user.email || 'Google User');
        setAccessToken(token);
      },
      () => {
        setUserEmail(null);
        setAccessToken(null);
      }
    );
  }, []);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setSyncMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUserEmail(res.user.email);
        setAccessToken(res.accessToken);
        setSyncMessage('Successfully authenticated with Google Sheets & Drive API.');

        // Initialize spreadsheet
        const sheetInfo = await findOrCreateSpreadsheet(res.accessToken);
        const updatedStatus: GoogleSheetsSyncStatus = {
          ...syncStatus,
          spreadsheetId: sheetInfo.id,
          spreadsheetUrl: sheetInfo.url,
          lastSyncTime: new Date().toISOString(),
        };
        setSyncStatus(updatedStatus);
        saveStoredSheetsStatus(updatedStatus);
      }
    } catch (err: any) {
      console.error(err);
      setSyncMessage(`Authentication error: ${err.message || 'Failed to sign in'}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSyncCurrentReport = async () => {
    if (!accessToken || !currentReport) return;

    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const sheetInfo = await findOrCreateSpreadsheet(accessToken);
      const success = await appendValuationToSheet(accessToken, sheetInfo.id, currentReport);

      if (success) {
        const updatedStatus: GoogleSheetsSyncStatus = {
          ...syncStatus,
          spreadsheetId: sheetInfo.id,
          spreadsheetUrl: sheetInfo.url,
          lastSyncTime: new Date().toLocaleString(),
          totalSyncedCount: (syncStatus.totalSyncedCount || 0) + 1,
        };
        setSyncStatus(updatedStatus);
        saveStoredSheetsStatus(updatedStatus);
        setSyncMessage(`Report #${currentReport.id.slice(0, 8)} successfully backed up to Google Sheets!`);
      } else {
        setSyncMessage('Failed to append report to Google Sheets.');
      }
    } catch (err: any) {
      console.error(err);
      setSyncMessage(`Sync error: ${err.message || 'Sheet sync failed'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAllHistory = async () => {
    if (!accessToken || historyReports.length === 0) return;

    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const sheetInfo = await findOrCreateSpreadsheet(accessToken);
      const count = await syncBatchValuationsToSheet(accessToken, sheetInfo.id, historyReports);

      const updatedStatus: GoogleSheetsSyncStatus = {
        ...syncStatus,
        spreadsheetId: sheetInfo.id,
        spreadsheetUrl: sheetInfo.url,
        lastSyncTime: new Date().toLocaleString(),
        totalSyncedCount: (syncStatus.totalSyncedCount || 0) + count,
      };
      setSyncStatus(updatedStatus);
      saveStoredSheetsStatus(updatedStatus);
      setSyncMessage(`Batch synced ${count} historical valuation reports to Google Sheets!`);
    } catch (err: any) {
      console.error(err);
      setSyncMessage(`Batch sync error: ${err.message || 'Batch sync failed'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleScheduleChange = (schedule: BackupSchedule) => {
    const updated = { ...syncStatus, backupSchedule: schedule };
    setSyncStatus(updated);
    saveStoredSheetsStatus(updated);
  };

  const handleToggleAutoSync = () => {
    const updated = { ...syncStatus, autoSyncEnabled: !syncStatus.autoSyncEnabled };
    setSyncStatus(updated);
    saveStoredSheetsStatus(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto space-y-0">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
                <span>GOOGLE SHEETS BACKUP & DASHBOARD</span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-sans">
                  Automated Cloud Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Automatically archive vehicle valuation records & generate live analytics dashboards in Google Sheets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2 space-x-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-bold transition flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Connection & Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard_preview')}
            className={`pb-3 px-1 border-b-2 font-bold transition flex items-center space-x-2 ${
              activeTab === 'dashboard_preview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Sheet Dashboard Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-1 border-b-2 font-bold transition flex items-center space-x-2 ${
              activeTab === 'schedule'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Automated Schedule</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {syncMessage && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Auth Status Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center">
                    <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    Google Account Authentication
                  </span>
                  {accessToken ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected ({userEmail})
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                      Not Connected
                    </span>
                  )}
                </div>

                {!accessToken ? (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      Connect your Google Account to authorize automatic backup of valuation reports to your personal Google Drive and Google Sheets.
                    </p>
                    <button
                      onClick={handleSignIn}
                      disabled={isAuthenticating}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg"
                    >
                      {isAuthenticating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="w-4 h-4" />
                      )}
                      <span>Sign in with Google to Connect Sheets</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1 text-xs font-mono">
                    <span className="text-slate-400">Active Google Account: <strong className="text-slate-200">{userEmail}</strong></span>
                    <button
                      onClick={() => logoutGoogle().then(() => setAccessToken(null))}
                      className="text-rose-400 hover:underline text-[11px]"
                    >
                      Disconnect Account
                    </button>
                  </div>
                )}
              </div>

              {/* Sync Actions Grid */}
              {accessToken && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-200 flex items-center">
                        <Database className="w-4 h-4 mr-1.5 text-emerald-400" />
                        Spreadsheet Target: Pak_Valuations_Punjab_Database
                      </span>
                      {syncStatus.spreadsheetUrl && (
                        <a
                          href={syncStatus.spreadsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center transition"
                        >
                          Open Live Sheet <ExternalLink className="w-3 h-3 ml-1.5" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Total Synced Reports</div>
                        <div className="text-lg font-bold text-emerald-400">{syncStatus.totalSyncedCount || 0} Records</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Last Successful Sync</div>
                        <div className="text-xs font-bold text-slate-200 truncate">{syncStatus.lastSyncTime || 'Never'}</div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      {currentReport && (
                        <button
                          onClick={handleSyncCurrentReport}
                          disabled={isSyncing}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition flex items-center justify-center space-x-2"
                        >
                          {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                          <span>Sync Current Active Report</span>
                        </button>
                      )}

                      <button
                        onClick={handleSyncAllHistory}
                        disabled={isSyncing || historyReports.length === 0}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition flex items-center justify-center space-x-2 border border-slate-700"
                      >
                        {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                        <span>Sync All History ({historyReports.length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dashboard_preview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-300 flex items-center">
                    <Table className="w-4 h-4 mr-1.5 text-amber-400" />
                    Google Sheets Tab 2: Automated_Dashboard Formulas
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Live Google Formulas</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The Google Sheet automatically includes pre-programmed formulas that aggregate real-time metrics across all your saved reports:
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-slate-300 font-bold">Total Appraised Portfolio Value</div>
                      <div className="text-[10px] text-slate-400">Sum of all vehicle Fair Market Values in PKR</div>
                    </div>
                    <code className="text-amber-400 bg-slate-950 px-2 py-1 rounded text-[11px] font-bold border border-slate-800">
                      =SUM(Valuation_Records!K2:K1000)
                    </code>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-slate-300 font-bold">Average Market Valuation</div>
                      <div className="text-[10px] text-slate-400">Mean valuation across all makes & models</div>
                    </div>
                    <code className="text-emerald-400 bg-slate-950 px-2 py-1 rounded text-[11px] font-bold border border-slate-800">
                      =AVERAGE(Valuation_Records!K2:K1000)
                    </code>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-slate-300 font-bold">Hot Demand Vehicles Count</div>
                      <div className="text-[10px] text-slate-400">Count of Very High Demand ratings (Alto, Civic, Corolla)</div>
                    </div>
                    <code className="text-blue-400 bg-slate-950 px-2 py-1 rounded text-[11px] font-bold border border-slate-800">
                      =COUNTIF(Valuation_Records!P2:P1000, "*Very High*")
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-slate-200 flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5 text-emerald-400" />
                      AUTOMATED BACKUP SCHEDULE & RECURRENCE
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Choose how frequently valuation data is automatically archived into Google Sheets.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncStatus.autoSyncEnabled}
                      onChange={handleToggleAutoSync}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Schedule Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                  {(['auto_instant', 'weekly', 'monthly', 'yearly'] as BackupSchedule[]).map((sch) => {
                    const isSelected = syncStatus.backupSchedule === sch;
                    const labels: Record<BackupSchedule, { title: string; desc: string }> = {
                      manual: { title: 'Manual Only', desc: 'Sync on button click' },
                      auto_instant: { title: 'Instant', desc: 'Sync on every new report' },
                      weekly: { title: 'Weekly', desc: 'Every 7 days auto-sync' },
                      monthly: { title: 'Monthly', desc: 'Monthly summary backup' },
                      yearly: { title: 'Yearly', desc: 'Annual portfolio archive' },
                    };

                    return (
                      <button
                        key={sch}
                        type="button"
                        onClick={() => handleScheduleChange(sch)}
                        className={`p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold uppercase">{labels[sch].title}</div>
                        <div className="text-[10px] opacity-80 mt-1">{labels[sch].desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Direct Google OAuth 2.0 API Connection
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
