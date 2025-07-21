import React from 'react';
import { LogQuery } from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  selectCapturedLogsForInstance,
  clearCapturedLogs,
  clearCapturedLogsForIds,
} from '../../store/slices/loggingSlice';

interface LoggingSettingsSectionProps {
  cardInstanceId: string;
  queries: LogQuery[];
  onQueriesChanged: (queries: LogQuery[]) => void;
}

const LoggingSettingsSection: React.FC<LoggingSettingsSectionProps> = ({ cardInstanceId, queries, onQueriesChanged }) => {
  const dispatch = useAppDispatch();
  const capturedLogs = useAppSelector(state => selectCapturedLogsForInstance(state, cardInstanceId));
  
  const allCategories = Object.keys(ConditionalLoggerEngine.getInstance().getRegisteredCategories()).sort();

  const handleAddQuery = () => {
    const newQueries = [...queries, { id: `log-query-${Date.now()}`, category: '', functionName: '', enabled: true }];
    onQueriesChanged(newQueries);
  };

  const handleUpdateQuery = (id: string, newQuery: Partial<LogQuery>) => {
    const newQueries = queries.map(q => q.id === id ? { ...q, ...newQuery } : q);
    onQueriesChanged(newQueries);
  };

  const handleRemoveQuery = (id: string) => {
    const newQueries = queries.filter(q => q.id !== id);
    onQueriesChanged(newQueries);
  };
  
  const handleClearLogs = () => {
    // The editor ID will always end in '-editor'. We can derive the main ID.
    const baseId = cardInstanceId.replace(/-editor$/, '');
    const mainId = `${baseId}-main`;
    const editorId = cardInstanceId;

    dispatch(clearCapturedLogsForIds({ cardInstanceIds: [mainId, editorId] }));
  };

  return (
    <div className="logging-settings-section">
      <h3>Log Queries</h3>
      <p>Define specific rules to capture logs. These are saved with the card configuration.</p>
      <button onClick={handleAddQuery} style={{ marginBottom: '15px' }}>Add Log Query</button>
      
      <div className="queries-list">
        {queries.map((query: LogQuery) => (
          <div key={query.id} style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={query.enabled}
              onChange={(e) => handleUpdateQuery(query.id, { enabled: e.target.checked })}
              title="Enable/Disable Query"
            />
            <select
              value={query.category}
              onChange={(e) => handleUpdateQuery(query.id, { category: e.target.value })}
            >
              <option value="">-- Select Category --</option>
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input
              type="text"
              placeholder="Function Name (optional)"
              value={query.functionName || ''}
              onChange={(e) => handleUpdateQuery(query.id, { functionName: e.target.value })}
            />
            <button onClick={() => handleRemoveQuery(query.id)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff4d4d' }}>
              &#x2716;
            </button>
          </div>
        ))}
      </div>

      <div className="captured-logs" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Captured Logs ({capturedLogs.length})</h4>
            <button onClick={handleClearLogs} disabled={capturedLogs.length === 0}>Clear Logs</button>
        </div>
        <pre style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
          {capturedLogs.length > 0 
            ? capturedLogs.map((log: any) => `[${log.timestamp}] [${log.category}:${log.functionName}] ${log.message}`).join('\n')
            : 'No logs captured yet. Define and enable a query to begin.'
          }
        </pre>
      </div>
    </div>
  );
};

export default LoggingSettingsSection; 