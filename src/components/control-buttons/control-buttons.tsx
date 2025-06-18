import { useAppDispatch } from "src/stores/hooks";
import s from "./control-buttons.module.scss";
import { resetField, solve, startNewGame } from "src/stores/field-store";

export const ControlButtons = () => {
  const dispatch = useAppDispatch();

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
    <div className={s.root}>
      <button className={s.green} onClick={handleNewGame}>
        Новая игра
      </button>
      <button className={s.red} onClick={handleReset}>
        Попробовать снова
      </button>
      <div className={s.spacer} />
      <button onClick={handleSolve}>
        Показать решение
      </button>
    </div>
  )
}