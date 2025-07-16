import { useState } from 'react';

interface ModalState {
  addPlace: { isOpen: boolean; dayId: string };
  editPlace: { isOpen: boolean; dayId: string; place: any };
  editDay: { isOpen: boolean; day: any };
  editAccommodation: { isOpen: boolean; dayId: string; accommodation: any };
  addDay: { isOpen: boolean };
  editTripInfo: { isOpen: boolean };
}

interface DeleteModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface AccommodationUpdateModalState {
  isOpen: boolean;
  dayId: string;
  oldAccommodation: any;
  newAccommodation: any;
  affectedDays: any[];
  currentDay: any;
}

const initialModalState: ModalState = {
  addPlace: { isOpen: false, dayId: '' },
  editPlace: { isOpen: false, dayId: '', place: null },
  editDay: { isOpen: false, day: null },
  editAccommodation: { isOpen: false, dayId: '', accommodation: null },
  addDay: { isOpen: false },
  editTripInfo: { isOpen: false },
};

const initialDeleteModalState: DeleteModalState = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

const initialAccommodationUpdateModalState: AccommodationUpdateModalState = {
  isOpen: false,
  dayId: '',
  oldAccommodation: null,
  newAccommodation: null,
  affectedDays: [],
  currentDay: null,
};

export const useModalState = () => {
  const [modals, setModals] = useState<ModalState>(initialModalState);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>(initialDeleteModalState);
  const [accommodationUpdateModal, setAccommodationUpdateModal] = useState<AccommodationUpdateModalState>(
    initialAccommodationUpdateModalState
  );

  const openAddPlaceModal = (dayId: string) => {
    setModals((prev) => ({ ...prev, addPlace: { isOpen: true, dayId } }));
  };

  const openEditPlaceModal = (dayId: string, place: any) => {
    setModals((prev) => ({ ...prev, editPlace: { isOpen: true, dayId, place } }));
  };

  const openEditDayModal = (day: any) => {
    setModals((prev) => ({ ...prev, editDay: { isOpen: true, day } }));
  };

  const openEditAccommodationModal = (dayId: string, accommodation: any) => {
    setModals((prev) => ({
      ...prev,
      editAccommodation: { isOpen: true, dayId, accommodation },
    }));
  };

  const openAddDayModal = () => {
    setModals((prev) => ({ ...prev, addDay: { isOpen: true } }));
  };

  const openEditTripInfoModal = () => {
    setModals((prev) => ({ ...prev, editTripInfo: { isOpen: true } }));
  };

  const closeAllModals = () => {
    setModals(initialModalState);
  };

  const openDeleteModal = (title: string, message: string, onConfirm: () => void) => {
    setDeleteModal({ isOpen: true, title, message, onConfirm });
  };

  const closeDeleteModal = () => {
    setDeleteModal(initialDeleteModalState);
  };

  const openAccommodationUpdateModal = (
    dayId: string,
    oldAccommodation: any,
    newAccommodation: any,
    affectedDays: any[],
    currentDay: any
  ) => {
    setAccommodationUpdateModal({
      isOpen: true,
      dayId,
      oldAccommodation,
      newAccommodation,
      affectedDays,
      currentDay,
    });
  };

  const closeAccommodationUpdateModal = () => {
    setAccommodationUpdateModal(initialAccommodationUpdateModalState);
  };

  return {
    modals,
    deleteModal,
    accommodationUpdateModal,
    openAddPlaceModal,
    openEditPlaceModal,
    openEditDayModal,
    openEditAccommodationModal,
    openAddDayModal,
    openEditTripInfoModal,
    closeAllModals,
    openDeleteModal,
    closeDeleteModal,
    openAccommodationUpdateModal,
    closeAccommodationUpdateModal,
  };
};
