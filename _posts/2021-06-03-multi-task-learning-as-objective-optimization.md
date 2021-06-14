---
title: "[Paper Review] Multi-Task Learning as Multi-Objective Optimization"
tags: Reinforcement-Learning Optimization Deep-Learning
published: false
comment: true
---

This paper was published in NIPS (2018). 

## Introduction

### Stein's Paradox

- Stein's Paradox : When solving the task of estimating the means of three or more Gaussian random variables, it is better to use samples from all of them rather than to estimate them separately. 

  **Stein's example** (or **phenomenon** or **paradox**), in [decision theory](https://en.wikipedia.org/wiki/Decision_theory) and [estimation theory](https://en.wikipedia.org/wiki/Estimation_theory), is the phenomenon that when three or more parameters are estimated simultaneously, there exist combined [estimators](https://en.wikipedia.org/wiki/Estimator) more accurate on average (that is, having lower expected [mean squared error](https://en.wikipedia.org/wiki/Mean_squared_error)) than any method that handles the parameters separately. It is named after [Charles Stein](https://en.wikipedia.org/wiki/Charles_Stein_(statistician)) of [Stanford University](https://en.wikipedia.org/wiki/Stanford_University), who discovered the phenomenon in 1955.
  {:.gray_no_border}

- Stein's paradox was an early motivation for multi-task learning (MTL)

- "Even seemingly unrelated real world tasks have strong dependencies due to the shared processes that give rise to the data." $\rightarrow$ motivates the use of multiple tasks as an inductive bais in learning systems. 

### Two Approaches of MTL System

1. **Weighted Sum Approach**

  - Weighted sum approach is widely used. 
  - However, this may only work when the tasks are not competing, which may not always be the case. 
  - MTL with conflicting objectives requires modeling of the trade-off between tasks, which is beyond what a linear combination achieves. 

2. **Pareto Optimal**
	-  find a solution that are not dominated by any others. 
	-  Such solutions are said to be Pareto optimal. 

### Finding the Pareto-Optimal : Multi-Objective Optimization (MOO)

- Variety of algorithms of MOO exist. 
- One such approach is the **multiple-gradient descent algorithm (MGDA)**, which uses gradient-based optimization and provably converges to a point on the Pareto set. 
- MGDA is well suited for multi-task learning with deep networks = use gradients of each task and solve an optimization problem to decide on an update over the shared parameters. 

- However, MGDA has some downsides as well:
  1. does not do well for high-dimensional gradients
  2. require explicit computation of gradients per task (multiplies the training time by the number of tasks)

### Contribution

- Propose a new optimizer : **Frank-Wolfe-based optimizer** that scales to high-dimensional problems. 

- Exact algorithm for multi-objective optimization of deep networks with negligible computational overhead. 

- Test on three different problems:

  1. multi-digit classification (MultiMNIST)

     <center><img src="https://live.staticflickr.com/65535/51222812939_ea8837b083_o.png" alt="image-20210603190428819" style="zoom:50%;" /></center>

  2. multi-label classification with CelebA dataset

  3. Scene understanding : multiple tasks of semantic segmentation, instance segmentation, and depth estimation. 



## Related Work

### Multi-Task Learning

1. Hard Parameter Sharing : subset of parameters is shared between tasks while other parameters are task-specific. 
2. Soft Parameter Sharing : all parameters are task-specific but they are jointly constrained via Bayesian priors. 

### Multi-Objective Optimization

Multi-objective optimization optimizes a set of possibly contrasting objectives. Among many approaches, one may use **gradient-based multi-objective optimization**. These methods use multi-objective KKT conditions and find a **descent direction that decreases all objectives**. This approach was extended to stochastic gradient descent by few papers. 

## Problem Formulation

### Multi-Task Learning (MTL) Problem

- Input space $\mathcal{X}$ and a collection of task spaces $$\{ \mathcal{Y}^t \}_{t\in [T]}$$, such that large dataset of i.i.d. data points $$\{\mathbf{x}_i, y_i^1, \cdots, y_i^T \}_{i \in [N]}$$ is given where $T$ is the number of tasks, $$N$$ is the number of data points, and $y_i^t$ is the label of the $t$-th task for the $i$th data point. 

- Weighted sum-approach tries to solve the problem of 
  
  $$
  \min_{\theta^{sh}, \theta^1, \cdots, \theta^T} \sum_{t=1}^T c^t \hat{\mathcal{L}}^t (\theta ^{sh}, \theta^t )
  $$
  
  where $\theta^{sh}$ is the shared parameters and $\theta^t$ is the task-specific parameters. $c^t$ isthe weight per task (either predefined or not, static or dynamic). Loss is defined as
  
  $$
  \hat{\mathcal{L}}^t (\theta^{sh}, \theta^t) = \frac{1}{N} \sum_i \mathcal{L}(f^t (\mathbf{x}_i; \theta^{sh}, \theta^t),  y_i^t )
  $$
  
  Although the weighted sum formulation is intuitively appealing, it typically either requires an expensive grid search over various scalings or the use of a heuristic. 
  {:.info}

- Alternatively, MTL can be formulated as a multi-objective optimization. We specify the multi-objective optimization formulation of MTL using a vector-valued loss $\mathbf{L}$. 

  $$
  \min_{\theta^{sh}, \theta^1, \cdots, \theta^T} \mathbf{L}(\theta^{sh}, \theta^1, \cdots, \theta^T) = \min_{\theta^{sh}, \theta^1, \cdots, \theta^T} \begin{bmatrix} \hat{ \mathcal{L}}^1 (\theta^{sh}, \theta^1)\\ \hat{ \mathcal{L}}^2 (\theta^{sh}, \theta^1) \\ \vdots \\  \hat{ \mathcal{L}}^T (\theta^{sh}, \theta^1)  \end{bmatrix}
  $$

### Pareto-Optimality for MTL

1. A solution $\theta$ dominates a solution $\bar{\theta}$ if $\hat {\mathcal{L}}^t (\theta^{sh}, \theta^t) \leq \hat{\mathcal{L}}^t (\bar \theta^{sh}, \bar \theta^t)$ for all tasks $t$ and

   $$
   \mathbf{L}(\theta^{sh}, \theta^1, \cdots, \theta^T) \not = \mathbf{L}(\bar \theta^{sh}, \bar \theta^1, \cdots, \bar \theta^T)
   $$
   
2. A solution $\theta^\star$ is called **Pareto optimal** if there exists no solution $\theta$ that dominates $\theta^\star$. 

Set of pareto optimal solutions is called the Pareto set ($$\mathcal{P}_\theta$$) and its image is called the Pareto front ($$\mathcal{P}_\mathbf{L} = \{\mathbf{L}(\theta) \}_{\theta \in \mathcal{P}_\theta}$$
{:.info}

### Multiple-Gradient Descent Algorithm (MGDA)

MGDA leverageas the KKT conditions, which are necessary for optimality. We now state the KKT conditions for both task-specific and shared parameters:

- There exist $\alpha^1, \cdots, \alpha^T \geq 0$ such that $\sum_{t=1}^T \alpha^t =1$ and $\sum_{t=1}^T \alpha^t \nabla_{\theta^{sh}} \hat{\mathcal{L}}^t (\theta^{sh}, \theta^t)=0$
- For all tasks $t$, $$\nabla_{\theta^t} \hat{\mathcal{L}}^t (\theta^{sh}, \theta^t)=0$$

Using above KKT optimality condition, we can compute the gradient descent step. Consider the optimization problem (QP)

<center><img src="https://live.staticflickr.com/65535/51222134846_5a973b2e34_o.png" alt="image-20210603202143774" style="zoom:40%;" /></center>

Desideri (2012) showed that either the solution to this optimization problem is 

1. 0 and the resulting point satisfies the KKT conditions above
2. solution gives a **descent direction that improves all tasks**. 

Thus, the resulting gradient descent step can be computed by

$$
- \sum_{t=1}^T \hat{\alpha}^t \nabla_{\theta^{sh}} \hat{\mathcal{L}}(\theta^{sh}, \theta^t)
$$

### Solving the Optimization Problem (QP) for Dual Task

<center><img src="https://live.staticflickr.com/65535/51222134846_5a973b2e34_o.png" alt="image-20210603202143774" style="zoom:40%;" /></center>

- Consider two task situation ($T=2$) 

   $$
   \min_{\alpha\in [0,1]}  \ \Big \| \alpha \nabla_{\theta^{sh}} \hat{\mathcal{L}}^1 (\theta^{sh}, \theta^1)+ (1-\alpha)\nabla_{\theta^{sh}}\hat{\mathcal{L}}^2 (\theta^{sh}, \theta^2) \Big \|_2 ^2
   $$
   
   which is basically a problem of 
   
   $$
   \min_{\alpha \in [0,1]} \ \Big \| \alpha v_1 + (1-\alpha)v_2 \Big \|
   $$
   
   which can be analytically solved by
   
   $$
   \hat{\alpha} = \bigg [ \frac{(v_2 - v_1)^T v_2}{\|v_2 - v_1 \|_2 ^2}\bigg ] _{+, ^1_T}
   $$
   
   where $$[\cdot]_+,^1_T$$ represents the clipping to $[0,1]$. 
   
   $$
   [a]_+,^1_T = \max (\min(a,1),0)
   $$
   
   <center><img src="https://live.staticflickr.com/65535/51222162061_c8749db462_o.png" alt="image-20210603204216330" style="zoom:40%;" /></center>
   
   

### Extending it to multiple tasks : Frank-Wolfe algorithm

Frank-wolfe algorithm solves the constrained optimization problem 

$$
\begin{aligned}
\min_x & \ \ f(x) \\
\text{s.t.}& \ \ x \in C
\end{aligned}
$$

without projection procedure, unlike any other (sub-)gradient methods. 

1. Compute $$\mathbf{s}^t \in \arg \min_{s\in C} \nabla f(\mathbf{x}^t)^T \mathbf{s}$$
2. Set $$\mathbf{w}^{t+1} = (1-\eta_t) \mathbf{x}^t  + \eta _t \mathbf{s}^t$$

<center><img src="https://live.staticflickr.com/65535/51222421853_db15c532fd_o.png" alt="image-20210603211405039" style="zoom:50%;" /></center>

<center><img src="https://live.staticflickr.com/65535/51221502477_ec7744318c_o.png" alt="image-20210603211656511" style="zoom:50%;" /></center>

## Final Algorithm

<center><img src="https://live.staticflickr.com/65535/51223288850_c0f43c8e86_o.png" alt="image-20210603211848665" style="zoom:40%;" /></center>



