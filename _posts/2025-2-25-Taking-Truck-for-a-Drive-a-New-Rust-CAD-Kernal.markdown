---
layout: post
title:  Taking Truck for a Drive - A New Rust CAD Kernal - DRAFT
date:   2025-2-25 00:10:00 -0500
categories: jekyll update
---

## **Introduction**

#### **What is truck?**
[truck](https://github.com/ricosjp/truck) is a new CAD kernal written in Rust. It is being developed by a company in Japan called [RICOS Co. Ltd.](https://www.ricos.ltd/).

#### **What is CAD?**
if you're not familiar, [**CAD**](https://en.wikipedia.org/wiki/Computer-aided_design) (computer assisted design) software or kernals are programs or libraries that help people create designs in lots of different fields. However, **truck** is a library to perform strictly geometric operations to create mechanical designs, such as boolean operations like:
* Union (make a new shape out of multiple 2D/3D shapes)
* Intersection (make a new shape out of only the overlapping areas/volumes of multiple 2D/3D shapes)
* Difference (make a new shape by subtracting one or more shapes from a single shape's area/volume)

There are lots of other operations that a CAD software package or kernal would typically implement to make the user's life easier, but the basic operations above are the building blocks for most other features. The problem is that developing CAD software is complex, time consuming, and error-prone.

There is a long [**history**](https://news.ycombinator.com/item?id=43167865) in this domain which made me think about **truck** and how unique it is to see a new and open-source competitor to other long-standing open-source projects:
* [**OpenCasecade OCCT**](https://github.com/Open-Cascade-SAS/OCCT): open-source library, used by [**FreeCAD**](https://www.freecad.org/) and lots of other open-source projects. it has lots of problems and is slightly limited in some regards, but is the only real alternative to other closed-source solutions.
* [**SolveSpace**](https://solvespace.com/index.pl): open-source software and [**library**](https://solvespace.com/library.pl). Even more limited than OCCT and with more bugs (see [this](https://github.com/solvespace/solvespace/issues/1024))
* [**Fornjot**](https://www.fornjot.app/) open-source library but haven't seen this mentioned or used much in other projects

There are also lots of [**closed-source projects**](https://en.wikipedia.org/wiki/Geometric_modeling_kernel) that have been around for 40+ years in some form or another.

If you would like to learn more about geometric modeling and the math behind it, I recommend the book [**Geometric Modeling: The mathematics of shapes**](https://www.amazon.com/Geometric-Modeling-mathematics-Nikolay-Golovanov/dp/1497473195). This book is a goldmine of resources that I haven't really ever seen before.

#### **What are we doing with truck?**
I just want to give it a spin. I was excited to try it out more thoroughly in a project called [**CADmium**](https://github.com/CADmium-Co/CADmium), but it never really took off.


<br>


## **Installing Rust and truck**
if you're following along, we'll need rust, download it [here](https://www.rust-lang.org/tools/install).

Next, we'll need **truck**. **truck**'s structure is split into a bunch of separate Rust creates, as documented [here](https://ricos.gitlab.io/truck-tutorial/v0.6/).