import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapView } from "@/components/Map";
import AppShell from "@/components/AppShell";
import { Building2, ExternalLink, List, Map, MapPin, Phone, Search, Star } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type ClinicResult = google.maps.places.PlaceResult & {
  place_id: string;
  name: string;
  vicinity: string;
};

export default function Clinics() {
  const [view, setView] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [clinics, setClinics] = useState<ClinicResult[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  const searchClinics = useCallback(
    (query: string, location?: { lat: number; lng: number }) => {
      if (!mapRef.current) return;
      setIsSearching(true);
      clearMarkers();

      const service = new google.maps.places.PlacesService(mapRef.current);
      const center = location
        ? new google.maps.LatLng(location.lat, location.lng)
        : mapRef.current.getCenter()!;

      const request: google.maps.places.TextSearchRequest = {
        query: query || "autism clinic therapy center Philippines",
        location: center,
        radius: 20000,
      };

      service.textSearch(request, (results, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setClinics(results as ClinicResult[]);

          // Add markers
          results.forEach((place) => {
            if (!place.geometry?.location) return;
            const marker = new google.maps.Marker({
              position: place.geometry.location,
              map: mapRef.current!,
              title: place.name,
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              },
            });
            marker.addListener("click", () => setSelectedClinic(place as ClinicResult));
            markersRef.current.push(marker);
          });

          if (results[0]?.geometry?.location) {
            mapRef.current?.panTo(results[0].geometry.location);
          }
        }
      });
    },
    []
  );

  const handleMapReady = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(loc);
            map.setCenter(loc);
            map.setZoom(13);
            searchClinics("autism clinic therapy center special needs", loc);
          },
          () => {
            // Default to Metro Manila
            const manila = { lat: 14.5995, lng: 120.9842 };
            map.setCenter(manila);
            map.setZoom(12);
            searchClinics("autism clinic therapy center Philippines", manila);
          }
        );
      } else {
        const manila = { lat: 14.5995, lng: 120.9842 };
        map.setCenter(manila);
        map.setZoom(12);
        searchClinics("autism clinic therapy center Philippines", manila);
      }
    },
    [searchClinics]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim()
      ? `${searchQuery} autism clinic therapy Philippines`
      : "autism clinic therapy center Philippines";
    searchClinics(query, userLocation ?? undefined);
  };

  const getDirections = (clinic: ClinicResult) => {
    const lat = clinic.geometry?.location?.lat();
    const lng = clinic.geometry?.location?.lng();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Nearby Clinics
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Find autism-specialized clinics and therapy centers in the Philippines.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  view === "map" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Map className="w-4 h-4" /> Map
              </button>
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  view === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by city or area (e.g., Quezon City, Makati)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === "map" ? (
            <div className="relative h-full">
              <MapView
                onMapReady={handleMapReady}
                className="w-full h-full"
                initialCenter={{ lat: 14.5995, lng: 120.9842 }}
                initialZoom={12}
              />

              {/* Clinic info panel */}
              {selectedClinic && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-10">
                  <Card className="border-border shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{selectedClinic.name}</h3>
                        <button
                          onClick={() => setSelectedClinic(null)}
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {selectedClinic.vicinity}
                      </div>
                      {selectedClinic.rating && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-medium">{selectedClinic.rating}</span>
                          {selectedClinic.user_ratings_total && (
                            <span className="text-xs text-muted-foreground">({selectedClinic.user_ratings_total})</span>
                          )}
                          {selectedClinic.opening_hours?.open_now !== undefined && (
                            <Badge
                              variant="outline"
                              className={`text-xs ml-1 ${selectedClinic.opening_hours.open_now ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`}
                            >
                              {selectedClinic.opening_hours.open_now ? "Open" : "Closed"}
                            </Badge>
                          )}
                        </div>
                      )}
                      <Button size="sm" className="w-full h-8 text-xs" onClick={() => getDirections(selectedClinic)}>
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Get Directions
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4 sm:p-6">
              {clinics.length === 0 ? (
                <div className="text-center py-16">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isSearching ? "Searching for clinics..." : "Search for clinics to see results here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-w-2xl mx-auto">
                  <p className="text-sm text-muted-foreground mb-4">{clinics.length} clinics found</p>
                  {clinics.map((clinic) => (
                    <Card
                      key={clinic.place_id}
                      className="border-border hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => {
                        setSelectedClinic(clinic);
                        setView("map");
                        if (mapRef.current && clinic.geometry?.location) {
                          mapRef.current.panTo(clinic.geometry.location);
                          mapRef.current.setZoom(16);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                              <h3 className="font-semibold text-foreground text-sm truncate">{clinic.name}</h3>
                            </div>
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-2">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              {clinic.vicinity}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              {clinic.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  <span className="text-xs font-medium">{clinic.rating}</span>
                                  {clinic.user_ratings_total && (
                                    <span className="text-xs text-muted-foreground">({clinic.user_ratings_total})</span>
                                  )}
                                </div>
                              )}
                              {clinic.opening_hours?.open_now !== undefined && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${clinic.opening_hours.open_now ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`}
                                >
                                  {clinic.opening_hours.open_now ? "Open Now" : "Closed"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0 h-8 text-xs"
                            onClick={(e) => { e.stopPropagation(); getDirections(clinic); }}
                          >
                            Directions
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
