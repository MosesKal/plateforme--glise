"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const extensions = [
  { id: 1,  nom: "Camp de Jésus-Christ Bel-Air Fizi", ville: "Kinshasa",   pays: "RDC",     lat: -4.352,  lng: 15.281, principale: true  },
  { id: 2,  nom: "Extension Gombe",        ville: "Kinshasa",   pays: "RDC",     lat: -4.318,  lng: 15.327, principale: false },
  { id: 3,  nom: "Extension Lubumbashi",   ville: "Lubumbashi", pays: "RDC",     lat: -11.664, lng: 27.479, principale: false },
  { id: 4,  nom: "Extension Brazzaville",  ville: "Brazzaville",pays: "Congo",   lat: -4.263,  lng: 15.243, principale: false },
  { id: 5,  nom: "Extension Kolwezi",      ville: "Kolwezi",    pays: "RDC",     lat: -10.715, lng: 25.466, principale: false },
  { id: 6,  nom: "Extension Likasi",       ville: "Likasi",     pays: "RDC",     lat: -10.981, lng: 26.733, principale: false },
  { id: 7,  nom: "Extension Goma",         ville: "Goma",       pays: "RDC",     lat: -1.679,  lng: 29.231, principale: false },
  { id: 8,  nom: "Extension Kampala",      ville: "Kampala",    pays: "Ouganda", lat:  0.347,  lng: 32.583, principale: false },
  { id: 9,  nom: "Extension Fungurume",    ville: "Fungurume",  pays: "RDC",     lat: -10.595, lng: 26.316, principale: false },
]

function makeIcon(principale: boolean) {
  const size = principale ? 22 : 16
  const bg = principale ? "#ffcb32" : "#024339"
  const border = principale ? "#024339" : "#ffcb32"

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${bg};
      border:2px solid ${border};
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
    "></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

export function ExtensionsMap() {
  return (
    <MapContainer
      center={[-5, 18]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      zoomControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {extensions.map((ext) => (
        <Marker key={ext.id} position={[ext.lat, ext.lng]} icon={makeIcon(ext.principale)}>
          <Popup>
            <div style={{ fontFamily: "Montserrat, sans-serif", minWidth: 140 }}>
              <p style={{ fontWeight: 700, color: "#024339", margin: "0 0 3px", fontSize: 13 }}>
                {ext.nom}
              </p>
              <p style={{ color: "#666", fontSize: 12, margin: 0 }}>
                {ext.ville}, {ext.pays}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
