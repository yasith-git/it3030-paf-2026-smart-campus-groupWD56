package com.example.smart_campus_operations.service;

import com.example.smart_campus_operations.config.StorageProperties;
import com.example.smart_campus_operations.exception.FileStorageException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/jpg");
    private final StorageProperties storageProperties;
    private Path uploadRoot;

    @PostConstruct
    public void init() {
        try {
            this.uploadRoot = Paths.get(storageProperties.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(this.uploadRoot);
        } catch (IOException ex) {
            throw new FileStorageException("Could not initialize upload directory", ex);
        }
    }

    public StoredFile storeTicketAttachment(Long ticketId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("File must not be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new FileStorageException("Only JPG, JPEG, PNG, and WEBP images are allowed");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String extension = extractExtension(originalFilename);
        String storedFileName = UUID.randomUUID() + (extension.isBlank() ? "" : "." + extension);

        try {
            Path ticketDir = uploadRoot.resolve("tickets").resolve(String.valueOf(ticketId));
            Files.createDirectories(ticketDir);
            Path target = ticketDir.resolve(storedFileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return new StoredFile(originalFilename, storedFileName, contentType, file.getSize(), target.toString());
        } catch (IOException ex) {
            throw new FileStorageException("Failed to store file", ex);
        }
    }

    public Resource loadAsResource(String filePath) {
        try {
            Path path = Paths.get(filePath).toAbsolutePath().normalize();
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists()) {
                throw new FileStorageException("File not found on disk");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new FileStorageException("Failed to load file as resource", ex);
        }
    }

    public void delete(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException ex) {
            throw new FileStorageException("Failed to delete file", ex);
        }
    }

    private String extractExtension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index == -1 || index == filename.length() - 1) {
            return "";
        }
        return filename.substring(index + 1).toLowerCase();
    }

    public record StoredFile(String originalFilename, String storedFileName, String contentType, long fileSize, String filePath) {
    }
}

