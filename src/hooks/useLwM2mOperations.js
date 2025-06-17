// Custom hook para operaciones LwM2M desde el frontend
import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/clients';

export const useLwM2mOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  // Funcion para leer un recurso especifico
  const readResource = useCallback(async (endpoint, objectId, instanceId, resourceId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${endpoint}/read/${objectId}/${instanceId}/${resourceId}`,
        { timeout: 10000 }
      );
      
      // DEBUG: Vamos a ver qué está llegando exactamente
      console.log('Response completa:', response.data);
      console.log('Tipo de dato:', typeof response.data);
      
      // Extraer solo el valor del string LwM2mSingleResource
      let cleanValue = response.data;

      // Primero extraemos el valor del objeto respuesta
      if (cleanValue && typeof cleanValue === 'object' && cleanValue.value) {
        cleanValue = cleanValue.value; // Ahora cleanValue es el string "LwM2mSingleResource [id=0, value=1, type=INTEGER]"
      }

      // Ahora procesamos el string para extraer solo el valor numérico
      if (typeof cleanValue === 'string' && cleanValue.includes('value=')) {
        console.log('Encontré value= en el string');
        const match = cleanValue.match(/value=([^,\]]+)/);
        if (match) {
          console.log('Match encontrado:', match[1]);
          cleanValue = match[1].trim();
        }
      }

      console.log('Valor final limpio:', cleanValue);

      // Crear el objeto resultado con la estructura que espera IPSOControl
      const result = {
        value: cleanValue,  // Solo el valor limpio: 21.7
        timestamp: response.data.timestamp || new Date().toISOString()
      };

      setLastResult(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Funcion para escribir a un recurso especifico
  const writeResource = useCallback(async (endpoint, objectId, instanceId, resourceId, value) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${endpoint}/write/${objectId}/${instanceId}/${resourceId}`,
        { value },
        { 
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      setLastResult(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Funcion para ejecutar un recurso
  const executeResource = useCallback(async (endpoint, objectId, instanceId, resourceId, args = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${endpoint}/execute/${objectId}/${instanceId}/${resourceId}`,
        { arguments: args },
        { 
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      setLastResult(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Funcion para limpiar el estado
  const clearState = useCallback(() => {
    setError(null);
    setLastResult(null);
  }, []);

  return {
    loading,
    error,
    lastResult,
    readResource,
    writeResource,
    executeResource,
    clearState
  };
};

export default useLwM2mOperations;