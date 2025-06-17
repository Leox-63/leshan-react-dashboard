// 🎨 Custom hook para manejar objetos IPSO de manera inteligente
import { useMemo } from 'react';

// 📚 Diccionario completo de objetos IPSO estándar
const IPSO_OBJECTS_REGISTRY = {
  // 🌡️ Sensores ambientales
  3303: { 
    name: "Temperature Sensor", 
    icon: "🔥", 
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
  
  // 🔧 Sistema LwM2M estándar
  0: { 
    name: "Security Object", 
    icon: "🔒", 
    color: "#6c7b8a",
    category: "System",
    unit: "Security"
  },
  1: { 
    name: "Server Object", 
    icon: "🖥️", 
    color: "#5d6d7e",
    category: "System",
    unit: "Config"
  },
  3: { 
    name: "Device Object", 
    icon: "⚙️", 
    color: "#566573",
    category: "System",
    unit: "Info"
  },
  4: { 
    name: "Connectivity Monitoring", 
    icon: "📶", 
    color: "#4f5b66",
    category: "System",
    unit: "Network"
  },
  5: { 
    name: "Firmware Update", 
    icon: "🔄", 
    color: "#85929e",
    category: "System",
    unit: "Update"
  },
  6: { 
    name: "Location Object", 
    icon: "⚲", 
    color: "#00b894",
    category: "Location",
    unit: "Position"
  },
  7: { 
    name: "Connectivity Statistics", 
    icon: "📊", 
    color: "#7b8a98",
    category: "System",
    unit: "Stats"
  },
  
  // 🆕 Objetos IPSO adicionales comunes
  3308: {
    name: "Set Point",
    icon: "🎯",
    color: "#fd79a8",
    category: "Actuator",
    unit: "Value"
  },
  3313: {
    name: "Accelerometer",
    icon: "📏",
    color: "#fdcb6e",
    category: "Environmental",
    unit: "m/s²"
  },
  3314: {
    name: "Magnetometer",
    icon: "🧭", 
    color: "#6c5ce7",
    category: "Environmental",
    unit: "µT"
  },
  3315: {
    name: "Barometer",
    icon: "🌪️",
    color: "#00b894",
    category: "Environmental", 
    unit: "hPa"
  },
  3325: {
    name: "Distance Sensor",
    icon: "📐",
    color: "#00cec9",
    category: "Environmental",
    unit: "m"
  },
  3326: {
    name: "Direction",
    icon: "🧭",
    color: "#74b9ff",
    category: "Location",
    unit: "°"
  },
  3327: {
    name: "Time",
    icon: "⏰",
    color: "#708090",
    category: "System",
    unit: "Unix Time"
  },
  3328: {
    name: "Gyrometer",
    icon: "🌀",
    color: "#fab1a0",
    category: "Environmental",
    unit: "°/s"
  },
  
  // 🔊 Objetos de audio/multimedia
  3442: {
    name: "Audio Clip",
    icon: "🔊",
    color: "#e17055",
    category: "Multimedia",
    unit: "Audio"
  },
  
  // 📱 Objetos de comunicación
  3340: {
    name: "Positioner",
    icon: "🎚️",
    color: "#00b894",
    category: "Actuator",
    unit: "Position"
  },
  3341: {
    name: "Addressable Text Display",
    icon: "📺",
    color: "#fd79a8",
    category: "Actuator",
    unit: "Text"
  },
  3342: {
    name: "On/Off Switch",
    icon: "🔘",
    color: "#6c5ce7",
    category: "Actuator",
    unit: "On/Off"
  },
  3343: {
    name: "Level Control",
    icon: "🎛️",
    color: "#fdcb6e",
    category: "Actuator",
    unit: "%"
  },
  3344: {
    name: "Up/Down Control",
    icon: "↕️",
    color: "#74b9ff",
    category: "Actuator",
    unit: "Direction"
  },
  3345: {
    name: "Multiple Axis Joystick",
    icon: "🕹️",
    color: "#fd79a8",
    category: "Actuator",
    unit: "X,Y,Z"
  },
  
  // 📊 Objetos de medición adicionales
  3330: {
    name: "Distance",
    icon: "📏",
    color: "#00cec9",
    category: "Environmental",
    unit: "m"
  },
  3331: {
    name: "Energy",
    icon: "⚡",
    color: "#fdcb6e",
    category: "Environmental",
    unit: "Wh"
  },
  3332: {
    name: "Direction",
    icon: "🧭",
    color: "#6c5ce7",
    category: "Location",
    unit: "°"
  },
  3333: {
    name: "Time",
    icon: "⏱️",
    color: "#778899",
    category: "System",
    unit: "s"
  },
  3334: {
    name: "Gyrometer",
    icon: "🌀",
    color: "#fab1a0",
    category: "Environmental",
    unit: "°/s"
  },
  3335: {
    name: "Colour",
    icon: "🎨",
    color: "#e84393",
    category: "Environmental",
    unit: "RGB"
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
      .filter(link => {
        // 🚫 Filtramos links que no son objetos válidos
        return !link.includes('rt=[oma.lwm2m]') && !link.includes('>;ver=');
      })
      .map(link => {
        // Extraemos el ID del objeto desde el link
        // Formatos válidos: "</3303/0>", "</1/0>", "</3>", "/3303/0", "3303/0"
        let match;
        
        // Intentamos diferentes patrones de más específico a menos específico
        if (link.includes('</') && link.includes('>')) {
          // Formato: </3303/0> o </3/0> o </6/0>
          match = link.match(/<\/(\d+)(?:\/(\d+))?>/);
        } else if (link.startsWith('/')) {
          // Formato: /3303/0 o /3/0
          match = link.match(/^\/(\d+)(?:\/(\d+))?/);
        } else if (/^\d+/.test(link)) {
          // Formato: 3303/0 o 3303 o 3
          match = link.match(/^(\d+)(?:\/(\d+))?/);
        }
        
        if (!match) {
          // Si no podemos parsear, intentamos extraer cualquier número
          const numberMatch = link.match(/(\d+)/);
          if (numberMatch) {
            const objectId = parseInt(numberMatch[1]);
            
            const objectInfo = IPSO_OBJECTS_REGISTRY[objectId];
            return {
              id: objectId,
              instanceId: 0,
              link,
              name: objectInfo ? objectInfo.name : `Object ${objectId}`,
              icon: objectInfo ? objectInfo.icon : "📦",
              color: objectInfo ? objectInfo.color : "#95a5a6",
              category: objectInfo ? objectInfo.category : "Other",
              unit: objectInfo ? objectInfo.unit : "Unknown",
              isKnown: !!objectInfo,
              displayName: objectInfo ? objectInfo.name : `Object ${objectId}`
            };
          }
          return null; // No se pudo parsear nada útil
        }

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
      .filter(Boolean) || []; // Removemos nulls y aseguramos que sea array

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
      systemCount: objectsByCategory.System?.length || 0,
      multimediaCount: objectsByCategory.Multimedia?.length || 0,
      locationCount: objectsByCategory.Location?.length || 0,
      powerCount: objectsByCategory.Power?.length || 0,
      otherCount: objectsByCategory.Other?.length || 0
    };
  }, [objectLinks]);

  return parsedObjects;
};

// Export por defecto también
export default useIPSOObjects;