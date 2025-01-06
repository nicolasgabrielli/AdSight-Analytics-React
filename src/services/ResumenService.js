import axios from 'axios';

const baseUrl = 'http://localhost:8080/api';

// get resumen actual
export const getResumen = async () => {
    try {
        const response = await axios.get(`${baseUrl}/resumen`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        throw error;
    }
}

// get todos los resúmenes de una pantalla
export const getResumenesPorPantalla = async (idPantalla) => {
    try {
        const response = await axios.get(`${baseUrl}/resumen/pantalla/${idPantalla}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener resúmenes de la pantalla:', error);
        throw error;
    }
}

// Opcional: Agregar método para crear resumen (para pruebas)
export const createResumen = async (resumenData) => {
    try {
        const response = await axios.post(`${baseUrl}/resumen`, resumenData);
        return response.data;
    } catch (error) {
        console.error('Error al crear resumen:', error);
        throw error;
    }
}

