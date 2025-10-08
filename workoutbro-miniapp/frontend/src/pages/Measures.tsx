import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Calendar, Target, Dumbbell } from 'lucide-react';

interface Measurement {
  id: number;
  date: string;
  weight: number;
  bodyFat?: number;
  muscle?: number;
  notes?: string;
}

const Measures: React.FC = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([
    {
      id: 1,
      date: '2025-01-07',
      weight: 75.5,
      bodyFat: 15.2,
      muscle: 35.8,
      notes: 'Хороший прогресс'
    },
    {
      id: 2,
      date: '2025-01-01',
      weight: 74.8,
      bodyFat: 16.1,
      muscle: 34.9,
      notes: 'Начало программы'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    weight: '',
    bodyFat: '',
    muscle: '',
    notes: ''
  });

  const handleAddMeasurement = () => {
    if (!newMeasurement.weight) return;

    const measurement: Measurement = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newMeasurement.weight),
      bodyFat: newMeasurement.bodyFat ? parseFloat(newMeasurement.bodyFat) : undefined,
      muscle: newMeasurement.muscle ? parseFloat(newMeasurement.muscle) : undefined,
      notes: newMeasurement.notes || undefined
    };

    setMeasurements(prev => [measurement, ...prev]);
    setNewMeasurement({ weight: '', bodyFat: '', muscle: '', notes: '' });
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getWeightChange = (current: number, previous: number) => {
    const change = current - previous;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pt-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Измерения
            </h1>
            <p className="text-text-secondary">
              Отслеживайте свой прогресс
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="p-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stats */}
        {measurements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Текущий вес</p>
                  <p className="text-text-primary font-bold text-xl">
                    {measurements[0].weight} кг
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Изменение</p>
                  <p className={`font-bold text-xl ${
                    measurements.length > 1 
                      ? getWeightChange(measurements[0].weight, measurements[1].weight).isPositive
                        ? 'text-green-500'
                        : 'text-red-500'
                      : 'text-text-primary'
                  }`}>
                    {measurements.length > 1 
                      ? `${getWeightChange(measurements[0].weight, measurements[1].weight).isPositive ? '+' : '-'}${getWeightChange(measurements[0].weight, measurements[1].weight).value} кг`
                      : '—'
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add Measurement Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-dark-card border border-dark-border rounded-xl mb-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Добавить измерение
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2">
                  Вес (кг) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.weight}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:border-primary focus:outline-none"
                  placeholder="75.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    Жир (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.bodyFat}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, bodyFat: e.target.value }))}
                    className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:border-primary focus:outline-none"
                    placeholder="15.2"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    Мышцы (кг)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.muscle}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, muscle: e.target.value }))}
                    className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:border-primary focus:outline-none"
                    placeholder="35.8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-2">
                  Заметки
                </label>
                <textarea
                  value={newMeasurement.notes}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:border-primary focus:outline-none"
                  rows={3}
                  placeholder="Добавьте заметки..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddMeasurement}
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 bg-dark-card border border-dark-border text-text-primary rounded-lg font-medium hover:border-primary transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Measurements History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            История измерений
          </h2>
          
          <div className="space-y-3">
            {measurements.map((measurement, index) => (
              <motion.div
                key={measurement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="p-4 bg-dark-card border border-dark-border rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">
                        {formatDate(measurement.date)}
                      </p>
                      <p className="text-text-secondary text-sm">
                        {measurement.notes || 'Без заметок'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary font-bold text-lg">
                      {measurement.weight} кг
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {measurement.bodyFat && (
                    <div className="text-center p-2 bg-dark-border rounded-lg">
                      <p className="text-text-secondary text-xs">Жир</p>
                      <p className="text-text-primary font-semibold">
                        {measurement.bodyFat}%
                      </p>
                    </div>
                  )}
                  {measurement.muscle && (
                    <div className="text-center p-2 bg-dark-border rounded-lg">
                      <p className="text-text-secondary text-xs">Мышцы</p>
                      <p className="text-text-primary font-semibold">
                        {measurement.muscle} кг
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Empty State */}
        {measurements.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📏</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Нет измерений
            </h3>
            <p className="text-text-secondary mb-4">
              Добавьте первое измерение, чтобы отслеживать прогресс
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Добавить измерение
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Measures;
