// Componente interactivo para controlar objetos IPSO
import React, { useState, useEffect } from 'react';
import useLwM2mOperations from '../hooks/useLwM2mOperations';

const IPSOControl = ({ clientEndpoint, ipsoObject }) => {
  // DEBUG temporal
  console.log('IPSO Object:', ipsoObject);
  console.log('Category:', ipsoObject.category);
  
  const { loading, error, lastResult, readResource, writeResource, executeResource, clearState } = useLwM2mOperations();
  const [writeValue, setWriteValue] = useState('');
  const [executeArgs, setExecuteArgs] = useState('');
  const [currentValue, setCurrentValue] = useState(null);

  // 🧹 Limpiar valores cuando cambie el objeto
  useEffect(() => {
    console.log('🔄 Objeto cambió, limpiando valores...');
    setCurrentValue(null);
    setWriteValue('');
    setExecuteArgs('');
    clearState(); // También limpiar errores del hook
  }, [ipsoObject.id, ipsoObject.instanceId, clearState]);

  // Recursos comunes segun el tipo de objeto IPSO
  const getCommonResources = (objectId) => {
    switch (objectId) {
      case 3303: // Temperature Sensor
        return [
          { id: 5700, name: 'Sensor Value', type: 'read', unit: 'C' },
          { id: 5701, name: 'Min Measured Value', type: 'read', unit: 'C' },
          { id: 5702, name: 'Max Measured Value', type: 'read', unit: 'C' },
          { id: 5605, name: 'Reset Min/Max', type: 'execute' }
        ];
      case 3442: // Audio Clip
        return [
          { id: 5520, name: 'Audio Clip', type: 'write', unit: 'URL/ID' },
          { id: 5521, name: 'Audio Trigger', type: 'write', unit: 'On/Off' },
          { id: 5522, name: 'Audio Duration', type: 'read', unit: 'seconds' },
          { id: 5523, name: 'Audio Level', type: 'write', unit: '%' }
        ];
      case 3311: // Light Control
        return [
          { id: 5850, name: 'On/Off', type: 'write', unit: 'boolean' },
          { id: 5851, name: 'Dimmer', type: 'write', unit: '%' },
          { id: 5852, name: 'On Time', type: 'read', unit: 'seconds' }
        ];
      case 1: // Server Object
        return [
          { id: 0, name: 'Short Server ID', type: 'read', unit: 'integer' },
          { id: 1, name: 'Lifetime', type: 'read', unit: 'seconds' },
          { id: 2, name: 'Default Min Period', type: 'read', unit: 'seconds' },
          { id: 3, name: 'Default Max Period', type: 'read', unit: 'seconds' },
          { id: 8, name: 'Registration Update', type: 'execute', unit: 'trigger' }
        ];
      case 4: // Connectivity Monitoring
        return [
          { id: 0, name: 'Network Bearer', type: 'read', unit: 'integer' },
          { id: 1, name: 'Available Network Bearer', type: 'read', unit: 'integer' },
          { id: 2, name: 'Radio Signal Strength', type: 'read', unit: 'dBm' },
          { id: 3, name: 'Link Quality', type: 'read', unit: 'integer' },
          { id: 4, name: 'IP Addresses', type: 'read', unit: 'string' }
        ];
      case 5: // Firmware Update
        return [
          { id: 0, name: 'Package', type: 'write', unit: 'opaque' },
          { id: 1, name: 'Package URI', type: 'write', unit: 'string' },
          { id: 2, name: 'Update', type: 'execute', unit: 'trigger' },
          { id: 3, name: 'State', type: 'read', unit: 'integer' },
          { id: 5, name: 'Update Result', type: 'read', unit: 'integer' }
        ];
      case 7: // Connectivity Statistics  
        return [
          { id: 0, name: 'SMS Tx Counter', type: 'read', unit: 'integer' },
          { id: 1, name: 'SMS Rx Counter', type: 'read', unit: 'integer' },
          { id: 2, name: 'Tx Data', type: 'read', unit: 'integer' },
          { id: 3, name: 'Rx Data', type: 'read', unit: 'integer' },
          { id: 6, name: 'Collection Period', type: 'read', unit: 'integer' }
        ];
      case 0: // Security Object
        return [
          { id: 0, name: 'Bootstrap Server URI', type: 'read', unit: 'URI' },
          { id: 1, name: 'Bootstrap Server', type: 'read', unit: 'boolean' },
          { id: 2, name: 'Security Mode', type: 'read', unit: 'integer' },
          { id: 3, name: 'Public Key', type: 'read', unit: 'opaque' },
          { id: 10, name: 'Short Server ID', type: 'read', unit: 'integer' }
        ];
      case 3: // Device Object
        return [
          { id: 0, name: 'Manufacturer', type: 'read', unit: 'string' },
          { id: 1, name: 'Model Number', type: 'read', unit: 'string' },
          { id: 2, name: 'Serial Number', type: 'read', unit: 'string' },
          { id: 4, name: 'Reboot', type: 'execute' }
        ];
      default:
        return [
          { id: 0, name: 'Resource 0', type: 'read', unit: 'unknown' },
          { id: 1, name: 'Resource 1', type: 'write', unit: 'unknown' }
        ];
    }
  };

  const resources = getCommonResources(ipsoObject.id);

  const handleRead = async (resourceId) => {
    try {
      const result = await readResource(clientEndpoint, ipsoObject.id, ipsoObject.instanceId, resourceId);
      setCurrentValue({ resourceId, value: result.value, timestamp: result.timestamp });
    } catch (err) {
      console.error('Error reading resource:', err);
    }
  };

  const handleWrite = async (resourceId) => {
    if (!writeValue.trim()) {
      alert('Please enter a value to write');
      return;
    }

    try {
      // Intentar convertir el valor segun el tipo
      let value = writeValue;
      if (value === 'true' || value === 'false') {
        value = value === 'true';
      } else if (!isNaN(value) && !isNaN(parseFloat(value))) {
        value = parseFloat(value);
      }

      const result = await writeResource(clientEndpoint, ipsoObject.id, ipsoObject.instanceId, resourceId, value);
      setCurrentValue({ resourceId, value: result.writtenValue, timestamp: result.timestamp });
      setWriteValue('');
    } catch (err) {
      console.error('Error writing resource:', err);
    }
  };

  const handleExecute = async (resourceId) => {
    try {
      const result = await executeResource(clientEndpoint, ipsoObject.id, ipsoObject.instanceId, resourceId, executeArgs);
      setCurrentValue({ resourceId, executed: true, timestamp: result.timestamp });
      setExecuteArgs('');
    } catch (err) {
      console.error('Error executing resource:', err);
    }
  };

  return (
    <div className="ipso-control" data-category={ipsoObject.category || 'unknown'} data-object-id={ipsoObject.id}>
      <div className="ipso-control-header">
        <span className="ipso-control-icon">{ipsoObject.icon}</span>
        <h4 className="ipso-control-title">{ipsoObject.displayName}</h4>
        <span className="ipso-control-id">#{ipsoObject.id}/{ipsoObject.instanceId}</span>
      </div>

      {error && (
        <div className="ipso-control-error">
          <span>Error: {error}</span>
          <button onClick={clearState} className="clear-error-btn">X</button>
        </div>
      )}

      <div className="ipso-control-resources">
        {resources.map(resource => (
          <div key={resource.id} className="ipso-resource">
            <div className="resource-info">
              <span className="resource-name">{resource.name}</span>
              <span className="resource-id">#{resource.id}</span>
              <span className="resource-unit">{resource.unit}</span>
            </div>

            <div className="resource-actions">
              {resource.type === 'read' && (
                <button 
                  onClick={() => handleRead(resource.id)}
                  disabled={loading}
                  className="btn-read"
                >
                  Read
                </button>
              )}

              {resource.type === 'write' && (
                <div className="write-controls">
                  <input
                    type="text"
                    value={writeValue}
                    onChange={(e) => setWriteValue(e.target.value)}
                    placeholder="Enter value..."
                    className="write-input"
                  />
                  <button 
                    onClick={() => handleWrite(resource.id)}
                    disabled={loading || !writeValue.trim()}
                    className="btn-write"
                  >
                    Write
                  </button>
                </div>
              )}

              {resource.type === 'execute' && (
                <div className="execute-controls">
                  <input
                    type="text"
                    value={executeArgs}
                    onChange={(e) => setExecuteArgs(e.target.value)}
                    placeholder="Arguments (optional)..."
                    className="execute-input"
                  />
                  <button 
                    onClick={() => handleExecute(resource.id)}
                    disabled={loading}
                    className="btn-execute"
                  >
                    Execute
                  </button>
                </div>
              )}
            </div>

            {/* Valor en la esquina inferior derecha */}
            {currentValue && currentValue.resourceId === resource.id && (
              <span className="resource-value">{currentValue.value}</span>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div className="ipso-control-loading">
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
};

export default IPSOControl;