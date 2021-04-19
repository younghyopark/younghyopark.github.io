---
title: "[Optimization] 6 - Lagrange Duality, Slater's Condition"
tags: Optimization Lecture-Note
permalink: "/notion_to_markdown/opt-lecture-6/"
---

## Lagrangian

Consider an optimization problem 

$$
\begin{aligned} \min & \ \ \ f_0 (x) \\ \text{s.t} & \ \ \ f_i (x) \leq 0, \ \ \  i= 1, \cdots, m \\ & \ \ \ h_i (x) =0, \ \ \ i=1, \cdots, p \end{aligned}
$$

Now, take the constraint into account by **augmenting the objective function with a weighted sum of the constraint functions**. 

Lagrangian $L: \mathbb{R}^n \times \mathbb{R}^m \times \mathbb{R}^p \rightarrow \mathbb{R}$ defined by

$$
L(x,\lambda, \nu) := f_0 (x) + \sum_{i=1}^n \lambda_i f_i (x) + \sum_{i=1}^p \nu_i h_i (x)
$$

where $\lambda_i$ is the Lagrange multiplier associated with the inequality constraints, and $\nu_i$ is the Lagrange multipler associated with equality constraints. We call $\lambda, \nu$ as **dual variables** or Lagrange multiplier vectors. 



## Lagrange Dual

Define Lagrange dual function $g: \mathbb{R}^m \times \mathbb{R}^n \rightarrow \mathbb{R}$

$$
g(\lambda, \nu) := \inf_{x\in \mathbb{R}^n } L(x,\lambda, \nu) = \inf_{x\in \mathbb{R}^n } \bigg [ f_0 (x) + \sum_{i=1}^n \lambda_i f_i (x) + \sum_{i=1}^p \nu_i h_i (x) \bigg ]
$$

Note that this dual function is **concave** in $(\lambda, \nu)$, even when the original problem is non-convex. 

**[proof]** Lagrangian is affine in $(\lambda, \nu)$. Thus, $g(\lambda, \nu)$ can be construed as a pointwise infimum of affine function. 

### Lagrange Dual Lower bounds the Optimal Value

**[Proposition]** For any $\lambda \geq 0$ and any $\nu$, 

$$
g(\lambda, \nu) \leq p^\star
$$

**[proof]** Fix an arbitrary feasible $\tilde{x}$. Then, 

$$
f_i (\tilde{x}) \leq 0 \\
h_i (\tilde{x}) =0
$$

Now, fix an arbitrary $\lambda \geq 0 $ and $\nu$. We have

$$
\sum \lambda_i f_i (\tilde{x})  + \sum \nu_i h_i (\tilde{x}) \leq 0
$$

Thus, 

$$
L(\tilde{x}, \lambda, \nu) = f_o (\tilde{x}) +\sum \lambda_i f_i (\tilde{x})  + \sum \nu_i h_i (\tilde{x}) \leq f_o(\tilde{x}) \leq p^\star 
$$
for all feasibe $\tilde{x}$.

### Lagrange Dual Problem

$$
\begin{aligned}
\max & \ \ \ g(\lambda,\nu)\\
\text{s.t.} & \ \ \ \lambda \geq 0 
\end{aligned}
$$

We have to maximize the Lagrange Dual (to at least get closer to the original optimal value $p^\star$).  

- A pair $(\lambda, \nu)$ is called **dual-feasible** if
  
  $$
  \lambda \geq 0 , \ \ \ g(\lambda, \nu) >-\infty
  $$
  
- This dual problem is always a convex optimization problem, even when the original problem is non-convex. (Recall that $g(\lambda, \nu)$ was concave function)



### [Ex] Dual of standard form LP

$$
\begin{aligned}
\min & \ \ \ c^Tx \\
\text{s.t.} & \ \ \ Ax=b \\
& \ \ \ x\geq 0
\end{aligned}
$$

**[solution]** First get the Lagrangian

$$
\begin{aligned}
L(x,\lambda, \nu) &= c^T x+ \nu^T (Ax-b) + \lambda ^T (-x)\\
& = (c+A^T \nu -\lambda)^T x -\nu^T b
\end{aligned}
$$

Now, minimize the Lagrangian with respect to $x$. 

$$
g(\lambda, \nu) = \inf_x L(x,\lambda, \nu) = 
\begin{cases} 
-\nu^Tb & \ \ \ \text{if } c+A^T \nu - \lambda =0\\
-\infty & \ \ \ \text{otherwise}
\end{cases}
$$

Thus, the dual problem is

$$
\begin{aligned}
\max & \ \ \ -\nu^T b \\
\text{s.t.} & \ \ \ c+ A^T \nu - \lambda =0 \\
& \ \ \ \lambda \geq 0
\end{aligned}
$$



### [Ex] Dual of inequality form LP

Same procedure, we get

$$
\begin{aligned}
\max & \ \ \ -b^T \lambda \\
\text{s.t.} & \ \ \ c+ A^T \lambda  =0 \\
& \ \ \ \lambda \geq 0
\end{aligned}
$$







## Interpreting the Lagrangian Dual

### Linear Approximation

We can rewrite the original problem (1) as

$$
\min \ \ f_0 (x) + \sum_{i=1}^n I_- (f_i (x))  + \sum_{i=1}^p  I_0 (h_i (x))
$$

where $I_- : \mathbb{R} \rightarrow \mathbb{R}$ is a penalty function for positive reals (blue line in below figure)

$$
I_- (u) := \begin{cases}
0 & \ \ \ \text{if } u \leq 0 \\
+\infty & \ \ \ \text {if } u>0
\end{cases}
$$

Similarly, $I_0 : \mathbb{R} \rightarrow \mathbb{R}$ is a penalty function for nonzero values. 

$$
I_0 (u) := \begin{cases}
0 & \ \ \ \text{if } u = 0 \\
+\infty & \ \ \ \text {if } u\not =0
\end{cases}
$$

Now, let's relax the function a bit. 

<center><img src="image-20210418201908558.png" alt="image-20210418201908558" style="zoom:50%;" /></center>

<center><img src="image-20210418202115363.png" alt="image-20210418202115363" style="zoom:50%;" /></center>

Replace $I_-(u)$ with the linear function $\lambda_i u$ where $\lambda_i \geq 0$, and function $I_0 (u)$ with $\nu_i u$. We then have a Lagrangian. 

Thus, the linear penalty function introduced here is the **underestimator** of the original penalty function. Thus, it seems quite obvious that dual function has to yield a lower bound on the optimal value of the primal problem. 




### Geometric Interpretation

Consider the following set of values

$$
\mathcal{G}:= \{ (f_1(x), \cdots, f_m(x), h_1(x), \cdots, h_p(x), f_0 (x)) \}\in \mathbb{R}^m \times \mathbb{R}^p \times \mathbb{R}
$$

Now, the optimal value of the primal problem can be expressed as

$$
p^\star = \inf \{ p \ \vert \ (u,v,t) \in \mathcal{G}, \ u\leq 0 , v=0\}
$$

Meanwhile, the dual function can be expressed as 


$$
g(\lambda, \nu) = \inf \{ (\lambda, \nu, 1)^T (u,v,t) \ \vert \ (u,v,t) \in \mathcal{G}\}
$$

Suppose $\lambda \geq 0$. Then, if $u\leq 0$ and $v=0$, 


$$
t \geq (\lambda , \nu, 1)^T (u,v,t)
$$

Therfore, 


$$
\begin{aligned}
p^\star &= \inf \ \{ t \ \vert \ (u,v,t) \in \mathcal{G}, u\leq 0, v=0\}\\
& \geq \inf \ \{ (\lambda , \nu, 1)^T (u,v,t) \ \vert \ (u,v,t) \in \mathcal{G}, u\leq 0, v=0\}\\
& \geq \inf \ \{ (\lambda , \nu, 1)^T (u,v,t) \ \vert \ (u,v,t) \in \mathcal{G}\} = g(\lambda, \nu) \\
\end{aligned}
$$

<center><img src="image-20210418203400472.png" alt="image-20210418203400472" style="zoom:50%;" /></center>

<center><img src="image-20210418203616032.png" alt="image-20210418203616032" style="zoom:35%;" /></center>

## Strong Duality

### Weak Duality

- $p^\star$ = optimal value of the primal problem
- $d^\star$ = optimal value of the dual problem

Then, "weak duality" holds, regardless of the convexity of the primal problem. 

$$
d^\star \leq p^\star
$$

and $p^\star - d^\star$ is called the **duality gap**.

### Strong Duality

We say strong duality holds if

$$
p^\star = d^\star
$$

**Note that strong duality generally does not hold**. However, under certain condition, strong duality holds. 

### Slater's condition

* * *

**[Theorem]** Strong duality holds for a convex optimization problem if Slater's condition holds. Slater's condition means that, there exists $x$ such that 
$$
f_i (x) <0 , \ \ \ i=1, \cdots, m, \ \ \ Ax= b
$$
(In other words, slater's condition states that the point should satisfy the inequality condition **strictly**.)

However, if some of its inequality constraint is **affine**, such inequality constraints does not have to hold strictly. If $f_1, \cdots, f_k$ are affine, then strong duality holds if there exists $x$ such that

$$
f_i (x) \leq 0, \ \ \ i=1, \cdots, k, \ \ f_i (x) <0 , \ \ i= k+1, \cdots, m, \ \ Ax=b
$$

* * *

- We can see that, for LP, **slater's condition** is achieved when $x$ is feasible. 



## Proving the Slater's Theorem

### Let's Prove...

Consider the convex optimization problem

$$
\begin{aligned} \min & \ \ \ f_0 (x) \\ \text{s.t} & \ \ \ f_i (x) \leq 0, \ \ \  i= 1, \cdots, m \\ & \ \ \ Ax=b \end{aligned}
$$

where $\tilde{x}$ satisfies the Slater's condition. In other words, 

$$
f_i (\tilde{x}) <0, \ \ i=1,\cdots, m, \ \text{and } A\tilde{x}=b
$$

To simplify the proof, assume the primal optimal value $p^\star$ is finite, and $\text{rank }A = p$. 

Let's first define two sets $\mathcal{A, B}$. 

$$
\mathcal{A}:= \{(u,v,t) \ \vert \ \exists x \in \mathcal{D} \text{ s.t.} f_i (x)\leq u_i, h_i (x) =v_i , f_0 (x)\leq t\}\\
\mathcal{B} := \{(0,0,s) \in \mathbb{R}^m \times \mathbb{R}^p \times \mathbb{R} \ \vert \ s<p^\star \}
$$




### Separating Hyperplane Theorem

**[Theorem]** Suppose $C$ and $D$ are nonempty disjoint convex sets. Then there exist $a\not =0$ and $b$ such that
$$
a^Tx \leq b \ \ \ \forall x \in C\\
a^Tx \geq b \ \ \ \forall x \in D
$$


<center><img src="image-20210418205855515.png" alt="image-20210418205855515" style="zoom:50%;" /></center>

We call that a **separating hyperplane** for $C$ and $D$. 



### Step1 : Claim $\mathcal{A}\cap \mathcal{B} =\varnothing$ 

Suppose $\exists (u,v,t) \in \mathcal{A \cap B}$ . Since $(u,v,t)\in \mathcal{B}$, we have

$$
u=0, \ \ v=0,\ \ t<p^\star
$$

Meanwhile, since $(u,v,t) \in \mathcal{A}$, there exists $x$ such that

$$
f_i (x) \leq u =0, \ \ h_i (x)=v=0 , \ \ \ f_0 (x) \leq t <p^\star
$$

This is contradictory, since we assumed that $p^\star$ is the optimal value of the primal problem. 



### Step 2 : Use the Separting Hyperplane Theorem

By the separating hyperplane theorem, there exists $(\tilde{\lambda}, \tilde{\nu}, \mu)\not =0$ and $\alpha$ such that

$$
\tilde{\lambda}^T u + \tilde{\nu}v + \mu t \geq \alpha  \ \ \ \forall (u,v,t) \in \mathcal{A}\\
\tilde{\lambda}^T u + \tilde{\nu}v + \mu t \leq \alpha  \ \ \ \forall (u,v,t) \in \mathcal{B}\\
$$

- Note that, for $(u,v,t)\in \mathcal{A}$,  $u$ and $t$ is unbounded upwards. Thus, to make the first condition feasible, we can deduce that $\tilde{\lambda} \geq 0$ and $\mu \geq 0$. (otherwise, $\tilde{\lambda}^T u + \mu t$ will be unbounded below)

- Also, the second condition implies that 
	
  $$
  \mu t \leq \alpha \ \ \ \forall t <p^\star
  $$
  
  which also implies
  
  $$
  \mu p^\star \leq \alpha
  $$
  
- Combining with the first condition for $u_i = f_i (x), v_i = h_i (x) = Ax-b, t= f_0 (x)$
	
	$$
	\sum_{i=1}^n \tilde{\lambda}_i f_i (x) + \tilde{\nu}^T(Ax-b)+ \mu f_0 (x) \geq \alpha \geq \mu p^\star \label{28}
	$$
  
  



### Step 3 : Suppose that $\mu>0$

Divide equation ($\ref{28}$) with $\mu$. Then, we obtain

$$
L(x,\tilde{\lambda}/\mu, \tilde{\nu}/\mu) \geq p^\star
$$

Minimizing the Lagrangian over $x$, we have

$$
g(\lambda, \nu)\geq p^\star
$$

Meanwhile, the weak-duality still holds. 

$$
g(\lambda, \nu) \leq p^\star
$$

Thus, 

$$
g(\lambda, \nu) = p^\star
$$

the strong duality holds. 



### Step 4 : What if $\mu=0$?

Now, assume $\mu =0$. We then have

$$
\sum_{i=1}^n \tilde{\lambda}_i f_i (x) + \tilde{\nu}^T(Ax-b) \geq \alpha \geq \mu p^\star =0
$$

Applying this to $\tilde{x}$ that satisfies the Slater's condition, ($A\tilde{x}-b =0$ and $f_i (\tilde{x}) < 0$)

$$
\sum_{i=1}^n \tilde{\lambda}_i f_i (\tilde{x}) \geq 0
$$

Since $f_i (\tilde{x}) <0$ and $\tilde{\lambda}_i \geq 0$, above inequality can only hold when

$$
\tilde{\lambda}=0
$$

Since the separating hyperplane requires $(\tilde{\lambda}, \tilde{\nu},\mu)$ to be nonzero, the remaining nonzero item $\tilde{\nu}\not=0$.

Then, equation (29) can be rewritten as

$$
\tilde{\nu}^T(Ax-b)\geq 0 \ \ \ \forall x
$$

while for $\tilde{x}$, 

$$
\tilde{\nu}^T (A\tilde{x}-b)=0
$$

However, since $A^T \tilde{\nu} \not =0$, there is always an $x$ that satisfies

$$
\tilde{\nu}^T (Ax-b) <0
$$

This is a contradiction! Thus, $\mu >0$. 



### Geometric Idea behind the Proof

<center><img src="image-20210418213553709.png" alt="image-20210418213553709" style="zoom:50%;" /></center>

## References

- S. Boyd, L.Vandenberghe, Convex Opimization, Cambridge University Press, 2004. <http://stanford.edu/~boyd/cvxbook/>

- Optimization Theory and Applications, SNU EE 2021, Insoon Yang