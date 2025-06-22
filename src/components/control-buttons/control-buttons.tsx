import { useAppDispatch, useAppSelector } from "src/stores/hooks";
import s from "./control-buttons.module.scss";
import { resetField, solve, startNewGame } from "src/stores/field-store";
import clsx from "clsx";

interface ControlButtonsProps {
  className?: string;
}

export const ControlButtons = ({ className }: ControlButtonsProps) => {
  const dispatch = useAppDispatch();
  const { isSolved } = useAppSelector((state) => state.field);

  const handleNewGame = () => {
    localStorage.removeItem("field");
    dispatch(startNewGame());
  }
  const handleReset = () => {
    dispatch(resetField());
  }
  const handleSolve = () => {
    dispatch(solve());
  }

  return (
    <div className={clsx(s.root, className)}>
      <button className={s.green} onClick={handleNewGame}>
        Новая игра
      </button>
      <button className={s.red} onClick={handleReset}>
        Попробовать снова
      </button>
      {!isSolved && (
        <>
          <div className={s.spacer} />
          <button onClick={handleSolve}>
            Показать решение
          </button>
        </>
      )}
    </div>
  )
}