import { CellType } from "src/shared/enums";
import Tent from "src/assets/icons/tent.svg"
import Tree from "src/assets/icons/tree.svg"
import s from "./cell-view.module.scss"
import clsx from "clsx";
import type { Cell } from "src/shared/types";
import { useAppDispatch, useAppSelector } from "src/stores/hooks";
import { changePendingCellBinding, startBindingCell, toggleCellType } from "src/stores/field-store";
import { isTentCell } from "src/shared/lib/is-tent-cell";
import { isTreeCell } from "src/shared/lib/is-tree-cell";

interface CellProps {
  size: number | string;
  cell: Cell;
  disabled?: boolean;
}

const valueClassNames: Record<CellType, string> = {
  [CellType.Empty]: s.empty,
  [CellType.Tent]: s.tent,
  [CellType.Grass]: s.grass,
  [CellType.Tree]: s.tree,
}

const bindingClassNames: Record<string, string> = {
  "-1,0": s.binding_top,
  "1,0": s.binding_bottom,
  "0,-1": s.binding_left,
  "0,1": s.binding_right,
};

export const CellView = ({ cell, size, disabled }: CellProps) => {
  const dispatch = useAppDispatch();

  const boundCell = useAppSelector((state) => {
    if (isTentCell(cell) && cell.treeId) {
      return state.field.cellsMap[cell.treeId];
    }
    if (isTreeCell(cell) && cell.tentId) {
      return state.field.cellsMap[cell.tentId];
    }

    return undefined;
  });

  const bindingType = boundCell ? [
    boundCell.position.row - cell.position.row,
    boundCell.position.column - cell.position.column,
  ].join(",") : "";

  const colorIndex = (cell.position.row + cell.position.column) % 3;
  const grassClassName = `grass_${colorIndex}`;

  const handleClick = () => {
    if (disabled) {
      return;
    }
    dispatch(toggleCellType(cell));
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    if (disabled) {
      return;
    }
    event.preventDefault();
    dispatch(startBindingCell(cell));
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (disabled) {
      return;
    }
    event.preventDefault();
    dispatch(changePendingCellBinding(cell));
  }

  const valueClassName = valueClassNames[cell.type];

  return (
    <div
      style={{ width: size, height: size }}
      className={clsx(s.cell, bindingClassNames[bindingType], {
        [s[grassClassName]]: cell.type !== CellType.Empty,
        [s.border_left]: cell.position.column === 0,
        [s.border_top]: cell.position.row == 0,
      })}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <div className={clsx(s.innerBox, valueClassName)}>
        {cell.type === CellType.Tent && (
          <img draggable={false} src={Tent} alt="tent" />
        )}
        {cell.type === CellType.Tree && (
          <img draggable={false} src={Tree} alt="tree" />
        )}
      </div>
    </div>
  )
}