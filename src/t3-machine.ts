import { Machine, send } from 'xstate';

export interface T3MachineContext {
  boardSize: number;
  moves: {
    x: number;
    y: number;
    player: number;
  }[];
  board: any[][];
  message?: {
    type: 'error' | 'warning' | 'info' | 'success';
    string: string;
  };
}

enum Markers {
  X = 'X',
  O = 'O',
}

const t3Machine = Machine<T3MachineContext>(
  {
    id: 't3-machine',
    initial: 'origin',
    context: {
      boardSize: 3,
      moves: [],
      board: [],
    },
    states: {
      origin: {
        exit: ['setUp'],
        on: {
          START: {
            target: 'playing',
          },
        },
      },
      playing: {
        on: {
          MOVE: {
            target: 'playing',
            actions: ['addPlayerMove', 'whoWon', send('END')],
          },
          END: {
            target: 'end',
            cond: 'doWeHaveAWinner',
          },
          RESET: {
            target: 'origin',
          },
        },
      },
      end: {
        on: {
          RESET: {
            target: 'origin',
          },
        },
      },
    },
  },
  {
    actions: {
      setUp: (context: T3MachineContext, _: any) => {
        for (let x = 0; x < context.boardSize; x++) {
          context.board[x] = [];
        }
      },
      addPlayerMove: (context: T3MachineContext, event: any) => {
        context.message = undefined;
        if (
          event.x < 0 ||
          event.x >= context.boardSize ||
          event.y < 0 ||
          event.y >= context.boardSize
        ) {
          context.message = {
            type: 'error',
            string: 'Invalid position.',
          };
          return;
        }

        let player = 0;
        if (context.moves.length > 0) {
          player = context.moves[context.moves.length - 1].player === 0 ? 1 : 0;
        }

        if (context.board[event.x][event.y]) {
          context.message = {
            type: 'error',
            string: 'Position is already marked.',
          };
          return;
        }

        context.moves = [...context.moves, { ...event, player }];

        context.board[event.x][event.y] = player === 0 ? Markers.X : Markers.O;
      },
      whoWon: (context: T3MachineContext, _any) => {
        let xCount = 0;
        let oCount = 0;
        for (let x = 0; x < context.boardSize; x++) {
          xCount =
            xCount + context.board[x].filter(m => m === Markers.X).length;
          oCount =
            oCount + context.board[x].filter(m => m === Markers.O).length;

          if (xCount === context.boardSize) {
            context.message = {
              type: 'success',
              string: 'X have won!',
            };
            return;
          }

          if (oCount === context.boardSize) {
            context.message = {
              type: 'success',
              string: 'O have won!',
            };
            return;
          }
        }
      },
    },
    guards: {
      doWeHaveAWinner: (context: T3MachineContext, _: any) => {
        try {
          // horizontals
          for (let x = 0; x < context.boardSize; x++) {
            const xCount = context.board[x].filter(m => m === Markers.X).length;
            const oCount = context.board[x].filter(m => m === Markers.O).length;

            if (xCount === context.boardSize) {
              return true;
            }

            if (oCount === context.boardSize) {
              return true;
            }
          }

          // verticals
          let xCount = 0;
          let oCount = 0;
          for (let x = 0; x < context.boardSize; x++) {
            for (let y = 0; y < context.boardSize; y++) {
              if (context.board[x][y] === Markers.X) {
                xCount++;
              }
              if (context.board[x][y] === Markers.O) {
                oCount++;
              }

              if (xCount === context.boardSize) {
                return true;
              }

              if (oCount === context.boardSize) {
                return true;
              }
            }
          }

          // diagonals
          xCount = 0;
          oCount = 0;
          const boarsArrayLength = context.boardSize - 1;
          for (let y = boarsArrayLength; y >= 0; y--) {
            if (
              context.board[boarsArrayLength - y][boarsArrayLength - y] ===
              Markers.X
            ) {
              xCount++;
            }
            if (
              context.board[boarsArrayLength - y][boarsArrayLength - y] ===
              Markers.O
            ) {
              oCount++;
            }

            if (xCount === context.boardSize) {
              return true;
            }

            if (oCount === context.boardSize) {
              return true;
            }
          }

          // reverse diagonals
          xCount = 0;
          oCount = 0;
          for (let y = 0; y < context.boardSize; y++) {
            if (context.board[y][boarsArrayLength - y] === Markers.X) {
              xCount++;
            }
            if (context.board[y][boarsArrayLength - y] === Markers.O) {
              oCount++;
            }

            if (xCount === context.boardSize) {
              return true;
            }

            if (oCount === context.boardSize) {
              return true;
            }
          }
          return false;
        } catch (e) {
          console.error(e);
          return false;
        }
      },
    },
  }
);

export default t3Machine;
