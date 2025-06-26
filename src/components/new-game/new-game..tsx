import Select, { type Options } from 'react-select'
import s from "./new-game.module.scss";
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from 'src/stores/hooks';
import clsx from 'clsx';
import axios from 'axios';
import { setField } from 'src/stores/field-store';
import type { CellType } from 'src/shared/enums';
import { createCell } from 'src/shared/lib/create-cell';
import Tree from "src/assets/icons/loading.svg"

const MIN_VALUE = 5;

interface Option<T> {
  value: T;
  label: T;
}

const ROWS_OPTIONS: Options<Option<number>> = Array.from({ length: 16 })
  .map((_, index) => ({ value: index + MIN_VALUE, label: index + MIN_VALUE }));

const COLUMNS_OPTIONS: Options<Option<number>> = Array.from({ length: 16 })
  .map((_, index) => ({ value: index + MIN_VALUE, label: index + MIN_VALUE }));

const DIFFICULTY_OPTIONS: Options<Option<string>> = [
  { value: "easy", label: "Легкая" },
  { value: "medium", label: "Средняя" },
  { value: "hard", label: "Сложная" },
]

interface GenerateResponse {
  grid: CellType[][];
  col: number[];
  row: number[];
}

const getInitialValues = () => {
  const storageValue = localStorage.getItem("gameSettings");

  if (storageValue) {
    return JSON.parse(storageValue);
  }

  return {
    rows: ROWS_OPTIONS[2],
    columns: COLUMNS_OPTIONS[2],
    difficulty: DIFFICULTY_OPTIONS[1],
  }
}

export const NewGamePage = () => {
  const initialValues = useMemo(() => getInitialValues(), []);

  const [rows, setRows] = useState(initialValues.rows);
  const [columns, setColumns] = useState(initialValues.columns);
  const [difficulty, setDifficulty] = useState(initialValues.difficulty);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("gameSettings", JSON.stringify({ rows, columns, difficulty }));
    } catch (error) {
      console.error(error);
    }
  }, [rows, columns, difficulty]);

  const dispatch = useAppDispatch();

  const handleStartGame = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.post<GenerateResponse>("https://tents-api.onrender.com/generate", {
        rows: Math.min(rows.value, columns.value),
        cols: Math.max(rows.value, columns.value),
        difficulty: difficulty.value,
      });
      dispatch(setField({
        cells: resp.data.grid.map((row, rowIndex) => {
          return row.map((type, columnIndex) => {
            return createCell(type, { row: rowIndex, column: columnIndex })
          });
        }),
        columnsLimits: resp.data.col,
        rowsLimits: resp.data.row,
        size: { column: resp.data.col.length, row: resp.data.row.length },
      }))
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  return (
    <div className={s.root}>
      <div className={s.mainTitle}>
        Палатки и деревья
      </div>
      <div className={s.title}>
        Выберите размер поля
      </div>
      <div className={s.selectsWrapper}>
        <Select
          className={s.select}
          isSearchable={false}
          value={rows}
          options={ROWS_OPTIONS}
          onChange={(value) => value && setRows(value)}
        />
        <Select
          className={s.select}
          isSearchable={false}
          value={columns}
          options={COLUMNS_OPTIONS}
          onChange={(value) => value && setColumns(value)}
        />
      </div>
      <div className={s.title}>
        Выберите сложность
      </div>
      <div className={s.selectsWrapper}>
        <Select
          className={s.select}
          isSearchable={false}
          value={difficulty}
          options={DIFFICULTY_OPTIONS}
          onChange={(value) => value && setDifficulty(value)}
        />
      </div>
      <button
        className={clsx({ [s.disabled]: loading })}
        onClick={handleStartGame}
      >
        <span>Начать игру</span>
        {loading && <img src={Tree} alt="Загрузка" />}
      </button>
    </div>
  )
}