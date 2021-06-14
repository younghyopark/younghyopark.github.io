---
title: "[Optimization] Multi Objective Optimization"
tags: Reinforcement-Learning Optimization
published: false
comment: true
---

## Multi-objective Optimization

### Problem Definition

Let's first consider an unconstrained multiobjective optimization problem.

$$
\min _{x\in \mathbb{R}^n } F(x) = \min _{x\in \mathbb{R}^n } {\begin{pmatrix}  f_1 (x)   \\ \vdots \\ f_k (x) \end{pmatrix} }
$$

Function $$F$$ is the objective function, but one thing is different: it's now a **vector**, not scalar. In contrast to single objective optimization problems, there exists no total order of the objective function values in $$\mathbb{R}^k$$, $$k\geq 2$$. Therefore, the comparison of values is should be defined in a different way. 

### Defining the Inequality

Let $$v,w \in \mathbb{R}^k$$ . The vector $v$ is less than $w$ if $$v_i < w_i$$ for all $$ i \in \{1, \cdots, k\}$$. 

$$
v < _p w \iff v_i <w_i \ \text{ for }\  \forall i \in \{1, \cdots, k\}
$$



### Dominance / Pareto Optimal / Pareto Set

(a) A point $x^\star \in \mathbb{R}^n$ dominates a point $x\in \mathbb{R}^n$ if $F(x^\star) \leq _p F(x)$ and $F(x^\star) \not = F(x)$. 

(b) A point $x^\star \in \mathbb{R}^n $ is called (globally) **Pareto optimal** if there exists no point $x \in \mathbb{R}^n $ dominating $x^\star$. The image $F(x^\star)$ of a (globally) Pareto optimal point $x^\star$ is called a (globally) Pareto optimal value. 

(c) **Non-dominated solution set** : given a set of solutions, the non-dominated solution set is a set of all the solutions that are not dominated by any member of the solution set. 

(d) The set of **non-dominated** points is called the Pareto set $\mathcal{P}_S$, its image the Pareto front $\mathcal{P}_F$. 

<img src="https://live.staticflickr.com/65535/51220899302_e3901842bc_o.png" alt="image-20210603131428244" style="zoom:30%;" />



### Goals of Multi-objective 

- Find set of solutions as close as possible to Pareto-optimal front!
- Find a set of solutions as divserse as possible!

## Necessary condition for optimality

### KKT condition

Let $x^\star$ be a Pareto point of multi-objective optimization problem. Then, there exist nonnegative scalars $\alpha_1, \cdots, \alpha_k \geq 0$ such that 

$$
\sum_{i=1}^k \alpha_i = 1 \text{ and } \sum_{i=1}^k \alpha_i \nabla f_i(x^\star) =0
$$

Note that this is only a **necessary condition** for a point $x^\star$ to be Pareto-point, and the set of points satisfying the KKT optimality condition is called the set of **substationary points** $$ \mathcal{P}_{S,sub}$$. 

### Descent Direction

To identify a descent direction $q(x)$ for which all objectives are non-increasing, i.e.:

$$
\nabla f_i (x) \cdot q(x) \leq 0, \ \ \ i= 1, \cdots, k
$$

One way to compute a descent direction is to solve the auxillary optimization problem:

$$
\min_{\alpha \in \mathbb{R}^k}  \bigg \{ \Big \|\sum_{i=1}^k \alpha_i \nabla f_i (x) \Big \|_2 ^2 \ \Big | \ \alpha_i \geq 0 , i = 1, \cdots, k , \sum_{i=1}^k \alpha_i =1 \bigg \}
$$

Then, if we define

$$
q(x)= - \sum_{i=1}^k  \hat{\alpha}_i \nabla f_i (x),
$$

where $\hat{\alpha}$ is the solution of the optimization problem above, we can either say $q(x)=0$ and $x$ satisfies the KKT optimality condition, or $q(x)=0$ is a descent direction for all objectives $f_1(x), \cdots, f_k(x)$ in $x$. 

$$
\nabla f_i (x) \cdot \bigg ( -\sum_{i=1}^k \hat{\alpha}_i \nabla f_i (x) \bigg ) \leq 0
$$

prf) Define
$$
K(x) = \bigg \{ \sum_{i=1}^k \alpha_i \nabla f_i(x) , \alpha_i \geq 0, i=1, \cdots, n, \sum_{i=1}^n \alpha_i =1 \bigg \},
$$

and assume that $0 \not \in K(x)$ for any fixed $$ x \in \mathbb{R}^n$$. Furthermore, assume that there exists a vector $v(x) \in K(x)$ with $$q(x)^T v(x) \leq 0$$. Then, we obtain the following properties of the vectors $\lambda(q(x)-v(x))$, $0\leq \lambda \leq 1$:

  (a) $$(v(x) + \lambda(q(x)-v(x))) \in K(x)$$ for all $0\leq \lambda \leq 1$;

  (b) $$ q(x)^T (\lambda(q(x)-v(x))) >0$$,  for all $0<\lambda \leq 1$. 



<img src="https://live.staticflickr.com/65535/51247024735_f1e187d74a_o.png" alt="CleanShot 2021-06-14 at 16.32.49@2x" style="zoom:50%;" />

<img src = "https://cln.sh/Q1IGhq/download" style="zoom:50%">









<img src ="https://cln.sh/Q1IGhq/download" style="zoom:40%">



