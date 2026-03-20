package com.meditree.meditree_backend.datastructure;
import com.meditree.meditree_backend.model.Patient;

public class AVLNode {

    Patient patient;   // The patient stored in this node
    AVLNode left;      // Points to patient with LOWER priority score
    AVLNode right;     // Points to patient with HIGHER priority score
    int height;        // Height of this node (used for balancing)

    // Constructor — creates a new node with a patient
    public AVLNode(Patient patient) {
        this.patient = patient;
        this.height = 1;   // A new node always has height 1
        this.left = null;
        this.right = null;
    }
}
