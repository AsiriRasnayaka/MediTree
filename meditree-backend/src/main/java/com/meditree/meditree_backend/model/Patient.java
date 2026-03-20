package com.meditree.meditree_backend.model;

public class Patient {
    private String id;           // Unique ID (e.g., "P001")
    private String name;         // Patient's full name
    private int age;             // Patient's age
    private int severity;        // Severity level: 1 (minor) to 10 (critical)
    private String symptoms;     // Description of symptoms
    private int waitMinutes;     // How many minutes the patient has been waiting
    private int priorityScore;   // Calculated score — higher = treated first
    private long arrivalTime;    // System time when patient arrived (for wait time calc)

    // Constructor — called when a new patient is added
    public Patient(String id, String name, int age, int severity, String symptoms) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.severity = severity;
        this.symptoms = symptoms;
        this.waitMinutes = 0;
        this.arrivalTime = System.currentTimeMillis(); // record arrival time
        this.priorityScore = calculateScore();         // auto-calculate score
    }

    // Default constructor needed by Spring Boot (for JSON conversion)
    public Patient() {}

    // -------------------------------------------------------
    // PRIORITY SCORE FORMULA:
    // Score = (severity × 5) + age bonus + wait time bonus
    //
    // Age bonus: +3 if patient is a child (<12) or elderly (>65)
    // Wait bonus: +1 for every 10 minutes waiting
    //
    // Example: severity=8, age=70, waited=20min
    //   = (8×5) + 3 + 2 = 45
    // -------------------------------------------------------
    public int calculateScore() {
        int score = severity * 5;

        // Bonus for vulnerable age groups
        if (age < 12 || age > 65) {
            score += 3;
        }

        // Bonus for long wait time
        score += waitMinutes / 10;

        return score;
    }

    // Called when patient's condition changes (Novelty Feature 1)
    public void updateSeverity(int newSeverity) {
        this.severity = newSeverity;
        this.priorityScore = calculateScore(); // recalculate automatically
    }

    // Updates wait time based on real clock time
    public void refreshWaitTime() {
        long now = System.currentTimeMillis();
        this.waitMinutes = (int)((now - arrivalTime) / 60000); // convert ms to minutes
        this.priorityScore = calculateScore(); // update score with new wait time
    }

    // -------------------------------------------------------
    // Getters and Setters (Spring Boot needs these to send
    // data as JSON to the React frontend)
    // -------------------------------------------------------

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public int getSeverity() { return severity; }
    public void setSeverity(int severity) { this.severity = severity; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public int getWaitMinutes() { return waitMinutes; }
    public void setWaitMinutes(int waitMinutes) { this.waitMinutes = waitMinutes; }

    public int getPriorityScore() { return priorityScore; }
    public void setPriorityScore(int priorityScore) { this.priorityScore = priorityScore; }

    public long getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(long arrivalTime) { this.arrivalTime = arrivalTime; }

    @Override
    public String toString() {
        return "Patient{id=" + id + ", name=" + name +
                ", severity=" + severity + ", score=" + priorityScore + "}";
    }
}
