import { CellType } from "src/shared/enums";
import type { TentCell } from "src/shared/types";

export const isTentCell = (cell: any): cell is TentCell => {
  return (
    cell != null &&
    typeof cell === "object" &&
    cell.type === CellType.Tent &&
    "id" in cell &&
    "position" in cell
  );
}
