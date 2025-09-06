import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggleSection: React.FC = () => {
  const { themeMode, toggleTheme, isDark } = useTheme();

  return (
    <div className="sub-section-container" style={{ 
      borderTop: '1px solid #ddd', 
      marginTop: '16px', 
      paddingTop: '16px' 
    }}>
      <h4 className="sub-section-title">Theme Settings</h4>
      <p style={{ 
        fontSize: '0.9em', 
        color: 'gray', 
        marginTop: '-10px', 
        marginBottom: '15px' 
      }}>
        Switch between light and dark themes for optimal viewing.
      </p>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        padding: '12px',
        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      }}>
        
        {/* Theme Mode Indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          flex: 1 
        }}>
          <span style={{ 
            fontSize: '18px',
            opacity: 0.8 
          }}>
            {isDark ? '🌙' : '☀️'}
          </span>
          <span style={{ 
            fontWeight: '500',
            color: isDark ? '#ffffff' : '#333333'
          }}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        {/* Toggle Switch */}
        <div 
          onClick={toggleTheme}
          style={{
            position: 'relative',
            width: '48px',
            height: '24px',
            backgroundColor: isDark ? '#4CAF50' : '#e0e0e0',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            border: `1px solid ${isDark ? '#66BB6A' : '#ccc'}`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: isDark ? '26px' : '2px',
              width: '18px',
              height: '18px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              transition: 'left 0.3s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
            }}
          >
            {isDark ? '🌙' : '☀️'}
          </div>
        </div>
      </div>

      {/* Theme Preview */}
      <div style={{ 
        marginTop: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        
        {/* Light Theme Preview */}
        <div style={{
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(200, 200, 200, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
          opacity: isDark ? 0.5 : 1,
          transition: 'opacity 0.3s ease',
        }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '500',
            color: '#333333',
            marginBottom: '8px' 
          }}>
            Light Theme
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            justifyContent: 'center' 
          }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              background: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '4px',
              border: '1px solid rgba(200, 200, 200, 0.3)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }} />
            <div style={{ 
              width: '20px', 
              height: '20px', 
              background: '#e74c3c', 
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 0 8px #e74c3c40',
            }} />
            <div style={{ 
              width: '20px', 
              height: '20px', 
              background: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '4px',
              border: '1px solid rgba(200, 200, 200, 0.3)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }} />
          </div>
        </div>

        {/* Dark Theme Preview */}
        <div style={{
          padding: '12px',
          background: 'rgba(30, 30, 30, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          textAlign: 'center',
          opacity: isDark ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
        }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '500',
            color: '#ffffff',
            marginBottom: '8px' 
          }}>
            Dark Theme
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            justifyContent: 'center' 
          }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              background: 'rgba(30, 30, 30, 0.9)', 
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
            <div style={{ 
              width: '20px', 
              height: '20px', 
              background: '#e74c3c', 
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 0 8px #e74c3c60',
            }} />
            <div style={{ 
              width: '20px', 
              height: '20px', 
              background: 'rgba(30, 30, 30, 0.9)', 
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>
      </div>

      {/* Theme Description */}
      <div style={{ 
        marginTop: '12px',
        padding: '8px',
        fontSize: '0.85em',
        color: isDark ? '#cccccc' : '#666666',
        fontStyle: 'italic',
        textAlign: 'center',
      }}>
        {isDark 
          ? '🌙 Dark mode reduces eye strain and provides better contrast for conditional effects'
          : '☀️ Light mode offers crisp visibility and clean appearance for detailed part inspection'
        }
      </div>

    </div>
  );
};

export default ThemeToggleSection;
