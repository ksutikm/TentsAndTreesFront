import { CellType } from "src/shared/enums";
import type { EmptyCell } from "src/shared/types";

export const isEmptyCell = (cell: any): cell is EmptyCell => {
  return (
    cell != null &&
    typeof cell === "object" &&
    cell.type === CellType.Empty &&
    "id" in cell &&
    "position" in cell
  );
}
