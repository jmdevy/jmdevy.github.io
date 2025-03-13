---
layout: post
title:  Taking Truck for a Drive - A New Rust CAD Kernal - DRAFT
date:   2025-2-25 00:10:00 -0500
categories: jekyll update
---


<style>
    /* Code block background */
    .highlighter-rouge .highlight {
        background: black;
    }
</style>


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

There are also programs like [OpenSCAD](https://openscad.org/) (SDF based, only meshes), [Build123](https://github.com/gumyr/build123d) (OCCT, same issues as FreeCAD), [CadQuery](https://github.com/CadQuery/cadquery) (OCCT, same issues as FreeCAD). These projects are interesting because you *script* your parts instead of interacting with and defining it through a GUI. **truck** is only different in that is a CAD kernal that (like OCCT) that happens to be easy to use by building programs in Rust, which is comparable to OpenSCAD in ease of use.

If you would like to learn more about geometric modeling and the math behind it, I recommend the book [**Geometric Modeling: The mathematics of shapes**](https://www.amazon.com/Geometric-Modeling-mathematics-Nikolay-Golovanov/dp/1497473195). This book is a goldmine of resources that I haven't really ever seen before.

#### **What are we doing with truck?**
I just want to give it a spin. I was excited to try it out more thoroughly in a project called [**CADmium**](https://github.com/CADmium-Co/CADmium), but it never really took off.


<br>


## **Installing Rust**
if you're following along, we'll need Rust, download it [here](https://www.rust-lang.org/tools/install).

If you have never used Rust before, you can learn about it in [**A Tour of Rust**](https://tourofrust.com/).


<br>


## **First truck Program**
Next, we'll need **truck**. **truck**'s structure is split into a bunch of separate Rust creates, as documented [here](https://github.com/ricosjp/truck?tab=readme-ov-file#crates). We'll add these creates to our Rust environment. Luckily, the project has some basic tutorials and documentation we can follow starting [here](https://ricos.gitlab.io/truck-tutorial/v0.6/mesh/first-triangle.html). We'll modify it a bit to create a square:

1. `cargo new --bin truck-triangle`
2. `cd truck-triangle`
3. `cargo add truck-meshalgo`
4. Edit `truck-triangle/src/main.rs`

```rust
use truck_meshalgo::prelude::Point3;
use truck_meshalgo::prelude::StandardAttributes;
use truck_meshalgo::prelude::Faces;
use truck_meshalgo::prelude::PolygonMesh;
use truck_meshalgo::prelude::obj;


/// Create a mesh representing a square
fn main() {
    // Create a rust growable vector array of 3D truck points: https://doc.rust-lang.org/std/macro.vec.html
    let vertices = vec![
        Point3::new(0.0, 0.0, 0.0),
        Point3::new(1.0, 0.0, 0.0),
        Point3::new(1.0, 0.0, 1.0),
        Point3::new(0.0, 0.0, 1.0),
    ];

    // Construct face from 4 vertices: https://github.com/ricosjp/truck/blob/f4fe3a8d763b40d19ef113f4ee2e137d93d5147a/truck-polymesh/src/lib.rs#L82
    let faces = Faces::from_iter([[0, 1, 2, 3]]);

    // Store modified/non-default vertices and default UVs & normals: https://github.com/ricosjp/truck/blob/f4fe3a8d763b40d19ef113f4ee2e137d93d5147a/truck-polymesh/src/lib.rs#L46
    let attributes = StandardAttributes {
        vertices,
        ..Default::default()
    };
    
    // Create the polygon
    let polygon = PolygonMesh::new(attributes, faces);

    // Create file for the .obj data to be written to and write it out
    let mut obj = std::fs::File::create("square.obj").unwrap();
    obj::write(&polygon, &mut obj).unwrap();
}
```

You can view the .obj file in [**Blender**](https://www.blender.org/) or [**CAD Assistant**](https://www.opencascade.com/products/cad-assistant/).

<div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-25-Taking-Truck-for-a-Drive-a-New-Rust-CAD-Kernal/1_square.png"/>
    </div>
<center><i>Figure 1: First truck Object, a Square</i></center>
<br>

Now that we know that **truck** is working and we can create meshes, let's try some of the modeling features and make a more complex part.


<br>


## **Modeling With truck**
As this [**tutorial**](https://ricos.gitlab.io/truck-tutorial/v0.6/modeling/modeling-cube.html) states, we'll need some of the other **truck** crates:
1. `cargo add truck-modeling`
2. `cargo add truck-stepio`

Make sure to check out the tutorial above for a simple example and visualization of creating a cube.

Instead of a cube, we'll create a vase. This is nice basic object to test CAD software because we want to be able to make smooth curves, not just abrupt angles. Here's a **very** crude drawing of the vase, and two ways you might create it in a typical CAD software.

<div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="27%" style="margin-top:10px" src="/assets/2025-2-25-Taking-Truck-for-a-Drive-a-New-Rust-CAD-Kernal/2_vase_drawings.png"/>
    </div>
<center><i>Figure 2: Methods of Creating a Vase</i></center>
<br>

In the above image, the very top profile/shape is the silhouette of our completed vase from the side. **White** colors indicate complete/final generated geometry.

The middle two images show a side view of what we would create in a CAD software to generate the vase. **Green** lines are profiles we would draw in a CAD software to design the general shape of the part on planes and around axes. On the bottom, the **red** lines show the direction these operations could be performed in and the **yellow** elements are datums like axes.

The left side of the image shows an operation called a **loft**, or **pipe** if you use a path with it as well. 3D Geometry is created by making multiple profiles in different planes and locations potentially at various rotations as well, and then lofting through the various profiles. You can see a depiction of this operation provided by FreeCAD [**here**](https://wiki.freecad.org/PartDesign_AdditiveLoft).

On the right side, this operation is called a **revolve** or **revolution** and works around a single axis to create a 3D solid. FreeCAD also has a depiction of this [**operation**](https://wiki.freecad.org/PartDesign_Revolution).

Unfortunately, **truck** seems to only have single-axis linear extrude/sweep and not loft/pipe, but it does have a rotational sweep that is really just the **revolve** operation above! You can see the different types of modeling operations available in **truck** [**here**](https://docs.rs/truck-modeling/latest/truck_modeling/builder/index.html).


#### **Creating the Revolve Profile**
According the to the documentation, [**`builder::rsweep`**](https://docs.rs/truck-modeling/latest/truck_modeling/builder/fn.rsweep.html) can use an [**`Edge`**](https://docs.rs/truck-modeling/latest/truck_modeling/topology/type.Edge.html) or a [**`Wire`**](https://docs.rs/truck-modeling/latest/truck_modeling/topology/type.Wire.html) for the sweep profile. What's the difference between the two? It looks like a **wire** can consist of many **edges**. I think we could generate an **edge** by using [**`builder::tsweep`**](https://docs.rs/truck-modeling/latest/truck_modeling/builder/fn.tsweep.html) on a [**`Vertex`**](https://docs.rs/truck-modeling/latest/truck_modeling/builder/fn.vertex.html) but we'll just use [**`Edge::new`**](https://docs.rs/truck-topology/0.6.0/truck_topology/struct.Edge.html#method.new).

For the curvy part of the profile, we'll use the [**`building::bezier`**](https://docs.rs/truck-modeling/latest/truck_modeling/builder/fn.bezier.html) function.