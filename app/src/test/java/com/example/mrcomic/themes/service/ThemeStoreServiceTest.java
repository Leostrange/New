package com.example.mrcomic.themes.service;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.mrcomic.themes.model.Theme;
import com.example.mrcomic.themes.repository.ThemeRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Unit тесты для ThemeStoreService
 */
@RunWith(RobolectricTestRunner.class)
public class ThemeStoreServiceTest {
    
    @Mock
    private ThemeRepository mockRepository;
    
    private ThemeStoreService themeStoreService;
    private Context context;
    
    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        context = RuntimeEnvironment.application;
        themeStoreService = new ThemeStoreService(context);
        
        // Внедряем mock репозиторий
        themeStoreService.setRepository(mockRepository);
    }
    
    @Test
    public void testGetFeaturedThemes() {
        // Arrange
        List<Theme> expectedThemes = createMockThemes();
        MutableLiveData<List<Theme>> liveData = new MutableLiveData<>();
        liveData.setValue(expectedThemes);
        
        when(mockRepository.getFeaturedThemes()).thenReturn(liveData);
        
        // Act
        LiveData<List<Theme>> result = themeStoreService.getFeaturedThemes();
        
        // Assert
        assertNotNull(result);
        assertEquals(expectedThemes, result.getValue());
        verify(mockRepository).getFeaturedThemes();
    }
    
    @Test
    public void testSearchThemes() {
        // Arrange
        String query = "dark theme";
        List<Theme> expectedResults = createMockThemes();
        MutableLiveData<List<Theme>> liveData = new MutableLiveData<>();
        liveData.setValue(expectedResults);
        
        when(mockRepository.searchThemes(query)).thenReturn(liveData);
        
        // Act
        LiveData<List<Theme>> result = themeStoreService.searchThemes(query);
        
        // Assert
        assertNotNull(result);
        assertEquals(expectedResults, result.getValue());
        verify(mockRepository).searchThemes(query);
    }
    
    @Test
    public void testDownloadAndInstallTheme() {
        // Arrange
        String themeId = "theme_123";
        CompletableFuture<Void> expectedFuture = CompletableFuture.completedFuture(null);
        
        when(mockRepository.downloadTheme(themeId)).thenReturn(expectedFuture);
        when(mockRepository.installTheme(eq(themeId), anyString())).thenReturn(expectedFuture);
        
        // Act
        CompletableFuture<Void> result = themeStoreService.downloadAndInstallTheme(themeId);
        
        // Assert
        assertNotNull(result);
        assertFalse(result.isCompletedExceptionally());
        verify(mockRepository).downloadTheme(themeId);
    }
    
    @Test
    public void testToggleFavorite() {
        // Arrange
        String themeId = "theme_123";
        CompletableFuture<Void> expectedFuture = CompletableFuture.completedFuture(null);
        
        when(mockRepository.toggleFavorite(themeId)).thenReturn(expectedFuture);
        
        // Act
        CompletableFuture<Void> result = themeStoreService.toggleFavorite(themeId);
        
        // Assert
        assertNotNull(result);
        assertFalse(result.isCompletedExceptionally());
        verify(mockRepository).toggleFavorite(themeId);
    }
    
    @Test
    public void testGetTotalThemeCount() {
        // Arrange
        int expectedCount = 10000;
        MutableLiveData<Integer> liveData = new MutableLiveData<>();
        liveData.setValue(expectedCount);
        
        when(mockRepository.getTotalThemeCount()).thenReturn(liveData);
        
        // Act
        LiveData<Integer> result = themeStoreService.getTotalThemeCount();
        
        // Assert
        assertNotNull(result);
        assertEquals(Integer.valueOf(expectedCount), result.getValue());
        verify(mockRepository).getTotalThemeCount();
    }
    
    @Test
    public void testGetTrendingThemes() {
        // Arrange
        List<Theme> expectedThemes = createMockThemes();
        MutableLiveData<List<Theme>> liveData = new MutableLiveData<>();
        liveData.setValue(expectedThemes);
        
        when(mockRepository.getTrendingThemes()).thenReturn(liveData);
        
        // Act
        LiveData<List<Theme>> result = themeStoreService.getTrendingThemes();
        
        // Assert
        assertNotNull(result);
        assertEquals(expectedThemes, result.getValue());
        verify(mockRepository).getTrendingThemes();
    }
    
    @Test
    public void testUninstallTheme() {
        // Arrange
        String themeId = "theme_123";
        CompletableFuture<Void> expectedFuture = CompletableFuture.completedFuture(null);
        
        when(mockRepository.uninstallTheme(themeId)).thenReturn(expectedFuture);
        
        // Act
        CompletableFuture<Void> result = themeStoreService.uninstallTheme(themeId);
        
        // Assert
        assertNotNull(result);
        assertFalse(result.isCompletedExceptionally());
        verify(mockRepository).uninstallTheme(themeId);
    }
    
    @Test
    public void testSearchThemesWithEmptyQuery() {
        // Arrange
        String emptyQuery = "";
        
        // Act
        LiveData<List<Theme>> result = themeStoreService.searchThemes(emptyQuery);
        
        // Assert
        assertNotNull(result);
        // Для пустого запроса должен возвращаться пустой результат
        assertTrue(result.getValue() == null || result.getValue().isEmpty());
    }
    
    @Test
    public void testErrorHandlingInDownload() {
        // Arrange
        String themeId = "invalid_theme";
        CompletableFuture<Void> failedFuture = new CompletableFuture<>();
        failedFuture.completeExceptionally(new RuntimeException("Download failed"));
        
        when(mockRepository.downloadTheme(themeId)).thenReturn(failedFuture);
        
        // Act
        CompletableFuture<Void> result = themeStoreService.downloadAndInstallTheme(themeId);
        
        // Assert
        assertNotNull(result);
        // Проверяем, что ошибка обрабатывается корректно
        try {
            result.get();
            fail("Expected exception was not thrown");
        } catch (Exception e) {
            assertTrue(e.getCause() instanceof RuntimeException);
        }
    }
    
    // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===
    
    private List<Theme> createMockThemes() {
        Theme theme1 = new Theme();
        theme1.setThemeId("theme_1");
        theme1.setName("Dark Mode Pro");
        theme1.setDescription("Professional dark theme");
        theme1.setRating(4.5f);
        theme1.setDownloadCount(1500L);
        
        Theme theme2 = new Theme();
        theme2.setThemeId("theme_2");
        theme2.setName("Manga Classic");
        theme2.setDescription("Classic manga style theme");
        theme2.setRating(4.7f);
        theme2.setDownloadCount(2300L);
        
        return Arrays.asList(theme1, theme2);
    }
}

