import { FieldView } from 'src/components/field-view/field-view'
import { useAppDispatch, useAppSelector } from 'src/stores/hooks'
import { ControlButtons } from 'src/components/control-buttons/control-buttons'
import { NewGamePage } from 'src/components/new-game/new-game.'
import { useEffect, useState } from 'react'
import { setField } from 'src/stores/field-store'
import { WinnerModal } from 'src/components/winner-modal/winner-modal'


export const App = () => {
  const isInitialized = useAppSelector((state) => state.field.isInitialized);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const field = localStorage.getItem("field");
      if (field) {
        dispatch(setField(JSON.parse(field)));
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <div className='root'>
      {isInitialized && (
        <>
          <ControlButtons />
          <FieldView />
          <WinnerModal />
        </>
      )}
      {!isInitialized && (
        <>
          <NewGamePage />
        </>
      )}
    </div>
  )
}
