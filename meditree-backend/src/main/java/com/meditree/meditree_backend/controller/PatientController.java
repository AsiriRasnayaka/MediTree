package com.meditree.meditree_backend.controller;

import com.meditree.meditree_backend.model.Patient;


import com.meditree.meditree_backend.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// @RestController = This class receives HTTP requests from React frontend
// @RequestMapping = All URLs start with /api
// @CrossOrigin    = Allows React (port 5173) to talk to Java (port 8080)
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientService patientService; // Spring injects this automatically

    // -------------------------------------------------------
    // POST /api/patients
    // Add a new patient
    //
    // React sends: { "name": "John", "age": 45, "severity": 8, "symptoms": "chest pain" }
    // Java returns: the created Patient object with ID and score
    // -------------------------------------------------------
    @PostMapping("/patients")
    public ResponseEntity<Patient> addPatient(@RequestBody Map<String, Object> body) {
        String name     = (String) body.get("name");
        int age         = (Integer) body.get("age");
        int severity    = (Integer) body.get("severity");
        String symptoms = (String) body.get("symptoms");

        Patient created = patientService.addPatient(name, age, severity, symptoms);
        return ResponseEntity.ok(created);
    }

    // -------------------------------------------------------
    // GET /api/patients/queue
    // Get all patients sorted by priority (highest first)
    // React uses this to display the Queue View table
    // -------------------------------------------------------
    @GetMapping("/patients/queue")
    public ResponseEntity<List<Patient>> getQueue() {
        return ResponseEntity.ok(patientService.getQueue());
    }

    // -------------------------------------------------------
    // POST /api/patients/treat-next
    // Treat the next patient (removes highest priority from tree)
    // -------------------------------------------------------
    @PostMapping("/patients/treat-next")
    public ResponseEntity<?> treatNext() {
        Patient patient = patientService.treatNext();
        if (patient == null) {
            return ResponseEntity.ok(Map.of("message", "No patients in queue"));
        }
        return ResponseEntity.ok(patient);
    }

    // -------------------------------------------------------
    // PUT /api/patients/{id}/severity
    // Update a patient's severity (Novelty Feature 1)
    //
    // React sends: { "severity": 9 }
    // AVL Tree rebalances automatically
    // -------------------------------------------------------
    @PutMapping("/patients/{id}/severity")
    public ResponseEntity<?> updateSeverity(
            @PathVariable String id,
            @RequestBody Map<String, Integer> body) {

        int newSeverity = body.get("severity");
        boolean success = patientService.updateSeverity(id, newSeverity);

        if (success) {
            return ResponseEntity.ok(Map.of("message", "Severity updated successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // -------------------------------------------------------
    // GET /api/patients/{id}/wait-time
    // Get estimated wait time for a patient (Novelty Feature 2)
    // -------------------------------------------------------
    @GetMapping("/patients/{id}/wait-time")
    public ResponseEntity<?> getWaitTime(@PathVariable String id) {
        int minutes = patientService.estimateWaitTime(id);
        if (minutes == -1) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of(
                "patientId", id,
                "estimatedWaitMinutes", minutes
        ));
    }

    // -------------------------------------------------------
    // GET /api/alerts
    // Get all patients who've waited too long (Novelty Feature 3)
    // -------------------------------------------------------
    @GetMapping("/alerts")
    public ResponseEntity<List<Patient>> getAlerts() {
        return ResponseEntity.ok(patientService.getAlerts());
    }

    // -------------------------------------------------------
    // GET /api/dashboard
    // Get summary stats for the Dashboard screen
    // -------------------------------------------------------
    @GetMapping("/dashboard")
    public ResponseEntity<PatientService.DashboardStats> getDashboard() {
        return ResponseEntity.ok(patientService.getDashboardStats());
    }
}
