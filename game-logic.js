/* Saanp Seedhi (Snakes & Ladders) core logic — pure functions, no DOM.
   Used by index.html and headless-tested in Node. */
(function (root) {
  'use strict';

  // Classic board layout
  var SNAKES = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
  var LADDERS = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

  var PLAYER_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#ec4899'];
  var PLAYER_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

  // playerTypes: array like ['human','cpu','off','off'] (2-4 active)
  function createGame(playerTypes, rng) {
    var players = [];
    playerTypes.forEach(function (t, i) {
      if (t === 'off') return;
      players.push({ name: PLAYER_NAMES[i] + (t === 'cpu' ? ' (CPU)' : ''), type: t, color: PLAYER_COLORS[i], pos: 0 });
    });
    return {
      players: players,
      turn: 0,
      winner: -1,
      lastRoll: 0,
      rng: rng || Math.random
    };
  }

  function rollDice(rng) {
    return 1 + Math.floor((rng || Math.random)() * 6);
  }

  // Applies a roll for the current player. Returns an events object.
  function takeTurn(state, roll) {
    var p = state.players[state.turn];
    var ev = {
      player: state.turn, roll: roll,
      from: p.pos, to: p.pos,
      overshoot: false, snake: null, ladder: null,
      extraTurn: false, won: false
    };
    state.lastRoll = roll;

    if (p.pos + roll > 100) {
      ev.overshoot = true;
    } else {
      p.pos += roll;
      ev.to = p.pos;
      if (SNAKES[p.pos]) {
        ev.snake = { from: p.pos, to: SNAKES[p.pos] };
        p.pos = SNAKES[p.pos];
        ev.to = p.pos;
      } else if (LADDERS[p.pos]) {
        ev.ladder = { from: p.pos, to: LADDERS[p.pos] };
        p.pos = LADDERS[p.pos];
        ev.to = p.pos;
      }
      if (p.pos === 100) {
        ev.won = true;
        state.winner = state.turn;
      }
    }

    if (roll === 6 && !ev.won) ev.extraTurn = true;
    return ev;
  }

  function nextTurn(state, extraTurn) {
    if (!extraTurn) state.turn = (state.turn + 1) % state.players.length;
  }

  // Boustrophedon cell coords, 0-indexed from top-left. n in 1..100.
  function cellRC(n) {
    var rowFromBottom = Math.floor((n - 1) / 10);
    var row = 9 - rowFromBottom;
    var colInRow = (n - 1) % 10;
    var col = (rowFromBottom % 2 === 0) ? colInRow : 9 - colInRow;
    return { row: row, col: col };
  }

  var api = {
    SNAKES: SNAKES, LADDERS: LADDERS,
    PLAYER_COLORS: PLAYER_COLORS,
    createGame: createGame, rollDice: rollDice,
    takeTurn: takeTurn, nextTurn: nextTurn, cellRC: cellRC
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SaanpSeedhi = api;
})(typeof window !== 'undefined' ? window : global);
