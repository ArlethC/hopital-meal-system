/*
    Archivo: advertenciaCambiosNoGuardados.tsx
    Descripcion: Hook para mostrar una alerta cuando no hay cambios no guardados.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/

import { useEffect } from "react";
import { useBlocker } from "react-router-dom"; 

export function useUnsavedChangesWarning(shouldBlock: boolean) {

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldBlock) return;
      e.preventDefault();
      e.returnValue = ""; 
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldBlock]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      return shouldBlock && currentLocation.pathname !== nextLocation.pathname;
    }
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "Tienes cambios sin guardar. ¿Seguro que deseas salir?"
      );
      if (confirmLeave) {
        blocker.proceed(); 
      } else {
        blocker.reset(); 
      }
    }
  }, [blocker]);
}