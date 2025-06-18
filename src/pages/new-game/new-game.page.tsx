import Select, { type Options } from 'react-select'
import s from "./new-game.module.scss";
import { useState } from 'react';
import { useAppDispatch } from 'src/stores/hooks';
import clsx from 'clsx';
import axios from 'axios';
import { setField } from 'src/stores/field-store';
import type { CellType } from 'src/shared/enums';
import { createCell } from 'src/shared/lib/create-cell';

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

export const NewGamePage = () => {
  const [rows, setRows] = useState(ROWS_OPTIONS[2]);
  const [columns, setColumns] = useState(COLUMNS_OPTIONS[2]);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_OPTIONS[1]);

  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleStartGame = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.post<GenerateResponse>("https://tents-api.onrender.com/generate", {
        size_n: rows.value,
        size_m: columns.value,
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
      console.log(resp);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={s.root}>
      <div className={s.title}>
        Выберите размер поля
      </div>
      <div className={s.selectsWrapper}>
        <Select
          className={s.select}
          value={rows}
          options={ROWS_OPTIONS}
          onChange={(value) => value && setRows(value)}
        />
        <Select
          className={s.select}
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
          value={difficulty}
          options={DIFFICULTY_OPTIONS}
          onChange={(value) => value && setDifficulty(value)}
        />
      </div>
      <button
        className={clsx({ [s.disabled]: loading })}
        onClick={handleStartGame}
      >
        Начать игру
      </button>
    </div>
  )
}