package com.example.comicreader; // Or a suitable package name

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class ComicUtils {

    /**
     * Lists files in a given directory, attempting to identify comic book files.
     * For now, it will just list all files and directories.
     * Later, filtering for CBZ, CBR, PDF will be added.
     *
     * @param directoryPath The path to the directory.
     * @return A list of file names in the directory.
     *         Returns an empty list if the path is invalid or an error occurs.
     */
    public List<String> listComicFiles(String directoryPath) {
        File directory = new File(directoryPath);
        List<String> fileNames = new ArrayList<>();

        if (!directory.exists() || !directory.isDirectory()) {
            System.err.println("Error: Path is not a valid directory: " + directoryPath);
            return fileNames; // Return empty list
        }

        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isFile()) {
                    String fileName = file.getName();
                    String lowerCaseFileName = fileName.toLowerCase();
                    if (lowerCaseFileName.endsWith(".cbz") ||
                        lowerCaseFileName.endsWith(".cbr") ||
                        lowerCaseFileName.endsWith(".pdf")) {
                        fileNames.add(fileName);
                    }
                }
            }
        } else {
            System.err.println("Error: Could not list files in directory: " + directoryPath);
            // This can happen due to permission issues, etc.
        }
        return fileNames;
    }

    // Main method for demonstrating filtering capabilities
    public static void main(String[] args) {
        ComicUtils utils = new ComicUtils();
        String baseTestDir = "comic_utils_test_main";

        // Create base directory
        File baseDirFile = new File(baseTestDir);
        if (!baseDirFile.exists()) {
            baseDirFile.mkdirs();
        }

        // Setup directory paths
        String mixedDirPath = baseTestDir + File.separator + "mixedDir";
        String nonComicDirPath = baseTestDir + File.separator + "nonComicDir";
        String emptyDirPath = baseTestDir + File.separator + "emptyDir";

        // Create test directories
        new File(mixedDirPath).mkdirs();
        new File(nonComicDirPath).mkdirs();
        new File(emptyDirPath).mkdirs();

        try {
            // Create files for mixedDir
            new File(mixedDirPath, "comic1.cbz").createNewFile();
            new File(mixedDirPath, "comic2.cbr").createNewFile();
            new File(mixedDirPath, "document.pdf").createNewFile();
            new File(mixedDirPath, "notes.txt").createNewFile();
            new File(mixedDirPath, "Comic_Upper.CBZ").createNewFile();


            // Create files for nonComicDir
            new File(nonComicDirPath, "image.jpg").createNewFile();
            new File(nonComicDirPath, "archive.zip").createNewFile();

            System.out.println("--- Demonstrating ComicUtils.listComicFiles ---");

            // Test case 1: Mixed directory
            System.out.println("\n[1] Listing mixed content directory: " + mixedDirPath);
            List<String> mixedFiles = utils.listComicFiles(mixedDirPath);
            printFileList(mixedFiles, mixedDirPath);

            // Test case 2: Directory with no comic files
            System.out.println("\n[2] Listing directory with no comic files: " + nonComicDirPath);
            List<String> nonComicFiles = utils.listComicFiles(nonComicDirPath);
            printFileList(nonComicFiles, nonComicDirPath);

            // Test case 3: Empty directory
            System.out.println("\n[3] Listing empty directory: " + emptyDirPath);
            List<String> emptyFiles = utils.listComicFiles(emptyDirPath);
            printFileList(emptyFiles, emptyDirPath);

            // Test case 4: Invalid directory
            String invalidPath = baseTestDir + File.separator + "nonexistent_dir";
            System.out.println("\n[4] Listing invalid directory: " + invalidPath);
            List<String> invalidFiles = utils.listComicFiles(invalidPath);
            printFileList(invalidFiles, invalidPath);

        } catch (java.io.IOException e) {
            System.err.println("Error creating test files: " + e.getMessage());
        } finally {
            // Clean up
            System.out.println("\n--- Cleaning up temporary test directories ---");
            deleteDirectory(baseDirFile);
            System.out.println("Cleanup complete.");
        }
    }

    private static void printFileList(List<String> files, String path) {
        if (files.isEmpty() && !(new File(path).exists())) {
            // Error message for invalid path is already printed by listComicFiles
            System.out.println("-> No files found (or path was invalid).");
        } else if (files.isEmpty()) {
            System.out.println("-> No comic files found in this directory.");
        }
        else {
            System.out.println("-> Found comic files:");
            for (String fileName : files) {
                System.out.println("  - " + fileName);
            }
        }
    }

    private static void deleteDirectory(File directoryToDelete) {
        File[] allContents = directoryToDelete.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    file.delete();
                }
            }
        }
        directoryToDelete.delete();
    }
}
