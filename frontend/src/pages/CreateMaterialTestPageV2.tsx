import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@services/api';
import { useAuthStore } from '@context/authStore';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

interface TestParameter {
  name: string;
  value: string | number;
  unit: string;
  min?: number;
  max?: number;
}

const TEST_TYPES = {
  TENSILE_STRENGTH: {
    name: 'Tensile Strength',
    parameters: [
      { name: 'Force Applied (N)', unit: 'N', min: 0, max: 100000 },
      { name: 'Breaking Point (mm)', unit: 'mm', min: 0, max: 1000 },
    ],
    unit: 'MPa',
  },
  HARDNESS: {
    name: 'Hardness Test',
    parameters: [
      { name: 'Method', unit: 'method', options: ['HV', 'HB', 'HR'] },
      { name: 'Indentation Size', unit: 'mm', min: 0, max: 5 },
    ],
    unit: 'HV',
  },
  ELONGATION: {
    name: 'Elongation',
    parameters: [
      { name: 'Initial Length (mm)', unit: 'mm', min: 0, max: 1000 },
      { name: 'Final Length (mm)', unit: 'mm', min: 0, max: 1000 },
    ],
    unit: '%',
  },
  DENSITY: {
    name: 'Density Test',
    parameters: [
      { name: 'Mass (g)', unit: 'g', min: 0, max: 10000 },
      { name: 'Volume (cm³)', unit: 'cm³', min: 0, max: 10000 },
    ],
    unit: 'g/cm³',
  },
  MOISTURE: {
    name: 'Moisture Content',
    parameters: [
      { name: 'Initial Weight (g)', unit: 'g', min: 0, max: 10000 },
      { name: 'Dry Weight (g)', unit: 'g', min: 0, max: 10000 },
    ],
    unit: '%',
  },
};

export const CreateMaterialTestPageV2: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedTestType, setSelectedTestType] = useState<any>(null);
  
  const [form, setForm] = useState({
    testId: `TEST-${Date.now()}`,
    materialId: '',
    batchId: '',
    testType: '',
    resultValue: 0,
    testParameters: {} as Record<string, string | number>,
    status: 'PENDING',
    remarks: '',
    passFailCriteria: '',
  });

  useEffect(() => {
    loadMaterials();
    loadBatches();
  }, []);

  const loadMaterials = async () => {
    try {
      setMaterials([
        { id: '1', name: 'Raw Material A', code: 'MAT001' },
        { id: '2', name: 'Raw Material B', code: 'MAT002' },
      ]);
    } catch (err) {
      console.error('Failed to load materials', err);
    }
  };

  const loadBatches = async () => {
    try {
      setBatches([
        { id: '1', batchNumber: 'BATCH-001', productName: 'Product A' },
        { id: '2', batchNumber: 'BATCH-002', productName: 'Product B' },
      ]);
    } catch (err) {
      console.error('Failed to load batches', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'testType') {
      const testType = (TEST_TYPES as any)[value];
      setSelectedTestType(testType);
      setForm({ ...form, [name]: value, testParameters: {}, resultValue: 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleParameterChange = (paramName: string, value: string | number) => {
    setForm({
      ...form,
      testParameters: {
        ...form.testParameters,
        [paramName]: value,
      },
    });
  };

  const determineStatus = () => {
    if (!form.resultValue || !form.passFailCriteria) return 'PENDING';

    const criteria = form.passFailCriteria.split('-');
    if (criteria.length === 2) {
      const min = parseFloat(criteria[0]);
      const max = parseFloat(criteria[1]);
      
      if (form.resultValue >= min && form.resultValue <= max) {
        return 'PASSED';
      } else {
        return 'FAILED';
      }
    }
    return 'PENDING';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.testType) {
      setError('Please select a test type');
      return;
    }

    if (!form.materialId && !form.batchId) {
      setError('Please select either a material or a batch to test');
      return;
    }

    if (form.resultValue <= 0) {
      setError('Result value must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const finalStatus = determineStatus();
      
      await apiClient.post('/material-tests', {
        materialId: form.materialId || null,
        batchId: form.batchId || null,
        testType: form.testType,
        resultValue: form.resultValue,
        resultUnit: (TEST_TYPES as any)[form.testType]?.unit,
        testParameters: form.testParameters,
        status: finalStatus,
        testedBy: user?.id,
        testedAt: new Date().toISOString(),
        remarks: form.remarks,
        passFailCriteria: form.passFailCriteria,
        createdBy: user?.id,
      });
      navigate('/material-tests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create material test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button
        onClick={() => navigate('/material-tests')}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '2rem',
        }}
      >
        <FaArrowLeft /> BACK TO MATERIAL TESTS
      </button>

      <div style={{ borderBottom: '3px solid var(--secondary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-dark)', textTransform: 'uppercase', margin: 0 }}>
          CREATE MATERIAL TEST
        </h1>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(220, 38, 38, 0.05)',
          borderLeft: '4px solid var(--accent)',
          color: 'var(--accent)',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', marginBottom: '2rem' }}>
        
        {/* HEADER SECTION */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            TEST DETAILS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                TEST ID
              </label>
              <input
                type="text"
                value={form.testId}
                disabled
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', background: 'var(--bg-secondary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                TEST TYPE *
              </label>
              <select
                name="testType"
                value={form.testType}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem' }}
              >
                <option value="">-- Select Test Type --</option>
                {Object.entries(TEST_TYPES).map(([key, value]: [string, any]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                MATERIAL (for material test)
              </label>
              <select
                name="materialId"
                value={form.materialId}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem' }}
              >
                <option value="">-- Select Material (Optional) --</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                BATCH (for production QC)
              </label>
              <select
                name="batchId"
                value={form.batchId}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem' }}
              >
                <option value="">-- Select Batch (Optional) --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} - {b.productName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* TEST PARAMETERS SECTION */}
        {selectedTestType && (
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              TEST PARAMETERS
            </h2>

            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', border: '2px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {selectedTestType.parameters.map((param: any, index: number) => (
                  <div key={index}>
                    <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      {param.name} ({param.unit})
                    </label>
                    {param.options ? (
                      <select
                        value={form.testParameters[param.name] || ''}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
                      >
                        <option value="">-- Select --</option>
                        {param.options.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={form.testParameters[param.name] || ''}
                        onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value))}
                        min={param.min}
                        max={param.max}
                        placeholder={`Min: ${param.min}, Max: ${param.max}`}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULT SECTION */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            TEST RESULT
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                RESULT VALUE *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  name="resultValue"
                  value={form.resultValue}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  style={{ flex: 1, padding: '0.75rem', border: '2px solid var(--border)' }}
                />
                <span style={{ fontWeight: '600', color: 'var(--text-light)', minWidth: '50px' }}>
                  {selectedTestType ? selectedTestType.unit : 'Unit'}
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                PASS/FAIL CRITERIA (Min-Max) *
              </label>
              <input
                type="text"
                name="passFailCriteria"
                value={form.passFailCriteria}
                onChange={handleChange}
                placeholder="e.g., 50-150"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '0.25rem 0 0 0' }}>
                Format: minimum-maximum
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                STATUS
              </label>
              <input
                type="text"
                disabled
                value={determineStatus()}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', background: 'var(--bg-secondary)' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '0.25rem 0 0 0' }}>
                Auto-calculated from criteria
              </p>
            </div>
          </div>
        </div>

        {/* REMARKS SECTION */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            REMARKS & NOTES
          </h2>

          <label style={{ display: 'block', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
            TEST REMARKS
          </label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Add any observations, deviations, or special notes about this test"
            rows={4}
            style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', fontSize: '0.95rem', fontFamily: 'inherit' }}
          />
        </div>

        {/* TEST SUMMARY */}
        <div style={{ background: 'rgba(15, 118, 110, 0.05)', padding: '1.5rem', marginBottom: '2rem', border: '2px solid var(--secondary)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--secondary)', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>
            TEST SUMMARY
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>
                <strong>Test Type:</strong> {selectedTestType ? selectedTestType.name : 'Not selected'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>
                <strong>Result:</strong> {form.resultValue} {selectedTestType ? selectedTestType.unit : ''}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>
                <strong>Criteria:</strong> {form.passFailCriteria || 'Not set'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                <strong>Status:</strong>{' '}
                <span style={{
                  color: determineStatus() === 'PASSED' ? 'var(--success)' : determineStatus() === 'FAILED' ? 'var(--accent)' : 'var(--warning)',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}>
                  {determineStatus()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              background: loading ? 'var(--text-light)' : 'linear-gradient(135deg, var(--secondary), var(--secondary-light))',
              color: 'white',
              padding: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              textTransform: 'uppercase',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <FaCheckCircle /> {loading ? 'SAVING...' : 'SAVE MATERIAL TEST'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/material-tests')}
            style={{
              flex: 1,
              background: 'var(--border-dark)',
              color: 'var(--primary)',
              padding: '1rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              textTransform: 'uppercase',
              fontSize: '1rem',
            }}
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
};
