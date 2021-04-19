---
title: "[Optimization] 5 - Typical Convex Optimization Problems"
tags: Optimization Lecture-Note
permalink: "/notion_to_markdown/opt-lecture-5/"
---

## Standard Form of Convex Optimization Problems


$$
\begin{aligned}
\min &\ \ f_0 (x) \\
\text{s.t.} & \ \ f_i (x)  \leq 0, i=1,\cdots, m\\
& \ \ a_i ^T x = b_i , i=1,\cdots, p

\end{aligned}
$$


- the objective function must be convex
- inequality constraint functions must be convex
- the equality constraint functions should be affine
- more generally, this problem is said to be convex if the cost function is convex and its feasible set is convex. 

## Optimality in convex optimization

 In convex optimization problems, any **locally optimal point** is **globally optimal**. 

**[proof]** We say a feasible point is locally optimal if there is an $R>0$ such that 

$$
   f_0 (x)  =  \inf \{ f_o (z) \ \vert \ z\in \text{feasible set},  \ 
   \|z-x\|_2 \leq R\}
   
$$


Now, suppose that $x$ is not globally optimal. Thus, therer exists a feasible $y$ such that 

$$
   f_0 (y) <f_0 (x)
   
$$


Evidently, $\|y-x\|_2 >R$. Consider a point $z$ given by

$$
   z = (1-\theta ) x + \theta y , \ \ \ \theta = \frac{R}{2\|y-x\|_2 }
   
$$


We set $\theta$ like above, to make

$$
   \|z-x\|_2 = \|\theta (y-x)\|_2  = \frac{R}{2}
   
$$


By convexity of the feasible set, $z$ is also feasible. 

Now, by the convexity of $f_0$, we have

$$
   f_0 (z) \leq (1-\theta ) f_0 (x) + \theta f_0 (y) <f_0 (x)
   
$$


Finally, a contradiction. $z$ is inside the boundary $R$, but $f_0 (z)$ is smaller than $f_0 (x)$. Thus, $x$ has to be globally optimal. 



## Optimality condition for convex optimization

### For differentiable $f_0 $

- Suppose now that the objective function $f_0 $ is differentiable. Let $X$ denote the feasible set. 

- Then, $x$ is optimal if and only if $x \in X$ and


$$
  \nabla f_0 (x)^ T (y-x) \geq 0 \ \ \ \forall y \in X
$$


<center><img src="image-20210418180403172.png" alt="image-20210418180403172" style="zoom:50%;" /></center>

($\implies$)  Assume that $x\in X$ satisfies the optimality condition. 

$$
\nabla f_0 (x)^T (y-x) \geq 0 \ \ \ \forall y \in X
$$

Since $f_0 $ is a convex function, 

$$
f_0 (y) \geq f_0 (x) + \nabla f_0 (x)^T (y-x) \geq f_0 (x)
$$

Since above inequality holds for entire all $y\in X$, $x$ is optimal. 

($\impliedby$) Now Assume $x$ is optimal, and assume that the optimality condition doesn't hold.

$$
\nabla f_0 (x)^T (y-x) <0 \ \ \ \exists y \in X
$$

For $t\in [0,1]$, let 

$$
z(t) = ty+ (1-t)x \in X
$$

Now, differentiate $f_0 (z) = f_0 (ty + (1-t)x)$ with $t$. 

$$
\frac{d}{dt}f_0 (z(t)) \bigg \vert_{t=0}= f_0 ^\prime (z(t)) \frac{dz}{dt} = \nabla f(z(0))^T ( y-x) = \nabla f(x)^T (y-x)<0
$$

Thus, for sufficiently small $\epsilon >0$, 

$$
f_0 (z(\epsilon)) < f_0 (z(0)) = f_0 (x)
$$

which is a contradiction. ($x$ is no longer a optimal point)



### For unconstrained problems

* For unconstrained problems, the optimality condition reduces to 
  
$$
  \nabla f_0 (x)=0
  
$$


- Why? 

  - Suppose $x$ is optimal, which means $x \in \text{dom }f = X$

  - By the general optimality condition, we have
    
      $$
\nabla f_0 (x)^T (y-x) \geq 0
     $$
     
     for all feasible $y\in X$. 

  - Since $f_0$ is differentiable, the domain is open by definition. 

  - Thus, there exists a small positive $t$ such that
  
    $$
  y:= x- t \nabla f_0 (x) \in X
    $$
  
  - Since $y$ is feasible,
    
    $$
 \nabla f_0 (x)^T (-t \nabla f_0 (x)) = -t \| \nabla f_0 (x)\|_2 ^2 \geq 0 
     
    $$
  
- Thus, we can conclude that
  
    $$
   \nabla f_0 (x) =0
   $$




- For example, consider the problem of minimizing
  
  $$
f_0 (x) = \frac{1}{2} x^T Px + q^T x+ r
  $$
  
  where $P \in \mathbb{S}^n_+$ . The optimality condition for $x$ is 

  $$
  \nabla f_0 (x) = Px+q =0
  $$

  

### For the case with equality constraints


$$
\begin{aligned}
\text{min} & \ \ \ f_0 (x) \\
\text{s.t.} & \ \ \ Ax = b

\end{aligned}
$$


- general optimality condition for a feasible $x$
  
  $$
\nabla f_0 (x)^T (y-x) \geq 0 , \ \ \ \forall y \ \ \text{s.t.} \ \ Ay = b
  $$


- Since $x$ is feasible and the feasible set is affine, every feasible $y$ can be written as
  
  $$
y= x+v
  $$
  
  for some $v\in \mathcal{N}(A)$. 

- Thus, the optimality condition can be rewritten as
  
$$
  \nabla f_0 (x)^T v \geq 0 , \ \ \forall v \in \mathcal{N}(A)
  
$$


- If a linear function is nonnegative on a subspace, then it must be zero on the subspace. 

- Thus, 
  
  $$
\nabla f_0 (x)^T v =0 \ \ \ \forall v \in \mathcal{N}(A)
  $$
  
  which can be also interpreted as 

  $$
  \nabla f_0 (x) \perp v \ \ \ \forall v \in \mathcal{N} (A)
  $$


- Since the perp of null space is the range space of tranposed matrix, 
  
$$
  \mathcal{N}(A)^{\perp} = \mathcal{R}(A^T)
  
$$

  the optimality condition can be rewritten as

$$
  \nabla f_0 (x) \in \mathcal{R}(A^T)
  
$$


- Thus, there exists a $v \in \mathbb{R}^p$ such that
  
$$
  \nabla f_0 (x) + A^T v =0.
  
$$

  which is the optimality constraint with equality constraint. 



### Minimization over the nonnegative orthant


$$
\begin{aligned}
\min & \ \ \ f_0 (x) \\
\text{s.t.} & \ \ \ x\geq 0 
\end{aligned}
$$


- The general optimality condition is
  
$$
  \nabla f_0 (x)^T (y-x) \geq 0 \ \ \ \forall y \geq 0
  
$$


- Note that $\nabla f_0 (x)^T y $ is unbounded below on $y\geq 0$, unless $\nabla f_0 (x) \geq 0$.  $\rightarrow$ **think about it for a bit!**

- Thus, $\nabla f_0 (x) \geq 0$. 

- Now, consider $y=0$ for the optimality condition above. 
  
$$
  x\geq 0 , \ \ \ -\nabla f_0 (x) ^T x \geq 0
  
$$


- 

- We know that $\nabla f_0 (x) \geq 0$, and $x\geq 0$. Thus, above inequality can only hold when
  
$$
  \nabla f_0 (x)^T x =0
  
$$

  especially when

$$
  (\nabla f_0 (x))_i x_i =0 \ \ \ \forall i 
  
$$

  

## Linear Programming (LP)

### Definition

Objective and constraint functions are all **affine**.

$$
\begin{aligned}
\min & \ \ \ c^Tx +d \\
\text{s.t.} & \ \ \ Gx \leq h \\
& \ \ \ Ax = b
\end{aligned}
$$


### Geometric interpretation of LP

<center><img src="image-20210418184241659.png" alt="image-20210418184241659" style="zoom:50%;" /></center>

### Two forms of LP

- **Standard form of LP** : replace the inequality constraint with $x\geq 0$.


$$
\begin{aligned}
\min & \ \ \ c^Tx +d \\
\text{s.t.} & \ \ \ Ax=b \\
& \ \ \ x\geq 0
\end{aligned}
$$


- Inequality form of LP : there's no equality constraints. 


$$
\begin{aligned}
\min & \ \ \ c^Tx +d \\
\text{s.t.} & \ \ \ Ax \leq b
\end{aligned}
$$




### Converting LPs to Standard form

Recall: our general form LP was

$$
\begin{aligned}
\min & \ \ \ c^Tx +d \\
\text{s.t.} & \ \ \ Gx \leq h \\
& \ \ \ Ax = b
\end{aligned}
$$


1. Introduce slack variables $s_i$ for the inequalities
   
$$
   Gx+s = h\\s \geq 0 
   
$$


2. Express the variable $x$ as 
   
$$
   x = x^+ - x^-
   
$$

   where $x^+, x^- \geq 0 $

3. Now, we have a standrad form LP
   
$$
   \begin{aligned}
   \min & \ \ \ c^T x^+ - c^T x^-  +d \\
   \text{s.t.} & \ \ \ Gx^+ + Gx^- +s  =h \\
   & \ \ \ Ax^+ - Ax^- = b\\
   & \ \ \ s\geq 0 , \ x^+ \geq 0 , \ x^ - \geq 0 
   \end{aligned}
   
$$

   

### Minimizing convex piecewise-linear functions

Consider the problem of minimizing a piecewise-linear convex function

$$
f(x): = \max_{i = 1, \cdots, m} (a_i ^T x+ b_i )
$$

We can create this as an LP by transforming into a epigraphical form

$$
\begin{aligned}
\min & \ \ \ t \\
\text{s.t.} & \ \ \ a_i ^T x+ b_i \leq t \ \ \ i=1,\cdots, m\\
\end{aligned}
$$



## Quadratic Programming (QP)

### Definition

When the objective function is convex quadratic, and the constraints are affine. 

$$
\begin{aligned}
\min & \ \ \ \frac{1}{2}x^T Px + q^T x+ r\\
\text{s.t.} & \ \ \ Gx \leq h \\
& \ \ \ Ax=b
\end{aligned}
$$

where $P \in \mathbb{S}^n_+$ , $G \in \mathbb{R}^{m\times n}$, and $A\in \mathbb{R}^{p\times n}$. 



### Geometric Interpretation

<center><img src="image-20210418185732163.png" alt="image-20210418185732163" style="zoom:50%;" /></center>

### LP with Random Cost is QP

Let's consider a problem, similar to LP. 

$$
\begin{aligned}
\min & \ \ \ c^Tx \\
\text{s.t.} & \ \ \ Gx \leq h \\
& \ \ \ Ax = b
\end{aligned}
$$

But the difference is that, the cost vector $c$ is stochastic: 

$$
\mathbb{E}(c) = \bar{c}\\
\mathbb{E}[(c-\bar{c})(c-\bar{c})^T ] = \Sigma
$$

Note that 

$$
\mathbb{E}[ c^T x] = \bar{c}^T x\\ 
\text{var} [c^T x] = \mathbb{E} [ (c^T x - \bar{c}^T x)^2  ] = x^T \Sigma x
$$

A way to take the variance (risk) into account is to minimize

$$
\mathbb{E}[c^Tx] + \gamma \text{var} [ c^Tx] 
$$

instead of the stochastic $c^Tx$. 

Resulting problem is 

$$
\begin{aligned}
\min & \ \ \ \bar{c}^Tx + \gamma x^T \Sigma x \\
\text{s.t.} & \ \ \ Gx \leq h \\
& \ \ \ Ax = b
\end{aligned}
$$

which is a quadratic programming (QP).





## Quadratically constrained Quadratic Program (QCQP)


$$
\begin{aligned}
\min & \ \ \ \frac{1}{2}x^T P_0x + q_0^T x+ r_0\\
\text{s.t.} & \ \ \ \frac{1}{2}x^T P_ix + q_i^T x+ r_i \leq 0,\ \ i=1, \cdots, m \\
& \ \ \ Ax=b
\end{aligned}
$$


where $P_i \in \mathcal{S}^n _+$. 



## Second-Order Cone Programming (SOCP)


$$
\begin{aligned}
\min & \ \ \ f^T x\\
\text{s.t.} & \ \ \ \|A_i x + b_i \|_2 \leq c_i ^T x+ d_i,\ \ i=1, \cdots, m \\
& \ \ \ Fx=g
\end{aligned}
$$


### Robust Linear Programming


$$
\begin{aligned}
\min & \ \ \ c^T x\\
\text{s.t.} & \ \ \ a_i ^T x \leq b_i ,\ \ i=1, \cdots, m 
\end{aligned}
$$


- Suppose that the parameters $a_i$ are uncertain (lying in ellipsoid)
  
$$
  a_i \in \mathcal{E}_i := \{ \bar{a}_i + P_i u \ \vert \ \|u\|_2 \leq 1 \}
  
$$

  where $P_i \in \mathbb{R}^{n\times n}$. 

- Now, we have the following robust-linear program
  
$$
  \begin{aligned}
  \min & \ \ \ c^T x\\
  \text{s.t.} & \ \ \ a_i ^T x \leq b_i , \ \ \forall a_i \in \mathcal{E}_i , \ \ i=1, \cdots, m 
  \end{aligned}
  
$$


- Note that the inequality constraint $a_i ^T x \leq b_i , \ \ \forall a_i \in \mathcal{E}_i$ can be written as
  
$$
  \sup \{ a_i ^T x \ \vert \ a_i \in \mathcal{E}_i \} \leq b_i
  
$$

  and it can be re-written as

$$
  \sup \{ a_i ^T x \ \vert \ a_i \in \mathcal{E}_i \} = \bar{a}_i ^T x + \sup \{u^T P_i  x \ \vert \ \|u\|_2 \leq 1 \} = \bar{a}_i ^T x + \|P_i x \|_2 ^2
  
$$


- This implies that the robust LP is equivalent to SOCP
  
$$
  \begin{aligned}
  \min & \ \ \ c^T x\\
  \text{s.t.} & \ \ \ \bar{a}_i ^T x + \|P_i x \|_2 ^2 \leq b_i , \ \ \ i=1, \cdots, m
  \end{aligned}
  
$$

  

  



## References

- S. Boyd, L.Vandenberghe, Convex Opimization, Cambridge University Press, 2004. <http://stanford.edu/~boyd/cvxbook/>

- Optimization Theory and Applications, SNU EE 2021, Insoon Yang















































