import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "src/stores/root"

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
