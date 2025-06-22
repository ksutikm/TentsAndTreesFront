import { useAppDispatch, useAppSelector } from "src/stores/hooks";
import s from "./control-buttons.module.scss";
import { resetField, solve, startLoading, startNewGame } from "src/stores/field-store";
import clsx from "clsx";
import axios from "axios";
import { CellType } from "src/shared/enums";

interface ControlButtonsProps {
  className?: string;
}

interface SolveResponse {
  grid: CellType[][];
}

export const ControlButtons = ({ className }: ControlButtonsProps) => {
  const dispatch = useAppDispatch();
  const { isSolved, field } = useAppSelector((state) => state.field);

  const handleNewGame = () => {
    localStorage.removeItem("field");
    dispatch(startNewGame());
  }
  const handleReset = () => {
    dispatch(resetField());
  }
  const handleSolve = async () => {
    dispatch(startLoading());
    let apiData: CellType[][] | undefined;
    try {
      const resp = await axios.post<SolveResponse>("https://tents-api.onrender.com/solve", {
        row: field.rowsLimits,
        col: field.columnsLimits,
        grid: field.cells.map((row) => row.map((cell) => cell.type === CellType.Tree ? CellType.Tree : CellType.Empty)),
      });
      apiData = resp.data.grid;
    } catch (error) {
      console.error(error);
    }
    dispatch(solve(apiData));
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