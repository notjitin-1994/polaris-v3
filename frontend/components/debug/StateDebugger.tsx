'use client';

import { useState, useEffect } from 'react';
import { StateDebugger, TimeTravelDebugger, devToolsIntegration } from '@/lib/stores/debugging';
import { useBlueprintStore } from '@/lib/stores/blueprintStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { useAuthStore } from '@/lib/stores/authStore';

interface StateDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StateDebuggerComponent({ isOpen, onClose }: StateDebuggerProps) {
  const [activeTab, setActiveTab] = useState<'state' | 'history' | 'performance' | 'time-travel'>(
    'state',
  );
  const [stateHistory, setStateHistory] = useState<unknown[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<unknown>(null);
  const [snapshots, setSnapshots] = useState<unknown[]>([]);

  const blueprintStore = useBlueprintStore();
  const uiStore = useUIStore();
  const authStore = useAuthStore();

  // Update state history
  useEffect(() => {
    if (isOpen) {
      const history = StateDebugger.getStateHistory();
      setStateHistory(history);
    }
  }, [isOpen]);

  // Update memory usage
  useEffect(() => {
    if (isOpen && activeTab === 'performance') {
      const usage = StateDebugger.getMemoryUsage();
      setMemoryUsage(usage);
    }
  }, [isOpen, activeTab]);

  // Update snapshots
  useEffect(() => {
    if (isOpen && activeTab === 'time-travel') {
      const snapshots = TimeTravelDebugger.getSnapshots();
      setSnapshots(snapshots);
    }
  }, [isOpen, activeTab]);

  // Connect to Redux DevTools
  useEffect(() => {
    if (isOpen) {
      const stores = {
        blueprint: blueprintStore,
        ui: uiStore,
        auth: authStore,
      };
      devToolsIntegration.connect(stores);

      return () => {
        devToolsIntegration.disconnect();
      };
    }
  }, [isOpen, blueprintStore, uiStore, authStore]);

  if (!isOpen) return null;

  const exportState = () => {
    const stores = {
      blueprint: blueprintStore,
      ui: uiStore,
      auth: authStore,
    };
    const stateJson = StateDebugger.exportState(stores);

    // Download as file
    const blob = new Blob([stateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `state-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const stores = {
        blueprint: blueprintStore,
        ui: uiStore,
        auth: authStore,
      };
      StateDebugger.importState(content, stores);
    };
    reader.readAsText(file);
  };

  const restoreSnapshot = (index: number) => {
    const stores = {
      blueprint: blueprintStore,
      ui: uiStore,
      auth: authStore,
    };
    TimeTravelDebugger.restoreSnapshot(index, stores);
  };

  const takeSnapshot = () => {
    const blueprintState = blueprintStore.getState();
    const uiState = uiStore.getState();
    const authState = authStore.getState();

    TimeTravelDebugger.takeSnapshot('blueprint', blueprintState);
    TimeTravelDebugger.takeSnapshot('ui', uiState);
    TimeTravelDebugger.takeSnapshot('auth', authState);

    // Update snapshots
    const snapshots = TimeTravelDebugger.getSnapshots();
    setSnapshots(snapshots);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-modal overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">State Debugger</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'state', label: 'State' },
              { id: 'history', label: 'History' },
              { id: 'performance', label: 'Performance' },
              { id: 'time-travel', label: 'Time Travel' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as 'state' | 'history' | 'performance' | 'time-travel')
                }
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'state' && (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button
                    onClick={exportState}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Export State
                  </button>
                  <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer">
                    Import State
                    <input type="file" accept=".json" onChange={importState} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Blueprint Store</h3>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(blueprintStore.getState(), null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">UI Store</h3>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(uiStore.getState(), null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Auth Store</h3>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(authStore.getState(), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">State Change History</h3>
                  <button
                    onClick={() => StateDebugger.clearStateHistory()}
                    className="px-3 py-1 text-sm bg-red-200 text-red-700 rounded hover:bg-red-300"
                  >
                    Clear History
                  </button>
                </div>

                <div className="space-y-2">
                  {stateHistory.map((entry, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {entry.store} - {entry.action}
                          </div>
                          <div className="text-sm text-gray-500">
                            {entry.timestamp.toISOString()}
                          </div>
                        </div>
                        <button
                          onClick={() => console.log('State:', entry.state)}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Log
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Performance Metrics</h3>

                {memoryUsage && (
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-medium text-gray-900 mb-2">Memory Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Used:</span>
                        <span>{(memoryUsage.used / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>{(memoryUsage.total / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Percentage:</span>
                        <span>{memoryUsage.percentage.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Performance Monitoring</h4>
                  <p className="text-sm text-gray-600">
                    Performance monitoring is active. Check the console for warnings.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'time-travel' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Time Travel Debugging</h3>
                  <button
                    onClick={takeSnapshot}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Take Snapshot
                  </button>
                </div>

                <div className="space-y-2">
                  {snapshots.map((snapshot, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {snapshot.store} - {snapshot.timestamp.toISOString()}
                          </div>
                        </div>
                        <button
                          onClick={() => restoreSnapshot(index)}
                          className="px-3 py-1 text-sm bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
