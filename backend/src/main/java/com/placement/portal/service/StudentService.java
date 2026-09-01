package com.placement.portal.service;

import com.placement.portal.dto.StudentRequest;
import com.placement.portal.dto.StudentResponse;
import com.placement.portal.entity.StudentProfile;
import com.placement.portal.entity.User;
import com.placement.portal.exception.ResourceNotFoundException;
import com.placement.portal.repository.StudentProfileRepository;
import com.placement.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

@Service
public class StudentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        // Check if email already exists
        if (studentProfileRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create User
        User user = new User();
        // Validate Password
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.STUDENT);
        user.setEnabled(true);

        // Create Student Profile
        StudentProfile profile = new StudentProfile();
        profile.setFullName(request.getFullName());
        profile.setEmail(request.getEmail());
        profile.setDepartment(request.getDepartment());
        profile.setYear(request.getYear());
        profile.setPhone(request.getPhone());
        profile.setCgpa(request.getCgpa());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setUser(user);

        user.setStudentProfile(profile);

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser);
    }

    public Page<StudentResponse> getAllStudents(@NonNull Pageable pageable) {
        return studentProfileRepository.findAll(pageable)
                .map(this::mapProfileToResponse);
    }

    public Page<StudentResponse> getAllStudents(@NonNull Pageable pageable, String department, String name) {
        if (name != null && !name.isEmpty() && department != null && !department.isEmpty()) {
            return studentProfileRepository.findByFullNameContainingIgnoreCaseAndDepartment(name, department, pageable)
                    .map(this::mapProfileToResponse);
        } else if (name != null && !name.isEmpty()) {
            return studentProfileRepository.findByFullNameContainingIgnoreCase(name, pageable)
                    .map(this::mapProfileToResponse);
        } else if (department != null && !department.isEmpty()) {
            return studentProfileRepository.findByDepartment(department, pageable)
                    .map(this::mapProfileToResponse);
        }
        return studentProfileRepository.findAll(pageable)
                .map(this::mapProfileToResponse);
    }

    public StudentResponse getStudentById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Student ID cannot be null");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!user.getRole().equals(User.Role.STUDENT)) {
            throw new ResourceNotFoundException("User is not a student");
        }

        return mapToResponse(user);
    }

    public StudentResponse getStudentByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!user.getRole().equals(User.Role.STUDENT)) {
            throw new ResourceNotFoundException("User is not a student");
        }

        return mapToResponse(user);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request, String currentUsername) {
        if (id == null) {
            throw new IllegalArgumentException("Student ID cannot be null");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!user.getRole().equals(User.Role.STUDENT)) {
            throw new ResourceNotFoundException("User is not a student");
        }

        StudentProfile profile = user.getStudentProfile();

        // Update profile fields
        profile.setFullName(request.getFullName());
        profile.setDepartment(request.getDepartment());
        profile.setYear(request.getYear());
        profile.setPhone(request.getPhone());
        profile.setCgpa(request.getCgpa());
        profile.setDateOfBirth(request.getDateOfBirth());

        // Update email if changed
        if (!profile.getEmail().equals(request.getEmail())) {
            if (studentProfileRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            profile.setEmail(request.getEmail());
        }

        // Update password if provided (only for admin updates)
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Student ID cannot be null");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!user.getRole().equals(User.Role.STUDENT)) {
            throw new ResourceNotFoundException("User is not a student");
        }

        userRepository.delete(user);
    }

    public java.util.List<StudentResponse> getStudentsByDepartment(String department) {
        return studentProfileRepository.findByDepartment(department).stream()
                .map(this::mapProfileToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public byte[] exportStudentsToCSV(String department) {
        java.util.List<StudentProfile> students;
        if (department != null && !department.isEmpty()) {
            students = studentProfileRepository.findByDepartment(department);
        } else {
            students = studentProfileRepository.findAll();
        }

        try (java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                java.io.OutputStreamWriter osw = new java.io.OutputStreamWriter(baos,
                        java.nio.charset.StandardCharsets.UTF_8);
                com.opencsv.CSVWriter writer = new com.opencsv.CSVWriter(osw)) {

            // Header
            String[] header = { "ID", "Full Name", "Email", "Department", "Year", "Phone", "CGPA", "DOB" };
            writer.writeNext(header);

            // Data
            for (StudentProfile student : students) {
                String[] row = {
                        student.getId().toString(),
                        student.getFullName(),
                        student.getEmail(),
                        student.getDepartment(),
                        student.getYear().toString(),
                        student.getPhone(),
                        student.getCgpa().toString(),
                        student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : ""
                };
                writer.writeNext(row);
            }

            writer.flush();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }

    private StudentResponse mapToResponse(User user) {
        StudentProfile profile = user.getStudentProfile();
        return new StudentResponse(
                user.getId(),
                user.getUsername(),
                profile.getFullName(),
                profile.getEmail(),
                profile.getDepartment(),
                profile.getYear(),
                profile.getPhone(),
                profile.getCgpa(),
                profile.getDateOfBirth(),
                profile.getProfilePicture() != null);
    }

    private StudentResponse mapProfileToResponse(StudentProfile profile) {
        User user = profile.getUser();
        return new StudentResponse(
                user.getId(),
                user.getUsername(),
                profile.getFullName(),
                profile.getEmail(),
                profile.getDepartment(),
                profile.getYear(),
                profile.getPhone(),
                profile.getCgpa(),
                profile.getDateOfBirth(),
                profile.getProfilePicture() != null);
    }

    private static final java.util.Set<String> ALLOWED_PICTURE_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp");
    private static final long MAX_PICTURE_SIZE_BYTES = 2 * 1024 * 1024;

    @Transactional
    public StudentResponse updateProfilePicture(String username,
            org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided");
        }
        if (!ALLOWED_PICTURE_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPEG, PNG, or WEBP images are allowed");
        }
        if (file.getSize() > MAX_PICTURE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image must be 2MB or smaller");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        StudentProfile profile = user.getStudentProfile();
        try {
            profile.setProfilePicture(file.getBytes());
            profile.setProfilePictureType(file.getContentType());
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to process image upload", e);
        }

        userRepository.save(user);
        return mapToResponse(user);
    }

    @Transactional
    public com.placement.portal.dto.StudentProfileDetailsResponse getProfileDetails(String username) {
        return mapToDetailsResponse(getProfileByUsername(username));
    }

    @Transactional
    public com.placement.portal.dto.StudentProfileDetailsResponse updateSummary(String username, String summary) {
        StudentProfile profile = getProfileByUsername(username);
        profile.setSummary(summary);
        studentProfileRepository.save(profile);
        return mapToDetailsResponse(profile);
    }

    @Transactional
    public com.placement.portal.dto.StudentProfileDetailsResponse updateEducation(
            String username, java.util.List<com.placement.portal.dto.EducationDto> entries) {
        StudentProfile profile = getProfileByUsername(username);

        profile.getEducation().clear();
        int order = 0;
        for (com.placement.portal.dto.EducationDto dto : entries) {
            com.placement.portal.entity.EducationEntry entry = new com.placement.portal.entity.EducationEntry();
            entry.setStudent(profile);
            entry.setInstitution(dto.getInstitution());
            entry.setDegree(dto.getDegree());
            entry.setFieldOfStudy(dto.getFieldOfStudy());
            entry.setStartYear(dto.getStartYear());
            entry.setEndYear(dto.getEndYear());
            entry.setGradeOrScore(dto.getGradeOrScore());
            entry.setDisplayOrder(order++);
            profile.getEducation().add(entry);
        }

        studentProfileRepository.save(profile);
        return mapToDetailsResponse(profile);
    }

    private com.placement.portal.dto.StudentProfileDetailsResponse mapToDetailsResponse(StudentProfile profile) {
        java.util.List<com.placement.portal.dto.EducationDto> education = profile.getEducation().stream()
                .map(e -> new com.placement.portal.dto.EducationDto(
                        e.getId(), e.getInstitution(), e.getDegree(), e.getFieldOfStudy(),
                        e.getStartYear(), e.getEndYear(), e.getGradeOrScore()))
                .collect(java.util.stream.Collectors.toList());

        return new com.placement.portal.dto.StudentProfileDetailsResponse(profile.getSummary(), education);
    }

    private StudentProfile getProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return user.getStudentProfile();
    }
}
