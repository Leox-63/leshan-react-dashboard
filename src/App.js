// Importamos React y los hooks principales que vamos a usar
import React, { useEffect, useState } from 'react';
// Importamos axios para hacer peticiones HTTP al backend
import axios from 'axios';
// Importamos componentes de React Router para navegación entre páginas
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// Importamos los estilos CSS de la aplicación
import './App.css';
// Importamos el componente ClientDetails que creamos en otro archivo
import ClientDetails from './ClientDetails';

// Componente funcional que muestra la lista de clientes
function ClientsList() {
  // Estado para almacenar todos los clientes obtenidos del servidor
  const [clients, setClients] = useState([]);
  // Estado para almacenar los clientes filtrados por la búsqueda
  const [filteredClients, setFilteredClients] = useState([]);
  // Estado para el término de búsqueda actual
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para controlar si los datos están cargando
  const [loading, setLoading] = useState(true);
  // Estado para almacenar mensajes de error
  const [error, setError] = useState(null);
  // Estado para controlar si el auto-refresh está activado
  const [autoRefresh, setAutoRefresh] = useState(true);
  // Estado para mostrar la hora de la última actualización
  const [lastUpdate, setLastUpdate] = useState(null);

  // Función asíncrona para obtener la lista de clientes del servidor
  const fetchClients = async () => {
    try {
      // Hacemos petición GET al endpoint del backend
      const response = await axios.get('http://localhost:8080/api/clients');
      // Guardamos los datos recibidos en el estado de clientes
      setClients(response.data);
      // También actualizamos la lista filtrada con todos los clientes
      setFilteredClients(response.data);
      // Guardamos la hora actual como última actualización
      setLastUpdate(new Date().toLocaleTimeString());
      // Cambiamos el estado de loading a false
      setLoading(false);
      // Limpiamos cualquier error previo
      setError(null);
    } catch (error) {
      // Si hay error, lo mostramos en la consola para debug
      console.error('Error fetching clients:', error);
      // Guardamos el mensaje de error en el estado para mostrarlo al usuario
      setError(`Error fetching clients: ${error.message || 'Unknown error'}`);
      // Cambiamos loading a false aunque haya error
      setLoading(false);
    }
  };

  // Hook useEffect que se ejecuta una vez al montar el componente
  useEffect(() => {
    // Llamamos a fetchClients para cargar los datos inicialmente
    fetchClients();
  }, []); // Array vacío significa que solo se ejecuta una vez

  // Hook useEffect para el auto-refresh cada 30 segundos
  useEffect(() => {
    // Si el auto-refresh está desactivado, no hacemos nada
    if (!autoRefresh) return;
    
    // Creamos un intervalo que ejecuta fetchClients cada 30 segundos
    const interval = setInterval(() => {
      fetchClients();
    }, 30000); // 30000 milisegundos = 30 segundos

    // Función de limpieza que se ejecuta cuando el componente se desmonta
    // o cuando cambia el valor de autoRefresh
    return () => clearInterval(interval);
  }, [autoRefresh]); // Se ejecuta cuando cambia autoRefresh

  // Hook useEffect para filtrar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    // Filtramos los clientes que contengan el término de búsqueda (ignorando mayúsculas)
    const filtered = clients.filter(client => 
      client.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Actualizamos la lista de clientes filtrados
    setFilteredClients(filtered);
  }, [clients, searchTerm]); // Se ejecuta cuando cambian clients o searchTerm

  // Función que maneja los cambios en el campo de búsqueda
  const handleSearchChange = (e) => {
    // Actualizamos el término de búsqueda con el valor del input
    setSearchTerm(e.target.value);
  };

  // Retornamos el JSX que define cómo se ve el componente
  return (
    // Contenedor principal de la lista de clientes
    <div className="clients-list-container">
      {/* Mostramos spinner de carga mientras loading es true */}
      {loading && <div className="loading-spinner">Loading clients...</div>}
      {/* Mostramos mensaje de error si existe */}
      {error && <div className="error-alert">{error}</div>}
      {/* Solo mostramos el contenido si no hay loading ni error */}
      {!loading && !error && (
        <>
          {/* Contenedor de controles (búsqueda y refresh) */}
          <div className="controls-container">
            {/* Contenedor del campo de búsqueda */}
            <div className="search-container">
              {/* Input para buscar clientes */}
              <input
                type="text"
                placeholder="🔍 Search clients..."
                value={searchTerm} // Valor controlado por el estado
                onChange={handleSearchChange} // Función que maneja cambios
                className="search-input"
              />
            </div>
            {/* Contenedor de controles de actualización */}
            <div className="refresh-controls">
              {/* Botón para actualización manual */}
              <button 
                onClick={fetchClients} // Llama a fetchClients al hacer click
                className="refresh-button"
                title="Manual refresh"
              >
                🔄 Refresh
              </button>
              {/* Toggle para activar/desactivar auto-refresh */}
              <label className="auto-refresh-toggle">
                <input
                  type="checkbox"
                  checked={autoRefresh} // Estado del checkbox
                  onChange={(e) => setAutoRefresh(e.target.checked)} // Actualiza estado
                />
                Auto-refresh (30s)
              </label>
              {/* Mostramos la hora de última actualización si existe */}
              {lastUpdate && (
                <span className="last-update">
                  Last update: {lastUpdate}
                </span>
              )}
            </div>
          </div>
          {/* Texto que muestra cuántos clientes se están mostrando */}
          <p className="instruction-text">
            {filteredClients.length > 0 
              ? `Showing ${filteredClients.length} client${filteredClients.length === 1 ? '' : 's'}` 
              : 'No clients match your search'
            }
          </p>
          {/* Condicional para mostrar clientes o mensaje de "no hay clientes" */}
          {filteredClients.length > 0 ? (
            // Grid que contiene las tarjetas de clientes
            <div className="clients-grid">
              {/* Mapeamos cada cliente a una tarjeta clickeable */}
              {filteredClients.map(client => (
                // Link de React Router para navegar a los detalles del cliente
                <Link 
                  key={client.endpoint} // Key única para React
                  to={`/clients/${client.endpoint}`} // URL de destino
                  className="client-card"
                >
                  {/* Nombre del endpoint del cliente */}
                  <h3 className="client-endpoint">{client.endpoint}</h3>
                  {/* Estado del cliente (siempre "Online" por ahora) */}
                  <p className="client-status">● Online</p>
                </Link>
              ))}
            </div>
          ) : (
            // Mensaje cuando no hay clientes para mostrar
            <div className="no-clients-message">
              {searchTerm ? 'No clients match your search.' : 'No clients connected.'}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Componente principal de la aplicación
function App() {
  // Estado para controlar el tema oscuro/claro - INICIAMOS EN MODO OSCURO
  const [darkMode, setDarkMode] = useState(true);

  // Función para alternar entre tema oscuro y claro
  const toggleTheme = () => {
    setDarkMode(!darkMode); // Cambia el estado al opuesto
  };

  // Retornamos el JSX principal de la aplicación
  return (
    // Router de React Router que maneja toda la navegación
    <Router>
      {/* Contenedor principal con clase condicional para el tema */}
      <div className={`App ${darkMode ? 'dark-theme' : 'light-theme'}`}>
        {/* Header con título y botón de cambio de tema */}
        <header className="app-header">
          {/* Título principal de la aplicación */}
          <h1 className="main-title">Leshan Dashboard</h1>
          {/* Botón para cambiar entre tema oscuro y claro */}
          <button onClick={toggleTheme} className="theme-toggle">
            {/* Texto del botón cambia según el tema actual */}
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </header>
        {/* Definición de rutas de la aplicación */}
        <Routes>
          {/* Ruta principal muestra la lista de clientes */}
          <Route path="/" element={<ClientsList />} />
          {/* Ruta dinámica para mostrar detalles de un cliente específico */}
          <Route path="/clients/:endpoint" element={<ClientDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

// Exportamos el componente App como default para que pueda ser importado
export default App;
