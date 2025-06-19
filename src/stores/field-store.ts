import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { CellType } from "src/shared/enums";
import { BacktrackSolver } from "src/shared/lib/backtrack-solver";
import { isEmptyCell } from "src/shared/lib/is-empty-cell";
import { isGrassCell } from "src/shared/lib/is-grass-cell";
import { isTentCell } from "src/shared/lib/is-tent-cell";
import { isTreeCell } from "src/shared/lib/is-tree-cell";
import type { Cell, Field, Position, TentCell, TreeCell } from "src/shared/types";

export interface FieldStore {
  isInitialized: boolean;
  field: Field;
  cellsMap: Record<string, Cell>;
  pendingCell: TentCell | TreeCell | null;
  isSolved: boolean;
  isSolvedBySolver: boolean;
}

const initialState: FieldStore = {
  isInitialized: false,
  field: {
    cells: [],
    columnsLimits: [],
    rowsLimits: [],
    size: {
      row: 0,
      column: 0,
    },
  },
  cellsMap: {},
  pendingCell: null,
  isSolved: false,
  isSolvedBySolver: false,
}

const ORTO_NEIGHBORS = [
  { dRow: -1, dColumn: 0 },
  { dRow: 1, dColumn: 0 },
  { dRow: 0, dColumn: -1 },
  { dRow: 0, dColumn: 1 },
];
const DIAGONAL_NEIGHBORS = [
  { dRow: -1, dColumn: -1 },
  { dRow: -1, dColumn: 0 },
  { dRow: -1, dColumn: 1 },
  { dRow: 1, dColumn: -1 },
  { dRow: 1, dColumn: 0 },
  { dRow: 1, dColumn: 1 },
  { dRow: 0, dColumn: -1 },
  { dRow: 0, dColumn: 1 },
];

const getOrtoNeighborTents = (field: Field, position: Position) => {
  const { row, column } = position;

  return ORTO_NEIGHBORS.reduce<TentCell[]>(
    (acc, { dRow, dColumn }) => {
      if (
        row + dRow < 0 ||
        row + dRow >= field.size.row ||
        column + dColumn < 0 ||
        column + dColumn >= field.size.column
      ) {
        return acc;
      }
      const neighbor = field.cells[row + dRow][column + dColumn];
      if (isTentCell(neighbor)) {
        acc.push(neighbor);
      }
      return acc;
    },
    []
  );
}

const getDiagonalNeighborTents = (field: Field, position: Position) => {
  const { row, column } = position;

  return DIAGONAL_NEIGHBORS.reduce<TentCell[]>(
    (acc, { dRow, dColumn }) => {
      if (
        row + dRow < 0 ||
        row + dRow >= field.size.row ||
        column + dColumn < 0 ||
        column + dColumn >= field.size.column
      ) {
        return acc;
      }
      const neighbor = field.cells[row + dRow][column + dColumn];
      if (isTentCell(neighbor)) {
        acc.push(neighbor);
      }
      return acc;
    },
    []
  );
}

const getBindableTents = (field: Field, position: Position) => {
  const neighborTents = getOrtoNeighborTents(field, position);

  return neighborTents.filter((tent) => !tent.treeId)
}

const countTentsInRow = (cells: Cell[][], row: number) => {
  return cells[row].filter((cell) => isTentCell(cell)).length;
}

const countTentsInColumn = (cells: Cell[][], column: number) => {
  return cells.map((row) => row[column])
    .filter((cell) => isTentCell(cell)).length;
}

const isSolved = (field: Field) => {
  const { cells, rowsLimits, columnsLimits } = field;

  if (cells.some((row) => {
    return row.some((cell) => {
      if (!isTentCell(cell)) {
        return false;
      }
      const neighborTents = getDiagonalNeighborTents(field, cell.position)
      return neighborTents.length > 0;
    })
  })) {
    return false;
  }

  return (
    rowsLimits.every((value, rowIndex) => value === countTentsInRow(cells, rowIndex)) &&
    columnsLimits.every((value, columnIndex) => value === countTentsInColumn(cells, columnIndex))
  )
}

export const fieldSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setField: (state, action: PayloadAction<Field>) => {
      state.field = action.payload;
      state.field.cells.forEach((row) => {
        row.forEach((cell) => {
          state.cellsMap[cell.id] = cell;
        });
      });
      state.isInitialized = true;
      state.isSolved = isSolved(state.field);
      state.isSolvedBySolver = state.isSolved;
    },
    toggleCellType: (state, action: PayloadAction<Cell>) => {
      const cells = state.field.cells;

      const cell = action.payload;
      const { row, column } = cell.position;

      if (isEmptyCell(cell)) {
        cells[row][column] = {
          id: cell.id,
          position: cell.position,
          type: CellType.Grass,
        };
      } else if (isTentCell(cell)) {
        const boundTree = cell.treeId && state.cellsMap[cell.treeId];
        if (isTreeCell(boundTree)) {
          boundTree.tentId = undefined;
          cells[boundTree.position.row][boundTree.position.column] = {
            id: boundTree.id,
            position: boundTree.position,
            type: CellType.Tree,
          };
        }

        cells[row][column] = {
          id: cell.id,
          position: cell.position,
          type: CellType.Empty,
        };
      } else if (isGrassCell(cell)) {
        cells[row][column] = {
          id: cell.id,
          position: cell.position,
          type: CellType.Tent,
        };
      } else if (isTreeCell(cell)) {
        const boundTent = cell.tentId && state.cellsMap[cell.tentId];
        if (isTentCell(boundTent)) {
          cells[row][column] = {
            id: cell.id,
            position: cell.position,
            type: CellType.Tree,
          };
          cells[boundTent.position.row][boundTent.position.column] = {
            id: boundTent.id,
            position: boundTent.position,
            type: CellType.Tent,
          };
        } else {
          const neighborTents = getBindableTents(state.field, cell.position);

          if (neighborTents.length === 1) {
            const [tent] = neighborTents;
            cells[row][column] = {
              id: cell.id,
              position: cell.position,
              type: CellType.Tree,
              tentId: tent.id,
            };
            cells[tent.position.row][tent.position.column] = {
              id: tent.id,
              position: tent.position,
              type: CellType.Tent,
              treeId: cell.id,
            };
          }
        }
      }

      state.field.cells.forEach((row) => {
        row.forEach((cell) => {
          state.cellsMap[cell.id] = cell;
        });
      });

      state.isSolved = isSolved(state.field);
    },

    fillWithGrass: (state, action: PayloadAction<{ column?: number, row?: number }>) => {
      const { column, row } = action.payload

      if (typeof column !== "number" && typeof row !== "number") {
        return;
      }

      if (typeof column === "number") {
        const tentsCount = countTentsInColumn(state.field.cells, column);

        if (tentsCount === state.field.columnsLimits[column]) {
          for (let i = 0; i < state.field.size.row; ++i) {
            const cell = state.field.cells[i][column];

            if (!isTentCell(cell) && !isTreeCell(cell)) {
              state.field.cells[i][column] = {
                id: cell.id,
                position: cell.position,
                type: CellType.Grass,
              }
            }
          }
        }
      }

      if (typeof row === "number") {
        const tentsCount = countTentsInRow(state.field.cells, row);

        if (tentsCount === state.field.rowsLimits[row]) {
          for (let i = 0; i < state.field.size.column; ++i) {
            const cell = state.field.cells[row][i];

            if (!isTentCell(cell) && !isTreeCell(cell)) {
              state.field.cells[row][i] = {
                id: cell.id,
                position: cell.position,
                type: CellType.Grass,
              }
            }
          }
        }
      }

      state.field.cells.forEach((row) => {
        row.forEach((cell) => {
          state.cellsMap[cell.id] = cell;
        });
      });
    },

    resetField: (state) => {
      for (let row = 0; row < state.field.size.row; ++ row) {
        for (let column = 0; column < state.field.size.column; ++column) {
          const cell = state.field.cells[row][column];
          if (isTreeCell(cell)) {
            state.field.cells[row][column] = {
              id: cell.id,
              position: cell.position,
              type: CellType.Tree,
            };
          } else {
            state.field.cells[row][column] = {
              id: cell.id,
              position: cell.position,
              type: CellType.Empty,
            };
          }
        }
      }

      state.field.cells.forEach((row) => {
        row.forEach((cell) => {
          state.cellsMap[cell.id] = cell;
        });
      });
      state.isSolved = false;
      state.isSolvedBySolver = false;
    },

    startNewGame: () => {
      return initialState;
    },

    solve: (state) => {
      const cells = Array.from({ length: state.field.size.row }).map(() => {
        return Array.from({ length: state.field.size.column }).map(() => CellType.Empty)
      });

      for (let row = 0; row < state.field.size.row; ++ row) {
        for (let column = 0; column < state.field.size.column; ++column) {
          const cell = state.field.cells[row][column];
          // console.log(cell.type, isTreeCell(cell));
          if (isTreeCell(cell)) {
            cells[row][column] = CellType.Tree;
          }
        }
      }


      const solver = new BacktrackSolver(
        cells,
        state.field.rowsLimits,
        state.field.columnsLimits,
      );
      const tents = solver.solve();
      if (tents) {
        for (let row = 0; row < state.field.size.row; ++ row) {
          for (let column = 0; column < state.field.size.column; ++column) {
            const cell = state.field.cells[row][column];
            if (isTreeCell(cell)) {
              state.field.cells[row][column] = {
                id: cell.id,
                position: cell.position,
                type: CellType.Tree,
              };
            } else {
              state.field.cells[row][column] = {
                id: cell.id,
                position: cell.position,
                type: CellType.Grass,
              };
            }
          }
        }
        tents.forEach(({ row, column }) => {
          state.field.cells[row][column] = {
            ...state.field.cells[row][column],
            type: CellType.Tent,
          };
        })
        state.isSolved = true;
        state.isSolvedBySolver = true;
      } else {
        alert("Что-то пошло не так");
      }
    },

    stopBindingCell: (state) => {
      state.pendingCell = null;
    },

    startBindingCell: (state, action: PayloadAction<Cell>) => {
      if (state.pendingCell) {
        // произошло второе касание - может быть зум или перемещение экрана
        state.pendingCell = null;

        return;
      }
      const cell = action.payload;

      if ((isTentCell(cell) && !cell.treeId) || (isTreeCell(cell) && !cell.tentId)) {
        state.pendingCell = cell;
      }
    },

    changePendingCellBinding: (state, action: PayloadAction<Cell>) => {
      const targetCell = action.payload;

      const { pendingCell, field: { cells } } = state;

      // сразу отбрасываем ситуаци, когда ничего менять не надо, чтобы не мешались потом
      if (isTentCell(pendingCell) && pendingCell.treeId === targetCell.id) {
        return;
      }
      if (isTreeCell(pendingCell) && pendingCell.tentId === targetCell.id) {
        return;
      }

      if (isTentCell(pendingCell)) {
        if (pendingCell.treeId) {
          const prevTree = state.cellsMap[pendingCell.treeId];
          cells[prevTree.position.row][prevTree.position.column] = {
            type: CellType.Tree,
            id: prevTree.id,
            position: prevTree.position,
          }
        }

        const treeId = (isTreeCell(targetCell) && !targetCell.tentId)
          ? targetCell.id
          : undefined;
        const newCell = {
          type: CellType.Tent,
          id: pendingCell.id,
          position: pendingCell.position,
          treeId,
        } as const;
        cells[pendingCell.position.row][pendingCell.position.column] = newCell;
        state.pendingCell = newCell;

        if (isTreeCell(targetCell) && !targetCell.tentId) {
          cells[targetCell.position.row][targetCell.position.column] = {
            type: CellType.Tree,
            id: targetCell.id,
            position: targetCell.position,
            tentId: pendingCell.id,
          }
        }
      }

      if (isTreeCell(pendingCell)) {
        if (pendingCell.tentId) {
          const prevTent = state.cellsMap[pendingCell.tentId];
          cells[prevTent.position.row][prevTent.position.column] = {
            type: CellType.Tent,
            id: prevTent.id,
            position: prevTent.position,
          }
        }

        const tentId = (isTentCell(targetCell) && !targetCell.treeId)
          ? targetCell.id
          : undefined;
        const newCell = {
          type: CellType.Tree,
          id: pendingCell.id,
          position: pendingCell.position,
          tentId,
        } as const;
        cells[pendingCell.position.row][pendingCell.position.column] = newCell;
        state.pendingCell = newCell;

        if (isTentCell(targetCell) && !targetCell.treeId) {
          cells[targetCell.position.row][targetCell.position.column] = {
            type: CellType.Tent,
            id: targetCell.id,
            position: targetCell.position,
            treeId: pendingCell.id,
          }
        }
      }
    }
  },
})

export const {
  setField,
  toggleCellType,
  fillWithGrass,
  startNewGame,
  resetField,
  solve,
  stopBindingCell,
  startBindingCell,
  changePendingCellBinding,
} = fieldSlice.actions

export const fieldReducer = fieldSlice.reducer