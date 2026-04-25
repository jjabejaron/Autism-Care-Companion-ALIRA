import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapView } from "@/components/Map";
import AppShell from "@/components/AppShell";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  Building2,
  Download,
  ExternalLink,
  List,
  Loader2,
  Map,
  MapPin,
  Navigation,
  Phone,
  QrCode,
  Search,
  Star,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type ClinicResult = google.maps.places.PlaceResult & {
  place_id: string;
  name: string;
  vicinity: string;
};

type ModalStep = "select-child" | "qr-code";

export default function Clinics() {
  const [view, setView] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [clinics, setClinics] = useState<ClinicResult[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Contact / QR modal state
  const [contactClinic, setContactClinic] = useState<ClinicResult | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>("select-child");
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: children = [] } = trpc.children.list.useQuery();

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
          results.forEach((place) => {
            if (!place.geometry?.location) return;
            const marker = new google.maps.Marker({
              position: place.geometry.location,
              map: mapRef.current!,
              title: place.name,
              icon: { url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" },
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

  const handleContact = (clinic: ClinicResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setContactClinic(clinic);
    setSelectedChildId(children.length === 1 ? children[0].id : null);
    setModalStep("select-child");
    setModalOpen(true);
  };

  const handleGenerateQR = () => {
    if (!selectedChildId) return;
    setModalStep("qr-code");
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setContactClinic(null);
    setSelectedChildId(null);
    setModalStep("select-child");
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const qrData =
    selectedChild && contactClinic
      ? JSON.stringify({
          child: {
            name: selectedChild.name,
            age: selectedChild.age,
            birthdate: selectedChild.birthdate
              ? new Date(selectedChild.birthdate).toLocaleDateString("en-PH")
              : "N/A",
            gender: selectedChild.gender,
            clinicallyDiagnosed: selectedChild.isClinicallyDiagnosed ? "Yes" : "No",
          },
          clinic: contactClinic.name,
          generatedBy: "ALIRA - Autism Care Companion",
          generatedAt: new Date().toLocaleDateString("en-PH"),
        })
      : "";

  const handleDownloadQR = () => {
    const svg = document.getElementById("alira-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `ALIRA-QR-${selectedChild?.name ?? "child"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1
                className="text-2xl font-normal text-foreground"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
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
                  view === "map"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Map className="w-4 h-4" /> Map
              </button>
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  view === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
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
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
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

              {/* Selected clinic info panel */}
              {selectedClinic && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-10">
                  <Card className="border-border shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">
                          {selectedClinic.name}
                        </h3>
                        <button
                          onClick={() => setSelectedClinic(null)}
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
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
                            <span className="text-xs text-muted-foreground">
                              ({selectedClinic.user_ratings_total})
                            </span>
                          )}
                          {selectedClinic.opening_hours && (
                            <Badge
                              variant="outline"
                              className={`text-xs ml-1 ${
                                typeof selectedClinic.opening_hours.isOpen === 'function' && selectedClinic.opening_hours.isOpen()
                                  ? "text-green-600 border-green-200 bg-green-50"
                                  : "text-red-600 border-red-200 bg-red-50"
                              }`}
                            >
                              {typeof selectedClinic.opening_hours.isOpen === 'function' && selectedClinic.opening_hours.isOpen() ? "Open" : "Closed"}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs"
                          onClick={() => getDirections(selectedClinic)}
                        >
                          <Navigation className="w-3.5 h-3.5 mr-1" />
                          Directions
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={(e) => handleContact(selectedClinic, e)}
                        >
                          <Phone className="w-3.5 h-3.5 mr-1" />
                          Contact
                        </Button>
                      </div>
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
                    {isSearching
                      ? "Searching for clinics..."
                      : "Search for clinics to see results here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-w-2xl mx-auto">
                  <p className="text-sm text-muted-foreground mb-4">
                    {clinics.length} clinics found
                  </p>
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
                              <h3 className="font-semibold text-foreground text-sm truncate">
                                {clinic.name}
                              </h3>
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
                                    <span className="text-xs text-muted-foreground">
                                      ({clinic.user_ratings_total})
                                    </span>
                                  )}
                                </div>
                              )}
                              {clinic.opening_hours && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    typeof clinic.opening_hours.isOpen === 'function' && clinic.opening_hours.isOpen()
                                      ? "text-green-600 border-green-200 bg-green-50"
                                      : "text-red-600 border-red-200 bg-red-50"
                                  }`}
                                >
                                  {typeof clinic.opening_hours.isOpen === 'function' && clinic.opening_hours.isOpen() ? "Open Now" : "Closed"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div
                            className="flex flex-col gap-2 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => getDirections(clinic)}
                            >
                              <Navigation className="w-3 h-3 mr-1" />
                              Directions
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 text-xs"
                              onClick={(e) => handleContact(clinic, e)}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Contact
                            </Button>
                          </div>
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

      {/* Contact / QR Code Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent className="max-w-md">
          {modalStep === "select-child" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Contact Clinic
                </DialogTitle>
                <DialogDescription>
                  <span className="font-medium text-foreground">{contactClinic?.name}</span>
                  <br />
                  {contactClinic?.vicinity}
                </DialogDescription>
              </DialogHeader>

              {/* Disclaimer */}
              <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Disclaimer:</span> ALIRA does not directly book
                  appointments with clinics. We help you find the nearest options and generate a QR
                  code with your child's demographics to speed up registration when you visit.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Select which child will visit this clinic:
                </p>
                {children.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No child profiles found. Please add a child profile first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedChildId(child.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                          selectedChildId === child.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            selectedChildId === child.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {child.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{child.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Age {child.age} · {child.gender} ·{" "}
                            {child.isClinicallyDiagnosed
                              ? "Clinically Diagnosed"
                              : "Not Yet Diagnosed"}
                          </div>
                        </div>
                        {selectedChildId === child.id && (
                          <div className="w-4 h-4 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedChildId}
                  onClick={handleGenerateQR}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
              </div>
            </>
          )}

          {modalStep === "qr-code" && selectedChild && contactClinic && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Child Demographics QR Code
                </DialogTitle>
                <DialogDescription>
                  Show this QR code at{" "}
                  <span className="font-medium text-foreground">{contactClinic.name}</span> to
                  quickly share your child's information.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center gap-4">
                {/* QR Code */}
                <div className="p-4 bg-white rounded-2xl border border-border shadow-sm">
                  <QRCodeSVG
                    id="alira-qr-code"
                    value={qrData}
                    size={200}
                    level="M"
                    includeMargin
                  />
                </div>

                {/* Child info summary */}
                <div className="w-full rounded-xl bg-muted/50 p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Child Information
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-foreground">{selectedChild.name}</span>
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium text-foreground">
                      {selectedChild.age} years old
                    </span>
                    <span className="text-muted-foreground">Birthdate</span>
                    <span className="font-medium text-foreground">
                      {selectedChild.birthdate
                        ? new Date(selectedChild.birthdate).toLocaleDateString("en-PH")
                        : "N/A"}
                    </span>
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium text-foreground capitalize">
                      {selectedChild.gender}
                    </span>
                    <span className="text-muted-foreground">Clinically Diagnosed</span>
                    <span
                      className={`font-medium ${
                        selectedChild.isClinicallyDiagnosed
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {selectedChild.isClinicallyDiagnosed ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 w-full">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Scan this QR code at the clinic's reception to share your child's demographics
                    and avoid lengthy data entry. ALIRA does not directly book appointments.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setModalStep("select-child")}
                >
                  Back
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleDownloadQR}>
                  <Download className="w-4 h-4 mr-2" />
                  Save QR
                </Button>
                <Button className="flex-1" onClick={handleCloseModal}>
                  Done
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
