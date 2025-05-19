// Simple WebSocket test script
// Run with: node test-websocket.js <websocket-url>

// Get URL from command line or use default
const wsUrl = process.argv[2] || 'ws://192.168.0.21:9020';

console.log(`Testing WebSocket connection to: ${wsUrl}`);

// Use browser-compatible WebSocket in Node.js
const WebSocket = require('ws');

// Create test WebSocket
try {
  const ws = new WebSocket(wsUrl);
  
  // Set up event handlers with detailed logging
  ws.on('open', () => {
    console.log('✅ Connection established successfully');
    console.log('Sending subscription request...');
    
    // Send subscription message
    const subscriptionMessage = {
      type: 'subscribe',
      events: ['part_partparameter.saved', 'part_partparameter.created', 'part_partparameter.updated']
    };
    
    ws.send(JSON.stringify(subscriptionMessage));
    console.log('Subscription request sent');
    
    // Keep connection open for messages
    console.log('Waiting for messages (Ctrl+C to exit)...');
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📩 Received message:', JSON.stringify(message, null, 2));
    } catch (e) {
      console.log('📩 Received raw data:', data);
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
  
  ws.on('close', (code, reason) => {
    console.log(`🔚 Connection closed: code=${code}, reason=${reason || 'No reason provided'}`);
    process.exit(0);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Closing connection...');
    ws.close();
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
  
} catch (error) {
  console.error('❌ Exception during connection:', error);
} 