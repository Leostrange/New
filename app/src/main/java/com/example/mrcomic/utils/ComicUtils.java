package com.example.mrcomic.utils;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import com.github.junrar.Archive;
import com.github.junrar.rarfile.FileHeader;

public class ComicUtils {

    public static List<String> unpackComic(String comicFilePath, String destinationDirectory) throws IOException {
        File comicFile = new File(comicFilePath);
        if (!comicFile.exists()) {
            throw new IOException("Comic file does not exist: " + comicFilePath);
        }

        File destDir = new File(destinationDirectory);
        if (!destDir.exists()) {
            destDir.mkdirs();
        }

        List<String> imagePaths = new ArrayList<>();
        String fileExtension = getFileExtension(comicFilePath);

        if (fileExtension.equalsIgnoreCase("cbz") || fileExtension.equalsIgnoreCase("zip")) {
            imagePaths = unpackZip(comicFilePath, destinationDirectory);
        } else if (fileExtension.equalsIgnoreCase("cbr") || fileExtension.equalsIgnoreCase("rar")) {
            imagePaths = unpackRar(comicFilePath, destinationDirectory);
        } else {
            throw new IllegalArgumentException("Unsupported comic file format: " + fileExtension);
        }
        Collections.sort(imagePaths);
        return imagePaths;
    }

    private static List<String> unpackZip(String zipFilePath, String destinationDirectory) throws IOException {
        List<String> imagePaths = new ArrayList<>();
        try (ZipFile zipFile = new ZipFile(zipFilePath)) {
            Enumeration<? extends ZipEntry> entries = zipFile.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                if (!entry.isDirectory() && isImageFile(entry.getName())) {
                    String filePath = destinationDirectory + File.separator + new File(entry.getName()).getName();
                    try (InputStream inputStream = zipFile.getInputStream(entry);
                         FileOutputStream outputStream = new FileOutputStream(filePath)) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = inputStream.read(buffer)) > 0) {
                            outputStream.write(buffer, 0, len);
                        }
                    }
                    imagePaths.add(filePath);
                }
            }
        }
        return imagePaths;
    }

    private static List<String> unpackRar(String rarFilePath, String destinationDirectory) throws IOException {
        List<String> imagePaths = new ArrayList<>();
        try (Archive archive = new Archive(new File(rarFilePath))) {
            FileHeader header = archive.nextFileHeader();
            while (header != null) {
                if (!header.isDirectory() && isImageFile(header.getFileNameString())) {
                    String filePath = destinationDirectory + File.separator + new File(header.getFileNameString()).getName();
                    try (FileOutputStream outputStream = new FileOutputStream(filePath)) {
                        archive.extractFile(header, outputStream);
                    }
                    imagePaths.add(filePath);
                }
                header = archive.nextFileHeader();
            }
        } catch (Exception e) {
            throw new IOException("Error unpacking RAR file: " + e.getMessage(), e);
        }
        return imagePaths;
    }

    private static boolean isImageFile(String fileName) {
        String lowerCaseFileName = fileName.toLowerCase();
        return lowerCaseFileName.endsWith(".jpg") ||
               lowerCaseFileName.endsWith(".jpeg") ||
               lowerCaseFileName.endsWith(".png") ||
               lowerCaseFileName.endsWith(".gif") ||
               lowerCaseFileName.endsWith(".bmp") ||
               lowerCaseFileName.endsWith(".webp");
    }

    private static String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf(".");
        if (dotIndex == -1 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1);
    }
}


