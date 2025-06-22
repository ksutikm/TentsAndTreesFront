import { useAppDispatch, useAppSelector } from "src/stores/hooks";
import { isTentCell } from "src/shared/lib/is-tent-cell";
import clsx from "clsx";
import { fillWithGrass } from "src/stores/field-store";
import s from "./constraint-view.module.scss"
import { isEmptyCell } from "src/shared/lib/is-empty-cell";

interface ConstraintViewProps {
  size: number | string;
  value: number;
  index: number;
  dimension: "row" | "column";
  disabled?: boolean;
}

export const ConstraintView = ({
  value,
  size,
  index,
  dimension,
  disabled,
}: ConstraintViewProps) => {
  const dispatch = useAppDispatch();

  const { tentsCount, emptyCount } = useAppSelector(((state) => {
    const cells = dimension === "column"
      ? state.field.field.cells.map((row) => row[index])
      : state.field.field.cells[index];

    const tentsCount = cells.filter(isTentCell).length;
    const emptyCount = cells.filter(isEmptyCell).length;

    return {
      tentsCount,
      emptyCount,
    };
  }));

  const isCorrect = (tentsCount < value && emptyCount > 0) || tentsCount === value;
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