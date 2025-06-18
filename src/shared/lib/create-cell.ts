import { nanoid } from "nanoid";
import { CellType } from "src/shared/enums";
import type { Cell, TentCell, TreeCell, Position } from "src/shared/types";

export function createCell(type: CellType.Tent, position: Position, treeId?: string): TentCell;
export function createCell(type: CellType.Tree, position: Position, tentId?: string): TreeCell;
export function createCell(type: CellType, position: Position): Cell;
export function createCell(type: CellType, position: Position, connectedCellId?: string): Cell {
  const id = nanoid(6);

  switch (type) {
    case CellType.Tent:
      return {
        id,
        position,
        type: type,
        treeId: connectedCellId,
      }
    case CellType.Tree:
      return {
        id,
        position,
        type: type,
        tentId: connectedCellId,
      }
    default:
      return {
        id,
        position,
        type: type,
      }
  }
}