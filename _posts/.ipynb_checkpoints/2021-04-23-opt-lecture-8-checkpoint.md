---
title: "[Optimization] Approximation and Fitting"
tags: Optimization Lecture-Note
comment: true
published: true
---

## Norm Approximation 

### Problem Definition

We are considering

$$
\min_{\mathbf{x}} \|\mathbf{Ax-b}\|
$$

where $\mathbf{A} \in \mathbb{R}^{m\times n}$ with $m\geq n$, and $\|\cdot \|$ is a norm on $\mathbb{R}^m $. This can be considered as a convex optimization problem, since norm is a convex function, and $\mathbf{Ax-b}$ is an affine transformation.

### Interpretation

We can interpret this problem in many ways:

1. **geometric** : $\mathbf{Ax}^\star$ is a point in $\mathcal{R}(\mathbf{A})$ closest to $\mathbf{b}$. 

   <center><img src="https://live.staticflickr.com/65535/51132546203_d5f03f1c50_o.png" alt="image-20210423090720126" style="zoom:50%;" /></center>

2. **estimation** : For a linear measurement model

   $$
   \mathbf{y = Ax+v}
   $$
   
   where $\mathbf{y}$ is the observation, $\mathbf{x}$ is unknown, and $\mathbf{v}$ is the measurement error, given $\mathbf{y=b}$, $\mathbf{x}^\star$ is the best guess of $\mathbf{x}$. 
   
3. **optimal design** : $\mathbf{x}$ is the design variable, where $\mathbf{Ax}$ is the result. $\mathbf{x}^\star$ is the design choice that best approximates the desired result $\mathbf{b}$. 

### Example

- **least-squares approximation** $\| \cdot \|_2$ : 

$$
  \begin{aligned}
	\min_{\mathbf{x}} & \ \ \ \|\mathbf{Ax-b}\|_2^2  = \mathbf{(Ax-b)}^T\mathbf{(Ax-b)}\\
  & \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ = \mathbf{x}^T\mathbf{A}^T\mathbf{A}\mathbf{x}-2\mathbf{b}^T\mathbf{A}\mathbf{x}+\mathbf{b}^T\mathbf{b}
  \end{aligned}
$$

  the solution satisfies the normal equation

$$
  \mathbf{A}^T \mathbf{Ax} = \mathbf{A}^T \mathbf{b}
$$

  If $\text{rank } \mathbf{A}=n$ , $\mathbf{x}^\star = (\mathbf{A}^T \mathbf{A})^{-1}\mathbf{A}^T \mathbf{b}$ 

- **chebysev approximation** $\|\cdot \|_\infty$ :

$$
  \begin{aligned}
  \min_{\mathbf{x}} & \ \ \ \bigg ( \|\mathbf{Ax-b}\|_\infty  = \max_i\ \big | \mathbf{a}_i^T \mathbf{x}-\mathbf{b}_i \big | \bigg ) 
  \end{aligned}
$$

  this can be converted to LP 

$$
  \begin{aligned}
\min & \ \ \ t \\
  \text{s.t.} & \ \ \ |\mathbf{a}_i ^T \mathbf{x}- \mathbf{b}_i |\leq t, \ \ \ i = 1,\cdots, m\\
  & \ \ \ \iff -t\mathbf{1} \leq \mathbf{Ax-b} \leq t\mathbf{1}
  \end{aligned}
$$

- **sum of absolute residuals approximation** $\|\cdot \|_1 $ :

$$
  \begin{aligned}
  \min_{\mathbf{x}} & \ \ \ \bigg ( \|\mathbf{Ax-b}\|_1  = \sum_i \ \big | \mathbf{a}_i^T \mathbf{x}-\mathbf{b}_i \big | \bigg ) 
  \end{aligned}
$$

  this can be converted to LP

$$
  \begin{aligned}
\min & \ \ \ \mathbf{1}^T \mathbf{y} \\
  \text{s.t.} & \ \ \ |\mathbf{A}  \mathbf{x}- \mathbf{b} |\leq \mathbf{y}\\
  & \ \ \ \iff -\mathbf{y} \leq \mathbf{Ax-b} \leq \mathbf{y}
  \end{aligned}
$$



## Penalty Function Approximation

### Problem Defintion

In $l_p$-norm approximation, for $1\leq p< \infty$, the objective is

$$
\big( |\mathbf{r}_1|^p+|\mathbf{r}_2|^p+ \cdots + |\mathbf{r}_m|^p\big ) ^{1/p}
$$

where 

$$
\mathbf{r}_i = \mathbf{a}_i ^T \mathbf{x} - \mathbf{b}_i
$$

In that case, if we define $\phi: \mathbb{R} \rightarrow \mathbb{R}$, 

$$
\phi(r) = |r|^p
$$

we can convert above problem into

$$
\begin{aligned}
\min & \ \ \ \sum_{i=1}^m \phi (\mathbf{r}_i )\\
\text{s.t.}& \ \ \ \mathbf{r= Ax-b}
\end{aligned}
$$

We call $\phi$ a **convex penalty function.**

### Examples

- **Quadratic** : $$\phi(u) = u^2$$

- **Deadzone-linear** with width $a$ : $$\phi(u) = \max \{0,\vert u\vert-a\}$$

- **Log-barrier** with limit $a$ : 
  $$
  \phi(u)= \begin{cases}
  -a^2 \log(1- (u/a)^2 ) & \ \text{if } |u| <a\\
  \infty & \ \text{otherwise}
  \end{cases}
  $$

  <center><img src="https://live.staticflickr.com/65535/51132430846_c78a752679_o.png" alt="image-20210423102502942" style="zoom:50%;" /></center>

### Huber penalty function

$$
\phi_{\text{hub}}(u) = \begin{cases}
u^2 & \ \text{if } |u| \leq M\\
M(2|u|-M)& \ \text{otherwise}
\end{cases}
$$

<center><img src="https://live.staticflickr.com/65535/51132644338_5151c1bb5f_o.png" alt="image-20210423102705223" style="zoom:50%;" /></center>

This huber penalty function allows an approximation less sensitive to outliers. In case of a least-squares regression where we fit $(t,y)$ with a linear curve $y = \alpha + \beta t$, using a huber penalty function makes us to draw a line that's way more robust to outliers. 

$$
\min \sum_i \phi_{\text{hub}}(y_i - \alpha- \beta t_i )
$$

<center><img src="https://live.staticflickr.com/65535/51131764947_fea274e64f_o.png" alt="image-20210423103135246" style="zoom:50%;" /></center>

## Least-Norm Problem

### Problem Definition

Consider the problem

$$
\begin{aligned}
\min_{\mathbf{x}} & \ \ \|\mathbf{x}\|\\
\text{s.t.} & \ \ \mathbf{Ax=b}
\end{aligned}
$$

where $\mathbf{A} \in \mathbb{R}^{m \times n}$ with $m\leq n$ (rows of $\mathbf{A}$ are linearly independent) and $\|\cdot \|$ is a norm on $\mathbb{R}^m $. In case of $m=n$, $\mathbf{x}^\star = \mathbf{A}^{-1}\mathbf{b}$. Thus, we assume $m<n$. 

### Interpretation

1. geometric : $\mathbf{x}^\star$ is a point in the affine set $$\{\mathbf{x} \vert \mathbf{Ax=b}\}$$ with minimum distance to origin $\mathbf{0}$. 
2. estimation : $\mathbf{b=Ax}$ are perfect measurements of $\mathbf{x}$. Among those, $\mathbf{x}^\star$ is the smallest estimate, consistent with the measurements. 
3. optimal design : $\mathbf{x}$ are design variables, $\mathbf{b}$ are required results: $\mathbf{x}^\star$ is the most efficient design that satisfies the requirements. 

### Examples

- In case of $\|\cdot \|_2$, this problem can be solved by **optimality conditions**

  $$
  \begin{aligned}
  \min _\mathbf{x} & \ \ \|\mathbf{x}\|_2 ^2 = \mathbf{x}^T \mathbf{x}\\
  \text{s.t.}& \ \ \mathbf{Ax=b}
  \end{aligned}
  $$
  
  where the Lagrangian is defined by
  
  $$
  \mathcal{L}(\mathbf{x, \nu}) = \mathbf{x}^T \mathbf{x} + \nu^T (\mathbf{Ax-b})
  $$
  
  Then, if we assume $(\mathbf{x}^\star, \nu^\star)$ as a primal and dual optimal point, below conditions must hold. 
  
  
  $$
  2\mathbf{x}^\star+ \mathbf{A}^T \nu ^\star = \mathbf{0}, \ \ \mathbf{Ax}^\star =b
  $$
  
  From these, we have
  
  $$
  2\mathbf{Ax}^\star + \mathbf{AA}^T \mathbf{\nu}^\star = \mathbf{0}\\
  \iff 2\mathbf{b}+\mathbf{AA}^T \mathbf{\nu}^\star =0 \\
  \iff \nu^\star = -2(\mathbf{AA}^T)^{-1}\mathbf{b}
  $$
  
  and
  
  $$
  \mathbf{x}^\star = \mathbf{A}^T (\mathbf{AA}^T)^{-1}\mathbf{b}
  $$
  
  Note that $\text{rank } \mathbf{A} = m <n$ , and thus the matrix $\mathbf{AA}^T$ is invertible. 
  
- In case of $\|\cdot \|_1 $, this can be solved by LP

  $$
  \begin{aligned}
  \min _\mathbf{x} & \ \  \mathbf{1}^T \mathbf{y}\\
  \text{s.t.}& \ \ \mathbf{Ax=b}\\
  & \ \ -\mathbf{y}\leq \mathbf{x} \leq \mathbf{y}
  \end{aligned}
  $$


## Regularized Approximation
### Problem Definiion
Regularization is a common scalariziation method used to solve the bi-criterion problem. One form of regularization is to minimize the weighted sum of the objectives:

$$
\min \|\mathbf{Ax-b}\| + \gamma \|\mathbf{x}\|
$$

where $\mathbf{A} \in \mathbb{R}^{m\times n}$ and norms on $\mathbb{R}^m$ and $\mathbb{R}^n$ can be different. 

### Tikhonov regularization

The most common form of regularization is the one with Euclidean norms, resulting in a conevx quadratic optimization problem. 

$$
\min \|\mathbf{Ax-b}\|_2 ^2 + \delta \|\mathbf{x}\|_2 ^2 = \mathbf{x}^T (\mathbf{A}^T\mathbf{A}+ \delta \mathbf{I})\mathbf{x}- 2\mathbf{b}^T\mathbf{Ax}+ \mathbf{b}^T \mathbf{b}
$$

This has an analytical solution of 


$$
\mathbf{x}^\star = (\mathbf{A}^T \mathbf{A}+ \delta \mathbf{I})^{-1}\mathbf{A}^T \mathbf{b}
$$

### Optimal Input Design

Consider a linear dynamical system with input $u(t)$ and output $y(t)$. 

1. tracking error with desired output $y_{des}$:

   $$
   J_{track} := \sum_{t=0}^N (y(t) - y_{des}(t))^2
   $$
   
2. input variation : 

   $$
   J_{der} := \sum_{t=0}^{N-1} (u(t+1)- u(t))^2
   $$
   
3. input magnitude : 
   
   $$
   J_{mag} := \sum_{t=0}^N u(t)^2
   $$

Regularized least-squares formulation:

$$
\min_u J_{track} + \delta J_{der} + \eta J_{mag}
$$

<center><img src="https://live.staticflickr.com/65535/51133712765_331360869e_o.png" alt="image-20210423123819940" style="zoom:50%;" /></center>



## Signal Reconstruction

### Problem Definition

Consider the multi-objective problem

$$
\min_{\hat{\mathbf{x}}}  \ (\|\hat{\mathbf{x}} - \mathbf{x}_{cor} \|_2 , \phi(\hat{\mathbf{x}}) )
$$

where $\mathbf{x}$ is unknown signal, and $\mathbf{x}_{cor} = \mathbf{x}+\mathbf{v}$ is observed corrupted version of $\mathbf{x}$, with additive noise $\mathbf{v}$. $\phi$ is regularization function or smoothing objective.

### Example

- Quadratic smoothing : 

   $$
   \phi_{quad}(\hat{\mathbf{x}}) = \sum_{i=1}^{n-1} (\hat{\mathbf{x}}_{i+1} - \hat{\mathbf{x}}_i )^2
   $$

- Total variation smoothing : 
  
   $$
   \phi_{tv}(\hat {\mathbf{x}}) = \sum_{i=1}^{n-1}|\hat{\mathbf{x}}_{i+1} - \hat{\mathbf{x}}_i |
   $$

### Total variation vs Quadratic Smoothing

   <center><img src="https://live.staticflickr.com/65535/51133723770_e40182b2d0_o.png" alt="image-20210423124638505" style="zoom:30%;" /></center>

<center><img src="https://live.staticflickr.com/65535/51133389864_51876ac60d_o.png" alt="image-20210423124755116" style="zoom:30%;" /></center>

Total variation smoothing preserves sharp transitions in signal!

## Robust Approximation
### Problem Definition

We want to minimize $$\|\mathbf{Ax-b}\|$$ with uncertain $$\mathbf{A}$$. We can take two approaches:

1. Stochastic : assume $\mathbf{A}$ is random, and minimize $$\mathbb{E}\|\mathbf{Ax-b}\|$$. 
2. Worst-case : choose set of $\mathcal{A}$ of possible values of $\mathbf{A}$, and minimize the worst-case scenario, $$\sup_{\mathbf{A}\in \mathcal{A}} \|\mathbf{Ax-b}\|$$.

### Example 

Let $\mathbf{A} = \mathbf{A}_0 + u \mathbf{A}_1 $. Stochastic case minimizes

$$
\mathbb{E} \|\mathbf{A}(u)\mathbf{x} - \mathbf{b}\|_2 ^2 , \ \ u \in \text{uni}[-1,1]
$$

Worst-case minimizes

$$
\sup_{u\in [-1,1]} \|\mathbf{A}(u) \mathbf{x}- \mathbf{b}\|_2^2
$$

The residual in three cases $$r(u) = \|\mathbf{A}(u)\mathbf{x}- \mathbf{b}\|_2$$

<center><img src="https://live.staticflickr.com/65535/51133399499_4e6c203e3b_o.png" alt="image-20210423125450373" style="zoom:50%;" /></center>

### Stochastic Robust Least Squares

Let $\mathbf{A = \bar{A}+U}$, where $\mathbf{U}$ is random with $\mathbb{E}\mathbf{U}=\mathbf{0}$, and $\mathbb{E}\mathbf{U}^T \mathbf{U = P}$. Consider the problem

$$
\min \ \mathbb{E}\|\mathbf{(\bar{A}+U)x-b}\|_2 ^2
$$

This can be converted to the problem of 

$$
\mathbb{E} \|\mathbf{(\bar{A} + U)x - b}\|_2 ^2 =\|\mathbf{\bar{A}x-b}\|_2 ^2 + \mathbf{x}^T \mathbf{Px}
$$

Hence, this problem is equivalent to LS problem

$$
\mathbb{E} \|\mathbf{(\bar{A} + U)x - b}\|_2 ^2 =\|\mathbf{\bar{A}x-b}\|_2 ^2 +\|\mathbf{P}^{1/2}\mathbf{x}\|_2^2
$$

for $$\mathbf{P} = \delta \mathbf{I}$$, we obtain a Tikhonov regularized problem. 


## References

- S. Boyd, L.Vandenberghe, Convex Opimization, Cambridge University Press, 2004. <http://stanford.edu/~boyd/cvxbook/>
- Optimization Theory and Applications, SNU EE 2021, Insoon Yang



  
