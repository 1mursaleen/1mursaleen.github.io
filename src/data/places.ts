import type { Place, PlaceId } from './types';

export const places: Record<PlaceId, Place> = {
  islamabad: { id: 'islamabad', name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lng: 73.0479 },
  lahore: { id: 'lahore', name: 'Lahore', country: 'Pakistan', lat: 31.5204, lng: 74.3587 },
  dubai: { id: 'dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  riyadh: { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
  paris: { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  munich: { id: 'munich', name: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.582 },
  'st-paul-island': { id: 'st-paul-island', name: 'St. Paul Island', country: 'Alaska, USA', lat: 57.1236, lng: -170.2764 },
  toronto: { id: 'toronto', name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  coppell: { id: 'coppell', name: 'Coppell', country: 'Texas, USA', lat: 32.9546, lng: -97.015 },
};

/** The career trajectory drawn on the globe, in order. */
export const trajectory: PlaceId[] = ['islamabad', 'dubai', 'riyadh', 'paris'];

/** Remote client fan-out from the current base. */
export const remoteFanOut: PlaceId[] = ['munich', 'st-paul-island', 'toronto', 'coppell'];
