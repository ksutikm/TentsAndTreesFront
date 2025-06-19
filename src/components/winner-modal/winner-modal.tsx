import { ControlButtons } from "src/components/control-buttons/control-buttons";
import s from "./winner-modal.module.scss";
import { useAppSelector } from "src/stores/hooks";

export const WinnerModal = () => {
  const { isSolved, isSolvedBySolver } = useAppSelector((state) => state.field);

  const isOpened = isSolved && !isSolvedBySolver;

  if (!isOpened) {
    return null;
  }

  return (
    <div className={s.overlay}>
      <div className={s.root}>
        <div className={s.title}>Поздравляем! Вы решили головоломку!</div>
        <ControlButtons className={s.buttons} />
      </div>
    </div>
  )
}