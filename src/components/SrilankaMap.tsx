import React, { useState } from 'react';
import { Tree } from '../types';
import { ZoomIn, ZoomOut, MapPin, Search } from 'lucide-react';

interface SrilankaMapProps {
  trees: Tree[];
  onSelectTree: (tree: Tree) => void;
  selectedTreeId?: string;
  searchQuery: string;
}

export default function SrilankaMap({ trees, onSelectTree, selectedTreeId, searchQuery }: SrilankaMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map coordinates of Sri Lanka districts approximately translated to 500x800 viewBox
  const markers = trees.map(tree => {
    // Basic approximate coordinate mapping for Sri Lankan cities/districts in our mock SVG viewbox (500x800)
    let cx = 250; // default center
    let cy = 400;

    const area = tree.area?.toLowerCase() || '';
    if (area.includes('galle')) {
      cx = 190; cy = 700; // Galle - south
    } else if (area.includes('colombo')) {
      cx = 160; cy = 580; // Colombo - west
    } else if (area.includes('ratnapura')) {
      cx = 220; cy = 610; // Ratnapura - south central
    } else if (area.includes('kandy')) {
      cx = 250; cy = 480; // Kandy - central
    } else if (area.includes('anuradhapura')) {
      cx = 240; cy = 290; // Anuradhapura - north central
    } else if (area.includes('jaffna')) {
      cx = 180; cy = 80;  // Jaffna - north
    } else if (area.includes('matara')) {
      cx = 220; cy = 720; // Matara - deep south
    } else if (area.includes('trincomalee')) {
      cx = 320; cy = 310; // Trincomalee - east coast
    } else {
      // Add random small offset so they don't exactly overlap
      const offsetHash = tree.id.charCodeAt(tree.id.length - 1) % 5;
      cx = 250 + (offsetHash * 15 - 30);
      cy = 450 + (offsetHash * 20 - 40);
    }

    return { ...tree, cx, cy };
  });

  const filteredMarkers = markers.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.treeName.toLowerCase().includes(q) ||
      m.scientificName.toLowerCase().includes(q) ||
      m.donorName.toLowerCase().includes(q) ||
      m.planterName.toLowerCase().includes(q) ||
      m.area.toLowerCase().includes(q)
    );
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
      {/* Search status summary */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-50 shadow-sm text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        {filteredMarkers.length} of {trees.length} Trees Spotted
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(3, z + 0.25))}
          className="p-2 bg-white rounded-xl border border-emerald-100 shadow-sm hover:bg-emerald-50 text-emerald-700 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(1, z - 0.25))}
          className="p-2 bg-white rounded-xl border border-emerald-100 shadow-sm hover:bg-emerald-50 text-emerald-700 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="px-2 py-1 bg-white rounded-xl border border-emerald-100 shadow-sm hover:bg-emerald-50 text-[10px] font-bold text-emerald-700 transition"
        >
          Reset
        </button>
      </div>

      {/* Interactive Map Canvas */}
      <div
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 500 800"
          className="w-full h-full transition-transform duration-75 select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Sri Lanka Landmass Outline Mock-SVG */}
          <path
            d="M 170,120 
               C 170,80 180,60 190,80 
               C 210,110 240,150 250,180
               C 260,200 300,220 310,250
               C 330,300 360,320 370,360
               C 380,400 370,450 350,510
               C 330,550 340,600 320,650
               C 300,700 270,750 240,760
               C 210,770 190,750 170,710
               C 150,670 140,640 130,590
               C 120,550 140,510 140,460
               C 140,410 160,350 160,300
               C 160,250 150,210 160,170
               Z"
            fill="#d1fae5"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Sub-regions details / ocean contours mock */}
          <path
            d="M 220,150 C 240,190 230,240 250,280 C 260,300 290,320 310,340"
            fill="none"
            stroke="#a7f3d0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M 160,350 C 190,380 230,390 240,430 C 250,470 210,530 220,580"
            fill="none"
            stroke="#a7f3d0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M 150,510 C 180,520 220,550 240,600 C 260,650 250,690 230,730"
            fill="none"
            stroke="#a7f3d0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Major District Centers Labels */}
          <g fontSize="10" fontWeight="bold" fill="#047857" opacity="0.6">
            <text x="160" y="90">Jaffna</text>
            <text x="210" y="290">Anuradhapura</text>
            <text x="290" y="325">Trincomalee</text>
            <text x="235" y="485">Kandy</text>
            <text x="130" y="585">Colombo</text>
            <text x="195" y="620">Ratnapura</text>
            <text x="175" y="705">Galle</text>
            <text x="205" y="725">Matara</text>
          </g>

          {/* Planted/Tagged Tree Markers */}
          {filteredMarkers.map((marker) => {
            const isSelected = selectedTreeId === marker.id;
            return (
              <g
                key={marker.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTree(marker);
                }}
                className="cursor-pointer group"
              >
                {/* Ripple Effect ring */}
                <circle
                  cx={marker.cx}
                  cy={marker.cy}
                  r={isSelected ? 16 : 8}
                  fill={marker.status === 'Tagged' ? '#10b981' : '#3b82f6'}
                  opacity={isSelected ? "0.3" : "0.15"}
                  className="transition-all duration-300 group-hover:scale-150"
                />
                
                {/* Core tree marker circle */}
                <circle
                  cx={marker.cx}
                  cy={marker.cy}
                  r={isSelected ? 7 : 5}
                  fill={marker.status === 'Tagged' ? '#059669' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-300 group-hover:r-7"
                />

                {/* Micro tooltip label for zoom scale */}
                <g className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                  <rect
                    x={marker.cx - 60}
                    y={marker.cy - 35}
                    width="120"
                    height="20"
                    rx="4"
                    fill="#1e293b"
                  />
                  <text
                    x={marker.cx}
                    y={marker.cy - 22}
                    fill="#ffffff"
                    fontSize="8"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {marker.treeName} - {marker.id}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quick Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-emerald-50 shadow-sm text-[10px] flex gap-3 text-gray-600 font-medium z-10">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block border border-white"></span>
          <span>Tagged Tree</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block border border-white"></span>
          <span>Planted Tree</span>
        </div>
      </div>
    </div>
  );
}
