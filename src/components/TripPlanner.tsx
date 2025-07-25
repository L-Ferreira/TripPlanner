import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, decimalHoursToHoursMinutes } from '@/lib/utils';
import { Car, Edit2, MapPin, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { useSyncContext } from '../contexts/SyncContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useModalState } from '../hooks/useModalState';
import { TripInfo, useTripData } from '../hooks/useTripData';
import AccommodationCard from './AccommodationCard';
import AccommodationUpdateConfirmationModal from './AccommodationUpdateConfirmationModal';
import AddDayModal from './AddDayModal';
import AddPlaceModal from './AddPlaceModal';
import DayNotesCard from './DayNotesCard';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EditAccommodationModal from './EditAccommodationModal';
import EditDayModal from './EditDayModal';
import EditPlaceModal from './EditPlaceModal';
import { EditTripInfoModal } from './EditTripInfoModal';
import PlacesCard from './PlacesCard';
import { TripHeader } from './TripHeader';

const TripPlanner = () => {
  // Get all data and actions from the centralized sync context
  const {
    tripData,
    hasLocalChanges,
    setAuthenticated,
    // Basic operations from context
    updateTripInfo,
    addDay,
    updateDay,
    deleteDay,
    addPlace,
    updatePlace,
    deletePlace,
    // Additional operations that may still need the hook
    updateDayNotes,
  } = useSyncContext();

  // Only use useTripData for complex operations that aren't in context yet
  const {
    addDayAndLinkAccommodation,
    updateAccommodation,
    updateLinkedAccommodation,
    findLinkedAccommodationDays,
    addPlaceImage,
    exportData,
    importData,
    resetData,
    checkUnusedNights,
    adjustPreviousAccommodationNights,
  } = useTripData();

  // Sync the auth state with the context
  const { isAuthenticated } = useGoogleAuth();

  useEffect(() => {
    setAuthenticated(isAuthenticated);
  }, [isAuthenticated, setAuthenticated]);

  // Prevent page refresh when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasLocalChanges) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes that will be lost if you leave this page. Are you sure you want to continue?';
        return 'You have unsaved changes that will be lost if you leave this page. Are you sure you want to continue?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasLocalChanges]);

  const {
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
  } = useModalState();

  // CRUD handlers
  const handleAddPlace = (placeData: any) => {
    addPlace(modals.addPlace.dayId, placeData);
  };

  const handleUpdatePlace = (placeData: any) => {
    updatePlace(modals.editPlace.dayId, modals.editPlace.place.id, placeData);
  };

  const handleUpdateDay = (dayData: any) => {
    updateDay(modals.editDay.day.id, dayData);
  };

  const handleUpdateAccommodation = (accommodationData: any) => {
    const dayId = modals.editAccommodation.dayId;
    const linkedInfo = findLinkedAccommodationDays(dayId);

    if (linkedInfo.isLinked) {
      // Show confirmation modal for linked accommodations
      const currentDay = tripData.days.find((d) => d.id === dayId);
      openAccommodationUpdateModal(
        dayId,
        currentDay!.accommodation,
        accommodationData,
        linkedInfo.linkedDays,
        currentDay!
      );
    } else {
      // Direct update for non-linked accommodations
      updateAccommodation(dayId, accommodationData);
    }
  };

  const handleConfirmAccommodationUpdate = () => {
    updateLinkedAccommodation(accommodationUpdateModal.dayId, accommodationUpdateModal.newAccommodation);
    closeAccommodationUpdateModal();
  };

  const handleDeleteDay = (dayId: string) => {
    const day = tripData.days.find((d) => d.id === dayId);
    openDeleteModal(
      'Delete Day',
      `Are you sure you want to delete Day #${day?.dayNumber} (${day?.region})? This action cannot be undone.`,
      () => deleteDay(dayId)
    );
  };

  const handleDeletePlace = (dayId: string, placeId: string) => {
    const day = tripData.days.find((d) => d.id === dayId);
    const place = day?.places.find((p) => p.id === placeId);
    openDeleteModal(
      'Delete Place',
      `Are you sure you want to delete "${place?.name}"? This action cannot be undone.`,
      () => deletePlace(dayId, placeId)
    );
  };

  const handleShowResetModal = () => {
    openDeleteModal(
      'Reset Trip Data',
      'Are you sure you want to reset all trip data? This will delete all days, places, and accommodations and give you a clean slate to start planning a new trip. This action cannot be undone.',
      () => resetData()
    );
  };

  const handleEditTripInfo = (updatedInfo: Partial<TripInfo>) => {
    updateTripInfo(updatedInfo);
    closeAllModals();
  };

  // Helper function to format drive time display
  const formatDriveTime = (decimalHours: number): string => {
    const { hours, minutes } = decimalHoursToHoursMinutes(decimalHours);
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen">
      <TripHeader
        tripTitle={tripData.tripInfo.name}
        tripDestination={tripData.tripInfo.description}
        tripStartDate={tripData.tripInfo.startDate}
        tripEndDate={tripData.tripInfo.endDate}
        onEditTrip={() => openEditTripInfoModal()}
        onAddDay={openAddDayModal}
        onExportData={exportData}
        onImportData={importData}
        onResetData={handleShowResetModal}
      />

      <Accordion type="single" collapsible className="w-full space-y-3">
        {tripData.days.map((day) => (
          <Fragment key={day.id}>
            <AccordionItem key={day.id} value={day.id} className="border border-gray-300 rounded-lg bg-white shadow-md">
              <AccordionTrigger className="text-left px-6 py-4 hover:bg-gray-50 data-[state=open]:rounded-t-lg data-[state=closed]:rounded-lg">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex items-center gap-4 flex-1">
                    <Badge
                      variant="outline"
                      className="hidden sm:block px-3 py-1 text-sm font-semibold border-gray-400"
                    >
                      Day #{day.dayNumber}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="block sm:hidden px-3 py-1 text-sm font-semibold border-gray-400"
                    >
                      #{day.dayNumber}
                    </Badge>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin size={16} />
                        <span className="font-medium break-words">{day.region}</span>
                      </div>
                      {day.driveTimeHours > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Car size={16} />
                          <span className="break-words">
                            {formatDriveTime(day.driveTimeHours)} • {day.driveDistanceKm}km
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mr-3">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDayModal(day);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          openEditDayModal(day);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDay(day.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteDay(day.id);
                        }
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 space-y-6 accordion-content">
                <div className="space-y-6">
                  {/* Google Maps Embed */}
                  {day.googleMapsEmbedUrl && (
                    <Card className="overflow-hidden border-gray-300 shadow-md">
                      <CardHeader className="pb-0">
                        <CardTitle className="flex items-center justify-between text-gray-800">
                          <div className="flex items-center gap-2">
                            <MapPin size={20} />
                            Route Map
                          </div>
                          {day.googleMapsUrl && (
                            <a
                              href={day.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm transition-colors"
                            >
                              Open in Maps
                            </a>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div
                          className={cn('bg-gray-100 rounded-lg overflow-hidden', 'h-[500px] md:h-80 max-h-[500px]')}
                        >
                          <iframe
                            src={day.googleMapsEmbedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Accommodation */}
                  <AccommodationCard day={day} onEditAccommodation={openEditAccommodationModal} />

                  {/* Places to Visit */}
                  <PlacesCard
                    day={day}
                    onAddPlace={openAddPlaceModal}
                    onEditPlace={openEditPlaceModal}
                    onDeletePlace={handleDeletePlace}
                    onAddPlaceImage={addPlaceImage}
                  />

                  {/* Day Notes */}
                  <DayNotesCard day={day} onUpdateNotes={updateDayNotes} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <div
              className={cn('h-0.5 m-2 bg-gray-200', day.id === tripData.days[tripData.days.length - 1].id && 'hidden')}
            />
          </Fragment>
        ))}
      </Accordion>

      {/* Modals */}
      <AddPlaceModal isOpen={modals.addPlace.isOpen} onClose={closeAllModals} onAddPlace={handleAddPlace} />

      <EditPlaceModal
        isOpen={modals.editPlace.isOpen}
        onClose={closeAllModals}
        onSave={handleUpdatePlace}
        place={modals.editPlace.place}
      />

      <EditDayModal
        isOpen={modals.editDay.isOpen}
        onClose={closeAllModals}
        onSave={handleUpdateDay}
        day={modals.editDay.day}
      />

      <EditAccommodationModal
        isOpen={modals.editAccommodation.isOpen}
        onClose={closeAllModals}
        onSave={handleUpdateAccommodation}
        accommodation={modals.editAccommodation.accommodation}
        dayNumber={
          modals.editAccommodation.dayId
            ? tripData.days.find((d) => d.id === modals.editAccommodation.dayId)?.dayNumber || 1
            : 1
        }
      />

      <AddDayModal
        isOpen={modals.addDay.isOpen}
        onClose={closeAllModals}
        onAdd={addDay}
        addDayAndLinkAccommodation={addDayAndLinkAccommodation}
        tripData={tripData}
        checkUnusedNights={checkUnusedNights}
        adjustPreviousAccommodationNights={adjustPreviousAccommodationNights}
      />

      <EditTripInfoModal
        isOpen={modals.editTripInfo.isOpen}
        tripInfo={tripData.tripInfo}
        onSave={handleEditTripInfo}
        onCancel={closeAllModals}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={deleteModal.onConfirm}
        onClose={closeDeleteModal}
      />

      {/* Accommodation Update Confirmation Modal */}
      <AccommodationUpdateConfirmationModal
        isOpen={accommodationUpdateModal.isOpen}
        oldAccommodation={accommodationUpdateModal.oldAccommodation}
        newAccommodation={accommodationUpdateModal.newAccommodation}
        affectedDays={accommodationUpdateModal.affectedDays}
        currentDay={accommodationUpdateModal.currentDay}
        onConfirm={handleConfirmAccommodationUpdate}
        onClose={closeAccommodationUpdateModal}
      />
    </div>
  );
};

export default TripPlanner;
