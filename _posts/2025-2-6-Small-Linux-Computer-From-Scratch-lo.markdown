---
layout: post
title:  Small Linux Computer From Scratch - lo - DRAFT
date:   2025-2-18 00:10:00 -0500
categories: jekyll update
---


<style>
    /* Code block background */
    .highlighter-rouge .highlight {
        background: black;
    }
</style>


## **Introduction**
This article will go through every topic related to developing an embedded Linux product from scratch.

Typically, hardware development blogs only go over high level concepts, like in the below posts, but I'm going to go over every last detail. However, it is expected that you have basic electrical engineering, Linux, product development, mechanical, and software engineering knowledge.

* [Type 1 diabetes watch](https://andrewchilds.com/posts/building-a-t1d-smartwatch-from-scratch)
* [Laptop from scratch](https://www.byran.ee/posts/creation/)
* [Fluid simulation pendant](https://mitxela.com/projects/fluid-pendant)

~ _this is going to be a long one... Please understand that not everything I say in this blog may be completely accurate, especially in the future when it could be out of date._


<br>


## **What Exactly Are We Building? What Are the Product Specifications?**
We'll be building a retro themed handheld Linux computer. The development and product requirements are:

* **Processor**
    * *Product requirements*: OK with sacrificing speed/resources for correct package, but the faster and more memory, the better
    * *Development requirements*: Must be an system on a chip (SoC) with integrated RAM (avoids routing of dense high-speed busses) and in a package with easy to inspect pins (non-BGA, see [IPC-7351](https://datasheet.datasheetarchive.com/originals/crawler/fancort.com/428761382a93d283e0ca120b5c72d850.pdf) for package types)
* **Connectivity**
    * *Product requirements* At least Wi-Fi 2.4GHz and Bluetooth BLE 5. The longer the range and larger the bandwidth the better, but willing to sacrifice those for development constraints
    * *Development requirements*: Easy to use software-wise and must be a system on a module (SoM) to avoid FCC certification. Must be easy to solder and inspect
* **Display**
    * *Product requirements*: Going for a retro look, doesn't need to be too big or too high in resolution. Being OLED instead of LCD would be nice, but willing to use LCD
    * *Development requirements*: Flexible connector that can be plugged into a connector on the board instead of directly soldered
* **Battery**
    * *Product requirements*: Larger, more mAh is better, but will to work with whatever fits
    * *Development requirements*: Needs to have datasheet, certifications, connector that can be plugged in, and integrated over-voltage, over-current, and over-charge protections.
* **Input**
    * *Product requirements*: Keyboard and basic gamepad controls that are as usable and comfortable as possible
    * *Development requirements*: Pre-made keyboard module to reduce development time and cost, and simple joysticks and buttons for game pad controls


<br>


## **Where to Source Parts and Services from? What to Look for?**
There are a lot of different places to source parts and services from. Here's a relatively extensive list:
* [DigiKey](https://www.digikey.com/) (mainly electrical)
* [Mouser](https://www.mouser.com/) (mainly electrical)
* [LCSC](https://www.lcsc.com/) (mainly electrical)
* [McMaster-Carr](https://www.mcmaster.com/) (mainly mechanical)
* [Alibaba](https://www.alibaba.com/) (electrical, mechanical, & services)
* [Aliexpress](https://www.aliexpress.us/?gatewayAdapt=glo2usa) (electrical & mechanical)
* [Wkooa](https://www.wkooa.com/) (screws, bolts, nuts, & washers)
* [BuyDisplay](https://www.buydisplay.com/) (displays)
* [PCBWay](https://www.pcbway.com/) (China, PCBs, stencils, & services)
* [JLCPCB](https://jlcpcb.com/) (China, PCBs, stencils, & services)
* [OSHPark](https://oshpark.com/) (US, PCBs, & stencils)

This is the hardest part! These are some of key attributes you need to look at for every part you choose:
* **Cost**: This goes hand-in-hand with *manufacturer*, *consistency*, *reliability*, *availability*, *documentation*, and *support* depending on price.
    * *Cheaper parts*: relatively unknown manufacturer might disappear; might receive inconsistent fake/counterfeit parts; some parts might work and others won't (unreliable); less documentation and support
    * *Expensive parts*: Could be the opposite of each attribute when comparing to cheaper parts, depends though.
* **Manufacturer**: If you can justify it, try to pick known manufactures (TI, STM, etc.) of parts for at least complex components. You might be able to use unknown Chinese parts for simple components/parts
* **Consistency**: Try to pick parts that are consistent (not fake, counterfeit, or have different part numbers) by choosing known manufactures, if possible, and get samples to test
* **Reliability**: Some complex but very cheap parts but simply fall apart, not solder well, or have very loose tolerances in dimensions or other aspects. Some percentage of parts **will** fail.
* **Availability**: Try to pick parts that can easily be swapped out with alternatives, and pick parts that shouldn't be going out of stock permanently for one reason or another. Check that stocks of the part when buying the first time are relatively large to what you need. The more in stock, the better of a sign that it will stay in stock in the future
* **Documentation**: For complex parts, check that there is sufficient documentation on the part. If it is simple or mimics other parts, you can probably get away without extensive documentation if you can find the information somewhere else
* **Support**: This is the last bullet-point for a reason. It is relatively rare to get support from small Chinese distributors or large companies that will only talk to you if you are buying 100k+ ~ 1M+ parts.


<br>


# **ERP**
What is an **ERP**? It stands for [Enterprise Resource Planning](https://en.wikipedia.org/wiki/Enterprise_resource_planning) and is a software that handles lots of different aspects of running a company. For someone designing a product, an ERP system is used for keeping track of parts and handling ordering of those parts.

For example, say we have a product with a screen, battery, electrical components, plastic enclosure, etc. Where do you keep the information about each component, it's price, manufacturer, availability, how to order it, etc? It would be nice to keep all that information in some kind of central database, right? That's one aspect of what ERP software can do.

There are lots of different commercial and open-source projects that you'll find on Google, but we won't use one for our one-off project.


<br>


# **Setting Up KiCAD**
If you're not familiar, KiCAD is a computer assisted design (CAD) electronic design automation (EDA) software (sometimes referred to as ECAD). At a high-level, KiCAD let's you design the connections of components (in a schematic) and the position and layout the components on a board (printed circuit board (PCB) design).

You create representations of components in the schematic called **symbols**. After creating or getting symbols for the components, you use wires to connect pins of components/symbols to other components/symbols.

Typically, as you're designing major parts of a schematic, you'll also start making or collecting representations of the physical components in a 2D format as a **footprint**. Footprints as placed on a 2D outline of the physical PCB and the wire connections from the schematic are physically routed on the board.

You'll also want to grab and make **3D Models** for each component at the footprint level. KiCAD will let you export 3D STEP files of you board that you can then use to design enclosures around.

The hard part, that no one mentions, is what does it actually look like to create, get, and use symbols, footprints, and 3D models in KiCAD. How do I order components and PCBs that I design if I use someone elses symbols or footprints? How should I organize my own custom libraries of symbols and footprints?

Well, let's go through each step.

#### **Installing KiCAD**
Visit the [download](https://www.kicad.org/download/) page and grab the latest release, run the installer.

You might also want a new theme that doesn't burn your eyes. As this [forum post](https://forum.kicad.info/t/kicad-7-colors-and-themes/44524/2) mentions, do the following:
1. Open KiCAD to the main project selection screen
2. Click "Project and Content Manager"
3. Click the "Color Themes" tab
4. Click "Install" on the themes you like (I use "Monokai High Contrast")
5. Click "Apply Pending Changes"
6. Go to `Preferences -> Preferences`
    1. `Symbol Editor -> Colors -> Use Theme -> Monokai High Contrast`
    2. `Schematic Editor -> Colors -> Theme -> Monokai High Contrast`
    3. `Footprint Editor -> Colors -> Theme -> Monokai High Contrast`
    4. `PCB Editor -> Colors -> Theme -> Monokai High Contrast`
    5. `Gerber Viewer -> Colors -> Theme -> Monokai High Contrast`
    6. Click "OK"

#### **Libraries**
KiCAD comes with pre-made global libraries for all sorts of component types and manufacture symbols and footprints (yes, there are separate libraries for each). The problem is that as KiCAD updates, so do the libraries. It will try and help you copy over old library components, but this can be a mess. Instead, we'll create our own libraries for symbols and footprints. If we find a symbol or footprint in the default KiCAD libraries, we'll copy them to our own library.

##### **Custom Library Structure**
We want to create separate parent directories for each type of component (or however you want to separate everything). Inside each parent, we'll have three separate folders and libraries, for footprints, 3D models, and symbols. For example:


```
components
+-- components_modules
|   +-- footprints
|   +-- models
|   +-- symbols
+-- components_mpus
|   +-- footprints
|   +-- models
|   +-- symbols
+-- components_switches
|   +-- footprints
|   +-- models
|   +-- symbols
+-- components_resistors
|   +-- footprints
|   +-- models
|   +-- symbols
+-- components_capacitors
|   +-- footprints
|   +-- models
|   +-- symbols
+-- components_inductors
|   +-- footprints
|   +-- models
|   +-- symbols
+-- components_ldo
|   +-- footprints
|   +-- models
|   +-- symbols

etc...
```

Pay attention to the following in the above structure:
* **Folder names:** prepend each folder with a common word like `components`. For example, everywhere you see `components` above, you could replace that word with `mylibrary`. Using a common word makes it a lot easier to search for and use your libraries within KiCAD
* **Structure:** Have a very upper level folder (e.g. `components`) that will the sub-libraries folders live in (e.g. `components_modules`). We'll want to commit this to git and push it to GitHub to have version control across our library.

There's some discussion [here](https://www.reddit.com/r/KiCad/comments/1eiai3t/new_libraries_or_append_to_default_libs/?rdt=35828) and [here](https://forum.kicad.info/t/copying-symbols-and-footprints-to-personal-libraries/49965/3) about why you might choose a structure like the above.

#### **KiCAD Walkthroughs**
There are a couple one-time and frequent tasks that will need to be performed in KiCAD throughout this blog post. The below dropdowns are collections of quick examples of how you can perform some of these tasks.

<details style="margin-bottom:15px">
    <summary><i><b>Walkthrough #1: Creating a KiCAD Project</b></i></summary>

    <b>1.</b> Open KiCAD
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/1_kicad_open.png"/>
    </div>
    <center><i>KiCAD Main Page</i></center>
    <br>

    <b>2.</b> Create a new project (store it anywhere and name it anything you want, I'll be using the name `lo`)
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/2_kicad_new_project.png"/>
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/3_kicad_project.png"/>
    </div>
    <center><i>KiCAD Main Page and Created Project</i></center>
    <br>

</details>

<details style="margin-bottom:15px">
    <summary><i><b>Walkthrough #2: Creating a Custom KiCAD Symbol Library</b></i></summary>

    <b>1.</b> Open KiCAD
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/3_kicad_project.png"/>
    </div>
    <center><i>KiCAD Main Page</i></center>
    <br>

    <b>3.</b> Click the "Schematic Editor" icon to open the project schematic
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/4_schematic_icon.png"/>
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/5_schematic.png"/>
    </div>
    <center><i>KiCAD Main Page Schematic Icon and Project Schematic</i></center>
    <br>

    <b>4.</b> Click the "Symbol Editor" button
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/6_symbol_editor_button.png"/>
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/7_symbol_editor.png"/>
    </div>
    <center><i>KiCAD Schematic Page Symbol Editor Button and Symbol Editor</i></center>
    <br>

    <b>5.</b> Do <i>File -> New Library -> Global -> Navigate/create "components/components_resistors/symbols/components_resistors.kicad_sym" folder</i>
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/8_new_library_file.png"/>
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/9_new_library.png"/>
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/10_new_library_global_ok.png"/>
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/11_new_library_created.png"/>
    </div>
    <center><i> After Creating Folders and Choosing Location & Name, Library is Created</i></center>
    <br>
</details>

<details style="margin-bottom:15px">
    <summary><i><b>Walkthrough #3: Creating a Custom KiCAD Symbol</b></i></summary>

    <b>1.</b> Open KiCAD
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/3_kicad_project.png"/>
    </div>
    <center><i>KiCAD Main Page</i></center>
    <br>

    <b>2.</b> Open the "Symbol Editor" from the main page or "Schematic Editor"
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/12_symbol_editor_button.png"/>
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/6_symbol_editor_button.png"/>
    </div>
    <center><i>KiCAD Main Page Symbol Editor Icon Button and Schematic Symbol Editor Button</i></center>
    <br>

    <b>3.</b> Select a library to add a new symbol to
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/13_select_symbol_library.png"/>
    </div>
    <center><i>Selecting a Symbol Library to Add a Symbol to</i></center>
    <br>

    <b>4.</b> Click <i>File -> New Symbol</i> and enter the part name and reference designator. As an example, I'll be adding the most complex part, the NUC980DR61YC Microprocessor that will mentioned more later. Reference designators are single or two character "codes" that quickly identify component types. You can find a list of designators here: <a>https://klc.kicad.org/symbol/s6/s6.1.html</a>
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/14_create_new_symbol_button.png"/>
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/15_enter_symbol_part_info.png"/>
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/16_new_symbol.png"/>
    </div>
    <center><i>Adding a new Symbol</i></center>
    <br>

    <b>6.</b> The first thing to do is fill in the part information field. Double left-click anywhere in the "Symbol Editor" sheet to open the dialog. This is a Microprocessor so it does not have a "value" like a capacitor or resistor would. We'll go to DigiKey and grab the datasheet, description and keywords.
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        <img width="90%" style="margin-top:10px" src="/assets/2025-2-6-Small-Linux-Computer-From-Scratch-lo/17_symbol_properties.png"/>
    </div>
    <center><i>Editing Symbol Properties</i></center>
    <br>



    <b>5.</b> Now it's time to get into actually drawing the symbol. The first thing to start with is creating an outline or main body of the symbol
    <div style="width:100%; display:flex; flex-direction:column; justify-content:center; align-items:center">
        
    </div>
    <center><i>Creating Symbol Outline</i></center>
    <br>

</details>

<details style="margin-bottom:15px">
    <summary><i><b>Walkthrough #4: Creating a Custom KiCAD Footprint Library</b></i></summary>
</details>

<details style="margin-bottom:15px">
    <summary><i><b>Walkthrough #5: Creating a Custom KiCAD Footprint</b></i></summary>
</details> 


<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>


## **Choosing a Processor**
We need a processor. Here's my justifications for most attributes you can decide on when choosing a microprocessor SoC:

* **Speed:** It can be slow. We aren't making a Linux tablet, I'm fine with sacrificing this for other aspects
* **Flash:** I would prefer the SoC has integrated on-board flash memory, but external SPI flash is fine too
* **RAM:** Ideally, the SoC has some fast single-access SRAM but I need it to have integrated DDR RAM to reduce design time
* **Availability:** This is a one time build so it not begin very available is fine as long as I can buy a couple of them
* **Cost:** It's alright if the processor costs a decent amount. It should cost less than a modern CPU but I'm fine with the price being factors higher than a microcontroller for a one time build
* **Solder-ability:** I need it to be hand solder-able such that I can see the pins and fix any possible shorts (no BGA packages! I don't own an x-ray machine)

So how do we find it? There are a couple of good blogs about this subject (and about building Linux Devices in general):
* [https://jaycarlson.net/embedded-linux/](https://jaycarlson.net/embedded-linux/)
* [https://www.thirtythreeforty.net/posts/2019/12/mastering-embedded-linux-part-2-hardware/#bare-processors](https://www.thirtythreeforty.net/posts/2019/12/mastering-embedded-linux-part-2-hardware/#bare-processors)
* [https://hackaday.com/2018/09/17/a-1-linux-capable-hand-solderable-processor/](https://hackaday.com/2018/09/17/a-1-linux-capable-hand-solderable-processor/)

In the second link above, they mention the [**Nuvoton NUC980 series**](https://www.nuvoton.com/products/microprocessors/arm9-mpus/nuc980-industrial-control-iot-series/) processors. These are perfect. TODO: why they are perfect


<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>



<br>


## **Choosing a Wi-Fi Coprocessor Module**
First, we'll want to go with a System on a Module (SoM) instead of a System on a Chip (SoC) since using an SoC requires creating
* External to the chip transmit and receive circuitry (TX power amp and RX filter)
* Antenna matching circuitry
* Shielding

https://github.com/espressif/esp-hosted/blob/master/esp_hosted_ng/README.md#12-supported-esp-boards
https://www.espressif.com/en/products/socs#:~:text=ESP32%2DP4.asc-,ESP32%2DS%20Series,-ESP32%2DS3%20Series



<br>



## **Choosing a Display**


<br>


## **Choosing a Battery**


<br>


## **Choosing a Keyboard Module**


<br>


## **Choosing Buttons & Switches**


<br>


## **Choosing Joysticks**


<br>


## **Designing an Enclosure**
We'll ultimately 3D print the enclosure, but it is always a good idea to start the design with the intention that we're going to injection mold it.

The below resources are pure gold for how to design parts for injection molding. We'll be following these religiously.

* [**Part and Mold Design**](https://web.archive.org/web/20240531004633/https://kompozit.org.tr/wp-content/uploads/2021/11/A_Design_Guide_Part_and_Mold_Design_Engi.pdf){:target="_blank"}{:rel="noopener noreferrer"}
* [**Snap-Fit Joints for Plastics**](https://web.archive.org/web/20230816100057/https://fab.cba.mit.edu/classes/S62.12/people/vernelle.noel/Plastic_Snap_fit_design.pdf){:target="_blank"}{:rel="noopener noreferrer"}
* [**Engineering Plastics Joining Techniques**](https://web.archive.org/web/20230602222325/https://techcenter.lanxess.com/scp/americas/en/docguard/Joining_Guide.pdf?docId=77016){:target="_blank"}{:rel="noopener noreferrer"}