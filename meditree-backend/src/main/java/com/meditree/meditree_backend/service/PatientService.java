package com.meditree.meditree_backend.service;

import com.meditree.meditree_backend.datastructure.AVLTree;
import com.meditree.meditree_backend.model.Patient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service

public class PatientService {

    private final AVLTree avlTree = new AVLTree();

    // Auto-incrementing ID counter: P001, P002, P003...
    private final AtomicInteger idCounter = new AtomicInteger(1);

    // -------------------------------------------------------
    // ADD PATIENT
    // Generates an ID, creates a Patient, inserts into AVL Tree
    // -------------------------------------------------------
    public Patient addPatient(String name, int age, int severity, String symptoms) {
        String id = String.format("P%03d", idCounter.getAndIncrement()); // P001, P002...
        Patient patient = new Patient(id, name, age, severity, symptoms);
        avlTree.insert(patient);
        return patient;
    }

    // -------------------------------------------------------
    // GET FULL SORTED QUEUE
    // Returns all patients sorted by priority (highest first)
    // This uses reverse in-order traversal of the AVL tree
    // -------------------------------------------------------
    public List<Patient> getQueue() {
        return avlTree.getSortedQueue();
    }

    // -------------------------------------------------------
    // TREAT NEXT PATIENT
    // Removes and returns the highest priority patient
    // -------------------------------------------------------
    public Patient treatNext() {
        return avlTree.treatNextPatient();
    }

    // -------------------------------------------------------
    // UPDATE SEVERITY (Novelty Feature 1 — Dynamic Re-scoring)
    // Updates patient condition → AVL tree rebalances
    // -------------------------------------------------------
    public boolean updateSeverity(String patientId, int newSeverity) {
        return avlTree.updatePatientSeverity(patientId, newSeverity);
    }

    // -------------------------------------------------------
    // ESTIMATE WAIT TIME (Novelty Feature 2)
    // Returns estimated wait time in minutes for a patient
    // -------------------------------------------------------
    public int estimateWaitTime(String patientId) {
        return avlTree.estimateWaitTime(patientId);
    }

    // -------------------------------------------------------
    // GET ALERTS (Novelty Feature 3 — Critical Alert System)
    // Returns list of patients who've waited too long
    // -------------------------------------------------------
    public List<Patient> getAlerts() {
        return avlTree.getAlerts();
    }

    // -------------------------------------------------------
    // DASHBOARD STATS
    // Returns summary numbers for the dashboard screen
    // -------------------------------------------------------
    public DashboardStats getDashboardStats() {
        List<Patient> queue = avlTree.getSortedQueue();
        List<Patient> alerts = avlTree.getAlerts();

        int total = queue.size();
        int critical = (int) queue.stream().filter(p -> p.getSeverity() >= 8).count();
        int moderate = (int) queue.stream().filter(p -> p.getSeverity() >= 5 && p.getSeverity() < 8).count();
        int minor    = (int) queue.stream().filter(p -> p.getSeverity() < 5).count();
        int alertCount = alerts.size();

        double avgWait = queue.stream().mapToInt(Patient::getWaitMinutes).average().orElse(0);

        return new DashboardStats(total, critical, moderate, minor, alertCount, avgWait);
    }

    // -------------------------------------------------------
    // Inner class for dashboard data
    // -------------------------------------------------------
    public static class DashboardStats {
        public int total, critical, moderate, minor, alertCount;
        public double avgWaitMinutes;

        public DashboardStats(int total, int critical, int moderate, int minor,
                              int alertCount, double avgWaitMinutes) {
            this.total = total;
            this.critical = critical;
            this.moderate = moderate;
            this.minor = minor;
            this.alertCount = alertCount;
            this.avgWaitMinutes = avgWaitMinutes;
        }
    }
}
