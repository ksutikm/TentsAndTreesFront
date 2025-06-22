import { getNeighborCells } from "src/shared/lib/get-neighbor-cells";
import { isTentCell } from "src/shared/lib/is-tent-cell";
import { isTreeCell } from "src/shared/lib/is-tree-cell";
import type { Cell } from "src/shared/types";

export const isCellInvalid = (cell: Cell, cells: Cell[][]) => {
  if (!isTentCell(cell)) {
    return false;
  }
  const hasNeighborTent = getNeighborCells(
    cells,
    cell.position,
    "diagonal",
  ).some(isTentCell);
  const hasNeighborTree = getNeighborCells(
    cells,
    cell.position,
    "orto",
  ).some(isTreeCell);

  return hasNeighborTent || !hasNeighborTree;
}