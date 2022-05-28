---
title:      "Object-Oriented Programming(OOP)"
date:       "2022-01-09"
category: "EN"
---

# Introduction
Most Engineers must hear the word, Object-Oriented Programming(OOP).  
However, there are few engineers who can explain it.  
In this article, I'll try to dig deeper into this topic.

## 1. The Forgotten History of OOP
### 1-1. Low level languages to High level languages
Low level languages like machine code and assembly appeared in the 1940s.  
By the end of the 1950s, the first popular high-level languages appeared.  
After that, C-family languages have replaced both COBOL and FORTRAN for most applications.  
In the course of its programing languages development, they've established how easy it is for people to express the work they want the PC to do.

### 1-2. Structured languages
Structured languages were proposed to further improve productivity and quality of programming.  
They increased independence of subroutines to make them more maintainable.  
They also need to reduce the number of global variables shared by multiple subroutines.  
However, they have to use global valuable when they need to retain information beyond the execution time of a subroutine.     
In this case, it's difficult to know which subroutine is modifying a global variable.

### 1-3. OOP
To solve the above problems, Object-oriented programming (OOP) was coined by Alan Kay.  
OOP is a style of programming that focuses on using objects to design and build applications.
OOP organizes the program to combine data and functionality and wrap it inside something called an `Object`.

* Objects  
Objects represent a real-world entity and the basic building block of OOP.  
ex) an Online Shopping System will have objects such as shopping cart, customer,product item, etc.

* Class  
Class is the prototype or blueprint of an object. It is a template definition of the attributes and methods of an object.  
ex) in the Online Shopping System, the Customer object will have attributes like shipping address, credit card, etc., and methods for placing an order, canceling an order, etc.

## 2. The four principles of OOP
### 2-1: Encapsulation
Encapsulation is the mechanism of binding the data together and hiding it from the outside world.  
It is achieved when each object keeps its state private so that other objects don’t have direct access to its state.  
Instead, they can access this state only through a set of public functions.

```python
class Product:

    def __init__(self):
        self.__maxprice = 900

    def sell(self):
        print("Selling Price: {}".format(self.__maxprice))

    def set_max_price(self, price):
        self.__maxprice = price

product = Product()
product.sell() # Selling Price: 900

# change the price
product.__maxprice = 1000
product.sell() # Selling Price: 900

# using setter function
product.set_max_price(1000)
product.sell() # Selling Price: 1000
```

### 2-2. Abstraction
Abstraction can be thought of as the natural extension of encapsulation.  
It means hiding all but the relevant data about an object in order to reduce the complexity of the system.  
In a large system, objects talk to each other, which makes it difficult to maintain a large code base;  
Abstraction helps by hiding internal implementation details of objects and only revealing operations that are relevant to other objects.

```python
from abc import ABC, abstractmethod

class Parent(ABC):
  def common(self):
    print('In common method of Parent')

  @abstractmethod
  def vary(self):
    pass

class Child1(Parent):
  def vary(self):
    print('In vary method of Child1')

class Child2(Parent):
  def vary(self):
    print('In vary method of Child2')

# object of Child1 class
child1 = Child1()
child1.common() # In common method of Parent
child1.vary() # In vary method of Child1

# object of Child2 class
child2 = Child2()
child2.common() # In common method of Parent
child2.vary() # In vary method of Child2
```

### 2-3: Inheritance
Inheritance is a mechanism to eliminate code duplication by grouping common parts of class definitions

### 2-4: Polymorphism
Polymorphism is the ability of an object to take different forms and thus, depending upon the context, to respond to the same message in different ways.  
ex) a chess game; a chess piece can take many forms, like bishop, castle, or knight and all these pieces will respond differently to the ‘move’ message.

```python
class Bishops:

    def move(self):
        print("Bishops can move diagonally")

class Knights:

    def move(self):
        print("Knights can move two squares vertically and one square horizontally, or two squares horizontally and one square vertically")

# common interface
def move_test(chess_piece):
    chess_piece.move()

#instantiate objects
bishop = Bishops()
knight = Knights()

# passing the object
move_test(bishop) # Bishops can move diagonally
move_test(knight) # Knights can move two squares vertically and one square horizontally, or two squares horizontally and one square vertically
```

## 3. Example
### CreditCard Class
- Actually, we need to consider type check error if arg is invalid value
```python
class CreditCard
  def __init__(self, customer, bank, acnt, limit):
    # encapsulation nonpublic
    self._customer = customer
    self._bank = bank
    self._account = acnt
    self._limit = limit
    self._balance = 0

  # accessor
  def get_customer(self):
    return self._customer

  def get_bank(self):
    return self._bank

  def charge(self, price):
    if price + self._balance > self._limit: # if charge would exceed limit
      return False                          # cannot accept charge
    else:
      self._balance += price
      return True

class PredatoryCreditCard(CreditCard):
  def __init__(self, customer, bank, acnt, limit, apr):
    super().__init__(customer, bank, acnt, limit)
    self._apr = apr

  def change(self, price):
    success = super().charge(price)
    if not success:
      self._balance += 5
    return success

  def process_month(self):
    if self._balance > 0:
      monthly_factor = pow(1 + self._apr, 1/12)
      self._balance *= monthly_factor
```