package com.placement.portal.controller;

import com.placement.portal.entity.ApplicationFieldValue;
import com.placement.portal.exception.ResourceNotFoundException;
import com.placement.portal.repository.ApplicationFieldValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileDownloadController {

    @Autowired
    private ApplicationFieldValueRepository fieldValueRepository;

    @GetMapping("/download/{applicationId}/{fieldName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable Long applicationId,
            @PathVariable String fieldName) {

        // Note: In a production app, you'd add extra security checks here
        // to ensure the student only downloads their own files, etc.

        ApplicationFieldValue fieldValue = fieldValueRepository.findAll().stream()
                .filter(fv -> fv.getApplication().getId().equals(applicationId) &&
                        fv.getFieldDefinition().getFieldName().equalsIgnoreCase(fieldName))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("File not found for this application and field"));

        if (fieldValue.getFileData() == null) {
            throw new ResourceNotFoundException("No file data found for this field");
        }

        String contentType = fieldValue.getFileType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fieldValue.getFileName() + "\"")
                .body(fieldValue.getFileData());
    }
}
