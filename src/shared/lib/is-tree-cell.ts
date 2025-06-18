import { CellType } from "src/shared/enums";
import type { TreeCell } from "src/shared/types";

export const isTreeCell = (cell: any): cell is TreeCell => {
  return (
    cell != null &&
    typeof cell === "object" &&
    cell.type === CellType.Tree &&
    "id" in cell &&
    "position" in cell
  );
};
