---
layout: post
title:  Simulating 3D Golf Ball Trajectory - The Bounce - DRAFT
date:   2025-1-10 00:00:00 -0500
categories: jekyll update
---


<style>
    /* Axes labels */
    .label {
        color: #FFF;
        font-family: sans-serif;
        padding: 2px;
        background: rgba( 0, 0, 0, .6 );
    }

    /* Code block background */
    .highlighter-rouge .highlight {
        background: black;
    }
</style>

<script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.171.0/examples/jsm/"
    }
  }
</script>

<!-- https://stackoverflow.com/a/46887516 -->
<!-- https://github.com/jwagner/simplex-noise.js -->
<script>var exports = {};</script>
<script src="https://cdn.jsdelivr.net/npm/simplex-noise@4.0.3/dist/cjs/simplex-noise.js" type="module"></script>

<script src="/assets/2025-1-10-Simulating-3D-Golf-Ball-Trajectory-The-Bounce/main_scene.js" type="module">
</script>



## **Introduction**
Continuing on from the last post where we simulated a golf ball getting hit by a club, now it's time to ask, **what happens to the ball when it hits and bounces on the ground?**

Fortunately, lots of research has been done to model this:
* *["Flight and bounce of spinning sports balls"](https://d1wqtxts1xzle7.cloudfront.net/108549885/10.000165920231208-1-ctedme-libre.pdf?1702051279=&response-content-disposition=inline%3B+filename%3DFlight_and_bounce_of_spinning_sports_bal.pdf&Expires=1736580168&Signature=E3vGXNFUvUSmxX4MdtpmV3Ha52etm7feRn0Miz07kiHd8ZtnWRIyarWI0uq~U1zfJN3MFRa0CyUAk4eIOmUkhlfxp3C10rWXKiyaWlBb~LBopayEgtwKxxlDqYnxJ5pmbFl6LPHijO0N78wUFrsJLvHSaPK~acc-TjgyEqJKHjWyqVfAVX2cojIkBw1HX80UxxodMnPLckppZ-cZgbQiuwIcQigF51XaJa8kF90N2SIbPQfZCNxi-Zu-BAcEn~6MOf9hs6bDlLAQ2vSUdn5I76wvM6Z--CMTEMxHuShYrXKMx0BoxYDFiaOIWoLcxiewQrLAZg-DqMw7W3weN9EovA__&Key-Pair-Id=APKAJLOHF5GGSLRBV4ZA)
* ["The physics of golf"](https://www.discountpdh.com/wp-content/themes/discountpdh/pdf-course/physics-golf.pdf?#page=23)
* ["The physics of golf: The convex face of a driver"](https://d1wqtxts1xzle7.cloudfront.net/103265711/Penner.Convex-libre.pdf?1686506680=&response-content-disposition=inline%3B+filename%3DThe_physics_of_golf_The_convex_face_of_a.pdf&Expires=1739936624&Signature=Gz7L1bkd-QMuQHJEzkpLWeaTEyL9hTz47EeEXT6LUWt-uDh5fyeBlFruTQI9A8JPXXR-GLSmbNCo5v7ywE6hlfl3yYvaLSsQJgcwtjq-U8HIadT7MwbfYZgFmbSkPPLns06RX-K-CdUKQxiINfjG7bCH6CaNS~NQ96NKWh6BxZR1TXmgbGZ1v9-W4UJdpOmRnwH0Fc~c05N5wAz9D6ydM4UNAu9jXARRPp8oklxWcnL~ms4lAoKJU2uF~QO8HUdInJI0O9qH-Hu30t3ysUfZlsueu-HU2cnshp~FKEU9g6QJDGEn3WzYxhhUrTR3Udv~2v29nKJspLCDMOT3oiGIxw__&Key-Pair-Id=APKAJLOHF5GGSLRBV4ZA)
* ["The physics of golf: The optimum loft of a driver"](http://www.raypenner.com/golf-loft.pdf)
* ["Measurements and linearized models for golf ball bounce"](https://arxiv.org/pdf/2302.02758)
* ["Development and Comparison of 3D Dynamic Models of Golf Clubhead-Ball Impacts"](https://dspacemainprd01.lib.uwaterloo.ca/server/api/core/bitstreams/6b9d555c-f631-4399-90ed-768f01b850f4/content)

The most important paper is the first link above.


<br>


## **A Better Simulation**
We're going to need an environment that allows us to test different scenarios:
* Bounce off of flat and inclined surfaces
* Assortment of turfs with different friction and compliance/restitution

With some [help](https://jayelinda.com/modelling-by-numbers-part-1a/) and some intuition, I made the following course generator in ThreeJS. The course turf types are stored in a 2D array. Each turf can have different attributes that we'll talk about later.

<center>
    <div id="simulationDiv" style="width:min-content; height:min-content; position:relative">
    </div>
</center>


<br>


## **Collision**
We'll need a way to simulate a sphere colliding with our course instead of a point, like in the last simulation. We could use a physics framework like [rapier](https://rapier.rs/), but ThreeJS provides a [raycast](https://threejs.org/docs/#api/en/objects/Mesh.raycast) method that we can use against meshes.

What we'll do is that for every point in space we simulate the ball, we'll densely check in all directions of the ball if we're colliding with the course mesh within a certain radius. If we collide, we'll calculate the new direction, velocity, and spin of the ball after the collision with some type of turf.