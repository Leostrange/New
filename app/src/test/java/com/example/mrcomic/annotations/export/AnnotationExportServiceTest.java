package com.example.mrcomic.annotations.export;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import android.content.Context;
import com.example.mrcomic.annotations.model.Annotation;
import com.example.mrcomic.annotations.types.AnnotationType;
import com.example.mrcomic.annotations.types.AnnotationPriority;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.Date;

/**
 * Unit тесты для AnnotationExportService
 */
@RunWith(RobolectricTestRunner.class)
public class AnnotationExportServiceTest {

    private AnnotationExportService exportService;
    private Context context;
    private List<Annotation> testAnnotations;

    @Before
    public void setUp() {
        context = RuntimeEnvironment.getApplication();
        exportService = AnnotationExportService.getInstance(context);
        testAnnotations = createTestAnnotations();
    }

    @Test
    public void testExportToPdf_Success() {
        // Arrange
        String fileName = "test_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToPdf(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getFilePath());
        assertTrue(new File(result.getFilePath()).exists());
        assertTrue(result.getFilePath().endsWith(".pdf"));
    }

    @Test
    public void testExportToHtml_Success() {
        // Arrange
        String fileName = "test_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToHtml(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getFilePath());
        assertTrue(new File(result.getFilePath()).exists());
        assertTrue(result.getFilePath().endsWith(".html"));
    }

    @Test
    public void testExportToJson_Success() {
        // Arrange
        String fileName = "test_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToJson(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getFilePath());
        assertTrue(new File(result.getFilePath()).exists());
        assertTrue(result.getFilePath().endsWith(".json"));
    }

    @Test
    public void testExportToCsv_Success() {
        // Arrange
        String fileName = "test_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToCsv(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getFilePath());
        assertTrue(new File(result.getFilePath()).exists());
        assertTrue(result.getFilePath().endsWith(".csv"));
    }

    @Test
    public void testExportToImage_Success() {
        // Arrange
        String fileName = "test_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToImage(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getFilePath());
        assertTrue(new File(result.getFilePath()).exists());
        assertTrue(result.getFilePath().endsWith(".png"));
    }

    @Test
    public void testExportWithFiltering_ByType() {
        // Arrange
        String fileName = "filtered_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();
        options.setFilterByType(AnnotationType.TEXT_NOTE);

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToJson(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
        
        // Проверяем, что файл содержит только аннотации нужного типа
        // В реальном тесте здесь бы парсили JSON и проверяли содержимое
    }

    @Test
    public void testExportWithFiltering_ByPriority() {
        // Arrange
        String fileName = "priority_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();
        options.setFilterByPriority(AnnotationPriority.HIGH);

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToJson(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
    }

    @Test
    public void testExportWithFiltering_ByPageRange() {
        // Arrange
        String fileName = "page_range_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();
        options.setStartPage(1);
        options.setEndPage(2);

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToJson(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
    }

    @Test
    public void testExportWithCustomization_IncludeMetadata() {
        // Arrange
        String fileName = "metadata_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();
        options.setIncludeMetadata(true);

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToJson(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
    }

    @Test
    public void testExportWithCustomization_GroupByPages() {
        // Arrange
        String fileName = "grouped_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();
        options.setGroupByPages(true);

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToHtml(testAnnotations, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
    }

    @Test
    public void testExport_EmptyAnnotationsList() {
        // Arrange
        String fileName = "empty_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();
        List<Annotation> emptyList = Arrays.asList();

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToJson(emptyList, fileName, options);

        // Assert
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertTrue(new File(result.getFilePath()).exists());
    }

    @Test
    public void testExport_NullAnnotationsList() {
        // Arrange
        String fileName = "null_annotations";
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToJson(null, fileName, options);

        // Assert
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertNotNull(result.getMessage());
        assertTrue(result.getMessage().contains("Список аннотаций не может быть null"));
    }

    @Test
    public void testExport_InvalidFileName() {
        // Arrange
        String invalidFileName = ""; // Пустое имя файла
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToJson(testAnnotations, invalidFileName, options);

        // Assert
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertNotNull(result.getMessage());
    }

    @Test
    public void testExport_NullFileName() {
        // Arrange
        String nullFileName = null;
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();

        // Act
        AnnotationExportService.ExportResult result = exportService.exportToJson(testAnnotations, nullFileName, options);

        // Assert
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertNotNull(result.getMessage());
    }

    @Test
    public void testExportOptions_DefaultValues() {
        // Arrange & Act
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();

        // Assert
        assertTrue(options.isIncludeMetadata());
        assertTrue(options.isGroupByPages());
        assertFalse(options.isIncludeImages());
        assertNull(options.getFilterByType());
        assertNull(options.getFilterByPriority());
        assertEquals(0, options.getStartPage());
        assertEquals(Integer.MAX_VALUE, options.getEndPage());
    }

    @Test
    public void testExportOptions_CustomValues() {
        // Arrange
        AnnotationExportService.ExportOptions options = new AnnotationExportService.ExportOptions();
        
        // Act
        options.setIncludeMetadata(false);
        options.setGroupByPages(false);
        options.setIncludeImages(true);
        options.setFilterByType(AnnotationType.HIGHLIGHT);
        options.setFilterByPriority(AnnotationPriority.HIGH);
        options.setStartPage(5);
        options.setEndPage(10);

        // Assert
        assertFalse(options.isIncludeMetadata());
        assertFalse(options.isGroupByPages());
        assertTrue(options.isIncludeImages());
        assertEquals(AnnotationType.HIGHLIGHT, options.getFilterByType());
        assertEquals(AnnotationPriority.HIGH, options.getFilterByPriority());
        assertEquals(5, options.getStartPage());
        assertEquals(10, options.getEndPage());
    }

    @Test
    public void testExportResult_SuccessResult() {
        // Arrange & Act
        AnnotationExportService.ExportResult result = new AnnotationExportService.ExportResult(true, "/path/to/file.pdf", "Export successful");

        // Assert
        assertTrue(result.isSuccess());
        assertEquals("/path/to/file.pdf", result.getFilePath());
        assertEquals("Export successful", result.getMessage());
    }

    @Test
    public void testExportResult_FailureResult() {
        // Arrange & Act
        AnnotationExportService.ExportResult result = new AnnotationExportService.ExportResult(false, null, "Export failed");

        // Assert
        assertFalse(result.isSuccess());
        assertNull(result.getFilePath());
        assertEquals("Export failed", result.getMessage());
    }

    @Test
    public void testGetSupportedFormats() {
        // Act
        List<String> formats = exportService.getSupportedFormats();

        // Assert
        assertNotNull(formats);
        assertTrue(formats.contains("PDF"));
        assertTrue(formats.contains("HTML"));
        assertTrue(formats.contains("JSON"));
        assertTrue(formats.contains("CSV"));
        assertTrue(formats.contains("PNG"));
    }

    @Test
    public void testGetExportDirectory() {
        // Act
        File exportDir = exportService.getExportDirectory();

        // Assert
        assertNotNull(exportDir);
        assertTrue(exportDir.exists() || exportDir.mkdirs());
        assertTrue(exportDir.isDirectory());
    }

    // Вспомогательные методы

    private List<Annotation> createTestAnnotations() {
        Annotation annotation1 = new Annotation();
        annotation1.setId(1L);
        annotation1.setComicId("comic123");
        annotation1.setPageNumber(1);
        annotation1.setType(AnnotationType.TEXT_NOTE);
        annotation1.setPriority(AnnotationPriority.HIGH);
        annotation1.setTitle("First Annotation");
        annotation1.setContent("This is the first test annotation");
        annotation1.setCreatedAt(new Date());

        Annotation annotation2 = new Annotation();
        annotation2.setId(2L);
        annotation2.setComicId("comic123");
        annotation2.setPageNumber(2);
        annotation2.setType(AnnotationType.HIGHLIGHT);
        annotation2.setPriority(AnnotationPriority.NORMAL);
        annotation2.setTitle("Second Annotation");
        annotation2.setContent("This is the second test annotation");
        annotation2.setCreatedAt(new Date());

        Annotation annotation3 = new Annotation();
        annotation3.setId(3L);
        annotation3.setComicId("comic123");
        annotation3.setPageNumber(1);
        annotation3.setType(AnnotationType.BOOKMARK);
        annotation3.setPriority(AnnotationPriority.LOW);
        annotation3.setTitle("Third Annotation");
        annotation3.setContent("This is the third test annotation");
        annotation3.setCreatedAt(new Date());

        return Arrays.asList(annotation1, annotation2, annotation3);
    }
}

