/**
 * JsonSynchronization.js
 * Компонент для синхронизации данных в формате JSON
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { SyncService } from '../../services/SyncService';
import { StorageService } from '../../services/StorageService';
import { NetworkService } from '../../services/NetworkService';
import { formatDate, formatFileSize } from '../../utils/Formatters';

/**
 * Компонент JSON-синхронизации
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onSyncComplete - Функция обратного вызова при завершении синхронизации
 */
const JsonSynchronization = ({ onSyncComplete }) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'
  const [lastSyncDate, setLastSyncDate] = useState(null);
  const [syncStats, setSyncStats] = useState(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncDetails, setSyncDetails] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    loadLastSyncInfo();
  }, []);

  /**
   * Загрузка информации о последней синхронизации
   */
  const loadLastSyncInfo = async () => {
    try {
      const storageService = new StorageService();
      const syncInfo = await storageService.getItem('lastSyncInfo');
      
      if (syncInfo) {
        const parsedInfo = JSON.parse(syncInfo);
        setLastSyncDate(new Date(parsedInfo.date));
        setSyncStats(parsedInfo.stats);
      }
    } catch (error) {
      console.error('Ошибка при загрузке информации о синхронизации:', error);
    }
  };

  /**
   * Запуск процесса синхронизации
   */
  const startSync = async () => {
    if (!await NetworkService.isConnected()) {
      Alert.alert('Ошибка синхронизации', 'Отсутствует подключение к интернету');
      return;
    }

    setSyncStatus('syncing');
    setSyncProgress(0);
    setSyncDetails([]);
    
    try {
      const syncService = new SyncService();
      
      // Регистрация обработчика прогресса
      syncService.onProgressUpdate((progress, detail) => {
        setSyncProgress(progress);
        setSyncDetails(prevDetails => [...prevDetails, detail]);
      });
      
      // Запуск синхронизации
      const result = await syncService.synchronize();
      
      // Сохранение информации о синхронизации
      const syncInfo = {
        date: new Date().toISOString(),
        stats: result
      };
      
      const storageService = new StorageService();
      await storageService.setItem('lastSyncInfo', JSON.stringify(syncInfo));
      
      setLastSyncDate(new Date());
      setSyncStats(result);
      setSyncStatus('success');
      
      // Вызов функции обратного вызова
      if (onSyncComplete) {
        onSyncComplete(result);
      }
    } catch (error) {
      console.error('Ошибка при синхронизации:', error);
      setSyncStatus('error');
      setSyncDetails(prevDetails => [...prevDetails, {
        type: 'error',
        message: `Ошибка: ${error.message}`
      }]);
    }
  };

  /**
   * Отмена процесса синхронизации
   */
  const cancelSync = async () => {
    try {
      const syncService = new SyncService();
      await syncService.cancel();
      setSyncStatus('idle');
      setSyncDetails(prevDetails => [...prevDetails, {
        type: 'info',
        message: 'Синхронизация отменена пользователем'
      }]);
    } catch (error) {
      console.error('Ошибка при отмене синхронизации:', error);
    }
  };

  /**
   * Рендер статистики синхронизации
   */
  const renderSyncStats = () => {
    if (!syncStats) return null;
    
    return (
      <View style={styles.statsContainer}>
        <Text style={[styles.statsTitle, { color: theme.textColor }]}>
          Статистика синхронизации:
        </Text>
        <View style={styles.statsRow}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Отправлено:</Text>
          <Text style={[styles.statsValue, { color: theme.textColor }]}>
            {syncStats.uploaded} файлов ({formatFileSize(syncStats.uploadedSize)})
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Получено:</Text>
          <Text style={[styles.statsValue, { color: theme.textColor }]}>
            {syncStats.downloaded} файлов ({formatFileSize(syncStats.downloadedSize)})
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Конфликты:</Text>
          <Text style={[styles.statsValue, { color: theme.textColor }]}>
            {syncStats.conflicts} файлов
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Ошибки:</Text>
          <Text style={[styles.statsValue, { color: theme.textColor }]}>
            {syncStats.errors} файлов
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Рендер деталей синхронизации
   */
  const renderSyncDetails = () => {
    if (syncDetails.length === 0) return null;
    
    return (
      <View style={styles.detailsContainer}>
        <TouchableOpacity
          style={styles.detailsHeader}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={[styles.detailsTitle, { color: theme.textColor }]}>
            {showDetails ? 'Скрыть детали' : 'Показать детали'}
          </Text>
        </TouchableOpacity>
        
        {showDetails && (
          <ScrollView style={styles.detailsList}>
            {syncDetails.map((detail, index) => (
              <Text
                key={index}
                style={[
                  styles.detailItem,
                  { 
                    color: detail.type === 'error' ? '#FF3B30' : 
                           detail.type === 'warning' ? '#FFCC00' : 
                           theme.textSecondary 
                  }
                ]}
              >
                {detail.message}
              </Text>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>
        JSON-синхронизация
      </Text>
      
      {lastSyncDate && (
        <Text style={[styles.lastSyncText, { color: theme.textSecondary }]}>
          Последняя синхронизация: {formatDate(lastSyncDate)}
        </Text>
      )}
      
      {syncStatus === 'syncing' && (
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { backgroundColor: theme.progressBackground }
            ]}
          >
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.accentColor,
                  width: `${syncProgress * 100}%` 
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            {Math.round(syncProgress * 100)}%
          </Text>
        </View>
      )}
      
      {syncStatus === 'success' && (
        <View style={[styles.statusContainer, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
          <Text style={[styles.statusText, { color: '#34C759' }]}>
            Синхронизация успешно завершена
          </Text>
        </View>
      )}
      
      {syncStatus === 'error' && (
        <View style={[styles.statusContainer, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
          <Text style={[styles.statusText, { color: '#FF3B30' }]}>
            Ошибка синхронизации
          </Text>
        </View>
      )}
      
      {renderSyncStats()}
      {renderSyncDetails()}
      
      <View style={styles.buttonContainer}>
        {syncStatus === 'syncing' ? (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { backgroundColor: '#FF3B30' }]}
            onPress={cancelSync}
          >
            <Text style={styles.buttonText}>Отменить синхронизацию</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accentColor }]}
            onPress={startSync}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Запустить синхронизацию</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastSyncText: {
    fontSize: 14,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
  statusContainer: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    width: 100,
  },
  statsValue: {
    fontSize: 14,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailsHeader: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  detailsList: {
    maxHeight: 200,
    marginTop: 8,
  },
  detailItem: {
    fontSize: 12,
    marginBottom: 4,
    paddingLeft: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default JsonSynchronization;
