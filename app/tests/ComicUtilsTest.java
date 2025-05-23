package com.example.comicreader;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ComicUtilsTest {

    private ComicUtils comicUtils;
    // @TempDir is a JUnit Jupiter extension that provides a temporary directory for tests
    // This directory is automatically created before each test and deleted after
    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        comicUtils = new ComicUtils();
        // tempDir is managed by JUnit, no need to create it manually here
        // System.out.println("Temporary directory created at: " + tempDir.toString());
    }

    // This method can be removed if @TempDir handles cleanup,
    // but explicit deletion is safer for files created within tests.
    @AfterEach
    void tearDown() throws IOException {
        // JUnit's @TempDir should handle recursive deletion of the directory.
        // If we create files directly under tempDir, they will be deleted.
        // If we create other temp directories/files not managed by @TempDir,
        // they would need manual cleanup here.
        // System.out.println("Cleaning up test directory: " + tempDir.toString());
    }

    private void createFile(String fileName) throws IOException {
        Files.createFile(tempDir.resolve(fileName));
    }

    private void createDirectory(String dirName) throws IOException {
        Files.createDirectory(tempDir.resolve(dirName));
    }

    @Test
    void testListComicFiles_ValidDirectory_FiltersNonComics() throws IOException {
        System.out.println("Testing with a valid directory containing mixed files...");
        createFile("comic1.cbz");
        createFile("document.pdf"); // This is a comic file type
        createFile("archive.zip"); // This is not
        createDirectory("subdir");

        List<String> files = comicUtils.listComicFiles(tempDir.toString());
        assertNotNull(files, "File list should not be null");
        assertEquals(2, files.size(), "Expected 2 comic files, got " + files.size());
        assertTrue(files.contains("comic1.cbz"), "Missing comic1.cbz");
        assertTrue(files.contains("document.pdf"), "Missing document.pdf");
        assertFalse(files.contains("archive.zip"), "archive.zip should be filtered out");
        assertFalse(files.contains("subdir"), "Subdirectories should be filtered out");
        System.out.println("Valid directory (mixed content) test passed. Found: " + files);
    }

    @Test
    void testListComicFiles_InvalidDirectory() {
        System.out.println("Testing with invalid directory...");
        String invalidPath = tempDir.toString() + File.separator + "nonexistent_dir";
        List<String> noFiles = comicUtils.listComicFiles(invalidPath);
        assertNotNull(noFiles, "File list should not be null for invalid path");
        assertTrue(noFiles.isEmpty(), "Expected empty list for invalid path, got " + noFiles.size() + " items.");
        System.out.println("Invalid directory test passed. Found: " + noFiles);
    }

    @Test
    void testListComicFiles_DirectoryWithOnlyNonComicFiles() throws IOException {
        System.out.println("Testing directory with only non-comic files...");
        createFile("text.txt");
        createFile("image.jpg");
        createFile("document.docx");
        createDirectory("another_subdir");

        List<String> files = comicUtils.listComicFiles(tempDir.toString());
        assertNotNull(files, "File list should not be null");
        assertTrue(files.isEmpty(), "Expected empty list when no comic files are present, got " + files.size());
        System.out.println("Directory with only non-comic files test passed. Found: " + files);
    }

    @Test
    void testListComicFiles_EmptyDirectory() throws IOException {
        System.out.println("Testing empty directory...");
        // tempDir is already empty at the start of this test if no files are created
        List<String> files = comicUtils.listComicFiles(tempDir.toString());
        assertNotNull(files, "File list should not be null for empty directory");
        assertTrue(files.isEmpty(), "Expected empty list for an empty directory, got " + files.size());
        System.out.println("Empty directory test passed. Found: " + files);
    }

    @Test
    void testListComicFiles_UpperCaseExtensions() throws IOException {
        System.out.println("Testing directory with uppercase comic file extensions...");
        createFile("COMIC.CBZ");
        createFile("MYSTORY.PDF");
        createFile("ANOTHER.CBR");
        createFile("text.TXT"); // Non-comic

        List<String> files = comicUtils.listComicFiles(tempDir.toString());
        assertNotNull(files, "File list should not be null");
        assertEquals(3, files.size(), "Expected 3 comic files with uppercase extensions, got " + files.size());
        // Sort for consistent assertion order
        Collections.sort(files);
        List<String> expectedFiles = Arrays.asList("ANOTHER.CBR", "COMIC.CBZ", "MYSTORY.PDF");
        Collections.sort(expectedFiles);
        assertEquals(expectedFiles, files, "File list does not match expected files with uppercase extensions.");
        System.out.println("Uppercase extensions test passed. Found: " + files);
    }

    @Test
    void testListComicFiles_MixedCaseExtensions() throws IOException {
        System.out.println("Testing directory with mixed-case comic file extensions...");
        createFile("Book.Cbz");
        createFile("Story.pDf");
        createFile("Image.cBr");
        createFile("archive.ZIP"); // Non-comic

        List<String> files = comicUtils.listComicFiles(tempDir.toString());
        assertNotNull(files, "File list should not be null");
        assertEquals(3, files.size(), "Expected 3 comic files with mixed-case extensions, got " + files.size());
        // Sort for consistent assertion order
        Collections.sort(files);
        List<String> expectedFiles = Arrays.asList("Book.Cbz", "Image.cBr", "Story.pDf");
        Collections.sort(expectedFiles);
        assertEquals(expectedFiles, files, "File list does not match expected files with mixed-case extensions.");
        System.out.println("Mixed-case extensions test passed. Found: " + files);
    }
     @Test
    void testListComicFiles_OnlyComicFiles() throws IOException {
        System.out.println("Testing directory with only comic files...");
        createFile("comic1.cbz");
        createFile("comic2.cbr");
        createFile("document1.pdf");

        List<String> files = comicUtils.listComicFiles(tempDir.toString());
        assertNotNull(files, "File list should not be null");
        assertEquals(3, files.size(), "Expected 3 comic files, got " + files.size());
        Collections.sort(files);
        List<String> expectedFiles = Arrays.asList("comic1.cbz", "comic2.cbr", "document1.pdf");
        Collections.sort(expectedFiles);
        assertEquals(expectedFiles, files, "File list does not match expected comic files.");
        System.out.println("Only comic files test passed. Found: " + files);
    }
}
