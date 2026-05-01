import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Navigation, Search, X } from 'lucide-react';

// Must be defined outside the component — stable reference prevents infinite re-renders
const LIBRARIES = ['places'];
const MAP_STYLE  = { height: '100%', width: '100%' };
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MAP_OPTIONS = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControlOptions: { position: 3 }, // RIGHT_TOP
};

// Extract city/state/pincode/address from a Google Geocoder result
const parseGeocode = (result, lat, lng) => {
  const get = (type) =>
    (result.address_components || []).find((c) => c.types.includes(type))?.long_name || '';
  return {
    lat,
    lng,
    city:    get('locality') || get('sublocality_level_1') || get('administrative_area_level_2') || '',
    state:   get('administrative_area_level_1') || '',
    pincode: get('postal_code') || '',
    address: result.formatted_address || '',
  };
};

/**
 * LocationPicker — Google Maps edition
 *
 * Props:
 *   lat, lng   – initial pin position (numbers or empty strings)
 *   onChange({ lat, lng, city, state, pincode, address })
 *              – called ONLY when the map, pin, search, or GPS changes position
 */
const LocationPicker = ({ lat: initLat, lng: initLng, onChange }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: LIBRARIES,
  });

  const hasInit  = Boolean(initLat && initLng && !isNaN(initLat) && !isNaN(initLng));
  const initPos  = hasInit ? { lat: Number(initLat), lng: Number(initLng) } : null;

  const [position, setPosition]       = useState(initPos);
  const [search, setSearch]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchBusy, setSearchBusy]   = useState(false);
  const [gpsBusy, setGpsBusy]         = useState(false);
  const [showDrop, setShowDrop]       = useState(false);

  const mapRef        = useRef(null);
  const geocoderRef   = useRef(null);
  const autoSvcRef    = useRef(null);
  const debounceRef   = useRef(null);
  const dropRef       = useRef(null);

  // Instantiate Google services once the SDK is ready
  useEffect(() => {
    if (!isLoaded) return;
    geocoderRef.current = new window.google.maps.Geocoder();
    autoSvcRef.current  = new window.google.maps.places.AutocompleteService();
  }, [isLoaded]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const reverseGeocode = useCallback((lat, lng) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        onChange(parseGeocode(results[0], lat, lng));
      } else {
        onChange({ lat, lng, city: '', state: '', pincode: '', address: '' });
      }
    });
  }, [onChange]);

  const apply = useCallback((lat, lng, precomputed) => {
    const pos = { lat, lng };
    setPosition(pos);
    if (mapRef.current) mapRef.current.panTo(pos);
    if (precomputed) onChange(precomputed);
    else reverseGeocode(lat, lng);
  }, [onChange, reverseGeocode]);

  // Debounced Places Autocomplete
  const handleSearchChange = (value) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) { setSuggestions([]); setShowDrop(false); return; }

    debounceRef.current = setTimeout(() => {
      if (!autoSvcRef.current) return;
      setSearchBusy(true);
      autoSvcRef.current.getPlacePredictions(
        { input: value, componentRestrictions: { country: 'in' } },
        (predictions, status) => {
          setSearchBusy(false);
          const OK = window.google.maps.places.PlacesServiceStatus.OK;
          if (status === OK && predictions?.length) {
            setSuggestions(predictions);
            setShowDrop(true);
          } else {
            setSuggestions([]);
            setShowDrop(false);
          }
        },
      );
    }, 300);
  };

  const handleSuggestionClick = (prediction) => {
    setSearch(prediction.description);
    setSuggestions([]);
    setShowDrop(false);
    geocoderRef.current.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        apply(lat, lng, parseGeocode(results[0], lat, lng));
        if (mapRef.current) mapRef.current.setZoom(16);
      }
    });
  };

  const handleMapClick = useCallback((e) => {
    apply(e.latLng.lat(), e.latLng.lng());
  }, [apply]);

  const handleMarkerDragEnd = useCallback((e) => {
    apply(e.latLng.lat(), e.latLng.lng());
  }, [apply]);

  const handleGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGpsBusy(false);
        apply(coords.latitude, coords.longitude);
        if (mapRef.current) mapRef.current.setZoom(16);
      },
      () => {
        setGpsBusy(false);
        alert('Could not get your location. Please allow location access in your browser settings.');
      },
      { timeout: 10000 },
    );
  };

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
        Failed to load Google Maps. Check that <code>VITE_GOOGLE_MAPS_API_KEY</code> is set and the Maps JavaScript API + Places API + Geocoding API are enabled in Google Cloud Console.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center text-sm text-slate-400">
        Loading map…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Search + GPS ── */}
      <div className="flex gap-2">
        <div className="relative flex-1" ref={dropRef}>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDrop(true)}
              placeholder="Search for a place or address…"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-9 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
            {searchBusy && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">…</span>
            )}
            {search && !searchBusy && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSuggestions([]); setShowDrop(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showDrop && suggestions.length > 0 && (
            <div className="absolute z-[1001] mt-1 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {suggestions.map((prediction) => {
                const main      = prediction.structured_formatting?.main_text || prediction.description;
                const secondary = prediction.structured_formatting?.secondary_text || '';
                return (
                  <button
                    key={prediction.place_id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(prediction); }}
                    className="flex w-full items-start gap-2.5 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-0 hover:bg-slate-50"
                  >
                    <MapPin size={13} className="mt-0.5 shrink-0 text-primary" />
                    <span className="leading-snug">
                      <span className="font-semibold text-slate-800">{main}</span>
                      {secondary && <span className="ml-1 text-slate-500">{secondary}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* GPS button */}
        <button
          type="button"
          onClick={handleGps}
          disabled={gpsBusy}
          className="flex h-12 shrink-0 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <Navigation size={14} className={gpsBusy ? 'animate-pulse text-primary' : ''} />
          {gpsBusy ? 'Locating…' : 'My location'}
        </button>
      </div>

      {/* ── Google Map ── */}
      <div className="h-72 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={MAP_STYLE}
          center={position ?? INDIA_CENTER}
          zoom={position ? 15 : 5}
          options={MAP_OPTIONS}
          onClick={handleMapClick}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {position && (
            <Marker
              position={position}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>

      <p className="text-center text-xs text-slate-400">
        Click the map or drag the pin to set your exact location
      </p>
    </div>
  );
};

export default LocationPicker;
