---
title:      "Trees"
date:       "2022-05-14"
category: "EN"
---

# Introduction
- In this article, we discuss one of the most important nonlinear data structures in
computing—trees.

## General Tree
- A Tree is an abstract data type that stores elements hierarchically.
- Formally, a tree T as a set of nodes storing elements such that the nodes have a parent-child relationship that satisfies the following properties
  - If T is nonempty, it has a special node, called the root of T, that has no parent
  - Each node v of T different from the root has a unique parent node w; every node with parent w is a child of w

```python
class Tree:
  class Position:
    def __ne__(self, other):
      return not (self == other)

  def root(self):
    return NotImplementError('must be implemented by subclass')

  def parent(self):
    """ return Position representing p's parent"""

  def num_children(self):
    return NotImplementError('must be implemented by subclass')

  def children(self, p):
    """Generate an iteration of Position p has"""

  def is_root(self, p):
    return self.root() == p

  def is_leaf(self, p):
    return self.num_children(p) == 0

  def is_empty(self):
    return len(self) == 0

  def depth(self, p):
    if self.is_root(p):
      return 0
    else:
      return 1 + self.depth(self.parent(p))

  def height(self, p)
    if self.is_leaf(p)
      return 0
    else:
      return 1 + max(self.height(c) for c in self.children(p))
```

## Binary Tree
- Every node has at most two children
- Each child node is labeled as being either a left child or a right child
- A left child precedes a right child in the order of children of a node

```python
class BinaryTree(Tree):
  def left(self,p):
    """return a position representing p's left child"""
    """return None if p does not have a left child"""
  
  def right(self, p):
    """return a position representing p's right child"""
    """return None if p does not have a right child"""

  def sibling(self,p):
    parent = self.parent(p)
    if parent is None:
      return None
    else:
      if p == self.left(parent):
        return self.right(parent)
      else:
        return self.left(parent)

  def children(self,p):
    if self.left(p) is not None:
      yield self.left(p)
    if self.right(p) is not None:
      yield self.right(p)
```

### Linked Binary Tree
- https://leetcode.com/problems/linked-list-in-binary-tree/
- 