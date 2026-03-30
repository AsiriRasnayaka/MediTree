package com.meditree.meditree_backend.datastructure;
import com.meditree.meditree_backend.model.Patient;

import java.util.ArrayList;
import java.util.List;

public class AVLTree {

    private AVLNode root; // The top node of the tree

    public AVLTree() {
        this.root = null;
    }

    // -------------------------------------------------------
    // HELPER: Get height of a node (null node = height 0)
    // -------------------------------------------------------
    private int height(AVLNode node) {
        if (node == null) return 0;
        return node.height;
    }

    // -------------------------------------------------------
    // HELPER: Get balance factor
    // balance > 1  → left side too heavy → rotate right
    // balance < -1 → right side too heavy → rotate left
    // -------------------------------------------------------
    private int getBalance(AVLNode node) {
        if (node == null) return 0;
        return height(node.left) - height(node.right);
    }

    // -------------------------------------------------------
    // HELPER: Update a node's height after changes
    // -------------------------------------------------------
    private void updateHeight(AVLNode node) {
        node.height = 1 + Math.max(height(node.left), height(node.right));
    }

    // -------------------------------------------------------
    // RIGHT ROTATION — fixes Left-Left imbalance
    // In MAX HEAP, left side has higher scores
    //
    //     y                x
    //    / \              / \
    //   x   C    →      A   y
    //  / \                 / \
    // A   B               B   C
    // -------------------------------------------------------
    private AVLNode rightRotate(AVLNode y) {
        AVLNode x  = y.left;
        AVLNode B  = x.right;

        // Perform rotation
        x.right = y;
        y.left  = B;

        // Update heights (y first, then x, because x is now above y)
        updateHeight(y);
        updateHeight(x);

        return x; // x is the new root of this subtree
    }

    // -------------------------------------------------------
    // LEFT ROTATION — fixes Right-Right imbalance
    //
    //   x                  y
    //  / \                / \
    // A   y      →       x   C
    //    / \            / \
    //   B   C          A   B
    // -------------------------------------------------------
    private AVLNode leftRotate(AVLNode x) {
        AVLNode y  = x.right;
        AVLNode B  = y.left;

        // Perform rotation
        y.left  = x;
        x.right = B;

        // Update heights
        updateHeight(x);
        updateHeight(y);

        return y; // y is the new root of this subtree
    }

    // -------------------------------------------------------
    // BALANCE — check and fix imbalance after insert/delete
    // There are 4 possible imbalance cases
    // -------------------------------------------------------
    private AVLNode balance(AVLNode node) {
        updateHeight(node);
        int bal = getBalance(node);

        // Case 1: Left-Left → single right rotation
        if (bal > 1 && getBalance(node.left) >= 0)
            return rightRotate(node);

        // Case 2: Left-Right → left rotate child, then right rotate
        if (bal > 1 && getBalance(node.left) < 0) {
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }

        // Case 3: Right-Right → single left rotation
        if (bal < -1 && getBalance(node.right) <= 0)
            return leftRotate(node);

        // Case 4: Right-Left → right rotate child, then left rotate
        if (bal < -1 && getBalance(node.right) > 0) {
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }

        return node; // already balanced, no change needed
    }

    // -------------------------------------------------------
    // INSERT — add a new patient into the AVL tree (Max Heap)
    // Max Priority Score = Root (highest priority patient on top)
    // -------------------------------------------------------
    private AVLNode insert(AVLNode node, Patient patient) {
        // Step 1: Normal BST insert (find the right empty spot)
        if (node == null) return new AVLNode(patient);

        // FOR MAX HEAP: Insert to left if score is greater, right if smaller
        if (patient.getPriorityScore() > node.patient.getPriorityScore()) {
            node.left = insert(node.left, patient);   // go left for higher score (max heap)
        } else if (patient.getPriorityScore() < node.patient.getPriorityScore()) {
            node.right = insert(node.right, patient); // go right for lower score
        } else {
            // Same score — add tiny offset to avoid duplicates
            patient.setPriorityScore(patient.getPriorityScore() + 1);
            node.left = insert(node.left, patient);
        }

        // Step 2: Rebalance after insert
        return balance(node);
    }

    // Public method to insert a patient
    public void insert(Patient patient) {
        root = insert(root, patient);
    }

    // -------------------------------------------------------
    // FIND MINIMUM — used when deleting a node
    // The minimum is the leftmost node
    // -------------------------------------------------------
    private AVLNode findMin(AVLNode node) {
        while (node.left != null) node = node.left;
        return node;
    }

    // -------------------------------------------------------
    // DELETE — remove a patient by their priority score
    // -------------------------------------------------------
    private AVLNode delete(AVLNode node, int score) {
        if (node == null) return null;

        if (score < node.patient.getPriorityScore()) {
            node.left = delete(node.left, score);       // go left
        } else if (score > node.patient.getPriorityScore()) {
            node.right = delete(node.right, score);     // go right
        } else {
            // Found the node to delete — 3 cases:

            // Case 1: No children (leaf node)
            if (node.left == null && node.right == null) return null;

            // Case 2: One child
            if (node.left == null)  return node.right;
            if (node.right == null) return node.left;

            // Case 3: Two children
            // Replace with the smallest node from the right subtree
            AVLNode successor = findMin(node.right);
            node.patient = successor.patient;
            node.right = delete(node.right, successor.patient.getPriorityScore());
        }

        // Rebalance after delete
        return balance(node);
    }

    // Public method to delete by score
    public void delete(int score) {
        root = delete(root, score);
    }

    // -------------------------------------------------------
    // TREAT NEXT — removes and returns the highest priority patient
    // In MAX HEAP: Highest priority = ROOT NODE
    // -------------------------------------------------------
    public Patient treatNextPatient() {
        if (root == null) return null;

        Patient next = root.patient;
        delete(root.patient.getPriorityScore()); // remove from tree
        return next;
    }

    // -------------------------------------------------------
    // GET SORTED QUEUE — returns all patients sorted highest first
    // In MAX HEAP: In-order traversal: left → root → right
    // (Left subtree has higher scores, right subtree has lower scores)
    // -------------------------------------------------------
    public List<Patient> getSortedQueue() {
        List<Patient> queue = new ArrayList<>();
        inOrderTraversal(root, queue);
        return queue;
    }

    private void inOrderTraversal(AVLNode node, List<Patient> list) {
        if (node == null) return;
        inOrderTraversal(node.left, list);  // visit higher scores first (left subtree)
        list.add(node.patient);
        inOrderTraversal(node.right, list); // visit lower scores last (right subtree)
    }

    // -------------------------------------------------------
    // FIND PATIENT BY ID — search through tree
    // -------------------------------------------------------
    public Patient findById(String id) {
        return findById(root, id);
    }

    private Patient findById(AVLNode node, String id) {
        if (node == null) return null;
        if (node.patient.getId().equals(id)) return node.patient;

        // Search both sides (ID doesn't follow score order)
        Patient leftResult  = findById(node.left, id);
        if (leftResult != null) return leftResult;
        return findById(node.right, id);
    }

    // -------------------------------------------------------
    // UPDATE PATIENT CONDITION (Novelty Feature 1)
    // Remove → update severity → re-insert with new score
    // -------------------------------------------------------
    public boolean updatePatientSeverity(String id, int newSeverity) {
        Patient patient = findById(id);
        if (patient == null) return false;

        delete(patient.getPriorityScore());  // remove from tree
        patient.updateSeverity(newSeverity); // recalculate score
        insert(patient);                     // re-insert with new score
        return true;
    }

    // -------------------------------------------------------
    // ESTIMATE WAIT TIME (Novelty Feature 2)
    // Count how many patients have higher score than given patient
    // Each patient takes ~15 minutes average
    // -------------------------------------------------------
    public int estimateWaitTime(String patientId) {
        Patient patient = findById(patientId);
        if (patient == null) return -1;

        int patientsAhead = countPatientsAhead(root, patient.getPriorityScore());
        return patientsAhead * 15; // 15 minutes per patient
    }

    private int countPatientsAhead(AVLNode node, int score) {
        if (node == null) return 0;
        
        // In MAX HEAP: Left subtree has higher scores, right subtree has lower scores
        if (node.patient.getPriorityScore() > score) {
            // This node is ahead + check both sides
            return 1 + countPatientsAhead(node.left, score)
                    + countPatientsAhead(node.right, score);
        } else {
            // Only left side can have higher scores (max heap property)
            return countPatientsAhead(node.left, score);
        }
    }

    // -------------------------------------------------------
    // GET ALERTS (Novelty Feature 3)
    // Find patients who've waited beyond safe limit for severity
    //
    // Safe wait limits by severity:
    //   10 (critical) → max 0 minutes
    //   8-9           → max 10 minutes
    //   5-7           → max 30 minutes
    //   1-4           → max 60 minutes
    // -------------------------------------------------------
    public List<Patient> getAlerts() {
        List<Patient> alerts = new ArrayList<>();
        checkAlerts(root, alerts);
        return alerts;
    }

    private void checkAlerts(AVLNode node, List<Patient> alerts) {
        if (node == null) return;

        Patient p = node.patient;
        p.refreshWaitTime(); // update wait time from real clock

        int maxWait = getMaxWaitForSeverity(p.getSeverity());
        if (p.getWaitMinutes() > maxWait) {
            alerts.add(p);
        }

        checkAlerts(node.left, alerts);
        checkAlerts(node.right, alerts);
    }

    private int getMaxWaitForSeverity(int severity) {
        if (severity == 10)        return 0;
        else if (severity >= 8)    return 10;
        else if (severity >= 5)    return 30;
        else                       return 60;
    }

    // -------------------------------------------------------
    // STATS — total count of patients in tree
    // -------------------------------------------------------
    public int getTotalPatients() {
        return countNodes(root);
    }

    private int countNodes(AVLNode node) {
        if (node == null) return 0;
        return 1 + countNodes(node.left) + countNodes(node.right);
    }

    // Get tree height (for visualization)
    public int getTreeHeight() {
        return height(root);
    }

    // -------------------------------------------------------
    // VISUALIZE TREE (For Admin Panel)
    // Converts AVL tree to JSON-friendly structure for visualization
    // -------------------------------------------------------
    public TreeNode getTreeStructure() {
        return convertToTreeNode(root);
    }

    private TreeNode convertToTreeNode(AVLNode node) {
        if (node == null) return null;

        TreeNode treeNode = new TreeNode();
        treeNode.id = node.patient.getId();
        treeNode.name = node.patient.getName();
        treeNode.score = node.patient.getPriorityScore();
        treeNode.severity = node.patient.getSeverity();
        treeNode.status = node.patient.getStatus();
        treeNode.height = node.height;

        if (node.left != null) {
            treeNode.left = convertToTreeNode(node.left);
        }
        if (node.right != null) {
            treeNode.right = convertToTreeNode(node.right);
        }

        return treeNode;
    }

    // -------------------------------------------------------
    // TreeNode - For visualization
    // -------------------------------------------------------
    public static class TreeNode {
        public String id;
        public String name;
        public int score;
        public int severity;
        public String status;
        public int height;
        public TreeNode left;
        public TreeNode right;
    }
}
