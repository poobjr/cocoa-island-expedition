import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { GameSession } from './engine/GameSession.js';
import { ShipRole } from './engine/types.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Single active seminar session
const session = new GameSession('TEAM-B');

// Connect session broadcast to Socket.io
session.broadcastCallback = (event: string, data: any) => {
  io.emit(event, data);
};

// Periodic state tick sync (every second)
setInterval(() => {
  if (session.isTimerRunning) {
    io.emit('TIMER_TICK', {
      phase: session.phase,
      currentDay: session.currentDay,
      secondsRemaining: session.turnSecondsRemaining
    });
  }
}, 1000);

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Serve static frontend in production if built
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Basic HTTP health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', day: session.currentDay, phase: session.phase });
});

// Single Page Application fallback routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/socket.io') || req.path.startsWith('/api')) {
    return next();
  }
  if (fs.existsSync(clientDistPath)) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } else {
    next();
  }
});

// Socket.io Connection & Event Gateway
io.on('connection', (socket: Socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Send current state immediately on connect
  socket.emit('GAME_STATE_UPDATE', session.serializeState());

  // 1. Join / Register Player
  socket.on('REGISTER_PLAYER', ({ name, teamId, role }: { name: string; teamId: string; role: ShipRole }) => {
    const player = session.registerPlayer(name, teamId, role, socket.id);
    socket.emit('PLAYER_REGISTERED', player);
    session.broadcastState();
  });

  // 2. Instructor Master Controls
  socket.on('INSTRUCTOR_START_GAME', () => {
    session.startGame();
  });

  socket.on('INSTRUCTOR_RESET_GAME', () => {
    session.resetGame();
  });

  socket.on('INSTRUCTOR_PAUSE_TIMER', () => {
    session.stopTimer();
    session.broadcastState();
  });

  socket.on('INSTRUCTOR_RESUME_TIMER', () => {
    session.startTimer(session.turnSecondsRemaining, undefined, () => {
      session.processEndOfDay();
    });
    session.broadcastState();
  });

  socket.on('INSTRUCTOR_SKIP_DAY', () => {
    session.stopTimer();
    session.processEndOfDay();
  });

  socket.on('INSTRUCTOR_TRIGGER_SPY_PHASE', () => {
    session.stopTimer();
    session.enterSpyPhase();
  });

  socket.on('INSTRUCTOR_TRIGGER_LEAK', ({ type }: { type: 'REVEAL_2_TEAMS' | 'BERMUDA_TRAP' }) => {
    session.triggerIntelLeak(type);
  });

  socket.on('INSTRUCTOR_TOGGLE_BOT', ({ teamId, isBot }: { teamId: string; isBot: boolean }) => {
    session.toggleTeamBot(teamId, isBot);
  });

  socket.on('INSTRUCTOR_AUTOFILL_BOTS', () => {
    session.autoFillBots();
  });

  socket.on('INSTRUCTOR_ADD_SHIP', ({ name, color, isBot }: { name: string; color?: string; isBot?: boolean }) => {
    session.addCustomShip(name, color, isBot);
  });

  socket.on('INSTRUCTOR_REMOVE_SHIP', ({ teamId }: { teamId: string }) => {
    session.removeShip(teamId);
  });

  // 3. Captain / Team Orders
  socket.on('UPDATE_DAILY_ORDER', ({ teamId, order }: { teamId: string; order: any }) => {
    session.updatePendingOrder(teamId, order);
  });

  // 4. Role Advisory Votes (from Navigator, Quartermaster, Geographer, Gunner, Deckhand)
  socket.on('SUBMIT_ADVISORY_VOTE', (voteData: any) => {
    session.submitAdvisoryVote(voteData);
  });

  // 5. Spy Operations
  socket.on('UPDATE_SPY_INTEL', ({ teamId, intel }: { teamId: string; intel: any }) => {
    session.updateSpyIntel(teamId, intel);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`⚓ Cocoa Island Expedition Server running on http://localhost:${PORT}`);
});
