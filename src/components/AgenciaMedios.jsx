import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Typography, Box, Paper, Grid, Divider, MenuItem, FormControl, Select } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MapaDeCalor from './MapaDeCalor';
import { getResumen, getResumenesPorPantalla } from '../services/ResumenService';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const AgenciaMedios = () => {
    const theme = useTheme();

    // Estados para los valores seleccionados en los filtros
    const [genero, setGenero] = useState('');
    const [rangoEtario, setRangoEtario] = useState('');
    const [raza, setRaza] = useState('');
    const [emocion, setEmocion] = useState('');
    const [region, setRegion] = useState('');
    const [pantalla, setPantalla] = useState('');

    // Agregar estado para el websocket
    const [stompClient, setStompClient] = useState(null);

    // Estado para almacenar los datos del resumen en tiempo real
    const [resumenData, setResumenData] = useState(null);

    // Datos simulados para la pantalla seleccionada con IDs correspondientes
    const [datosPantallas, setDatosPantallas] = useState({
        'Departamento de Informática': {
            id: '1',
            nombre: 'Departamento de Informática',
            lat: -33.44975204493245,
            lng: -70.68728969259477,
            genero: 'Masculino (56%)',
            rangoEtario: '25-34 años (34%)',
            raza: 'Caucásico (70%)',
            emocion: 'Feliz (45%)',
            volumen: '34200',
            contacto: {
                responsable: 'Dr. Juan Vásquez',
                cargo: 'Director del Departamento',
                email: 'juan.vasquez.g@usach.cl',
                telefono: '+56 2 2718 0000',
                direccion: 'Avenida Ecuador 3659, Estación Central'
            }
        },
        'Metro Ñuñoa': {
            id: '2',
            nombre: 'Metro Ñuñoa',
            lat: -33.4569,
            lng: -70.6483,
            genero: 'Femenino (60%)',
            rangoEtario: '18-24 años (40%)',
            raza: 'Afrodescendiente (50%)',
            emocion: 'Neutral (50%)',
            volumen: '15000',
            contacto: {
                responsable: 'María González',
                cargo: 'Coordinadora de Publicidad',
                email: 'maria.gonzalez@metro.cl',
                telefono: '+56 2 2937 0000',
                direccion: 'Av. Irarrázaval 3666, Ñuñoa'
            }
        },
        'Maipú': {
            id: '3',
            nombre: 'Maipú',
            lat: -33.5018,
            lng: -70.7574,
            genero: 'Desconocido (50%)',
            rangoEtario: '35-44 años (40%)',
            raza: 'Otro (60%)',
            emocion: 'Enojado (30%)',
            volumen: '10000',
        },
        'Viña del Mar': {
            id: '4',
            nombre: 'Viña del Mar',
            lat: -33.0153,
            lng: -71.5517,
            genero: 'Masculino (45%)',
            rangoEtario: '25-34 años (38%)',
            raza: 'Caucásico (65%)',
            emocion: 'Feliz (40%)',
            volumen: '25000',
        },
        'Quilpué': {
            id: '5',
            nombre: 'Quilpué',
            lat: -33.0472,
            lng: -71.4444,
            genero: 'Femenino (52%)',
            rangoEtario: '35-44 años (42%)',
            raza: 'Caucásico (58%)',
            emocion: 'Neutral (45%)',
            volumen: '12000',
        },
        'Valparaíso Centro': {
            id: '6',
            nombre: 'Valparaíso Centro',
            lat: -33.0472,
            lng: -71.6127,
            genero: 'Masculino (48%)',
            rangoEtario: '25-34 años (36%)',
            raza: 'Caucásico (62%)',
            emocion: 'Feliz (38%)',
            volumen: '30000',
        },
        'Concepción Centro': {
            id: '7',
            nombre: 'Concepción Centro',
            lat: -36.8270,
            lng: -73.0498,
            genero: 'Femenino (51%)',
            rangoEtario: '18-24 años (45%)',
            raza: 'Caucásico (70%)',
            emocion: 'Feliz (42%)',
            volumen: '28000',
        },
        'Talcahuano': {
            id: '8',
            nombre: 'Talcahuano',
            lat: -36.7249,
            lng: -73.1169,
            genero: 'Masculino (54%)',
            rangoEtario: '35-44 años (38%)',
            raza: 'Caucásico (65%)',
            emocion: 'Neutral (40%)',
            volumen: '18000',
        },
        'Chiguayante': {
            id: '9',
            nombre: 'Chiguayante',
            lat: -36.9259,
            lng: -73.0285,
            genero: 'Femenino (53%)',
            rangoEtario: '25-34 años (40%)',
            raza: 'Caucásico (68%)',
            emocion: 'Feliz (45%)',
            volumen: '15000',
        },
    });

    // Estado para los datos filtrados del mapa
    const [datosFiltrados, setDatosFiltrados] = useState([]);

    // Mapeo de valores del backend a valores de UI
    const mapeoGenero = {
        'Man': 'MASCULINO',
        'Woman': 'FEMENINO',
        'Unknown': 'DESCONOCIDO'
    };

    const mapeoRaza = {
        'white': 'CAUCASICO',
        'black': 'AFRODESCENDIENTE',
        'asian': 'ASIATICO',
        'indian': 'ASIATICO',
        'middle eastern': 'OTRO',
        'latino hispanic': 'OTRO'
    };

    const mapeoEmocion = {
        'happy': 'FELIZ',
        'sad': 'TRISTE',
        'angry': 'ENOJADO',
        'surprise': 'SORPRENDIDO',
        'neutral': 'NEUTRAL',
        'fear': 'NEUTRAL',
        'disgust': 'ENOJADO'
    };

    // Mover esta declaración junto con las otras opciones al inicio
    const opcionesRegion = ['Región Metropolitana', 'Valparaíso', 'Biobío'];
    
    // Opciones para los filtros (valores que mostramos en la UI)
    const opcionesGenero = ['MASCULINO', 'FEMENINO', 'DESCONOCIDO'];
    const opcionesRangoEtario = ['18-24', '25-34', '35-44', '45+'];
    const opcionesRaza = ['CAUCASICO', 'AFRODESCENDIENTE', 'ASIATICO', 'OTRO'];
    const opcionesEmocion = ['FELIZ', 'TRISTE', 'ENOJADO', 'SORPRENDIDO', 'NEUTRAL'];

    // Agregar estado para almacenar histórico de resúmenes
    const [historicoPantalla, setHistoricoPantalla] = useState([]);

    // Función para calcular estadísticas agregadas
    const calcularEstadisticasAgregadas = (resumenes) => {
        const estadisticasAgregadas = resumenes.reduce((acc, resumen) => {
            const personas = resumen.personas || [];
            
            personas.forEach(persona => {
                const generoMapeado = mapeoGenero[persona.genero_predominante] || 'DESCONOCIDO';
                const razaMapeada = mapeoRaza[persona.raza_predominante.toLowerCase()] || 'OTRO';
                const emocionMapeada = mapeoEmocion[persona.emocion_predominante.toLowerCase()] || 'NEUTRAL';

                acc.generos[generoMapeado] = (acc.generos[generoMapeado] || 0) + 1;
                acc.emociones[emocionMapeada] = (acc.emociones[emocionMapeada] || 0) + 1;
                acc.razas[razaMapeada] = (acc.razas[razaMapeada] || 0) + 1;
                acc.edades.push(persona.edad_promedio);
                acc.totalPersonas += 1;
            });

            return acc;
        }, { generos: {}, emociones: {}, razas: {}, edades: [], totalPersonas: 0 });

        return estadisticasAgregadas;
    };

    // Efecto para cargar histórico cuando se selecciona una pantalla
    useEffect(() => {
        if (pantalla) {
            const pantallaSeleccionada = datosPantallas[pantalla];
            if (pantallaSeleccionada) {
                getResumenesPorPantalla(pantallaSeleccionada.id)
                    .then(resumenes => {
                        setHistoricoPantalla(resumenes);
                        
                        // Calcular estadísticas agregadas
                        const estadisticas = calcularEstadisticasAgregadas(resumenes);
                        
                        // Calcular promedios y valores predominantes
                        const edadPromedio = estadisticas.edades.reduce((a, b) => a + b, 0) / estadisticas.edades.length;
                        const rangoEtario = obtenerRangoEtario(edadPromedio);
                        
                        // Actualizar datos de la pantalla
                        const nuevosDatos = {
                            ...pantallaSeleccionada,
                            volumen: `${estadisticas.totalPersonas}`,
                            genero: `${formatearTexto(obtenerPredominante(estadisticas.generos))}`,
                            emocion: `${formatearTexto(obtenerPredominante(estadisticas.emociones))}`,
                            raza: `${formatearTexto(obtenerPredominante(estadisticas.razas))}`,
                            rangoEtario: `${formatearTexto(rangoEtario, 'rangoEtario')}`
                        };

                        setDatosPantallas(prevDatos => ({
                            ...prevDatos,
                            [pantalla]: nuevosDatos
                        }));
                    })
                    .catch(error => {
                        console.error('Error al obtener histórico:', error);
                    });
            }
        }
    }, [pantalla]);

    // Modificar el efecto del websocket para actualizar también el histórico
    useEffect(() => {
        if (resumenData && pantalla) {
            const pantallaSeleccionada = datosPantallas[pantalla];
            if (pantallaSeleccionada && resumenData.id_pantalla === pantallaSeleccionada.id) {
                setHistoricoPantalla(prev => [...prev, resumenData]);
            }
        }
    }, [resumenData, pantalla]);

    useEffect(() => {
        // Cargar datos iniciales
        getResumen().then((data) => {
            console.log('Datos iniciales:', data);
            setResumenData(data);
        }).catch(error => {
            console.error('Error al obtener datos iniciales:', error);
        });

        // Conectar al WebSocket
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log('Conectado al WebSocket');
            
            client.subscribe('/topic/resumen', (mensaje) => {
                try {
                    const nuevoResumen = JSON.parse(mensaje.body);
                    console.log('Nuevo resumen recibido:', nuevoResumen);
                    setResumenData(nuevoResumen);
                } catch (error) {
                    console.error('Error al procesar mensaje del websocket:', error);
                }
            });
        }, (error) => {
            console.error('Error de conexión WebSocket:', error);
        });

        setStompClient(client);

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, []);

    // Efecto para aplicar filtros
    useEffect(() => {
        let datosFiltrados = Object.entries(datosPantallas).map(([nombre, datos]) => ({
            id: datos.id,
            lat: datos.lat,
            lng: datos.lng,
            intensity: parseInt(datos.volumen),
            name: nombre,
            info: `Volumen de Personas: ${datos.volumen}`,
            contacto: datos.contacto,
            genero: datos.genero,
            rangoEtario: datos.rangoEtario,
            raza: datos.raza,
            emocion: datos.emocion
        }));

        // Aplicar filtros usando el formato correcto
        if (genero) {
            datosFiltrados = datosFiltrados.filter(dato => 
                dato.genero.toUpperCase().includes(genero)
            );
        }
        if (rangoEtario) {
            datosFiltrados = datosFiltrados.filter(dato => 
                dato.rangoEtario.includes(rangoEtario)
            );
        }
        if (raza) {
            datosFiltrados = datosFiltrados.filter(dato => 
                dato.raza.toUpperCase().includes(raza)
            );
        }
        if (emocion) {
            datosFiltrados = datosFiltrados.filter(dato => 
                dato.emocion.toUpperCase().includes(emocion)
            );
        }
        if (region) {
            datosFiltrados = datosFiltrados.filter(dato => 
                opcionesPantallas[region].includes(dato.name)
            );
        }

        setDatosFiltrados(datosFiltrados);
    }, [genero, rangoEtario, raza, emocion, region, datosPantallas]);

    // Efecto para actualizar los datos cuando cambie resumenData
    useEffect(() => {
        if (resumenData) {
            console.log('Datos del resumen recibidos:', resumenData);
            
            // Validar que tengamos un ID de pantalla
            if (!resumenData.id_pantalla) {
                console.warn('Resumen sin ID de pantalla:', resumenData);
                return;
            }

            const idPantalla = String(resumenData.id_pantalla);
            console.log('Buscando pantalla con ID:', idPantalla);

            // Imprimir todas las pantallas y sus IDs para depuración
            Object.entries(datosPantallas).forEach(([nombre, datos]) => {
                console.log(`Pantalla ${nombre} tiene ID: ${datos.id}`);
            });

            // Buscar la pantalla que coincida con el ID
            const pantallaEncontrada = Object.entries(datosPantallas).find(
                ([nombre, datos]) => {
                    const coincide = datos.id === idPantalla;
                    console.log(`Comparando ${datos.id} con ${idPantalla}: ${coincide}`);
                    return coincide;
                }
            );

            if (!pantallaEncontrada) {
                console.warn(`No se encontró ninguna pantalla con ID ${idPantalla}`);
                return;
            }

            const [nombrePantalla, datosPantallaActual] = pantallaEncontrada;
            console.log('Pantalla encontrada:', nombrePantalla);

            // Procesar los datos del resumen
            const personas = resumenData.personas || [];
            
            const estadisticas = personas.reduce((acc, persona) => {
                const generoMapeado = mapeoGenero[persona.genero_predominante] || 'DESCONOCIDO';
                const razaMapeada = mapeoRaza[persona.raza_predominante.toLowerCase()] || 'OTRO';
                const emocionMapeada = mapeoEmocion[persona.emocion_predominante.toLowerCase()] || 'NEUTRAL';

                acc.generos[generoMapeado] = (acc.generos[generoMapeado] || 0) + 1;
                acc.emociones[emocionMapeada] = (acc.emociones[emocionMapeada] || 0) + 1;
                acc.razas[razaMapeada] = (acc.razas[razaMapeada] || 0) + 1;
                acc.edades.push(persona.edad_promedio);
                return acc;
            }, { generos: {}, emociones: {}, razas: {}, edades: [] });

            const edadPromedio = estadisticas.edades.reduce((a, b) => a + b, 0) / estadisticas.edades.length;
            const rangoEtario = obtenerRangoEtario(edadPromedio);

            // Crear los nuevos datos
            const nuevosDatos = {
                ...datosPantallaActual,
                lat: datosPantallaActual.lat,
                lng: datosPantallaActual.lng,
                id: datosPantallaActual.id,
                nombre: datosPantallaActual.nombre,
                volumen: `${resumenData.total_personas}`,
                genero: `${formatearTexto(obtenerPredominante(estadisticas.generos))}`,
                emocion: `${formatearTexto(obtenerPredominante(estadisticas.emociones))}`,
                raza: `${formatearTexto(obtenerPredominante(estadisticas.razas))}`,
                rangoEtario: `${formatearTexto(rangoEtario, 'rangoEtario')}`
            };

            console.log('Actualizando pantalla con nuevos datos:', nuevosDatos);

            // Actualizar el estado
            setDatosPantallas(prevDatos => {
                const nuevoEstado = {
                    ...prevDatos,
                    [nombrePantalla]: nuevosDatos
                };
                console.log('Nuevo estado de datosPantallas:', nuevoEstado);
                return nuevoEstado;
            });
        }
    }, [resumenData]);

    // Función para obtener el rango etario
    const obtenerRangoEtario = (edad) => {
        if (edad < 25) return '18-24';
        if (edad < 35) return '25-34';
        if (edad < 45) return '35-44';
        return '45+';
    };

    // Función auxiliar para obtener el valor predominante
    const obtenerPredominante = (datos) => {
        const total = Object.values(datos).reduce((a, b) => a + b, 0);
        const predominante = Object.entries(datos)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (predominante) {
            const [tipo, cantidad] = predominante;
            const porcentaje = Math.round((cantidad / total) * 100);
            return `${tipo} (${porcentaje}%)`;
        }
        return 'No hay datos';
    };

    // Función para formatear el texto mostrado
    const formatearTexto = (texto, tipo) => {
        // Convertir MAYUSCULAS a Formato Título
        const formatoTitulo = texto.charAt(0) + texto.slice(1).toLowerCase();
        
        if (tipo === 'rangoEtario') {
            return `${texto} años`;
        }
        return formatoTitulo;
    };

    // Opciones de pantallas según la región seleccionada
    const opcionesPantallas = {
        'Región Metropolitana': ['Departamento de Informática', 'Metro Ñuñoa', 'Maipú'],
        'Valparaíso': ['Viña del Mar', 'Quilpué', 'Valparaíso Centro'],
        'Biobío': ['Concepción Centro', 'Talcahuano', 'Chiguayante'],
    };

    useEffect(() => {
        if (pantalla) {
            const pantallaSeleccionada = datosPantallas[pantalla];
            console.log(pantallaSeleccionada);
        }
    }, [pantalla]);

    // Función para formatear la fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return 'No disponible';
        try {
            return new Date(fecha).toLocaleTimeString();
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    };

    return (
        <>
            <Navbar />
            <Box sx={{ padding: 2, backgroundColor: theme.palette.background.default, height: "100vh", overflow: "auto" }}>
                <Grid container spacing={2}>
                    {/* Columna Izquierda */}
                    <Grid item xs={3}>
                        <Paper sx={{ padding: 2, backgroundColor: theme.palette.background.paper, color: "#CAFFFF", height: "100%" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                                Seleccionar Filtros
                            </Typography>
                            {/* Dropdowns para los filtros */}
                            <Box sx={{ marginBottom: 3 }}>
                                <Typography variant="body1" sx={{ marginBottom: 1 }}>Género</Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={genero}
                                        onChange={(e) => setGenero(e.target.value)}
                                        displayEmpty
                                        sx={{
                                            backgroundColor: theme.palette.background.paper2,
                                            borderRadius: "20px",
                                            color: theme.palette.text.secondary,
                                            "& .MuiSelect-icon": { color: theme.palette.text.secondary },
                                            "&:hover": {
                                                backgroundColor: "#4A4A4C",
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Ninguno</MenuItem>
                                        {opcionesGenero.map((opcion) => (
                                            <MenuItem key={opcion} value={opcion}>
                                                {opcion}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ marginBottom: 3 }}>
                                <Typography variant="body1" sx={{ marginBottom: 1 }}>Rango Etario</Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={rangoEtario}
                                        onChange={(e) => setRangoEtario(e.target.value)}
                                        displayEmpty
                                        sx={{
                                            backgroundColor: theme.palette.background.paper2,
                                            borderRadius: "20px",
                                            color: theme.palette.text.secondary,
                                            "& .MuiSelect-icon": { color: theme.palette.text.secondary },
                                            "&:hover": {
                                                backgroundColor: "#4A4A4C",
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Ninguno</MenuItem>
                                        {opcionesRangoEtario.map((opcion) => (
                                            <MenuItem key={opcion} value={opcion}>
                                                {opcion}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ marginBottom: 3 }}>
                                <Typography variant="body1" sx={{ marginBottom: 1 }}>Raza</Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={raza}
                                        onChange={(e) => setRaza(e.target.value)}
                                        displayEmpty
                                        sx={{
                                            backgroundColor: theme.palette.background.paper2,
                                            borderRadius: "20px",
                                            color: theme.palette.text.secondary,
                                            "& .MuiSelect-icon": { color: theme.palette.text.secondary },
                                            "&:hover": {
                                                backgroundColor: "#4A4A4C",
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Ninguno</MenuItem>
                                        {opcionesRaza.map((opcion) => (
                                            <MenuItem key={opcion} value={opcion}>
                                                {opcion}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ marginBottom: 3 }}>
                                <Typography variant="body1" sx={{ marginBottom: 1 }}>Emoción Predominante</Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={emocion}
                                        onChange={(e) => setEmocion(e.target.value)}
                                        displayEmpty
                                        sx={{
                                            backgroundColor: theme.palette.background.paper2,
                                            borderRadius: "20px",
                                            color: theme.palette.text.secondary,
                                            "& .MuiSelect-icon": { color: theme.palette.text.secondary },
                                            "&:hover": {
                                                backgroundColor: "#4A4A4C",
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Ninguno</MenuItem>
                                        {opcionesEmocion.map((opcion) => (
                                            <MenuItem key={opcion} value={opcion}>
                                                {opcion}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Columna Central */}
                    <Grid item xs={6}>
                        <Paper sx={{ padding: 2, backgroundColor: "#2E2E30", height: "100%", color: "#CAFFFF" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                                Mapa de Calor
                            </Typography>
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "92%",
                                    borderRadius: "7px",
                                    overflow: "hidden", // Esto asegura que el mapa no se salga
                                }}
                            >
                                <MapaDeCalor 
                                    selectedPantalla={pantalla}
                                    datosFiltrados={datosFiltrados}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Columna Derecha */}
                    <Grid item xs={3}>
                        <Paper sx={{ padding: 2, backgroundColor: "#2E2E30", color: "#CAFFFF", height: "100%", overflowY: "auto" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                                Regiones Disponibles
                            </Typography>
                            <Box sx={{ marginBottom: 3 }}>
                                <FormControl fullWidth>
                                    <Select
                                        value={region}
                                        onChange={(e) => {
                                            setRegion(e.target.value);
                                            setPantalla(''); // Reiniciar la pantalla seleccionada
                                        }}
                                        displayEmpty
                                        sx={{
                                            backgroundColor: theme.palette.background.paper2,
                                            borderRadius: "20px",
                                            color: theme.palette.text.secondary,
                                            "& .MuiSelect-icon": { color: theme.palette.text.secondary },
                                            "&:hover": {
                                                backgroundColor: "#4A4A4C",
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Ninguna</MenuItem>
                                        {opcionesRegion.map((opcion) => (
                                            <MenuItem key={opcion} value={opcion}>
                                                {opcion}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                                Pantallas Disponibles
                            </Typography>
                            <Box sx={{ marginBottom: 3 }}>
                                <FormControl fullWidth>
                                    <Select
                                        value={pantalla}
                                        onChange={(e) => setPantalla(e.target.value)}
                                        displayEmpty
                                        disabled={!region} // Deshabilitar si no hay región seleccionada
                                        sx={{
                                            backgroundColor: theme.palette.background.paper2,
                                            borderRadius: "20px",
                                            color: theme.palette.text.secondary,
                                            "& .MuiSelect-icon": { color: theme.palette.text.secondary },
                                            "&:hover": {
                                                backgroundColor: "#4A4A4C",
                                            },
                                        }}
                                    >
                                        <MenuItem value="">Ninguna</MenuItem>
                                        {region &&
                                            opcionesPantallas[region]?.map((opcion) => (
                                                <MenuItem key={opcion} value={opcion}>
                                                    {opcion}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Detalles de la Pantalla */}
                <Box sx={{ marginTop: 2 }}>
                    <Paper sx={{ padding: 2, backgroundColor: "#2E2E30", color: "#CAFFFF" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                            Detalles de la Pantalla Seleccionada: {pantalla || 'Ninguna'}
                        </Typography>
                        <Divider sx={{ marginBottom: 2, backgroundColor: "#AAAAAA" }} />
                        {pantalla && datosPantallas[pantalla] ? (
                            <>
                                <Typography variant="body2">
                                    Volumen de Personas: <strong>{datosPantallas[pantalla].volumen}</strong>
                                </Typography>
                                <Typography variant="body2">
                                    Género: <strong>{datosPantallas[pantalla].genero}</strong>
                                </Typography>
                                <Typography variant="body2">
                                    Rango Etario: <strong>{datosPantallas[pantalla].rangoEtario}</strong>
                                </Typography>
                                <Typography variant="body2">
                                    Raza: <strong>{datosPantallas[pantalla].raza}</strong>
                                </Typography>
                                <Typography variant="body2">
                                    Emoción Predominante: <strong>{datosPantallas[pantalla].emocion}</strong>
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="body2">Seleccione una pantalla para ver detalles.</Typography>
                        )}
                    </Paper>
                </Box>

                {/* Agregar un indicador de actualización en tiempo real */}
                {resumenData && (
                    <Paper sx={{ 
                        padding: 1, 
                        backgroundColor: theme.palette.success.main,
                        color: "white",
                        position: "fixed",
                        bottom: 20,
                        right: 20,
                        zIndex: 1000
                    }}>
                        <Typography variant="body2">
                            Última actualización: {formatearFecha(resumenData.fecha)}
                        </Typography>
                    </Paper>
                )}
            </Box>
        </>
    );
};

export default AgenciaMedios;
