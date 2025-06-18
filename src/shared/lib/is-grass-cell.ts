import { CellType } from "src/shared/enums";
import type { GrassCell } from "src/shared/types";

export const isGrassCell = (cell: any): cell is GrassCell => {
  return (
    cell != null &&
    typeof cell === "object" &&
    cell.type === CellType.Grass &&
    "id" in cell &&
    "position" in cell
  );
}
