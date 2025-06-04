/**
 * BookmarksViewer.js
 * Компонент для визуального просмотра закладок
 */

import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { BookmarkService } from '../../services/BookmarkService';
import { NavigationService } from '../../services/NavigationService';
import { ThumbnailGenerator } from '../../utils/ThumbnailGenerator';
import { formatDate } from '../../utils/DateFormatter';

/**
 * Компонент визуального просмотра закладок
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onBookmarkSelect - Функция обработки выбора закладки
 * @param {string} props.bookType - Тип книги (comic, pdf, epub)
 * @param {string} props.bookId - Идентификатор книги
 */
const BookmarksViewer = ({ onBookmarkSelect, bookType, bookId }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' или 'list'
  const [sortOrder, setSortOrder] = useState('date'); // 'date', 'page', 'title'
  const { theme } = useTheme();

  useEffect(() => {
    loadBookmarks();
  }, [bookId]);

  /**
   * Загрузка закладок для текущей книги
   */
  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const bookmarkService = new BookmarkService();
      const bookmarkData = await bookmarkService.getBookmarks(bookId);
      
      // Генерация миниатюр для закладок
      const bookmarksWithThumbnails = await Promise.all(
        bookmarkData.map(async (bookmark) => {
          const thumbnail = await ThumbnailGenerator.generateForPage(
            bookId, 
            bookmark.pageNumber, 
            bookType
          );
          return { ...bookmark, thumbnail };
        })
      );
      
      setBookmarks(bookmarksWithThumbnails);
    } catch (error) {
      console.error('Ошибка при загрузке закладок:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обработчик выбора закладки
   * @param {Object} bookmark - Выбранная закладка
   */
  const handleBookmarkSelect = (bookmark) => {
    if (onBookmarkSelect) {
      onBookmarkSelect(bookmark);
    } else {
      NavigationService.navigateToPage(bookId, bookmark.pageNumber);
    }
  };

  /**
   * Обработчик удаления закладки
   * @param {string} bookmarkId - Идентификатор закладки
   */
  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      const bookmarkService = new BookmarkService();
      await bookmarkService.deleteBookmark(bookmarkId);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Ошибка при удалении закладки:', error);
    }
  };

  /**
   * Обработчик изменения режима просмотра
   */
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  /**
   * Обработчик изменения порядка сортировки
   * @param {string} order - Порядок сортировки
   */
  const changeSortOrder = (order) => {
    setSortOrder(order);
    
    // Сортировка закладок
    const sortedBookmarks = [...bookmarks];
    switch (order) {
      case 'date':
        sortedBookmarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'page':
        sortedBookmarks.sort((a, b) => a.pageNumber - b.pageNumber);
        break;
      case 'title':
        sortedBookmarks.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    setBookmarks(sortedBookmarks);
  };

  /**
   * Рендер элемента закладки в режиме сетки
   */
  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleBookmarkSelect(item)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <Text style={[styles.bookmarkTitle, { color: theme.textColor }]} numberOfLines={1}>
        {item.title || `Страница ${item.pageNumber}`}
      </Text>
      <Text style={[styles.bookmarkDate, { color: theme.textSecondary }]}>
        {formatDate(item.createdAt)}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteBookmark(item.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  /**
   * Рендер элемента закладки в режиме списка
   */
  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleBookmarkSelect(item)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.listThumbnail} />
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemTitle, { color: theme.textColor }]}>
          {item.title || `Страница ${item.pageNumber}`}
        </Text>
        <Text style={[styles.listItemPage, { color: theme.textSecondary }]}>
          Страница {item.pageNumber}
        </Text>
        <Text style={[styles.listItemDate, { color: theme.textSecondary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.listDeleteButton}
        onPress={() => handleDeleteBookmark(item.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>Закладки</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.viewModeButton, { backgroundColor: theme.buttonBackground }]}
            onPress={toggleViewMode}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              {viewMode === 'grid' ? 'Список' : 'Сетка'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortOrder === 'date' && styles.activeSortButton,
                { backgroundColor: theme.buttonBackground }
              ]}
              onPress={() => changeSortOrder('date')}
            >
              <Text style={[
                styles.buttonText,
                { color: sortOrder === 'date' ? theme.accentColor : theme.buttonText }
              ]}>
                По дате
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortOrder === 'page' && styles.activeSortButton,
                { backgroundColor: theme.buttonBackground }
              ]}
              onPress={() => changeSortOrder('page')}
            >
              <Text style={[
                styles.buttonText,
                { color: sortOrder === 'page' ? theme.accentColor : theme.buttonText }
              ]}>
                По странице
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortOrder === 'title' && styles.activeSortButton,
                { backgroundColor: theme.buttonBackground }
              ]}
              onPress={() => changeSortOrder('title')}
            >
              <Text style={[
                styles.buttonText,
                { color: sortOrder === 'title' ? theme.accentColor : theme.buttonText }
              ]}>
                По названию
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Загрузка закладок...
          </Text>
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            У вас пока нет закладок для этой книги
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 3 : 1}
          key={viewMode} // Для пересоздания списка при смене режима
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 4,
  },
  sortButtons: {
    flexDirection: 'row',
  },
  sortButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeSortButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 16,
  },
  gridItem: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 4,
    marginBottom: 8,
  },
  bookmarkTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  bookmarkDate: {
    fontSize: 12,
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    position: 'relative',
  },
  listThumbnail: {
    width: 60,
    height: 80,
    borderRadius: 4,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  listItemPage: {
    fontSize: 14,
    marginBottom: 2,
  },
  listItemDate: {
    fontSize: 12,
  },
  listDeleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BookmarksViewer;
