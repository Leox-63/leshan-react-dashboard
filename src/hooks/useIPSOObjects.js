// 🎨 Custom hook para manejar objetos IPSO de manera inteligente
import { useMemo } from 'react';

// 📚 Diccionario completo de objetos IPSO estándar
const IPSO_OBJECTS_REGISTRY = {
  // 🌡️ Sensores ambientales
  3303: { 
    name: "Temperature Sensor", 
    icon: "🌡️", 
    color: "#ff4757",
    category: "Environmental",
    unit: "°C"
  },
  3304: { 
    name: "Humidity Sensor", 
    icon: "💧", 
    color: "#3742fa",
    category: "Environmental", 
    unit: "%RH"
  },
  3323: { 
    name: "Pressure Sensor", 
    icon: "🌬️", 
    color: "#5f27cd",
    category: "Environmental",
    unit: "Pa"
  },
  
  // 💡 Actuadores
  3311: { 
    name: "Light Control", 
    icon: "💡", 
    color: "#ffa502",
    category: "Actuator",
    unit: "On/Off"
  },
  3312: { 
    name: "Power Control", 
    icon: "🔌", 
    color: "#ff6b6b",
    category: "Actuator",
    unit: "On/Off"
  },
  
  // 🌍 Navegación
  3336: { 
    name: "GPS Location", 
    icon: "📍", 
    color: "#10ac84",
    category: "Location",
    unit: "Coordinates"
  },
  
  // 🔋 Energía
  3322: { 
    name: "Battery Level", 
    icon: "🔋", 
    color: "#2ed573",
    category: "Power",
    unit: "%"
  },
  
  // 🔧 Sistema
  3: { 
    name: "Device Object", 
    icon: "⚙️", 
    color: "#747d8c",
    category: "System",
    unit: "Info"
  },
  1: { 
    name: "Server Object", 
    icon: "🖥️", 
    color: "#57606f",
    category: "System",
    unit: "Config"
  },
  0: { 
    name: "Security Object", 
    icon: "🔒", 
    color: "#2f3542",
    category: "System",
    unit: "Security"
  }
};

// 🎨 Custom hook principal
export const useIPSOObjects = (objectLinks) => {
  // 🔍 useMemo para optimizar el parsing de objetos
  const parsedObjects = useMemo(() => {
    if (!objectLinks || !Array.isArray(objectLinks)) {
      return {
        availableObjects: [],
        objectsByCategory: {},
        totalCount: 0,
        hasTemperature: false,
        hasHumidity: false,
        hasGPS: false,
        hasBattery: false
      };
    }

    // 📊 Parseamos cada object link
    const availableObjects = objectLinks
      .map(link => {
        // Extraemos el ID del objeto desde el link (ej: "/3303/0" -> 3303)
        const match = link.match(/^\/(\d+)(?:\/(\d+))?/);
        if (!match) return null;

        const objectId = parseInt(match[1]);
        const instanceId = match[2] ? parseInt(match[2]) : 0;
        
        // Buscamos la información del objeto en nuestro registro
        const objectInfo = IPSO_OBJECTS_REGISTRY[objectId];
        if (!objectInfo) {
          // Si no conocemos el objeto, creamos info básica
          return {
            id: objectId,
            instanceId,
            link,
            name: `Unknown Object ${objectId}`,
            icon: "❓",
            color: "#95a5a6",
            category: "Unknown",
            unit: "N/A",
            isKnown: false
          };
        }

        return {
          id: objectId,
          instanceId,
          link,
          name: objectInfo.name,
          icon: objectInfo.icon,
          color: objectInfo.color,
          category: objectInfo.category,
          unit: objectInfo.unit,
          isKnown: true,
          displayName: `${objectInfo.name}${instanceId > 0 ? ` #${instanceId}` : ''}`
        };
      })
      .filter(Boolean); // Removemos nulls

    // 📂 Agrupamos por categoría
    const objectsByCategory = availableObjects.reduce((acc, obj) => {
      if (!acc[obj.category]) acc[obj.category] = [];
      acc[obj.category].push(obj);
      return acc;
    }, {});

    // 🔍 Flags para detectar sensores específicos
    const hasTemperature = availableObjects.some(obj => obj.id === 3303);
    const hasHumidity = availableObjects.some(obj => obj.id === 3304);
    const hasGPS = availableObjects.some(obj => obj.id === 3336);
    const hasBattery = availableObjects.some(obj => obj.id === 3322);

    return {
      availableObjects,
      objectsByCategory,
      totalCount: availableObjects.length,
      hasTemperature,
      hasHumidity,
      hasGPS,
      hasBattery,
      sensorCount: objectsByCategory.Environmental?.length || 0,
      actuatorCount: objectsByCategory.Actuator?.length || 0,
      systemCount: objectsByCategory.System?.length || 0
    };
  }, [objectLinks]);

  return parsedObjects;
};

// Export por defecto también
export default useIPSOObjects;