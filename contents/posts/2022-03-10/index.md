---
title:      "Array-Based Sequences"
date:       "2022-03-10"
category: "EN"
---

# Introduction
In this article, we explore Python's various “sequence” classes, namely the builtin list, tuple, and str classes.  
Each supports indexing to access an individual element of a sequence, using a syntax such as seq[k].

## Low-Level Arrays
- Any byte of the main memory can be efficiently accessed based upon its memory address
- In this sense, we say that a computer’s main memory performs as random access memory (RAM)
- we say that any individual byte of memory can be stored or retrieved in O(1) time

## Referential Arrays
- Python represents a list or tuple instance using an internal storage mechanism of an array of object references.
- At the lowest level, what is stored is a consecutive sequence of memory addresses at which the elements of the sequence reside
- Although the relative size of the individual elements may vary, the number of bits used to store the memory address of each element is fixed
- Python can support constant-time access to a list or tuple element based on its index
```python
[ Rene , Joseph , Janet , Jonas , Helen , Virginia , ... ]
[0,1,2,3,4,5]
```

### Shallow copy
The below references the same elements as in the first list.  
If the contents of the list were of a mutable type, a deep copy, meaning a new list with new elements.  
It can be produced by using the deepcopy function from the copy module.

```python
backup = list(primes)
```

## Compact Arrays
- `Strings` are represented using an array of characters (not an array of references)
- Compact arrays such like `Strings` have several advantages over referential structures in terms of computing performance
  - the overall memory usage will be much lower
  - the primary data are stored consecutively in memory

## Dynamic Arrays
- A dynamic array is that a list instance maintains an underlying array that often has greater capacity than the current length of the list
- base: 56
  - length:  4: 56 + 8 * 4  = 88
  - length: 16: 56 + 8 * 16 = 184
- A list is a referential structure, the result of getsizeof for a list instance only includes the size for representing its primary structure
- The remaining issue to consider is how large of a new array to create
- A commonly used rule is for the new array to have twice the capacity of the existing array that has been filled
```python
import sys
for k in range(26):
  a = len(data)
  b = sys.getsizeof(data)
  print('Length: {0:3d}; Size in bytes: {1:4d}'.format(a,b))
  data.append(None)

Length:   0; Size in bytes:   56
Length:   1; Size in bytes:   88
Length:   2; Size in bytes:   88
Length:   3; Size in bytes:   88
Length:   4; Size in bytes:   88
Length:   5; Size in bytes:  120
Length:   6; Size in bytes:  120
Length:   7; Size in bytes:  120
Length:   8; Size in bytes:  120
Length:   9; Size in bytes:  184
Length:  10; Size in bytes:  184
Length:  11; Size in bytes:  184
Length:  12; Size in bytes:  184
Length:  13; Size in bytes:  184
Length:  14; Size in bytes:  184
Length:  15; Size in bytes:  184
Length:  16; Size in bytes:  184
Length:  17; Size in bytes:  256
Length:  18; Size in bytes:  256
Length:  19; Size in bytes:  256
Length:  20; Size in bytes:  256
Length:  21; Size in bytes:  256
Length:  22; Size in bytes:  256
Length:  23; Size in bytes:  256
Length:  24; Size in bytes:  256
Length:  25; Size in bytes:  256
```

## Multidimensional Data Sets
- We can represent a two-dimensional array as a list of rows,
with each row itself being a list of values
- An advantage of this representation is that we can naturally use a syntax such
as data[1][3]

```python
> data = ([0] * 2) * 4
> data
[0, 0, 0, 0, 0, 0, 0, 0] # This is a mistake

> data = [[0] * 2] * 4
> data
[[0, 0], [0, 0], [0, 0], [0, 0]] # Still a mistake
> data[0][1] = 2
> data
[[0, 2], [0, 2], [0, 2], [0, 2]] # same reference

> data = [[0]*2 for i in range(4)]
> data
[[0, 0], [0, 0], [0, 0], [0, 0]]
> data[0][1] = 2
> data
[[0, 2], [0, 0], [0, 0], [0, 0]] # references are isolated
```
