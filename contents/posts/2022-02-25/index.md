---
title:      "Recursion"
date:       "2022-02-25"
category: "EN"
---

# Introduction
Recursion is a technique by which a function makes one or more calls to itself during execution, or by which a data structure relies upon smaller instances of the very same type of structure in its representation.

## The Factorial Function
- n!
  - if n = 0: 1
  - if n >= 1: n(n-1)(n-2)...3*2*1 => n(n-1)!
```python
def factorial(n):
  if n == 0:
    return 1
  else:
    return n * factorial(n-1)
```

## Binary Search
This algorithm maintains two parameters, low and high, such that all the candidate entries have index at least low and at most high.
Initially, low = 0 and high = n − 1. We then compare the target value to the median candidate, that is, the item data[mid] with index

```
mid = [(low + high)/2]
```

We consider three cases:
- If the target equals data[mid], then we have found the item we are looking for, and the search terminates successfully.
- If target < data[mid], then we recur on the first half of the sequence, that is, on the interval of indices from low to mid − 1.
- If target > data[mid], then we recur on the second half of the sequence, that is, on the interval of indices from mid + 1 to high.

An unsuccessful search occurs if low > high, as the interval [low,high] is empty.

```python
def binary_search(data, target, low, high):
  if low > high:
    return False
  else:
    mid = (low + high) // 2
    if target == data[mid]:
      return True
    elif target > data[mid]:
      return binary_search(data,target,mid+1,high)
    else:
      return binary_search(data,target,low,mid-1)

if __name__ == "__main__":
  data = [2,4,5,7,8,9,12,14,17,19,22,25,27,28,33,37]
  print(binary_search(data,22,0,len(data)-1)) # True
```

### Analyze Performance
- Range = 2^(Loop)
- log2(Range) = Loop
- log2(Range) = loge(Range) / loge(2) ≒ loge(Range)
- Range: n -> Loop = logn
- Time Complexity : O(log(n))

|Range|Loop|
|--|--|
|2|1|
|4|2|
|8|3|
|16|4|
|...|...|
|2^k|k|

## Fibonacci Numbers
### Bad Fibonacci Numbers
- 1,1,2,3,5,8...
- The number of calls more than doubles for each two consecutive indices
- This snowballing effect is what leads to the exponential running time

```python
def fibo(n):
  print("called {}".format(n))
  if n == 0:
    return 0
  elif n == 1:
    return 1
  result = fibo(n-1) + fibo(n-2)
  print("n: {} result: {}".format(n,result))
  return result

if __name__ == "__main__":
  print(fibo(5))
```

### Good Fibonacci Numbers
- We can compute much more efficiently using a recursion in which each invocation makes only one recursive call

```python
def fibo(n):
  if n <= 1:
    return (n,0)
  else:
    (a, b) = fibo(n-1)
    return (a+b, a)

if __name__ == "__main__":
  print(fibo(5)[0])
```

## Ref
https://qiita.com/tan5o/items/c977908f1e69ab2e8af1

