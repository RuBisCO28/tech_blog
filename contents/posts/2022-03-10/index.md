---
title:      "Array-Based Sequences"
date:       "2022-03-10"
category: "EN"
---

# Introduction
In this article, we explore Python's various “sequence” classes, namely the builtin list, tuple, and str classes.  
Each supports indexing to access an individual element of a sequence, using a syntax such as seq[k].

## Low-Level Arrays
### Referential Arrays
- Python represents a list or tuple instance using an internal storage mechanism of an array of object references.
- At the lowest level, what is stored is a consecutive sequence of memory addresses at which the elements of the sequence reside

```python
[ Rene , Joseph , Janet , Jonas , Helen , Virginia , ... ]
```

### Shallow copy
The below references the same elements as in the first list.  
If the contents of the list were of a mutable type, a deep copy, meaning a new list with new elements.  
It can be produced by using the deepcopy function from the copy module.

```python
backup = list(primes)
```

