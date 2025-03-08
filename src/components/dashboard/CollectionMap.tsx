import React, { useState, useEffect, useRef } from "react";
import { MapPin, Clock, Filter, Navigation, Info } from "lucide-react";
import { motion } from "framer-motion";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  operatingHours: string;
  wasteTypes: string[];
  distance: string;
}

interface CollectionMapProps {
  collectionPoints?: CollectionPoint[];
  userLocation?: { lat: number; lng: number };
  onSelectPoint?: (point: CollectionPoint) => void;
}

// Updated collection points with Garissa, Kenya coordinates
const defaultCollectionPoints: CollectionPoint[] = [
  {
    id: "1",
    name: "Garissa Central Recycling Facility",
    address: "Main Street, Garissa Town",
    coordinates: { lat: -0.4569, lng: 39.6583 },
    operatingHours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
    wasteTypes: ["Plastic", "Paper", "Glass"],
    distance: "0.8 km",
  },
  {
    id: "2",
    name: "Garissa Community Collection Center",
    address: "Market Road, Garissa",
    coordinates: { lat: -0.4622, lng: 39.6420 },
    operatingHours: "Mon-Sat: 7AM-7PM",
    wasteTypes: ["Electronics", "Metal", "Batteries"],
    distance: "1.2 km",
  },
  {
    id: "3",
    name: "Neighborhood Drop-off Point",
    address: "Kismayu Road, Garissa",
    coordinates: { lat: -0.4512, lng: 39.6378 },
    operatingHours: "24/7 Access",
    wasteTypes: ["Plastic", "Paper", "Organic"],
    distance: "1.5 km",
  },
];

const CollectionMap: React.FC<CollectionMapProps> = ({
  collectionPoints = defaultCollectionPoints,
  // Updated user location to Garissa, Kenya
  userLocation = { lat: -0.4550, lng: 39.6423 },
  onSelectPoint = () => {},
}) => {
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(
    null,
  );
  const [filterType, setFilterType] = useState<string>("all");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const filteredPoints =
    filterType === "all"
      ? collectionPoints
      : collectionPoints.filter((point) =>
          point.wasteTypes.includes(filterType),
        );

  const handlePointSelect = (point: CollectionPoint) => {
    setSelectedPoint(point);
    onSelectPoint(point);
    
    // Center map on selected point
    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      map.setView([point.coordinates.lat, point.coordinates.lng], 15);
    }
  };

  const getDirections = (point: CollectionPoint) => {
    // In a real implementation, this would integrate with a maps API
    console.log(`Getting directions to ${point.name}`);
    window.open(
      `https://maps.google.com/?q=${point.coordinates.lat},${point.coordinates.lng}`,
      "_blank",
    );
  };

  // Initialize OpenStreetMap
  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet CSS
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    document.head.appendChild(linkElement);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.async = true;
    
    script.onload = () => {
      // Initialize map after Leaflet is loaded
      const L = window.L;
      
      if (!mapInstanceRef.current && mapRef.current) {
        // Create map centered on Garissa, Kenya
        const map = L.map(mapRef.current).setView(
          [userLocation.lat, userLocation.lng],
          14
        );
        
        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add user location marker
        const userIcon = L.divIcon({
          html: '<div class="p-1 rounded-full bg-blue-500 animate-pulse"><div class="h-4 w-4 rounded-full bg-blue-300"></div></div>',
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        
        // Store map instance in ref
        mapInstanceRef.current = map;
        
        // Add collection point markers
        updateMarkers(collectionPoints, map);
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      document.body.removeChild(script);
      document.head.removeChild(linkElement);
    };
  }, []);

  // Update markers when filtered points change
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers(filteredPoints, mapInstanceRef.current);
    }
  }, [filteredPoints, selectedPoint]);

  const updateMarkers = (points, map) => {
    const L = window.L;
    if (!L) return;
    
    // Clear existing markers
    if (markersRef.current.length) {
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];
    }
    
    // Add new markers
    points.forEach(point => {
      const isSelected = selectedPoint?.id === point.id;
      
      const markerIcon = L.divIcon({
        html: `<div class="p-1 rounded-full ${isSelected ? "bg-primary" : "bg-gray-500"}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-white">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
      
      const marker = L.marker([point.coordinates.lat, point.coordinates.lng], { icon: markerIcon })
        .addTo(map)
        .on('click', () => handlePointSelect(point));
      
      markersRef.current.push(marker);
    });
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Collection Points in Garissa</h2>
          <div className="flex items-center space-x-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by waste type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Plastic">Plastic</SelectItem>
                <SelectItem value="Paper">Paper</SelectItem>
                <SelectItem value="Glass">Glass</SelectItem>
                <SelectItem value="Metal">Metal</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Batteries">Batteries</SelectItem>
                <SelectItem value="Organic">Organic</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Filter className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter collection points</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-64px)]">
        {/* Map View - OpenStreetMap of Garissa, Kenya */}
        <div className="w-2/3 bg-gray-100 relative">
          <div ref={mapRef} className="absolute inset-0" />
        </div>

        {/* Collection Points List */}
        <div className="w-1/3 overflow-y-auto border-l border-gray-200">
          {filteredPoints.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Info className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No collection points match your filter criteria.</p>
              <Button variant="link" onClick={() => setFilterType("all")}>
                Show all points
              </Button>
            </div>
          ) : (
            filteredPoints.map((point) => (
              <Card
                key={point.id}
                className={`m-2 cursor-pointer transition-all ${selectedPoint?.id === point.id ? "border-primary" : ""}`}
                onClick={() => handlePointSelect(point)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{point.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-start space-x-2 mb-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                    <p className="text-sm text-gray-600">{point.address}</p>
                  </div>
                  <div className="flex items-start space-x-2 mb-2">
                    <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      {point.operatingHours}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {point.wasteTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      getDirections(point);
                    }}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Directions ({point.distance})
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionMap;