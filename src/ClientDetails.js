// Importamos React y los hooks necesarios (agregamos useMemo)
import React, { useEffect, useState, useCallback, useMemo } from 'react';
// Importamos hooks de React Router para obtener parámetros de URL y navegación
import { useParams, Link } from 'react-router-dom';
// Importamos axios para peticiones HTTP
import axios from 'axios';
// Importamos los estilos específicos de este componente
import './ClientDetails.css';
// Importamos nuestro custom hook para objetos IPSO
import useIPSOObjects from './hooks/useIPSOObjects';
// Importamos el componente de control IPSO
import IPSOControl from './components/IPSOControl';
// Importamos los estilos del componente IPSOControl
import './components/IPSOControl.css';

// Componente optimizado con React.memo para evitar re-renderizados innecesarios
const ClientDetails = React.memo(() => {
  // Obtenemos el parámetro 'endpoint' de la URL (ej: /clients/raspberrypi)
  const { endpoint } = useParams();
  // Estado para almacenar los datos completos del cliente
  const [clientData, setClientData] = useState(null);
  // Estado para controlar si los datos están cargando
  const [loading, setLoading] = useState(true);
  // Estado para almacenar mensajes de error
  const [error, setError] = useState(null);
  // Estado para controlar el auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  // Estado para mostrar la hora de última actualización
  const [lastUpdate, setLastUpdate] = useState(null);
  // Estado para controlar qué objeto IPSO está seleccionado para control
  const [selectedIPSOObject, setSelectedIPSOObject] = useState(null);

  // Función asíncrona optimizada con useCallback para obtener los detalles específicos de un cliente
  // useCallback evita que esta función se re-cree en cada render
  const fetchClientDetails = useCallback(async () => {
    try {
      // Hacemos petición GET al endpoint específico del cliente usando su endpoint
      const response = await axios.get(`http://localhost:8080/api/clients/${endpoint}`);
      
      // Guardamos todos los datos del cliente en el estado
      setClientData(response.data);
      // Actualizamos la hora de última actualización
      setLastUpdate(new Date().toLocaleTimeString());
      // Cambiamos loading a false
      setLoading(false);
      // Limpiamos cualquier error previo
      setError(null);
    } catch (error) {
      // Si hay error, lo registramos en consola para debug
      console.error('Error fetching client details:', error);
      // Guardamos el mensaje de error para mostrarlo al usuario
      setError(`Error fetching client details: ${error.message || 'Unknown error'}`);
      // Cambiamos loading a false aunque haya error
      setLoading(false);
    }
  }, [endpoint]); // Solo se re-crea cuando cambia 'endpoint'

  // Hook useEffect que se ejecuta cuando cambia el endpoint
  useEffect(() => {
    // Cargamos los detalles del cliente cada vez que cambia el endpoint
    fetchClientDetails();
  }, [fetchClientDetails]); // Ahora depende de fetchClientDetails (que depende de endpoint)

  // Hook useEffect para auto-refresh cada 15 segundos (más frecuente que la lista)
  useEffect(() => {
    // Si auto-refresh está desactivado, no hacemos nada
    if (!autoRefresh) return;
    
    // Creamos intervalo que actualiza cada 15 segundos
    const interval = setInterval(() => {
      fetchClientDetails();
    }, 15000); // 15000 milisegundos = 15 segundos

    // Función de limpieza para evitar memory leaks
    return () => clearInterval(interval);
  }, [autoRefresh, fetchClientDetails]); // Dependencias: autoRefresh y fetchClientDetails

  // useMemo para optimizar cálculos costosos - solo se recalcula cuando cambian los datos
  const objectLinksCount = useMemo(() => {
    // Calculamos el número de object links disponibles
    return clientData?.objectLinks?.length || 0;
  }, [clientData]); // Solo se recalcula cuando cambia clientData

  // useMemo para formatear la fecha de registro de manera más legible
  const formattedRegistrationDate = useMemo(() => {
    if (!clientData?.registrationDate) return 'N/A';
    try {
      // Intentamos formatear la fecha de una manera más amigable
      const date = new Date(clientData.registrationDate);
      return date.toLocaleString();
    } catch (error) {
      // Si hay error en el formateo, devolvemos el valor original
      return clientData.registrationDate;
    }
  }, [clientData?.registrationDate]); // Solo se recalcula cuando cambia la fecha

  // 🎨 Hook personalizado para manejar objetos IPSO inteligentemente
  const ipsoData = useIPSOObjects(clientData?.objectLinks);

  // 🎯 Componente para renderizar un objeto IPSO bonito
  const IPSOObjectBadge = ({ obj }) => {
    // No renderizar objetos sin nombre válido
    if (!obj || !obj.name || obj.name === 'N/A' || obj.name.trim() === '') {
      return null;
    }
    
    return (
      <div 
        className="ipso-object-badge"
        data-category={obj.category}
        style={{ 
          backgroundColor: obj.color,
          borderLeft: `4px solid ${obj.color}` 
        }}
        title={`${obj.displayName || obj.name} - ${obj.unit} (ID: ${obj.id}) - Click to control`}
        onClick={() => setSelectedIPSOObject(selectedIPSOObject?.id === obj.id ? null : obj)}
      >
        <span className="ipso-icon">{obj.icon}</span>
        <div className="ipso-info">
          <span className="ipso-name">{obj.displayName || obj.name}</span>
          <span className="ipso-unit">{obj.unit}</span>
        </div>
        {!obj.isKnown && <span className="ipso-unknown" title="Unknown IPSO Object">?</span>}
        <span className="ipso-control-indicator">
          {selectedIPSOObject?.id === obj.id ? '🔽' : '⚙️'}
        </span>
      </div>
    );
  };

  // 🎯 Componente para mostrar capacidades del dispositivo
  const DeviceCapabilities = () => {
    if (ipsoData.totalCount === 0) return null;

    return (
      <div className="device-capabilities">
        <h4 className="capabilities-title">🤖 Device Capabilities</h4>
        <div className="capabilities-grid">
          {ipsoData.hasTemperature && (
            <div className="capability-item temperature">
              <span className="capability-icon">🌡️</span>
              <span className="capability-text">Temperature Monitoring</span>
            </div>
          )}
          {ipsoData.hasHumidity && (
            <div className="capability-item humidity">
              <span className="capability-icon">💧</span>
              <span className="capability-text">Humidity Sensing</span>
            </div>
          )}
          {ipsoData.hasGPS && (
            <div className="capability-item gps">
              <span className="capability-icon">📍</span>
              <span className="capability-text">GPS Tracking</span>
            </div>
          )}
          {ipsoData.hasBattery && (
            <div className="capability-item battery">
              <span className="capability-icon">🔋</span>
              <span className="capability-text">Battery Monitoring</span>
            </div>
          )}
          {ipsoData.actuatorCount > 0 && (
            <div className="capability-item actuator">
              <span className="capability-icon">🎛️</span>
              <span className="capability-text">{ipsoData.actuatorCount} Controllable Device{ipsoData.actuatorCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Si está cargando, mostramos mensaje de carga
  if (loading) return <div className="loading-message">Loading client details...</div>;
  // Si hay error, mostramos el mensaje de error
  if (error) return <div className="error-message">{error}</div>;

  // Retornamos el JSX del componente
  return (
    // Contenedor principal de los detalles del cliente
    <div className="client-details-container">
      {/* Botón para volver a la lista de clientes */}
      <Link to="/" className="back-button">
        ← Back to Client List
      </Link>
      
      {/* Header con título y controles */}
      <div className="details-header">
        {/* Título de la sección */}
        <h2 className="client-details-title">📱 Client Details</h2>
        {/* Contenedor de controles de actualización */}
        <div className="details-controls">
          {/* Botón de refresh manual */}
          <button 
            onClick={fetchClientDetails} // Actualiza datos al hacer click
            className="refresh-button-small"
            title="Manual refresh"
          >
            🔄
          </button>
          {/* Toggle para auto-refresh */}
          <label className="auto-refresh-toggle-small">
            <input
              type="checkbox"
              checked={autoRefresh} // Estado del checkbox
              onChange={(e) => setAutoRefresh(e.target.checked)} // Cambia estado
            />
            Auto-refresh
          </label>
          {/* Mostramos hora de última actualización si existe */}
          {lastUpdate && (
            <span className="last-update-small">
              Updated: {lastUpdate}
            </span>
          )}
        </div>
      </div>

      {/* Condicional: si tenemos datos del cliente, los mostramos */}
      {clientData ? (
        // Tarjeta con todos los detalles del cliente
        <div className="client-details-card">
          {/* Item de detalle: Endpoint - ELEGANTE */}
          <div className="client-detail-item client-endpoint-item">
            <span className="client-detail-label endpoint-label">🏷️ Endpoint:</span>
            <span className="client-detail-value endpoint-value">{clientData.endpoint}</span>
          </div>
          {/* Item de detalle: Registration ID - ELEGANTE */}
          <div className="client-detail-item client-registration-item">
            <span className="client-detail-label registration-label">🔑 Registration ID:</span>
            <span className="client-detail-value registration-value">{clientData.registrationId}</span>
          </div>
          {/* Item de detalle: Dirección IP - ELEGANTE VERSION */}
          <div className="client-detail-item client-address-item">
            <span className="client-detail-label address-label">🌐 Address:</span>
            <span className="client-detail-value address-value">{clientData.address}</span>
          </div>
          {/* Item de detalle: Fecha de registro - ELEGANTE */}
          <div className="client-detail-item client-date-item">
            <span className="client-detail-label date-label">📅 Registration Date:</span>
            <span className="client-detail-value date-value">{formattedRegistrationDate}</span>
          </div>
          {/* Item de detalle: Última actualización - ELEGANTE */}
          <div className="client-detail-item client-update-item">
            <span className="client-detail-label update-label">🔄 Last Update:</span>
            <span className="client-detail-value update-value">{clientData.lastUpdate}</span>
          </div>
          {/* Item de detalle: Tiempo de vida de la sesión - ELEGANTE */}
          <div className="client-detail-item client-lifetime-item">
            <span className="client-detail-label lifetime-label">⏱️ Lifetime:</span>
            <span className="client-detail-value lifetime-value">{clientData.lifetime} seconds</span>
          </div>
          {/* Item de detalle: Número SMS - ELEGANTE */}
          <div className="client-detail-item client-sms-item">
            <span className="client-detail-label sms-label">📱 SMS Number:</span>
            <span className="client-detail-value sms-value">{clientData.smsNumber || 'N/A'}</span>
          </div>
          {/* Item de detalle: Enlaces a objetos LwM2M mejorados */}
          <div className="client-detail-item">
            <span className="client-detail-label">🔗 IPSO Objects ({ipsoData.totalCount}):</span>
            
            {/* 📊 Resumen por categorías */}
            {ipsoData.totalCount > 0 && (
              <div className="ipso-summary">
                {ipsoData.sensorCount > 0 && (
                  <span className="category-badge environmental">
                    🌡️ {ipsoData.sensorCount} Sensor{ipsoData.sensorCount > 1 ? 's' : ''}
                  </span>
                )}
                {ipsoData.actuatorCount > 0 && (
                  <span className="category-badge actuator">
                    🎛️ {ipsoData.actuatorCount} Actuator{ipsoData.actuatorCount > 1 ? 's' : ''}
                  </span>
                )}
                {ipsoData.systemCount > 0 && (
                  <span className="category-badge system">
                    ⚙️ {ipsoData.systemCount} System
                  </span>
                )}
                {ipsoData.multimediaCount > 0 && (
                  <span className="category-badge multimedia">
                    🔊 {ipsoData.multimediaCount} Multimedia
                  </span>
                )}
                {ipsoData.locationCount > 0 && (
                  <span className="category-badge location">
                    📍 {ipsoData.locationCount} Location
                  </span>
                )}
                {ipsoData.powerCount > 0 && (
                  <span className="category-badge power">
                    🔋 {ipsoData.powerCount} Power
                  </span>
                )}
                {ipsoData.otherCount > 0 && (
                  <span className="category-badge other">
                    📦 {ipsoData.otherCount} Other
                  </span>
                )}
              </div>
            )}
            
            {/* 🎨 Lista bonita de objetos IPSO */}
            <div className="ipso-objects-container">
              {ipsoData.totalCount > 0 ? (
                ipsoData.availableObjects
                  .filter(obj => obj && obj.name && obj.name !== 'N/A' && obj.name.trim() !== '')
                  .map((obj, index) => (
                    <IPSOObjectBadge key={`${obj.id}-${obj.instanceId}-${index}`} obj={obj} />
                  ))
              ) : (
                <div className="no-objects-message">
                  <span className="no-objects-icon">📭</span>
                  <span className="no-objects-text">No IPSO objects detected</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 🎮 Control interactivo para objeto IPSO seleccionado */}
          {selectedIPSOObject && (
            <div className="ipso-interactive-control">
              <h3>🎛️ Interactive Control</h3>
              <IPSOControl 
                clientEndpoint={clientData.endpoint} 
                ipsoObject={selectedIPSOObject} 
              />
            </div>
          )}
          
          {/* 🤖 Capacidades del dispositivo */}
          <DeviceCapabilities />
        </div>
      ) : (
        // Mensaje cuando no hay datos disponibles
        <div className="no-data-message">No details available for this client.</div>
      )}
    </div>
  );
});

// Exportamos el componente ClientDetails como default para que pueda ser importado
export default ClientDetails;