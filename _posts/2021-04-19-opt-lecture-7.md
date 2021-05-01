---
title: "[Optimization] KKT Optimality Condition"
tags: Optimization Lecture-Note
permalink: "/notion_to_markdown/opt-lecture-7/"
comment: true
---

## Characterizing the Optimality 

### How should we characterize the conditions for optimality?

What are the necessary and sufficient conditions for 

$$
x: \text{primal feasible point}\\
(\lambda, \nu) : \text{dual feasible point}
$$

to be optimal?



### Complementary slackness

Suppose that strong duality holds, and (somehow) the primal and dual optimal values are attained. 

$$
x^\star : \text{primal optimal point}\\
(\lambda^\star, \nu^\star) : \text{dual optimal point}
$$

We then have

$$
\begin{aligned}
p^\star = f_0(x^\star) & = g(\lambda^\star , \nu^\star)  = d^\star  \ \ \ \because \text{strong duality}\\
& = \inf_x \ \bigg ( f_0 (x) + \sum_{i=1}^m \lambda^\star _i f_i (x) + \sum_{i=1}^p \nu_i^\star h_i (x) \bigg )  \ \ \ (=L(x,\lambda^\star, \nu^\star) )\\
& \leq f_0 (x^\star) + \sum_{i=1}^n \lambda_i ^\star f_i (x^\star) + \sum_{i=1}^p \nu_i^\star h_i (x^\star)  \ \ \ (=L(x^\star, \lambda^\star, \nu^\star ))\\
& \leq f_0 (x^\star)  \ \ \ (\because x^\star \text{ is feasible})
\end{aligned}
$$

which implies that the inequality above should hold with **equality**. 

Thus, we can say that 

$$
\sum_{i=1}^n \lambda_i ^\star f_i (x^\star) =0
$$

and considering that $\lambda_i ^\star f_i (x^\star) \leq 0$ for all $i$,  we can finally deduce the **complementary slackness** condition.

$$
\lambda_i ^\star f_i (x^\star ) =0 \ \ \ i = 1, \cdots, m
$$

This complementary slackness can be expressed as two cases:

$$
\lambda_i ^\star >0  \ \ \ \implies \ \ \ f_i (x^\star) =0
$$

or, equivalently, 

$$
f_i (x^\star)  <0 \ \ \ \implies \ \ \ \lambda_i ^\star =0
$$

Unless the $i$th constraint is active at the optimum, the $i$th optimal Lagrange multiplier is zero. 

### If dual optimal point is given

If dual optimal point is given, you can easily get the primal optimal point by

$$
x^\star = \arg \min _x  L(x,\lambda^\star, \nu^\star) 
$$


## KKT Optimality Conditions

### Before beginning

1. Assume that $f_0, \cdots, f_m, h_1, \cdots, h_p$ are differentiable. (open domains)
2. No assumptions about the convexity (yet)

### KKT Conditions for Nonconvex Problems

First, assume that $x^\star, (\lambda^\star, \nu^\star)$ is the primal and dual optimal points with **zero duality gap**. Then we know that $x^\star$ minimizes the Lagrangian $L(x,\lambda^\star, \nu^\star)$ with respect to $x$. Thus, the gradient must vanish at $x^\star$ .

$$
\nabla f_0 (x^\star) + \sum_{i=1}^m \lambda_i ^\star \nabla f_i (x^\star) + \sum_{i=1}^p \nu_i ^\star \nabla h_i (x^\star) =0
$$

**Note that this is a necessary condition (not sufficient) for optimality, since the functions are not convex in this case. **

Thus, we have the following **necessary** conditions for optimality, called "Karush-Kuhn-Tucker (KKT)" conditions. Also, this condition requires a "strong duality" condition. 

<center><img src="image-20210419093930984.png" alt="image-20210419093930984" style="zoom:50%;" /></center>



### KKT Conditions for Convex Problems

When the primal problem is convex, we cany say something more. KKT conditions are also a **sufficient** condition for the points to be primal and dual optimal. Note that, KKT condition also implies **zero duality gap**. As long as the KKT conditions are satisfied for convex problems, we can gaurantee that those points are each primal and dual optimal points, with strong duality. 

<center><img src="image-20210419094313583.png" alt="image-20210419094313583" style="zoom:50%;" /></center>

<center><img src="https://live.staticflickr.com/65535/51150036593_fd92031162_o.png" alt="image-20210501153039328" style="zoom:50%;" /></center>

### Proving the KKT Condition

First two conditions say that $\tilde{x}$ is feasible. 

Let's then consider a mapping (**convex mapping**)

$$
x \rightarrow L(x,\tilde{\lambda}, \tilde{\nu})  = f_0 (x) + \sum_{i=1}^m \tilde{\lambda}_i f_i (x) + \sum_{i=1}^p \tilde{\nu}_i h_i (x)
$$

Since we know that above Lagrangian is **convex**, and first-order **derivative** **condition** holds (by the KKT) for $\tilde{x}$, we can conclude that


$$
\tilde{x} \in \arg \min _x L(x, \tilde{\lambda}, \tilde{\nu})
$$

Meanwhile, the dual optimal point

$$
\begin{aligned}
g(\tilde{\lambda}, \tilde{\nu}) & = L(\tilde{x}, \tilde{\lambda}, \tilde{\nu})\\
& = f_0 (\tilde{x}) + \sum_i \tilde{\lambda}_i f_i (\tilde{x}) + \sum_i \tilde{\nu}_i h_i (\tilde{x}) \\
& = f_0 (\tilde{x}) \ \ \ (\because \text{ complementary slackness and feasibility})
\end{aligned}
$$

shows that there is no duality gap. 

Thus, $\tilde{x}, (\tilde{\lambda}, \tilde{\nu})$ are primal and dual optimal points. 

### Solving the Primal problem via the Dual

Suppose that strong duality holds, and an optimal dual is known. We assume that the minimizer of $L(x,\lambda^\star, \nu^\star)$ is unique. Then, we can say

1. solution of $\min_x L(x,\lambda^\star, \nu^\star)$ is the primal optimal point. 
2. If it's not primal feasible, then no primal point can exist. 

## References

- S. Boyd, L.Vandenberghe, Convex Opimization, Cambridge University Press, 2004. <http://stanford.edu/~boyd/cvxbook/>

- Optimization Theory and Applications, SNU EE 2021, Insoon Yang



