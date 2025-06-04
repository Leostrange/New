/**
 * AnnotationsExportImport.js
 * Компонент для экспорта и импорта аннотаций
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { AnnotationService } from '../../services/AnnotationService';
import { FileSystemService } from '../../services/FileSystemService';
import { ShareService } from '../../services/ShareService';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { formatDate } from '../../utils/DateFormatter';

/**
 * Компонент экспорта и импорта аннотаций
 * @param {Object} props - Свойства компонента
 * @param {string} props.bookId - Идентификатор книги
 * @param {Function} props.onAnnotationsUpdated - Функция обратного вызова при обновлении аннотаций
 */
const AnnotationsExportImport = ({ bookId, onAnnotationsUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('json'); // 'json', 'csv', 'pdf'
  const { theme } = useTheme();

  /**
   * Экспорт аннотаций в выбранном формате
   */
  const handleExport = async () => {
    setLoading(true);
    try {
      const annotationService = new AnnotationService();
      const annotations = await annotationService.getAnnotations(bookId);
      
      if (annotations.length === 0) {
        Alert.alert('Экспорт аннотаций', 'Нет аннотаций для экспорта');
        return;
      }
      
      const fileSystemService = new FileSystemService();
      const timestamp = formatDate(new Date(), 'yyyyMMdd_HHmmss');
      const fileName = `annotations_${bookId}_${timestamp}.${exportFormat}`;
      let filePath;
      let fileContent;
      
      switch (exportFormat) {
        case 'json':
          fileContent = JSON.stringify({
            bookId,
            exportDate: new Date().toISOString(),
            annotations,
          }, null, 2);
          filePath = await fileSystemService.writeFile(
            fileSystemService.getExportDirectory(),
            fileName,
            fileContent
          );
          break;
          
        case 'csv':
          fileContent = 'Page,Type,Content,CreatedAt\n';
          annotations.forEach(annotation => {
            fileContent += `${annotation.pageNumber},${annotation.type},"${annotation.content.replace(/"/g, '""')}",${annotation.createdAt}\n`;
          });
          filePath = await fileSystemService.writeFile(
            fileSystemService.getExportDirectory(),
            fileName,
            fileContent
          );
          break;
          
        case 'pdf':
          filePath = await annotationService.generateAnnotationsPDF(
            bookId,
            annotations,
            fileSystemService.getExportDirectory(),
            fileName
          );
          break;
      }
      
      Alert.alert(
        'Экспорт завершен',
        `Аннотации экспортированы в файл: ${fileName}`,
        [
          { text: 'OK' },
          { 
            text: 'Поделиться', 
            onPress: () => ShareService.shareFile(filePath, `Аннотации к книге (${exportFormat})`) 
          }
        ]
      );
    } catch (error) {
      console.error('Ошибка при экспорте аннотаций:', error);
      Alert.alert('Ошибка', 'Не удалось экспортировать аннотации');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Импорт аннотаций из файла
   */
  const handleImport = async () => {
    setLoading(true);
    try {
      // Выбор файла для импорта
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      
      const fileUri = result[0].uri;
      const fileContent = await RNFS.readFile(fileUri, 'utf8');
      
      // Определение формата файла по расширению
      const fileExtension = fileUri.split('.').pop().toLowerCase();
      
      let importedAnnotations = [];
      
      switch (fileExtension) {
        case 'json':
          const jsonData = JSON.parse(fileContent);
          if (jsonData.annotations && Array.isArray(jsonData.annotations)) {
            importedAnnotations = jsonData.annotations;
          } else if (Array.isArray(jsonData)) {
            importedAnnotations = jsonData;
          } else {
            throw new Error('Неверный формат JSON');
          }
          break;
          
        case 'csv':
          const lines = fileContent.split('\n');
          const headers = lines[0].split(',');
          
          // Проверка наличия необходимых столбцов
          const pageIndex = headers.findIndex(h => h.toLowerCase() === 'page');
          const typeIndex = headers.findIndex(h => h.toLowerCase() === 'type');
          const contentIndex = headers.findIndex(h => h.toLowerCase() === 'content');
          
          if (pageIndex === -1 || typeIndex === -1 || contentIndex === -1) {
            throw new Error('CSV файл не содержит необходимых столбцов');
          }
          
          // Парсинг строк CSV
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = parseCSVLine(lines[i]);
            
            importedAnnotations.push({
              pageNumber: parseInt(values[pageIndex], 10),
              type: values[typeIndex],
              content: values[contentIndex],
              createdAt: new Date().toISOString(),
            });
          }
          break;
          
        default:
          throw new Error('Неподдерживаемый формат файла');
      }
      
      // Сохранение импортированных аннотаций
      const annotationService = new AnnotationService();
      await annotationService.importAnnotations(bookId, importedAnnotations);
      
      Alert.alert(
        'Импорт завершен',
        `Импортировано ${importedAnnotations.length} аннотаций`,
        [{ text: 'OK' }]
      );
      
      // Уведомление о обновлении аннотаций
      if (onAnnotationsUpdated) {
        onAnnotationsUpdated();
      }
    } catch (error) {
      console.error('Ошибка при импорте аннотаций:', error);
      Alert.alert('Ошибка', 'Не удалось импортировать аннотации');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Парсинг строки CSV с учетом кавычек
   * @param {string} line - Строка CSV
   * @returns {Array} - Массив значений
   */
  const parseCSVLine = (line) => {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Экранированная кавычка внутри кавычек
          currentValue += '"';
          i++;
        } else {
          // Переключение режима кавычек
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Разделитель вне кавычек
        values.push(currentValue);
        currentValue = '';
      } else {
        // Обычный символ
        currentValue += char;
      }
    }
    
    // Добавление последнего значения
    values.push(currentValue);
    
    return values;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>
        Экспорт и импорт аннотаций
      </Text>
      
      <View style={styles.formatSelector}>
        <Text style={[styles.formatLabel, { color: theme.textSecondary }]}>
          Формат экспорта:
        </Text>
        <View style={styles.formatButtons}>
          <TouchableOpacity
            style={[
              styles.formatButton,
              exportFormat === 'json' && styles.activeFormatButton,
              { backgroundColor: theme.buttonBackground }
            ]}
            onPress={() => setExportFormat('json')}
          >
            <Text style={[
              styles.formatButtonText,
              { color: exportFormat === 'json' ? theme.accentColor : theme.buttonText }
            ]}>
              JSON
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.formatButton,
              exportFormat === 'csv' && styles.activeFormatButton,
              { backgroundColor: theme.buttonBackground }
            ]}
            onPress={() => setExportFormat('csv')}
          >
            <Text style={[
              styles.formatButtonText,
              { color: exportFormat === 'csv' ? theme.accentColor : theme.buttonText }
            ]}>
              CSV
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.formatButton,
              exportFormat === 'pdf' && styles.activeFormatButton,
              { backgroundColor: theme.buttonBackground }
            ]}
            onPress={() => setExportFormat('pdf')}
          >
            <Text style={[
              styles.formatButtonText,
              { color: exportFormat === 'pdf' ? theme.accentColor : theme.buttonText }
            ]}>
              PDF
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accentColor }]}
          onPress={handleExport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Экспортировать аннотации</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accentColor }]}
          onPress={handleImport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Импортировать аннотации</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          Поддерживаемые форматы импорта: JSON, CSV
        </Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          Экспортированные файлы сохраняются в папку Documents/MrComic/Exports
        </Text>
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
    marginBottom: 16,
  },
  formatSelector: {
    marginBottom: 16,
  },
  formatLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  formatButtons: {
    flexDirection: 'row',
  },
  formatButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  activeFormatButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  formatButtonText: {
    fontSize: 14,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default AnnotationsExportImport;
