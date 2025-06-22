import { DIAGONAL_NEIGHBORS, ORTO_NEIGHBORS } from "src/shared/constants";
import type { Cell, Position } from "src/shared/types";

export const getNeighborCells = (
  cells: Cell[][],
  position: Position,
  type: "orto" | "diagonal"
): Cell[] => {
  const neighborsDeltas = type === "diagonal"
    ? DIAGONAL_NEIGHBORS
    : ORTO_NEIGHBORS

  return neighborsDeltas.map(({ dColumn, dRow }) => {
    return cells[position.row + dRow]?.[position.column + dColumn];
  }).filter(Boolean);
}