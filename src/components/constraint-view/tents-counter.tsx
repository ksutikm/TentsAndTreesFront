import { useAppDispatch, useAppSelector } from "src/stores/hooks";
import s from "./tents-counter.module.scss"
import { isTentCell } from "src/shared/lib/is-tent-cell";
import clsx from "clsx";
import { fillWithGrass } from "src/stores/field-store";

interface TentsCounterProps {
  size: number | string;
  value: number;
  index: number;
  dimension: "row" | "column";
  disabled?: boolean;
}

export const TentsCounter = ({
  value,
  size,
  index,
  dimension,
  disabled,
}: TentsCounterProps) => {
  const dispatch = useAppDispatch();

  const tentsCount = useAppSelector(((state) => {
    if (dimension === "column") {
      return state.field.field.cells
        .map((row) => row[index])
        .filter((cell) => isTentCell(cell)).length;
    }

    return state.field.field.cells[index]
      .filter((cell) => isTentCell(cell)).length;
  }));

  const isCorrect = tentsCount <= value;
  const isFullfilled = tentsCount === value;

  const handleClick = () => {
    if (disabled) {
      return;
    }
    dispatch(fillWithGrass({ [dimension]: index }));
  }

  return (
    <div
      className={clsx(s.root, {
        [s.incorrect]: !isCorrect,
        [s.fullfilled]: isFullfilled,
      })}
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      <div className={s.innerBox}>
        <div className={s.text}>
          {value}
        </div>
      </div>
    </div>
  )
}