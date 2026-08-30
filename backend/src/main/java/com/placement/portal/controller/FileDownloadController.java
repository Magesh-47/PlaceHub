package com.placement.portal.controller;

import com.placement.portal.entity.ApplicationFieldValue;
import com.placement.portal.entity.StudentProfile;
import com.placement.portal.entity.User;
import com.placement.portal.exception.ResourceNotFoundException;
import com.placement.portal.exception.UnauthorizedException;
import com.placement.portal.repository.ApplicationFieldValueRepository;
import com.placement.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileDownloadController {

    @Autowired
    private ApplicationFieldValueRepository fieldValueRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile-picture/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<byte[]> getProfilePicture(
            @PathVariable Long userId,
            Authentication authentication) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !user.getUsername().equals(authentication.getName())) {
            throw new UnauthorizedException("You can only view your own profile picture");
        }

        StudentProfile profile = user.getStudentProfile();
        if (profile == null || profile.getProfilePicture() == null) {
            throw new ResourceNotFoundException("No profile picture found for this student");
        }

        String contentType = profile.getProfilePictureType() != null
                ? profile.getProfilePictureType()
                : "image/jpeg";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(profile.getProfilePicture());
    }

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
