---
title:      "Linked Lists"
date:       "2022-04-08"
category: "EN"
---

# Introduction
- Python lists have some notable disadvantages
  - The length of a dynamic array might be longer than the actual number of elements that it stores
  - Amortized bounds for operations may be unacceptable in real-time systems
  - Insertions and deletions at interior positions of an array are expensive
- Linked Lists avoid the three disadvantages noted above for array-based sequences
- In this article, I'll try to dig deeper into `Linked Lists`

## Singly Linked Lists
- An important property of a linked list is that it does not have a predetermined fixed size
- It uses space proportionally to its current number of elements

### Inserting an Element at the Head of a Singly Linked List
```python
newest = Node(e) # create new node instance storing reference to element e
newest.next = L.head # set new node’s next to reference the old head node
L.head = newest # set variable head to reference the new node
L.size = L.size + 1 # increment the node count
```

### Inserting an Element at the Tail of a Singly Linked List
```python
newest = Node(e) # create new node instance storing reference to element e
newest.next = None # set new node’s next to reference the None object
L.tail.next = newest # make old tail node point to new node
L.tail = newest # set variable tail to reference the new node
L.tail = L.size + 1 # increment the node count
```

### Removing an Element from a Singly Linked List
```python
if L.head is None:
  Indicate an error: the list is empty.
L.head = L.head.next # make head point to next node (or None)
L.size = L.size − 1
```

## Circularly Linked Lists
