package com.meditree.meditree_backend.service;

import com.meditree.meditree_backend.datastructure.PatientMaxHeap;
import com.meditree.meditree_backend.model.Patient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service

public class PatientService {

    private final PatientMaxHeap maxHeap = new PatientMaxHeap();

    // Auto-incrementing ID counter: P001, P002, P003...
    private final AtomicInteger idCounter = new AtomicInteger(1);

    // -------------------------------------------------------
    // ADD PATIENT
    // Generates an ID, creates a Patient, inserts into Max Heap
    // -------------------------------------------------------
    public Patient addPatient(String name, int age, int severity, String symptoms) {
        String id = String.format("P%03d", idCounter.getAndIncrement()); // P001, P002...
        Patient patient = new Patient(id, name, age, severity, symptoms);
        maxHeap.insert(patient);
        return patient;
    }

    // -------------------------------------------------------
    // GET FULL SORTED QUEUE
    // Returns all patients sorted by priority (highest first)
    // -------------------------------------------------------
    public List<Patient> getQueue() {
        List<Patient> queue = maxHeap.getSortedQueue();
        // Update wait times for all patients
        for (Patient p : queue) {
            p.refreshWaitTime();
        }
        return queue;
    }

    // -------------------------------------------------------
    // TREAT NEXT PATIENT
    // Removes and returns the highest priority patient (root node)
    // -------------------------------------------------------
    public Patient treatNext() {
        return maxHeap.extractMax();
    }

    // -------------------------------------------------------
    // UPDATE SEVERITY (Novelty Feature 1 — Dynamic Re-scoring)
    // Updates patient condition → Heap rebalances automatically
    // -------------------------------------------------------
    public boolean updateSeverity(String patientId, int newSeverity) {
        Patient patient = maxHeap.findById(patientId);
        if (patient == null) return false;
        maxHeap.updatePatientPriority(patientId, newSeverity);
        return true;
    }

    // -------------------------------------------------------
    // ESTIMATE WAIT TIME (Novelty Feature 2)
    // Returns estimated wait time in minutes for a patient
    // -------------------------------------------------------
    public int estimateWaitTime(String patientId) {
        Patient patient = maxHeap.findById(patientId);
        if (patient == null) return -1;
        
        // Count patients with higher priority score
        int patientsAhead = 0;
        for (Patient p : maxHeap.getAllPatients()) {
            if (p.getPriorityScore() > patient.getPriorityScore()) {
                patientsAhead++;
            }
        }
        return patientsAhead * 15; // 15 minutes per patient
    }

    // -------------------------------------------------------
    // GET ALERTS (Novelty Feature 3 — Critical Alert System)
    // Returns list of patients who've waited too long
    // -------------------------------------------------------
    public List<Patient> getAlerts() {
        List<Patient> alerts = new ArrayList<>();
        for (Patient p : maxHeap.getAllPatients()) {
            p.refreshWaitTime();
            int maxWait = getMaxWaitForSeverity(p.getSeverity());
            if (p.getWaitMinutes() > maxWait) {
                alerts.add(p);
            }
        }
        return alerts;
    }

    private int getMaxWaitForSeverity(int severity) {
        if (severity == 10) return 0;
        else if (severity >= 8) return 10;
        else if (severity >= 5) return 30;
        else return 60;
    }

    // -------------------------------------------------------
    // SEARCH & FILTER PATIENTS
    // Search by name/ID and filter by severity, status, date
    // -------------------------------------------------------
    public List<Patient> searchPatients(String query) {
        List<Patient> patients = maxHeap.getSortedQueue();
        return patients.stream()
                .filter(p -> p.getName().toLowerCase().contains(query.toLowerCase()) ||
                           p.getId().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }

    public List<Patient> filterByStatus(String status) {
        List<Patient> patients = maxHeap.getSortedQueue();
        return patients.stream()
                .filter(p -> p.getStatus().equals(status))
                .toList();
    }

    public List<Patient> filterBySeverity(int minSeverity, int maxSeverity) {
        List<Patient> patients = maxHeap.getSortedQueue();
        return patients.stream()
                .filter(p -> p.getSeverity() >= minSeverity && p.getSeverity() <= maxSeverity)
                .toList();
    }

    // -------------------------------------------------------
    // UPDATE PATIENT STATUS
    // Changes status: WAITING -> IN_TREATMENT -> DISCHARGED
    // -------------------------------------------------------
    public boolean updatePatientStatus(String patientId, String newStatus) {
        Patient patient = maxHeap.findById(patientId);
        if (patient == null) return false;
        patient.setStatus(newStatus);
        return true;
    }

    // -------------------------------------------------------
    // GET MAX HEAP STRUCTURE (For Admin Visualization)
    // Returns the heap structure for visualization
    // -------------------------------------------------------
    public PatientMaxHeap.HeapNode getTreeStructure() {
        return maxHeap.getTreeStructure();
    }

    // -------------------------------------------------------
    // DASHBOARD STATS
    // Returns summary numbers for the dashboard screen
    // -------------------------------------------------------
    public DashboardStats getDashboardStats() {
        List<Patient> queue = maxHeap.getSortedQueue();
        // Update wait times for all patients
        for (Patient p : queue) {
            p.refreshWaitTime();
        }
        List<Patient> alerts = getAlerts();

        int total = queue.size();
        int critical = (int) queue.stream().filter(p -> p.getSeverity() >= 8).count();
        int moderate = (int) queue.stream().filter(p -> p.getSeverity() >= 5 && p.getSeverity() < 8).count();
        int minor    = (int) queue.stream().filter(p -> p.getSeverity() < 5).count();
        int alertCount = alerts.size();

        int waiting = (int) queue.stream().filter(p -> "WAITING".equals(p.getStatus())).count();
        int inTreatment = (int) queue.stream().filter(p -> "IN_TREATMENT".equals(p.getStatus())).count();
        int discharged = (int) queue.stream().filter(p -> "DISCHARGED".equals(p.getStatus())).count();

        double avgWait = queue.stream().mapToInt(Patient::getWaitMinutes).average().orElse(0);
        double avgWaitCritical = queue.stream()
                .filter(p -> p.getSeverity() >= 8)
                .mapToInt(Patient::getWaitMinutes)
                .average().orElse(0);

        return new DashboardStats(total, critical, moderate, minor, alertCount, avgWait, 
                                  waiting, inTreatment, discharged, avgWaitCritical);
    }

    // -------------------------------------------------------
    // Inner class for dashboard data
    // -------------------------------------------------------
    public static class DashboardStats {
        public int total, critical, moderate, minor, alertCount;
        public double avgWaitMinutes;
        public int waiting, inTreatment, discharged;
        public double avgWaitCritical;

        public DashboardStats(int total, int critical, int moderate, int minor,
                              int alertCount, double avgWaitMinutes,
                              int waiting, int inTreatment, int discharged,
                              double avgWaitCritical) {
            this.total = total;
            this.critical = critical;
            this.moderate = moderate;
            this.minor = minor;
            this.alertCount = alertCount;
            this.avgWaitMinutes = avgWaitMinutes;
            this.waiting = waiting;
            this.inTreatment = inTreatment;
            this.discharged = discharged;
            this.avgWaitCritical = avgWaitCritical;
        }
    }
}
