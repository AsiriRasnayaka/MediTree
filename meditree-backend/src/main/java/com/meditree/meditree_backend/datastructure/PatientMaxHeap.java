package com.meditree.meditree_backend.datastructure;

import com.meditree.meditree_backend.model.Patient;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

/**
 * Max Heap implementation for patients
 * - Highest priority patient at root (index 0)
 * - Parent priority >= children priority (max heap property)
 * - Automatic balancing on insert/delete
 * - O(log n) insert, O(1) peek max, O(log n) delete
 */
public class PatientMaxHeap {

    private List<Patient> heap;
    private Map<String, Integer> indexMap; // Maps patient ID to heap index for fast lookup

    public PatientMaxHeap() {
        this.heap = new ArrayList<>();
        this.indexMap = new HashMap<>();
    }

    // -------------------------------------------------------
    // INSERT — add patient to heap and maintain max heap property
    // -------------------------------------------------------
    public void insert(Patient patient) {
        heap.add(patient);
        int index = heap.size() - 1;
        indexMap.put(patient.getId(), index);
        siftUp(index);
    }

    // -------------------------------------------------------
    // SIFT UP — move node up to maintain max heap property
    // -------------------------------------------------------
    private void siftUp(int index) {
        while (index > 0) {
            int parentIndex = (index - 1) / 2;
            if (heap.get(index).getPriorityScore() > heap.get(parentIndex).getPriorityScore()) {
                // Swap with parent
                swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    // -------------------------------------------------------
    // GET MAX — return highest priority patient at root (O(1))
    // -------------------------------------------------------
    public Patient getMax() {
        if (heap.isEmpty()) return null;
        return heap.get(0);
    }

    // -------------------------------------------------------
    // EXTRACT MAX — remove and return highest priority patient
    // -------------------------------------------------------
    public Patient extractMax() {
        if (heap.isEmpty()) return null;

        Patient max = heap.get(0);
        indexMap.remove(max.getId());

        if (heap.size() == 1) {
            heap.remove(0);
            return max;
        }

        // Move last element to root
        Patient last = heap.remove(heap.size() - 1);
        heap.set(0, last);
        indexMap.put(last.getId(), 0);

        // Sift down to maintain heap property
        siftDown(0);
        return max;
    }

    // -------------------------------------------------------
    // SIFT DOWN — move node down to maintain max heap property
    // -------------------------------------------------------
    private void siftDown(int index) {
        while (true) {
            int largest = index;
            int leftChild = 2 * index + 1;
            int rightChild = 2 * index + 2;

            // Check if left child exists and is larger
            if (leftChild < heap.size() && 
                heap.get(leftChild).getPriorityScore() > heap.get(largest).getPriorityScore()) {
                largest = leftChild;
            }

            // Check if right child exists and is larger
            if (rightChild < heap.size() && 
                heap.get(rightChild).getPriorityScore() > heap.get(largest).getPriorityScore()) {
                largest = rightChild;
            }

            // If largest is not current index, swap and continue
            if (largest != index) {
                swap(index, largest);
                index = largest;
            } else {
                break;
            }
        }
    }

    // -------------------------------------------------------
    // UPDATE PRIORITY — update patient's severity and reheapify
    // -------------------------------------------------------
    public void updatePatientPriority(String patientId, int newSeverity) {
        Integer index = indexMap.get(patientId);
        if (index == null) return;

        Patient patient = heap.get(index);
        patient.updateSeverity(newSeverity);

        // Reheapify: sift up or down depending on new score
        int parentIndex = (index - 1) / 2;
        if (index > 0 && heap.get(index).getPriorityScore() > heap.get(parentIndex).getPriorityScore()) {
            siftUp(index);
        } else {
            siftDown(index);
        }
    }

    // -------------------------------------------------------
    // DELETE BY ID — remove specific patient and reheapify
    // -------------------------------------------------------
    public boolean deleteById(String patientId) {
        Integer index = indexMap.get(patientId);
        if (index == null) return false;

        indexMap.remove(patientId);

        if (index == heap.size() - 1) {
            heap.remove(index);
            return true;
        }

        // Move last element to deleted position
        Patient last = heap.remove(heap.size() - 1);
        heap.set(index, last);
        indexMap.put(last.getId(), index);

        // Reheapify
        int parentIndex = (index - 1) / 2;
        if (index > 0 && heap.get(index).getPriorityScore() > heap.get(parentIndex).getPriorityScore()) {
            siftUp(index);
        } else {
            siftDown(index);
        }

        return true;
    }

    // -------------------------------------------------------
    // FIND BY ID — find patient by ID
    // -------------------------------------------------------
    public Patient findById(String id) {
        Integer index = indexMap.get(id);
        if (index == null) return null;
        return heap.get(index);
    }

    // -------------------------------------------------------
    // GET ALL AS LIST — return all patients (not sorted)
    // -------------------------------------------------------
    public List<Patient> getAllPatients() {
        return new ArrayList<>(heap);
    }

    // -------------------------------------------------------
    // GET SORTED QUEUE — return patients sorted by priority (highest first)
    // -------------------------------------------------------
    public List<Patient> getSortedQueue() {
        List<Patient> sorted = new ArrayList<>(heap);
        sorted.sort((a, b) -> b.getPriorityScore() - a.getPriorityScore());
        return sorted;
    }

    // -------------------------------------------------------
    // SWAP — swap two elements in heap
    // -------------------------------------------------------
    private void swap(int i, int j) {
        Patient temp = heap.get(i);
        heap.set(i, heap.get(j));
        heap.set(j, temp);

        indexMap.put(heap.get(i).getId(), i);
        indexMap.put(heap.get(j).getId(), j);
    }

    // -------------------------------------------------------
    // SIZE — return number of patients
    // -------------------------------------------------------
    public int size() {
        return heap.size();
    }

    // -------------------------------------------------------
    // GET TREE STRUCTURE — For visualization
    // -------------------------------------------------------
    public HeapNode getTreeStructure() {
        if (heap.isEmpty()) return null;
        return buildHeapNode(0);
    }

    private HeapNode buildHeapNode(int index) {
        if (index >= heap.size()) return null;

        HeapNode node = new HeapNode();
        Patient patient = heap.get(index);
        node.id = patient.getId();
        node.name = patient.getName();
        node.score = patient.getPriorityScore();
        node.severity = patient.getSeverity();
        node.status = patient.getStatus();

        int leftIndex = 2 * index + 1;
        int rightIndex = 2 * index + 2;

        HeapNode leftChild = null;
        HeapNode rightChild = null;

        if (leftIndex < heap.size()) {
            leftChild = buildHeapNode(leftIndex);
            node.left = leftChild;
        }
        if (rightIndex < heap.size()) {
            rightChild = buildHeapNode(rightIndex);
            node.right = rightChild;
        }

        // Calculate node height: max(left height, right height) + 1
        // A leaf node (no children) has height 0
        int leftHeight = (leftChild != null) ? leftChild.height : -1;
        int rightHeight = (rightChild != null) ? rightChild.height : -1;
        node.height = 1 + Math.max(leftHeight, rightHeight);

        return node;
    }

    // -------------------------------------------------------
    // HeapNode — For visualization
    // -------------------------------------------------------
    public static class HeapNode {
        public String id;
        public String name;
        public int score;
        public int severity;
        public String status;
        public HeapNode left;
        public HeapNode right;
        public int height;  // Height of this node (0 for leaf, 1 for node with children, etc.)
    }
}
