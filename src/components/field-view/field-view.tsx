import { useEffect, useRef, useState } from "react";
import s from "./field-view.module.scss";
import { CellView } from "src/components/cell-view/cell-view";
import { useAppDispatch, useAppSelector } from "src/stores/hooks";
import { changePendingCellBinding, startBindingCell, stopBindingCell } from "src/stores/field-store";
import { ConstraintView } from "src/components/constraint-view/constraint-view";
import type { Position } from "src/shared/types";
import { isTentCell } from "src/shared/lib/is-tent-cell";
import { isTreeCell } from "src/shared/lib/is-tree-cell";
import clsx from "clsx";

const HORIZONTAL_CONTAINER_PADDING = 40;
const MAX_CONTAINER_SIZE = 1040;
const PADDING_BOTTOM = 40;
const PADDING_TOP_FALLBACK = 76;

const getCellSize = (
  fieldSize: Position,
  paddingTop = PADDING_TOP_FALLBACK
) => {
  const width = Math.min(window.innerWidth, MAX_CONTAINER_SIZE);
  const viewport = {
    width: width - HORIZONTAL_CONTAINER_PADDING,
    height: Math.min(window.innerHeight - paddingTop - PADDING_BOTTOM, MAX_CONTAINER_SIZE),
  };
  const horizontalCellSize = viewport.width / (fieldSize.column + 1)
  const verticalCellSize = viewport.height / (fieldSize.row + 1)
  const cellSize = Math.min(horizontalCellSize, verticalCellSize);

  return cellSize;
}

export const FieldView = () => {
  const dispatch = useAppDispatch();
  const { field, isInitialized, isSolved, isLoading, pendingCell } = useAppSelector((state) => state.field);

  const isDisabled = isSolved || isLoading;

  const [cellSize, setCellSize] = useState(getCellSize(field.size));

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const top = rootRef.current?.getBoundingClientRect()?.top;
      setCellSize(getCellSize(field.size, top));
    }
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    try {
      localStorage.setItem("field", JSON.stringify(field));
    } catch (error) {
      alert("Не удалось сохранить состояние");
    }
  }, [field, isInitialized]);

  useEffect(() => {
    const stopBinding = () => {
      dispatch(stopBindingCell());
    }
    document.addEventListener("visibilitychange", stopBinding);
    document.addEventListener("pointercancel", stopBinding);
    document.addEventListener("pointerup", stopBinding);
    document.addEventListener("pointerleave", stopBinding);
    window.addEventListener("blur", stopBinding);

    return () => {
      document.removeEventListener("visibilitychange", stopBinding);
      document.removeEventListener("pointercancel", stopBinding);
      document.removeEventListener("pointerup", stopBinding);
      document.removeEventListener("pointerleave", stopBinding);
      window.removeEventListener("blur", stopBinding);
    }
  }, []);

  const getTargetCellPosition = (event: React.PointerEvent): Position => {
    const { top, left } = rootRef.current!.getBoundingClientRect();
    const localCoords = {
      x: event.clientX - left,
      y: event.clientY - top,
    };
    const row = Math.floor(localCoords.y / cellSize) - 1;
    const column = Math.floor(localCoords.x / cellSize) - 1;

    return { row, column };
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    if (isDisabled) {
      return;
    }
    event.preventDefault();
    const position = getTargetCellPosition(event);
    const cell = field.cells[position.row]?.[position.column];
    if (isTentCell(cell) && !cell.treeId || isTreeCell(cell) && !cell.tentId) {
      event.preventDefault();
      dispatch(startBindingCell(cell));
    }
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (isDisabled || !pendingCell) {
      return;
    }
    event.preventDefault();
    const position = getTargetCellPosition(event);
    const cell = field.cells[position.row]?.[position.column];
    if (cell) {
      dispatch(changePendingCellBinding(cell));
    }
  }

  return (
    <div
      className={s.field}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      <div ref={rootRef} className={clsx({ [s.disabled]: isLoading })}>
        <div className={s.row}>
          <div style={{ width: cellSize }} />
          {field.columnsLimits.map((value, columnIndex) => (
            <ConstraintView
              dimension="column"
              disabled={isDisabled}
              key={columnIndex}
              index={columnIndex}
              size={cellSize}
              value={value}
            />
          ))}
        </div>
        {field.cells.map((row, rowIndex) => (
          <div className={s.row} key={rowIndex}>
            <ConstraintView
              dimension="row"
              disabled={isDisabled}
              index={rowIndex}
              size={cellSize}
              value={field.rowsLimits[rowIndex]}
            />
            {row.map((cell) => (
              <CellView
                key={cell.id}
                disabled={isDisabled}
                cell={cell}
                size={cellSize}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}