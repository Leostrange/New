package com.example.mrcomic.annotations.service;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import android.content.Context;
import androidx.arch.core.executor.testing.InstantTaskExecutorRule;
import androidx.lifecycle.Observer;
import com.example.mrcomic.annotations.model.Annotation;
import com.example.mrcomic.annotations.repository.AnnotationRepository;
import com.example.mrcomic.annotations.types.AnnotationType;
import com.example.mrcomic.annotations.types.AnnotationPriority;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

/**
 * Unit тесты для AnnotationService
 */
@RunWith(RobolectricTestRunner.class)
public class AnnotationServiceTest {

    @Rule
    public InstantTaskExecutorRule instantTaskExecutorRule = new InstantTaskExecutorRule();

    @Mock
    private AnnotationRepository mockRepository;

    @Mock
    private Observer<List<Annotation>> mockObserver;

    private AnnotationService annotationService;
    private Context context;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        context = RuntimeEnvironment.getApplication();
        annotationService = new AnnotationService(context, mockRepository);
    }

    @Test
    public void testCreateAnnotation_Success() throws ExecutionException, InterruptedException {
        // Arrange
        Annotation annotation = createTestAnnotation();
        when(mockRepository.insertAnnotation(annotation)).thenReturn(1L);

        // Act
        CompletableFuture<Annotation> result = annotationService.createAnnotation(annotation);
        Annotation createdAnnotation = result.get();

        // Assert
        assertNotNull(createdAnnotation);
        assertEquals(1L, createdAnnotation.getId());
        verify(mockRepository).insertAnnotation(annotation);
    }

    @Test
    public void testUpdateAnnotation_Success() throws ExecutionException, InterruptedException {
        // Arrange
        Annotation annotation = createTestAnnotation();
        annotation.setId(1L);
        when(mockRepository.updateAnnotation(annotation)).thenReturn(1);

        // Act
        CompletableFuture<Boolean> result = annotationService.updateAnnotation(annotation);
        Boolean updated = result.get();

        // Assert
        assertTrue(updated);
        verify(mockRepository).updateAnnotation(annotation);
    }

    @Test
    public void testDeleteAnnotation_Success() throws ExecutionException, InterruptedException {
        // Arrange
        long annotationId = 1L;
        when(mockRepository.deleteAnnotation(annotationId)).thenReturn(1);

        // Act
        CompletableFuture<Boolean> result = annotationService.deleteAnnotation(annotationId);
        Boolean deleted = result.get();

        // Assert
        assertTrue(deleted);
        verify(mockRepository).deleteAnnotation(annotationId);
    }

    @Test
    public void testSearchAnnotations_ByKeyword() throws ExecutionException, InterruptedException {
        // Arrange
        String keyword = "test";
        List<Annotation> expectedAnnotations = Arrays.asList(createTestAnnotation());
        when(mockRepository.searchAnnotations(keyword)).thenReturn(expectedAnnotations);

        // Act
        CompletableFuture<List<Annotation>> result = annotationService.searchAnnotations(keyword);
        List<Annotation> annotations = result.get();

        // Assert
        assertNotNull(annotations);
        assertEquals(1, annotations.size());
        verify(mockRepository).searchAnnotations(keyword);
    }

    @Test
    public void testFilterAnnotations_ByType() throws ExecutionException, InterruptedException {
        // Arrange
        AnnotationType type = AnnotationType.TEXT_NOTE;
        List<Annotation> expectedAnnotations = Arrays.asList(createTestAnnotation());
        when(mockRepository.getAnnotationsByType(type)).thenReturn(expectedAnnotations);

        // Act
        CompletableFuture<List<Annotation>> result = annotationService.getAnnotationsByType(type);
        List<Annotation> annotations = result.get();

        // Assert
        assertNotNull(annotations);
        assertEquals(1, annotations.size());
        assertEquals(type, annotations.get(0).getType());
        verify(mockRepository).getAnnotationsByType(type);
    }

    @Test
    public void testFilterAnnotations_ByPriority() throws ExecutionException, InterruptedException {
        // Arrange
        AnnotationPriority priority = AnnotationPriority.HIGH;
        List<Annotation> expectedAnnotations = Arrays.asList(createTestAnnotation());
        when(mockRepository.getAnnotationsByPriority(priority)).thenReturn(expectedAnnotations);

        // Act
        CompletableFuture<List<Annotation>> result = annotationService.getAnnotationsByPriority(priority);
        List<Annotation> annotations = result.get();

        // Assert
        assertNotNull(annotations);
        assertEquals(1, annotations.size());
        assertEquals(priority, annotations.get(0).getPriority());
        verify(mockRepository).getAnnotationsByPriority(priority);
    }

    @Test
    public void testGetAnnotationsByPage() throws ExecutionException, InterruptedException {
        // Arrange
        String comicId = "comic123";
        int pageNumber = 1;
        List<Annotation> expectedAnnotations = Arrays.asList(createTestAnnotation());
        when(mockRepository.getAnnotationsByPage(comicId, pageNumber)).thenReturn(expectedAnnotations);

        // Act
        CompletableFuture<List<Annotation>> result = annotationService.getAnnotationsByPage(comicId, pageNumber);
        List<Annotation> annotations = result.get();

        // Assert
        assertNotNull(annotations);
        assertEquals(1, annotations.size());
        assertEquals(pageNumber, annotations.get(0).getPageNumber());
        verify(mockRepository).getAnnotationsByPage(comicId, pageNumber);
    }

    @Test
    public void testValidateAnnotation_ValidAnnotation() {
        // Arrange
        Annotation annotation = createTestAnnotation();

        // Act
        boolean isValid = annotationService.validateAnnotation(annotation);

        // Assert
        assertTrue(isValid);
    }

    @Test
    public void testValidateAnnotation_InvalidAnnotation_NullContent() {
        // Arrange
        Annotation annotation = createTestAnnotation();
        annotation.setContent(null);

        // Act
        boolean isValid = annotationService.validateAnnotation(annotation);

        // Assert
        assertFalse(isValid);
    }

    @Test
    public void testValidateAnnotation_InvalidAnnotation_EmptyContent() {
        // Arrange
        Annotation annotation = createTestAnnotation();
        annotation.setContent("");

        // Act
        boolean isValid = annotationService.validateAnnotation(annotation);

        // Assert
        assertFalse(isValid);
    }

    @Test
    public void testValidateAnnotation_InvalidAnnotation_NullComicId() {
        // Arrange
        Annotation annotation = createTestAnnotation();
        annotation.setComicId(null);

        // Act
        boolean isValid = annotationService.validateAnnotation(annotation);

        // Assert
        assertFalse(isValid);
    }

    @Test
    public void testValidateAnnotation_InvalidAnnotation_NegativePageNumber() {
        // Arrange
        Annotation annotation = createTestAnnotation();
        annotation.setPageNumber(-1);

        // Act
        boolean isValid = annotationService.validateAnnotation(annotation);

        // Assert
        assertFalse(isValid);
    }

    @Test
    public void testGetAnnotationStatistics() throws ExecutionException, InterruptedException {
        // Arrange
        String comicId = "comic123";
        List<Annotation> annotations = Arrays.asList(
            createTestAnnotation(),
            createTestAnnotation(),
            createTestAnnotation()
        );
        when(mockRepository.getAnnotationsByComic(comicId)).thenReturn(annotations);

        // Act
        CompletableFuture<AnnotationService.AnnotationStatistics> result = annotationService.getAnnotationStatistics(comicId);
        AnnotationService.AnnotationStatistics stats = result.get();

        // Assert
        assertNotNull(stats);
        assertEquals(3, stats.getTotalCount());
        verify(mockRepository).getAnnotationsByComic(comicId);
    }

    @Test
    public void testBulkOperations_DeleteMultiple() throws ExecutionException, InterruptedException {
        // Arrange
        List<Long> annotationIds = Arrays.asList(1L, 2L, 3L);
        when(mockRepository.deleteAnnotations(annotationIds)).thenReturn(3);

        // Act
        CompletableFuture<Integer> result = annotationService.deleteAnnotations(annotationIds);
        Integer deletedCount = result.get();

        // Assert
        assertEquals(Integer.valueOf(3), deletedCount);
        verify(mockRepository).deleteAnnotations(annotationIds);
    }

    @Test
    public void testBulkOperations_UpdateMultiple() throws ExecutionException, InterruptedException {
        // Arrange
        List<Annotation> annotations = Arrays.asList(
            createTestAnnotation(),
            createTestAnnotation(),
            createTestAnnotation()
        );
        when(mockRepository.updateAnnotations(annotations)).thenReturn(3);

        // Act
        CompletableFuture<Integer> result = annotationService.updateAnnotations(annotations);
        Integer updatedCount = result.get();

        // Assert
        assertEquals(Integer.valueOf(3), updatedCount);
        verify(mockRepository).updateAnnotations(annotations);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCreateAnnotation_NullAnnotation() throws ExecutionException, InterruptedException {
        // Act & Assert
        CompletableFuture<Annotation> result = annotationService.createAnnotation(null);
        result.get(); // Should throw exception
    }

    @Test(expected = IllegalArgumentException.class)
    public void testUpdateAnnotation_NullAnnotation() throws ExecutionException, InterruptedException {
        // Act & Assert
        CompletableFuture<Boolean> result = annotationService.updateAnnotation(null);
        result.get(); // Should throw exception
    }

    @Test(expected = IllegalArgumentException.class)
    public void testDeleteAnnotation_InvalidId() throws ExecutionException, InterruptedException {
        // Act & Assert
        CompletableFuture<Boolean> result = annotationService.deleteAnnotation(-1L);
        result.get(); // Should throw exception
    }

    // Вспомогательные методы

    private Annotation createTestAnnotation() {
        Annotation annotation = new Annotation();
        annotation.setComicId("comic123");
        annotation.setPageNumber(1);
        annotation.setType(AnnotationType.TEXT_NOTE);
        annotation.setPriority(AnnotationPriority.NORMAL);
        annotation.setTitle("Test Annotation");
        annotation.setContent("This is a test annotation content");
        annotation.setX(100.0f);
        annotation.setY(200.0f);
        annotation.setWidth(150.0f);
        annotation.setHeight(50.0f);
        return annotation;
    }
}

