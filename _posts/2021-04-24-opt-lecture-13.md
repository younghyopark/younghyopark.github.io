---
title: "[Optimization] Subgradient Methods"
tags: Optimization Lecture-Note
comment: true
published: true
---

## Motivation

How should we handle **nondifferentiable objective functions**?
{:.info}

- objective functions can be convex but not differentiable
- can't use the standard optimality conditions
- can't use gradient or Hessian information in optimization algorithms

## Subgradients

### Definition

The subgradient set or subdifferential of a function $f$ at a point $x$ is defined as

$$
\partial f(x) := \{ g \ \vert \ f(y) \geq f(x) + \langle g, y-x \rangle, \ \ \forall y\}
$$

Intuitively, since a **function is convex if and only if its epigraph $\text{epi } f$ is convex**, the subgradient set $\partial f$ should be non-empty and consist of supporting hyperplanes of $\text{epi }f$. 

<center><img src="https://live.staticflickr.com/65535/51136147022_f2f3ecbe53_o.png" alt="image-20210425153801880" style="zoom:50%;" /></center>

If $f$ is conevx and diffeerentiable at $x$, then $\partial f(x) = \{ \nabla f(x)\}$. 

### Optimality Condition

`Theorem`{:.info}  Let $f: \mathbb{R}^n \rightarrow \mathbb{R}$ be convex. The point $x \in \mathbb{R}^n$ minimizes $f$ over a convex set $C$ if and only if there exists a subgradient $g\in \partial f(x)$ such that simultaneously for all $y\in C$, 

$$
\langle g, y-x \rangle \geq 0
$$

`Intuition`{:.success} There is a vector $g$ in the subgradient set $\partial f(x)$ such that $-g$ is a supporting hyperplane to the feasible set $C$ at the point $x$. The direction of decrease of the function $f$ lie outside the set $C$. 

<center><img src="https://live.staticflickr.com/65535/51137953510_423d8fb348_o.png" alt="image-20210425155612693" style="zoom:50%;" /></center>

If $C =\mathbb{R}^n$, $g=0$ is the only case where above inequality holds. 

### Calculus rules with subgradients

- Scaling : if $h(x) = \alpha f(x)$ for some $\alpha \geq 0$, then

  $$
  \partial h(x) = \alpha \partial f(x)
  $$

- Finite sum : Suppose $f_1, \cdots, f_m$ are convex functions and let $f:=\sum_{i=1}^m f_i$. Then,
  
  $$
  \partial f(x) = \sum_{i=1}^m \partial f_i (x)
  $$
  
  where the addition is Minkowski sum.
  
  `Proof`{:.warning} Let $g_i \in \partial f_i(x)$ for all $i$. Then,
  
  $$
  \begin{aligned}
  f(y) = \sum_{i=1}^m f_i (y) & \geq \sum_{i=1}^m (f_i(x)+ \langle g_i , y-x\rangle )\\
  & =\sum_{i=1}^m f_i (x) + \bigg \langle \sum_{i=1}^m g_i , y-x \bigg \rangle
  \end{aligned}
  $$
  
  we can see that 

  $$
  \sum_i g_i \in \partial f(x)
  $$
  
- Affine transformations : Let $f: \mathbb{R}^m \rightarrow \mathbb{R}$ be convex and $A \in \mathbb{R}^{m\times n}$ and $b\in \mathbb{R}^m$. Then, $h: \mathbb{R}^n \rightarrow \mathbb{R}$ defined by $h(x) = f(Ax+b)$ is convex and has subdifferential

  $$
  \partial h(x) = A^T \partial f(Ax+b)
  $$
  
  `Proof`{:.warning} Let $g \in \partial f(Ax+b)$. Then,
  
  $$
  \begin{aligned}
  h(y) = f(Ay+b) & \geq f(Ax+b) + \langle g, (Ay+b) - (Ax+b) \rangle\\
  & = h(x) + \langle g, A(y-x) \rangle\\
  & = h(x) + \langle A^T g, y-x \rangle\\
  \end{aligned}
  $$
  
  which shows that 
  
  $$
  A^T g = A^T \partial f(Ax+b)\in \partial h(x)
  $$

### Integrals with subgradients

Suppose that $f_s$ is convex for each $s\in S$, and let 

$$
f(x):= \int_S f_s (x) d\mu (s).
$$

where $\mu$ is a positive measure on $S$. Then, if we let $g_s(x) \in \partial f_s(x)$ for each $s\in S$, we have

$$
\int_S g_s (x) d\mu(s) \in \partial f(x)
$$

`Proof`{:.warning} 

$$
\begin{aligned}
\bigg \langle \int_S g_s (x) d\mu(s), y-x \bigg \rangle & = \int \langle g_s(x), y-x \rangle d\mu(s)\\
& \leq \int \Big ( f_s (y) - f_s(x) \Big )d\mu(s)\\
& = f(y)-f(x)
\end{aligned}
$$

### Application to stochastic optimization

If we have a collection of functions $F:\mathbb{R}^n \times \mathcal{S} \rightarrow \mathbb{R}$, where for each $s\in S$ the function $F(\cdot; s)$ is convex, then

$$
f(x) := \mathbb{E}_s [ F(x; \mathcal{S}) ]
$$

is convex when taking expectations over $\mathcal{S}$, and letting

$$
g(x; s) \in \partial F(x;s)
$$

gives a stochastic subgradient with the property that

$$
\mathbb{E}_s [g(x;S)] \in \partial f(x).
$$

### Finite Maxima

Let $f_i$, $i=1,\cdots, m$ be convex functions and $f(x) := \max_i f_i (x)$. Then, 

$$
\text{epi }f = \bigcap_i \text{epi }f
$$

Then, the subgradient set of $f$ is the convex hull of the subgradients of **active functions ** at $x$ (those attaining the maximum:

$$
\partial f(x) = \text{Conv} \{ \partial f_i (x) : f_i(x) = f(x)\}
$$

`Proof`{:.warning} For $y\in \mathbb{R}^n$, let $i$ be any index that $f_i (x) = f(x)$ (active index) and let $g_i \in \partial f_i (x)$. 

$$
\begin{aligned}
f(y) \geq f_i (y) & \geq f_i (x) + \langle g_i, y-x \rangle\\
& = f(x) + \langle g_i, y-x \rangle
\end{aligned}
$$



## Subgradient Methods

### Motivation

Subgradient-based methods are essentially universally applicable for convex optimization problems, becuase they rely very little on the structure of the problem being solved. 

- This leads to effective but slow algorithms in classical optimization problems.
- In large scale problems arising out of ML and statistical tasks, however, subgradient methods enjoy a number of (thoretical) optimality properties and have excellent practical performance. 

### Subgradient Algorithms

Recall that in gradient descent method, we have

$$
x_{k+1} = x_k - \alpha_k \nabla f(x_k)
$$

where $\alpha_ k>0$ is a positive sequence of stepsizes.

Then, the subgradient algorithm iterates for $k=1,2,\cdots$, the following step:

1. choose any subgradient

   $$
   g_k \in \partial f(x_k)
   $$
   
2. Take the subgradient step
   
   $$
   x_{k+1}:= x_k - \alpha_k g_k.
   $$

Note that, subgradient descent does not guarantee $f(x_{k+1}) \not \leq f(x_k)$.
{:.info}

<center><img src="https://live.staticflickr.com/65535/51137877199_1b3e1bdd83_o.png" alt="image-20210425191319246" style="zoom:50%;" /></center>

In this case, however, subgradients at least descend on a related quantity: the distance of $x$ to any optimal point. 

`Proof`{:.warning} Let $g\in \partial f(x)$ and let $x^\star \in \arg\min f(x)$. Then, for any $\alpha$, 

$$
\frac{1}{2} \|x - \alpha g-x^\star\|_2^2 = \frac{1}{2}\|x - x^\star\|_2 ^2 -\alpha \langle g, x-x^\star\rangle + \frac{\alpha^2}{2} \|g \|_2^2
$$

Then, by the definition of subgradients,

$$
-\langle g, x-x^\star \rangle  = \langle g, x^\star - x\rangle  \leq f(x^\star) - f(x)
$$

Therefore,

$$
\frac{1}{2}\|x- \alpha g -x^\star\|_2^2 \leq \frac{1}{2} \|x- x^\star\|_2^2 -\alpha (f(x) - f(x^\star) ) + \frac{\alpha^2}{2}\|g\|_2 ^2.
$$

We then conclude that, if $0<\alpha< \frac{2(f(x) - f(x^\star))}{\|g\|_2^2}$,

$$
\|x- \alpha g- x^\star \|_2 ^2 \leq \|x - x^\star \|_2 ^2
$$

If $0\not\in \partial f(x)$, then for any $x^\star\in \arg\min_x f(x)$ and any $g\in \partial f(x)$, there exists a stepsize $\alpha>0$ such that $$\|x-\alpha g -x^\star\|_2^2 < \|x-x^\star\|_2^2$$.
{:.info}


### Convergence Gaurantees

We begin by stating a general result on the convergence of subgradient methods. We make a few simplifying assumptions in stating our result, several of which are not completely necessary, but which considerably simplify the analysis. 

`Assumption`{:.success} 
1. There is at least one (possibly non-unique) minimizing point $$x^\star \in \arg\min_x f(x)$$ with $$f(x^\star) = \inf_x f(x) >-\infty$$. 
2. The subgradients are bounded: for all $x$ and all $g\in \partial f(x)$, we have the subgradient $$\|g\|_2 \leq M <\infty$$ (independently of $x$). 

`Theorem`{:.info} Let $\alpha_k$ be any non-negative sequence of stepsizes and the preceding assumptions hold. Let $x_k$ be generated by the subgradient iteration. Then for all $K\geq 1$,

$$
\sum_{k=1}^K \alpha_k \Big [ f(x_k) - f(x^\star) \Big ] \leq \frac{1}{2} \|x_1 - x^\star\|_2^2 + \frac{1}{2} \sum_{k=1}^K \alpha_k^2 M^2
$$

`Proof`{:.warning} By using equation (20), 

$$
\begin{aligned}
\frac{1}{2}\|x_{k+1}- x^\star\|_2^2 & \leq \frac{1}{2}\|x_k - \alpha_k g_k - x^\star\|_2^2\\
& \leq \frac{1}{2} \|x- x^\star\|_2^2 - \alpha_k (f(x_k) - f(x^\star) ) + \frac{\alpha^2}{2}\|g_k\|_2^2
\end{aligned}
$$

Rearranging this inequality, and using the **bounded assumption** $$\|g_k\|_2^2 \leq M^2$$, we obtain

$$
\alpha_k (f(x_k) -f(x^\star))\leq \frac{1}{2} \|x_k - x^\star\|_2^2 - \frac{1}{2}\|x_{k+1}- x^\star\|_2^2 + \frac{\alpha_k^2}{2}M^2
$$

By summing above equation from $k=1$ to $k=K$, we obtain

$$
\sum_{k=1}^K \alpha_k \Big [ f(x_k) - f(x^\star) \Big ] \leq \frac{1}{2} \|x_1 - x^\star\|_2^2 + \frac{1}{2} \sum_{k=1}^K \alpha_k^2 M^2
$$



### Weighted Averaging

`Corollary`{:.info} Let $A_k:= \sum_{i=1}^k \alpha_i$ and define

$$
\bar{x}_k = \frac{1}{A_K} \sum_{k=1}^K \alpha_k x_k.
$$

Then, we have

$$
f(\bar{x}_k) -f(x^\star) \leq \frac{\|x_1 -x^\star\|_2^2 + \sum_{k=1}^K \alpha_k^2 M^2}{2\sum_{k=1}^K \alpha_k}
$$

`Proof`{:.warning} Note that $A_k^{-1} \sum_i \alpha_i =1$, and convexity of $f$ implies

$$
\begin{aligned}
f(\bar{x}_k) - f(x^\star) &\leq \frac{1}{\sum_i \alpha_i} \sum_{k=1}^K \alpha_k f(x_k) - f(x^\star)\\
& = A_k^{-1} \bigg [ \sum_{k=1}^K \alpha_k (f(x_k)-  f(x^\star)) \bigg ] \\
& =\frac{\|x_1 - x^\star\|_2^2 + \sum_{k=1}^K \alpha_k^2 M^2}{2A_k}
\end{aligned}
$$



### Remarks

- Suppose that 

  $$
  \alpha_k \rightarrow 0 \ \ \ \ \text{and} \ \ \ \ \sum_{k=1}^\infty \alpha_k = \infty
  $$
  
  Then, 
  
  $$
  \frac{\sum_{k=1}^K \alpha_k^2}{\sum_{k=1}^K \alpha_k} \rightarrow 0
  $$
  
  and thus
  
  $$
  f(\bar{x}_K) - f(x^\star) \rightarrow 0 \ \ \text{as} \ \ K\rightarrow \infty
  $$

- Since the subgradient method is not a descent method, we may just use the best point observed so far instead of the tracked weighted average, or the final point.

   $$
   x_k^{best} = \arg \min_{x_i, i\leq k} f(x_i)
   $$
   
   Then, we can say that
   
   $$
   f(x_k^{best}) - f(x^\star) \leq f(\bar{x}_K) - f(x^\star) \leq \frac{\|x_1 - x^\star\|_2^2 + \sum_{k=1}^K \alpha_k^2 M^2}{2\sum_{k=1}^K \alpha_k}
   $$

### Example

If we aim to minimize

$$
f(x):= \frac{1}{m} \|Ax - b\|_1 = \frac{1}{m} \sum_{i=1}^m |\langle a_i, x \rangle-b_i |
$$

we can design the subgradient as 

$$
g(x) = \frac{1}{m} A^T \text{sign}(Ax-b) = \frac{1}{m} \sum_{i=1}^m a_i \text{sign} (\langle a_i, x \rangle-b_i )\in \partial f(x)
$$



## References

- S. Boyd, L.Vandenberghe, Convex Opimization, Cambridge University Press, 2004. <http://stanford.edu/~boyd/cvxbook/>
- Optimization Theory and Applications, SNU EE 2021, Insoon Yang



  