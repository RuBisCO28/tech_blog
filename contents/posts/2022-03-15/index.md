---
title:      "Stacks, Queues, and Deques"
date:       "2022-03-15"
category: "EN"
---

# Introduction
In this article, I'll try to dig deeper into `Stacks, Queues, and Deques`.

## Stacks
A stack is a collection of objects that are inserted and removed according to the last-in, first-out (LIFO) principle  
Stack supports the following methods  

```python
S.push(e) # Add element e to the top of stack S
S.pop() # Remove and return the top element from the stack S an error occurs if the stack is empty
S.top() # Return a reference to the top element of stack S, without removing it; an error occurs if the stack is empty
S.is_empty() # Return True if stack S does not contain any elements
len(S) # Return the number of elements in stack S; in Python, we implement this with the special method __len__
```

### Running time
- O(1)
- The size of the stack would no longer be synonymous with the length of the list
- Pushes and pops of the stack would not require changing the length of the list

## Queues
Queue is a collection of objects that are inserted and removed according to the first-in, first-out (FIFO) principle

```python
Q.enqueue(e) # Add element e to the back of queue Q.
Q.dequeue() # Remove and return the first element from queue Q; an error occurs if the queue is empty.
Q.first() # Return a reference to the element at the front of queue Q, without removing it; an error occurs if the queue is empty.
Q.is_empty() # Return True if queue Q does not contain any elements.
len(Q) # Return the number of elements in queue Q; in Python, we implement this with the special method __len__
```

## Double-Ended Queues
- It supports insertion and deletion at both the front and the back of the queue
