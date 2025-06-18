import type { CellType } from "src/shared/enums";

export interface Position {
  row: number;
  column: number;
}

interface BaseCell {
  type: CellType;
  id: string;
  position: Position;
}

export interface EmptyCell extends BaseCell {
  type: CellType.Empty;
}

export interface GrassCell extends BaseCell {
  type: CellType.Grass;
}

export interface TreeCell extends BaseCell {
  type: CellType.Tree;
  tentId?: string;
}

export interface TentCell extends BaseCell {
  type: CellType.Tent;
  treeId?: string;
}

export type Cell = EmptyCell | GrassCell | TreeCell | TentCell;

export interface Field {
  cells: Cell[][];
  size: Position;
  columnsLimits: number[];
  rowsLimits: number[];
}