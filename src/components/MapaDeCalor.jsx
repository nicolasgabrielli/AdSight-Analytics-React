import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import "leaflet.heat";
import { Switch, FormControlLabel, Box, Typography } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import { createRoot } from "react-dom/client";

// Datos del mapa de calor
const heatmapData = [
    { id: 1, lat: -33.44975204493245, lng: -70.68728969259477, intensity: 34200, name: "Departamento de Informática", info: "Volumen de Personas: 34,200 diarias" },
    { id: 2, lat: -33.4569, lng: -70.6483, intensity: 15000, name: "Metro Ñuñoa", info: "Volumen de Personas: 15,000 diarias" },
    { id: 3, lat: -33.5018, lng: -70.7574, intensity: 10000, name: "Maipú", info: "Volumen de Personas: 10,000 diarias" },
    { id: 4, lat: -33.4031, lng: -70.5729, intensity: 25000, name: "Las Condes", info: "Volumen de Personas: 25,000 diarias" },
];

// Normalizar las intensidades
const normalizeIntensity = (data, multiplier = 1) => {
    const minIntensity = Math.min(...data.map((point) => point.intensity));
    const maxIntensity = Math.max(...data.map((point) => point.intensity));

    return data.map((point) => ({
        ...point,
        normalizedIntensity: ((point.intensity - minIntensity) / (maxIntensity - minIntensity)) * multiplier,
    }));
};

const HeatmapLayer = ({ data }) => {
    const map = useMap();

    useEffect(() => {
        const heatLayer = L.heatLayer(
            data.map((point) => [point.lat, point.lng, point.normalizedIntensity]),
            {
                radius: 70,
                blur: 50,
                maxZoom: 16,
                gradient: {
                    0.1: "blue",
                    0.3: "green",
                    0.5: "yellow",
                    0.7: "orange",
                    1.0: "red",
                },
            }
        );

        heatLayer.addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [data, map]);

    return null;
};

const MapaConLeaflet = ({ selectedPantalla, datosFiltrados }) => {
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Usar datosFiltrados en lugar de normalizedData
    const normalizedData = useMemo(() => {
        return normalizeIntensity(datosFiltrados, 3);
    }, [datosFiltrados]);

    useEffect(() => {
        if (selectedPantalla) {
            const pantalla = normalizedData.find((point) => point.name === selectedPantalla);
            setSelectedMarker(pantalla ? pantalla.id : null);
        }
    }, [selectedPantalla, normalizedData]);

    // Función para crear un icono dinámico usando MUI
    const createMuiMarkerIcon = (id) => {
        const div = document.createElement("div");
        const root = createRoot(div);
        root.render(
            <RoomIcon
                sx={{
                    fontSize: "40px",
                    color: selectedMarker === id ? "red" : "blue", // Rojo si está seleccionado, azul por defecto
                }}
            />
        );
        return new L.DivIcon({
            html: div,
            className: "custom-div-icon",
            iconSize: [40, 40],
            iconAnchor: [20, 40], // Ajustar el anclaje del icono (parte inferior)
            popupAnchor: [0, -45], // Mover el popup hacia arriba
        });
    };

    // URL de capas de mapa
    const darkModeUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    const lightModeUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    // Coordenadas del centro según la región
    const centrosPorRegion = {
        'Región Metropolitana': [-33.4489, -70.6693],
        'Valparaíso': [-33.0458, -71.6197],
        'Biobío': [-36.8270, -73.0498],
    };

    // Obtener el centro según la región de la primera pantalla filtrada
    const getCentroMapa = () => {
        if (normalizedData.length > 0) {
            const primeraPantalla = normalizedData[0];
            return [primeraPantalla.lat, primeraPantalla.lng];
        }
        return [-33.4489, -70.6693]; // Centro por defecto (Santiago)
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                borderRadius: "7px",
                padding: "16px", // Añadir padding alrededor del mapa
                paddingBottom: "30px",
                backgroundColor: "#2E2E30",
            }}
        >
            {/* Switch para cambiar entre modo oscuro y claro */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingBottom: "8px", // Separar el switch del mapa
                }}
            >
                <FormControlLabel
                    control={<Switch checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />}
                    label={
                        <Typography
                            sx={{
                                color: "white",
                                fontSize: "14px",
                            }}
                        >
                            Modo Oscuro
                        </Typography>
                    }
                />
            </Box>

            <MapContainer
                center={getCentroMapa()}
                zoom={12}
                style={{ width: "100%", height: "600px", borderRadius: "7px" }}
            >
                {/* Capa de estilo dinámico */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url={isDarkMode ? darkModeUrl : lightModeUrl}
                />

                {/* Capa de calor */}
                <HeatmapLayer data={normalizedData} />

                {/* Marcadores */}
                {normalizedData.map((point) => (
                    <Marker
                        key={point.id}
                        position={[point.lat, point.lng]}
                        icon={createMuiMarkerIcon(point.id)}
                        eventHandlers={{
                            click: () => setSelectedMarker(point.id),
                        }}
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{point.name}</h3>
                                <div style={{ marginBottom: '10px', borderBottom: '1px solid #ccc' }}>
                                    <strong>Información de Contacto:</strong>
                                </div>
                                <p style={{ margin: '5px 0' }}><strong>Responsable:</strong> {point.contacto?.responsable}</p>
                                <p style={{ margin: '5px 0' }}><strong>Cargo:</strong> {point.contacto?.cargo}</p>
                                <p style={{ margin: '5px 0' }}><strong>Email:</strong> {point.contacto?.email}</p>
                                <p style={{ margin: '5px 0' }}><strong>Teléfono:</strong> {point.contacto?.telefono}</p>
                                <p style={{ margin: '5px 0' }}><strong>Dirección:</strong> {point.contacto?.direccion}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </Box>
    );
};

export default MapaConLeaflet;
