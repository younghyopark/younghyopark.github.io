---
layout: page
title: SGSD
description: Safety-Guaranteed Skill Discovery for Manipulation
img: assets/img/sgsd_thumb2.gif
importance: 2
category: academic
---

### Abstract

Recent progress in unsupervised skill discovery algorithms has shown great promise in learning an extensive collection of behaviors without extrinsic supervision. On the other hand, safety is one of the most critical factors for real-world robot applications. As skill discovery methods typically encourage exploratory and dynamic behaviors, it can often be the case that a large portion of learned skills remains too dangerous and unsafe. In this paper, we introduce the novel problem of safe skill discovery, which aims at learning, in a task-agnostic fashion, a repertoire of reusable skills that is inherently safe to be composed for solving downstream tasks. We propose **Safety-Guaranteed Skill Discovery (SGSD)**, an algorithm that learns a latent-conditioned skill-policy, regularized with a safety-critic modeling
a user-defined safety definition. Using the pretrained safe skill repertoire, hierarchical reinforcement learning can solve downstream tasks without the need of explicit consideration of safety during training and testing. We evaluate our algorithm on a collection of force-controlled robotic manipulation tasks in simulation and show promising downstream task performance with safety guarantees.
Please find \url{https://sites.google.com/view/safe-skill} for supplementary videos.

<br>

### Framework

<center>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/sgsd_framework.gif" title="example image" width=400 class="img-fluid rounded z-depth-1" %}
    </div>
</div>
</center>

<br>



### Downstream Task Solving

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/dt1.gif" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/dt2.gif" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>



<br>
<br>
<br>


