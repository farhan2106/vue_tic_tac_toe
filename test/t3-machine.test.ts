import { interpret, Interpreter } from 'xstate';
import Machine, { T3MachineContext } from '../src/t3-machine';

describe('T3 Machine', () => {
  let t3MachineService: Interpreter<T3MachineContext>;

  beforeEach(() => {
    t3MachineService = interpret(
      Machine.withContext({
        boardSize: 3,
        moves: [],
        board: [],
      })
    );
    t3MachineService.start();
  });

  it('able to start game', () => {
    t3MachineService.send('START');
    expect(t3MachineService.state.value).toBe('playing');
  });

  it('able to reset game when game has started', () => {
    t3MachineService.send('START');
    t3MachineService.send('RESET');
    expect(t3MachineService.state.value).toBe('origin');
  });

  it('able to reset game when game has ended', () => {
    t3MachineService.send('START');
    t3MachineService.send('RESET');
    expect(t3MachineService.state.value).toBe('origin');
  });

  it('able to make a valid move', () => {
    t3MachineService.send('START');
    t3MachineService.send('MOVE', { x: 0, y: 0 });
    expect(t3MachineService.state.value).toBe('playing');
    expect(t3MachineService.state.context).toMatchObject({
      moves: [{ x: 0, y: 0, player: 0 }],
      board: [
        ['X', undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
      ],
    });

    t3MachineService.send('MOVE', { x: 1, y: 0 });
    t3MachineService.send('MOVE', { x: 0, y: 1 });
    t3MachineService.send('MOVE', { x: 1, y: 1 });
    t3MachineService.send('MOVE', { x: 0, y: 2 });
    expect(t3MachineService.state.context).toMatchObject({
      moves: [
        { x: 0, y: 0, player: 0 },
        { x: 1, y: 0, player: 1 },
        { x: 0, y: 1, player: 0 },
        { x: 1, y: 1, player: 1 },
        { x: 0, y: 2, player: 0 },
      ],
      board: [
        ['X', 'X', 'X'],
        ['O', 'O', undefined],
        [undefined, undefined, undefined],
      ],
    });
  });

  it('able to detect a winner (horizontal)', () => {
    t3MachineService.send('START');
    t3MachineService.send('MOVE', { x: 0, y: 0 });
    t3MachineService.send('MOVE', { x: 1, y: 0 });
    t3MachineService.send('MOVE', { x: 0, y: 1 });
    t3MachineService.send('MOVE', { x: 1, y: 1 });
    t3MachineService.send('MOVE', { x: 0, y: 2 });
    expect(t3MachineService.state.context).toMatchObject({
      message: {
        type: 'success',
        string: 'X wins!',
      },
    });
    expect(t3MachineService.state.value).toBe('end');
  });

  it('able to detect a winner (vertical)', () => {
    t3MachineService.send('START');
    t3MachineService.send('MOVE', { x: 0, y: 0 });
    t3MachineService.send('MOVE', { x: 0, y: 1 });
    t3MachineService.send('MOVE', { x: 1, y: 0 });
    t3MachineService.send('MOVE', { x: 1, y: 1 });
    t3MachineService.send('MOVE', { x: 2, y: 0 });
    expect(t3MachineService.state.value).toBe('end');
    expect(t3MachineService.state.context).toMatchObject({
      message: {
        type: 'success',
        string: 'X wins!',
      },
    });
  });

  it('able to detect a winner (diagonals)', () => {
    t3MachineService.send('START');
    t3MachineService.send('MOVE', { x: 0, y: 0 });
    t3MachineService.send('MOVE', { x: 0, y: 1 });
    t3MachineService.send('MOVE', { x: 1, y: 1 });
    t3MachineService.send('MOVE', { x: 0, y: 2 });
    t3MachineService.send('MOVE', { x: 2, y: 2 });
    expect(t3MachineService.state.value).toBe('end');
    expect(t3MachineService.state.context).toMatchObject({
      message: {
        type: 'success',
        string: 'X wins!',
      },
    });
  });

  it('able to detect a winner (reversed-diagonals)', () => {
    t3MachineService.send('START');
    t3MachineService.send('MOVE', { x: 0, y: 2 });
    t3MachineService.send('MOVE', { x: 0, y: 1 });
    t3MachineService.send('MOVE', { x: 1, y: 1 });
    t3MachineService.send('MOVE', { x: 1, y: 2 });
    t3MachineService.send('MOVE', { x: 2, y: 0 });
    expect(t3MachineService.state.value).toBe('end');
    expect(t3MachineService.state.context).toMatchObject({
      message: {
        type: 'success',
        string: 'X wins!',
      },
    });
  });

  it('reject overriding mark', () => {
    t3MachineService.send('START');
    t3MachineService.send('MOVE', { x: 0, y: 0 });
    t3MachineService.send('MOVE', { x: 0, y: 0 });
    expect(t3MachineService.state.value).toBe('playing');
    expect(t3MachineService.state.context).toMatchObject({
      moves: [{ x: 0, y: 0, player: 0 }],
      board: [
        ['X', undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
      ],
      message: {
        type: 'danger',
        string: 'Position is already marked.',
      },
    });
  });

  it('reject mark outside of board', () => {
    t3MachineService.send('START');
    t3MachineService.send('MOVE', { x: -1, y: 0 });
    expect(t3MachineService.state.value).toBe('playing');
    expect(t3MachineService.state.context).toMatchObject({
      moves: [],
      board: [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
      ],
      message: {
        type: 'danger',
        string: 'Invalid position.',
      },
    });

    t3MachineService.send('MOVE', { x: 0, y: -1 });
    expect(t3MachineService.state.context).toMatchObject({
      moves: [],
      board: [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
      ],
      message: {
        type: 'danger',
        string: 'Invalid position.',
      },
    });
  });
});
