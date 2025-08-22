const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data storage
let mockArbers = [
  {
    id: 'arber-1',
    name: 'Tennis H2H Arber',
    status: 'Running',
    investment: { amount: 1000, currency: 'EUR' },
    bookies: ['betfair', 'bet365'],
    createdAt: new Date('2024-01-01T10:00:00Z'),
    opportunities: [
      {
        bet: { title: 'Djokovic vs Nadal', odds: 2.1 },
        bookie: { name: 'Betfair' },
        stake: '100',
        winnings: '210',
        profit: '10',
        currency: 'EUR',
        viable: true,
      },
    ],
  },
  {
    id: 'arber-2',
    name: 'Soccer 1X2 Arber',
    status: 'Paused',
    investment: { amount: 500, currency: 'EUR' },
    bookies: ['bet365', 'pinnacle'],
    createdAt: new Date('2024-01-02T14:00:00Z'),
    opportunities: [],
  },
];

let mockBookies = [
  {
    id: 'betfair-1',
    name: 'Betfair',
    status: 'Running',
    balance: 2500.5,
    currencyCode: 'EUR',
  },
  {
    id: 'bet365-1',
    name: 'Bet365',
    status: 'LoggedIn',
    balance: 1200.0,
    currencyCode: 'EUR',
  },
];

let mockStatistics = {
  totalOpportunities: 15,
  profitableOpportunities: 12,
  totalPotentialProfit: 150.75,
  averageProfit: 12.56,
  successRate: 80.0,
};

// Routes

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Arbers
app.get('/api/arbers', (req, res) => {
  res.json(mockArbers);
});

app.get('/api/arbers/:id', (req, res) => {
  const arber = mockArbers.find((a) => a.id === req.params.id);
  if (!arber) {
    return res.status(404).json({ error: 'Arber not found' });
  }
  res.json(arber);
});

app.post('/api/arbers', (req, res) => {
  const newArber = {
    id: `arber-${Date.now()}`,
    name: req.body.name || 'New Arber',
    status: 'Created',
    investment: req.body.investment || { amount: 100, currency: 'EUR' },
    bookies: req.body.bookies || [],
    createdAt: new Date(),
    opportunities: [],
  };
  mockArbers.push(newArber);
  res.status(201).json(newArber);
});

app.put('/api/arbers/:id', (req, res) => {
  const arberIndex = mockArbers.findIndex((a) => a.id === req.params.id);
  if (arberIndex === -1) {
    return res.status(404).json({ error: 'Arber not found' });
  }

  mockArbers[arberIndex] = { ...mockArbers[arberIndex], ...req.body };
  res.json(mockArbers[arberIndex]);
});

app.delete('/api/arbers/:id', (req, res) => {
  const arberIndex = mockArbers.findIndex((a) => a.id === req.params.id);
  if (arberIndex === -1) {
    return res.status(404).json({ error: 'Arber not found' });
  }

  mockArbers.splice(arberIndex, 1);
  res.status(204).send();
});

// Arber controls
app.post('/api/arbers/:id/pause', (req, res) => {
  const arber = mockArbers.find((a) => a.id === req.params.id);
  if (!arber) {
    return res.status(404).json({ error: 'Arber not found' });
  }

  arber.status = 'Paused';
  res.json({ message: 'Arber paused', arber });
});

app.post('/api/arbers/:id/resume', (req, res) => {
  const arber = mockArbers.find((a) => a.id === req.params.id);
  if (!arber) {
    return res.status(404).json({ error: 'Arber not found' });
  }

  arber.status = 'Running';
  res.json({ message: 'Arber resumed', arber });
});

// Bookies
app.get('/api/bookies', (req, res) => {
  res.json(mockBookies);
});

// Statistics
app.get('/api/statistics', (req, res) => {
  // Calculate real-time statistics from mock data
  const totalOpportunities = mockArbers.reduce(
    (sum, arber) => sum + (arber.opportunities?.length || 0),
    0,
  );

  const allOpportunities = mockArbers.flatMap(
    (arber) => arber.opportunities || [],
  );
  const profitableOpportunities = allOpportunities.filter(
    (opp) => parseFloat(opp.profit || '0') > 0,
  );

  const totalPotentialProfit = allOpportunities.reduce(
    (sum, opp) => sum + parseFloat(opp.profit || '0'),
    0,
  );

  const averageProfit =
    profitableOpportunities.length > 0
      ? totalPotentialProfit / profitableOpportunities.length
      : 0;

  const successRate =
    totalOpportunities > 0
      ? (profitableOpportunities.length / totalOpportunities) * 100
      : 0;

  const stats = {
    totalOpportunities,
    profitableOpportunities: profitableOpportunities.length,
    totalPotentialProfit,
    averageProfit,
    successRate,
  };

  res.json(stats);
});

// Opportunities history
app.get('/api/opportunities/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const allOpportunities = mockArbers.flatMap((arber) =>
    (arber.opportunities || []).map((opp) => ({
      ...opp,
      arberId: arber.id,
      arberName: arber.name,
      createdAt: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
    })),
  );

  // Sort by date and limit
  const sortedOpportunities = allOpportunities
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);

  res.json(sortedOpportunities);
});

// WebSocket connection status
app.get('/api/websocket/status', (req, res) => {
  res.json({
    connected: true, // This would check actual WebSocket server status
    url: 'ws://localhost:8080',
    clientsConnected: 1, // Mock value
  });
});

// Simulate real-time updates by periodically adding opportunities
function simulateRealTimeUpdates() {
  if (mockArbers.length === 0) return;

  // Add a random opportunity to a random arber
  const randomArber = mockArbers[Math.floor(Math.random() * mockArbers.length)];
  if (randomArber.status === 'Running') {
    const events = [
      'Real Madrid vs Barcelona',
      'Manchester United vs Chelsea',
      'Federer vs Djokovic',
      'Lakers vs Warriors',
      'Liverpool vs Arsenal',
    ];

    const bookies = ['Betfair', 'Bet365', 'Pinnacle', 'Bookmaker'];

    const newOpportunity = {
      bet: {
        title: events[Math.floor(Math.random() * events.length)],
        odds: (1.5 + Math.random() * 3).toFixed(2),
      },
      bookie: {
        name: bookies[Math.floor(Math.random() * bookies.length)],
      },
      stake: (50 + Math.random() * 200).toFixed(2),
      winnings: (100 + Math.random() * 400).toFixed(2),
      profit: (Math.random() * 50 - 10).toFixed(2), // Can be negative
      currency: 'EUR',
      viable: Math.random() > 0.3, // 70% chance of being viable
      createdAt: new Date(),
    };

    if (!randomArber.opportunities) {
      randomArber.opportunities = [];
    }
    randomArber.opportunities.push(newOpportunity);

    // Keep only last 50 opportunities per arber
    if (randomArber.opportunities.length > 50) {
      randomArber.opportunities = randomArber.opportunities.slice(-50);
    }

    console.log(
      `Added opportunity to ${randomArber.name}: ${newOpportunity.bet.title} - Profit: ${newOpportunity.profit}€`,
    );
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Surebet API Server running on http://localhost:${port}`);
  console.log('📊 Available endpoints:');
  console.log('  GET  /api/ping');
  console.log('  GET  /api/arbers');
  console.log('  GET  /api/arbers/:id');
  console.log('  POST /api/arbers');
  console.log('  PUT  /api/arbers/:id');
  console.log('  DELETE /api/arbers/:id');
  console.log('  POST /api/arbers/:id/pause');
  console.log('  POST /api/arbers/:id/resume');
  console.log('  GET  /api/bookies');
  console.log('  GET  /api/statistics');
  console.log('  GET  /api/opportunities/history');
  console.log('  GET  /api/websocket/status');

  // Start simulating real-time updates every 10-30 seconds
  setInterval(simulateRealTimeUpdates, 10000 + Math.random() * 20000);
});

module.exports = app;
