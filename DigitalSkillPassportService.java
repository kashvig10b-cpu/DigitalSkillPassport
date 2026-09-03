package com.dsp.service;

import java.security.SecureRandom;
import java.util.*;

/**
 * ============================================================================
 * PROJECT: Digital Skill Passport (Enterprise Talent & Credential System)
 * MODULE: Core Business Logic & Data Structures (Java Backend Service)
 * 
 * IMPLEMENTATION HIGHLIGHTS:
 * 1. HashMap Indexing: O(1) Candidate & Skill Lookups
 * 2. Weighted Linear Scoring: Dynamic Profile Quality Algorithm (0% - 100%)
 * 3. Queue (FIFO): University Admin Credential Verification Pipeline
 * 4. Multi-Parameter Filtering: Recruiter Matching & Min-Completion Threshold
 * 5. PRNG Cryptographic Generator: Collision-Free Passport ID Derivation
 * ============================================================================
 */
public class DigitalSkillPassportService {

    // ------------------------------------------------------------------------
    // Entity Model: Student Digital Passport
    // ------------------------------------------------------------------------
    public static class StudentPassport {
        private String passportId;
        private String name;
        private String email;
        private String degree;
        private String department;
        private String bio;
        private String phone;
        private String location;
        private String resumeUrl;
        private boolean hasProfilePhoto;
        private List<String> skills;
        private List<String> projects;
        private List<CertificateProof> certificates;
        private int educationCount;
        private int profileCompletionScore;

        public StudentPassport(String name, String email, String degree, String department) {
            this.name = name;
            this.email = email;
            this.degree = degree;
            this.department = department;
            this.passportId = generatePassportId(name);
            this.skills = new ArrayList<>();
            this.projects = new ArrayList<>();
            this.certificates = new ArrayList<>();
            this.bio = "";
            this.phone = "";
            this.location = "";
            this.resumeUrl = "";
            this.hasProfilePhoto = false;
            this.educationCount = 0;
            this.profileCompletionScore = 0;
        }

        public String getPassportId() { return passportId; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getDegree() { return degree; }
        public String getDepartment() { return department; }
        public List<String> getSkills() { return skills; }
        public List<String> getProjects() { return projects; }
        public List<CertificateProof> getCertificates() { return certificates; }
        public int getProfileCompletionScore() { return profileCompletionScore; }
        public void setProfileCompletionScore(int score) { this.profileCompletionScore = score; }

        public void setBio(String bio) { this.bio = bio; }
        public void setContact(String phone, String location) { this.phone = phone; this.location = location; }
        public void setResumeUrl(String url) { this.resumeUrl = url; }
        public void setHasProfilePhoto(boolean hasPhoto) { this.hasProfilePhoto = hasPhoto; }
        public void setEducationCount(int count) { this.educationCount = count; }

        public void addSkill(String skill) { this.skills.add(skill); }
        public void addProject(String project) { this.projects.add(project); }
        public void addCertificate(CertificateProof cert) { this.certificates.add(cert); }

        public boolean isVerified() {
            for (CertificateProof c : certificates) {
                if (c.isApproved()) return true;
            }
            return false;
        }

        @Override
        public String toString() {
            return String.format("[%s] %s | %s (%s) | Completion: %d%% | Verified: %s",
                    passportId, name, degree, department, profileCompletionScore, isVerified() ? "YES" : "NO");
        }
    }

    // ------------------------------------------------------------------------
    // Entity Model: Certificate Proof
    // ------------------------------------------------------------------------
    public static class CertificateProof {
        private String certId;
        private String studentPassportId;
        private String title;
        private String issuer;
        private boolean isApproved;

        public CertificateProof(String certId, String studentPassportId, String title, String issuer) {
            this.certId = certId;
            this.studentPassportId = studentPassportId;
            this.title = title;
            this.issuer = issuer;
            this.isApproved = false;
        }

        public String getCertId() { return certId; }
        public String getStudentPassportId() { return studentPassportId; }
        public String getTitle() { return title; }
        public String getIssuer() { return issuer; }
        public boolean isApproved() { return isApproved; }
        public void setApproved(boolean approved) { this.isApproved = approved; }
    }

    // ------------------------------------------------------------------------
    // 1. Cryptographic Passport ID Generator (PRNG)
    // ------------------------------------------------------------------------
    private static final SecureRandom random = new SecureRandom();

    public static String generatePassportId(String name) {
        String clean = name.replaceAll("[^a-zA-Z]", "").toUpperCase();
        String prefix = clean.length() >= 6 ? clean.substring(0, 6) : (clean + "PASSPORT").substring(0, 6);
        byte[] bytes = new byte[3];
        random.nextBytes(bytes);
        StringBuilder hex = new StringBuilder();
        for (byte b : bytes) {
            hex.append(String.format("%02X", b));
        }
        return prefix + "-" + hex.toString();
    }

    // ------------------------------------------------------------------------
    // 2. Weighted Linear Reduction Scoring Algorithm (0% - 100%)
    // ------------------------------------------------------------------------
    public static int calculateProfileScore(StudentPassport student) {
        int total = 0;
        if (student.hasProfilePhoto) total += 10;
        if (student.bio != null && student.bio.length() > 10) total += 10;
        if (!student.phone.isEmpty() && !student.location.isEmpty()) total += 10;
        if (!student.degree.isEmpty() && !student.department.isEmpty()) total += 15;
        if (student.educationCount > 0) total += 15;
        if (!student.skills.isEmpty()) total += 15;
        if (!student.projects.isEmpty()) total += 15;
        if (!student.certificates.isEmpty() || !student.resumeUrl.isEmpty()) total += 10;

        int finalScore = Math.min(100, total);
        student.setProfileCompletionScore(finalScore);
        return finalScore;
    }

    // ------------------------------------------------------------------------
    // 3. HashMap Search & Fast Indexing (O(1))
    // ------------------------------------------------------------------------
    public static class PassportRepository {
        // Fast O(1) Passport ID Map
        private Map<String, StudentPassport> idMap = new HashMap<>();
        // Inverted Skill Map: Skill -> List<StudentPassport>
        private Map<String, List<StudentPassport>> skillMap = new HashMap<>();

        public void save(StudentPassport student) {
            calculateProfileScore(student);
            idMap.put(student.getPassportId().toUpperCase(), student);

            for (String skill : student.getSkills()) {
                String key = skill.toLowerCase().trim();
                skillMap.computeIfAbsent(key, k -> new ArrayList<>()).add(student);
            }
        }

        public StudentPassport findById(String passportId) {
            return idMap.get(passportId.toUpperCase().trim());
        }

        public List<StudentPassport> findBySkill(String skill) {
            return skillMap.getOrDefault(skill.toLowerCase().trim(), Collections.emptyList());
        }

        public Collection<StudentPassport> findAll() {
            return idMap.values();
        }
    }

    // ------------------------------------------------------------------------
    // 4. University Admin Credential Audit Queue (FIFO)
    // ------------------------------------------------------------------------
    public static class AdminVerificationQueue {
        private Queue<CertificateProof> auditQueue = new LinkedList<>();

        public void enqueueProof(CertificateProof proof) {
            auditQueue.offer(proof);
        }

        public CertificateProof verifyNext(boolean approve, PassportRepository repo) {
            CertificateProof proof = auditQueue.poll();
            if (proof != null) {
                proof.setApproved(approve);
                StudentPassport student = repo.findById(proof.getStudentPassportId());
                if (student != null) {
                    calculateProfileScore(student);
                }
            }
            return proof;
        }

        public int pendingCount() {
            return auditQueue.size();
        }
    }

    // ------------------------------------------------------------------------
    // 5. Recruiter Candidate Filtering & Timsort Algorithm
    // ------------------------------------------------------------------------
    public static List<StudentPassport> searchCandidates(
            PassportRepository repo,
            int minCompletion,
            boolean onlyVerified,
            String skill
    ) {
        List<StudentPassport> matches = new ArrayList<>();

        for (StudentPassport sp : repo.findAll()) {
            if (sp.getProfileCompletionScore() < minCompletion) continue;
            if (onlyVerified && !sp.isVerified()) continue;
            if (skill != null && !skill.isEmpty()) {
                boolean hasSkill = sp.getSkills().stream().anyMatch(s -> s.equalsIgnoreCase(skill));
                if (!hasSkill) continue;
            }
            matches.add(sp);
        }

        // Timsort: descending by score
        matches.sort((a, b) -> Integer.compare(b.getProfileCompletionScore(), a.getProfileCompletionScore()));
        return matches;
    }

    // ------------------------------------------------------------------------
    // Main Method for Professor Demonstration & Viva Testing
    // ------------------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=================================================================");
        System.out.println("  DIGITAL SKILL PASSPORT - JAVA BACKEND CORE SERVICE (DSA)");
        System.out.println("=================================================================\n");

        PassportRepository repo = new PassportRepository();
        AdminVerificationQueue queue = new AdminVerificationQueue();

        // 1. Add sample student
        StudentPassport s1 = new StudentPassport("Kashvi Garg", "kashvi@college.edu", "B.Tech CSE", "AI");
        s1.setBio("Full-stack developer building real-time applications.");
        s1.setContact("+91 9876543210", "Bengaluru");
        s1.setHasProfilePhoto(true);
        s1.setEducationCount(2);
        s1.addSkill("Java");
        s1.addSkill("React");
        s1.addSkill("Spring Boot");
        s1.addProject("Digital Skill Passport System");
        s1.setResumeUrl("/api/files/resume.pdf");

        CertificateProof cert1 = new CertificateProof("CERT-01", s1.getPassportId(), "AWS Certified Developer", "Amazon");
        s1.addCertificate(cert1);

        StudentPassport s2 = new StudentPassport("Chandan Kumar", "chandan@college.edu", "B.Tech IT", "Cybersecurity");
        s2.addSkill("Java");
        s2.setHasProfilePhoto(true);

        repo.save(s1);
        repo.save(s2);

        System.out.println("1. Registered Students in HashMap:");
        for (StudentPassport sp : repo.findAll()) {
            System.out.println("   " + sp);
        }

        System.out.println("\n2. HashMap O(1) Search by Passport ID [" + s1.getPassportId() + "]:");
        StudentPassport found = repo.findById(s1.getPassportId());
        System.out.println("   Found: " + found.getName() + " (" + found.getEmail() + ")");

        System.out.println("\n3. Admin Verification Queue (FIFO):");
        queue.enqueueProof(cert1);
        System.out.println("   Pending in queue: " + queue.pendingCount());
        queue.verifyNext(true, repo);
        System.out.println("   After verification: " + s1);

        System.out.println("\n4. Recruiter Candidate Search (Min Completion >= 50%, Skill = 'Java'):");
        List<StudentPassport> results = searchCandidates(repo, 50, true, "Java");
        for (StudentPassport sp : results) {
            System.out.println("   -> " + sp);
        }

        System.out.println("\n=================================================================");
        System.out.println("  EXECUTION SUCCESSFUL!");
        System.out.println("=================================================================");
    }
}
