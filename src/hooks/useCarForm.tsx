import { useUI } from '../context/UIContext';
import { useAdminData } from '../context/AdminDataContext';
import { useCars } from '../context/CarsContext';
import CarForm from '../components/sheets/CarForm';
import type { Car } from '../types/db';

/** Devuelve una función para abrir el formulario de carro (agregar o editar).
 *  Al guardar recarga la data del admin y el catálogo del cliente. */
export function useCarForm() {
  const { openSheet, closeSheet, toast } = useUI();
  const { reload } = useAdminData();
  const { reload: reloadCatalog } = useCars();

  return (car?: Car) =>
    openSheet(
      <CarForm
        car={car}
        onSaved={(msg) => {
          closeSheet();
          toast(msg);
          void reload();
          void reloadCatalog();
        }}
        onError={toast}
      />,
    );
}
