import { useEffect, useState } from "react";
import s from "./field.module.scss";
import { CellView } from "src/components/cell-view/cell-view";
import { TentsCounter } from "src/components/tents-counter/tents-counter";
import { useAppDispatch, useAppSelector } from "src/stores/hooks";
import { stopBindingCell } from "src/stores/field-store";


export const FieldView = () => {
  const dispatch = useAppDispatch();
  const { field, isInitialized } = useAppSelector((state) => state.field);
  const [windowSize, setWindowSize] = useState(Math.min(window.innerHeight, window.innerWidth));

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(Math.min(window.innerHeight, window.innerWidth));
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, []);

  const containerSize = Math.min(windowSize - 40, 1000);
  const cellSize = containerSize / (Math.max(field.size.row, field.size.column) + 1);

  useEffect(() => {
    if (!isInitialized) {
      console.log("mo")
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

  return (
    <div className={s.field}>
      <div className={s.row}>
        <div style={{ width: cellSize }} />
        {field.columnsLimits.map((value, columnIndex) => (
          <TentsCounter
            dimension="column"
            key={columnIndex}
            index={columnIndex}
            size={cellSize}
            value={value}
          />
        ))}
      </div>
      {field.cells.map((row, rowIndex) => (
        <div className={s.row} key={rowIndex}>
          <TentsCounter
            dimension="row"
            index={rowIndex}
            size={cellSize}
            value={field.rowsLimits[rowIndex]}
          />
          {row.map((cell) => (
            <CellView
              key={cell.id}
              cell={cell}
              size={cellSize}
            />
          ))}
        </div>
      ))}
    </div>
  )
}