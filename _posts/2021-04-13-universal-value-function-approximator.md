---
title: "[ICML 2015] Universal Value Function Approximators"
tags: Reinforcement-Learning Multi-Reward/Objective
permalink: "/notion_to_markdown/%5BICML%202015%5D%20Universal%20Value%20Function%20Approximators%207120334d6860455c801cd9284c92970b/"
---


## Introduction

### Extending the purpose of value function

- General value function $V_g(s)$ represent the utility of any state $s$ in **achieving a given goal $g$**, represented by a pseudo-reward function.
- A collection of general value functions is powerful, and can be used in many ways.
    1. Horde architecture → consist of discrete set of value functions, while all of it is learned simultaneously from a single stream of experience. 
    2. Each value function may also be used to generate a policy or option that leas to a goal state
    3. collection of value functions can be used as a predictive representatino of state (predicted values themselves are used as a feature vector)

### Extending the idea of Value function approximator

- authors extend the idea of value function approximation to both states $s$ and goal $g$

    $$V(s,g;\theta)$$

- By universal, authors mean that the value function can generalise to any goal $g$ in a set $\mathcal{G}$ of possible goals
- Learning UVFA can be difficult! Why?

    agent will only see a small subset of possible combinations of states and goals $(s,g)$

## Background

- define a pseudo-reward function $R_g (s,a,s')$
- define a pseudo-discount function $\gamma_g(s)$ , $\gamma_g (s)=0$ iff $s$ is the goal.
- Define a general value function

    $$V_{g,\pi }(s) := \mathbb{E} \bigg [ \sum_{t=0}^\infty R_g (s_{t+1}, a_t, s_t ) \prod_{k=0}^t \gamma_g (s_k) \bigg | \ s_0  =s \bigg ]$$

    goal 에 다다르면 더 이상 reward function이 더해지지 않는 구조임

- Define a general action-value (q) function

    $$Q_{g, \pi} (s,a) := \mathbb{E}_{s'} [R_g (s,a,s') + \gamma_ g(s') V_{g,\pi} (s') ]$$

- optimal policy for a given goal

    $$\pi_g^\star(s) := \argmax _a Q_{\pi, g} (s,a)$$

## Universal Value Function Approximators (UVFA)

- Consider function approximators

    $$\begin{aligned}V(s,g;\theta) &\approx V_g ^\star (s)\\ Q(s,a,g;\theta)& \approx Q_g^\star(s,a) \end{aligned}$$

- How should we design the function? There are two ways

    <center><img src="Untitled%201.png" width="400"></center>

    1. simply concatenate s and g
    2. two-stream architecture, mapping each state and goal to $\R^n$  → $h$ maps $\R^n \times \R^n \rightarrow \R$
        - knowing that goals and states often share the same structure, one might share features between $\phi$  and $\psi$. (maybe the first layers?)
        - UVFA can be symmetric

            $$V_g^\star (s) = V_s ^\star (g)$$

            → this can be achieved by sharing the same network $\phi = \psi$.

### Two different ways to train UVFA

At this section, authors focus on "supervised training", where the values $V_g ^\star(s)$ are all given as a table. 

1. End-to-End Learning
    - using gradient descent, minimize

        $$\mathbb{E} \Big [ (V_g^\star (s) - V(s,g;\theta) )^2 \Big ]$$

2. Two-stage training procedure

    **This can be only applied to two-stream architecture!**

    - First, using matrix-factorization of $V_g (s)$, extract embedding vectors $\hat \phi(s)$ and $\hat \psi (g)$.

        <center><img src="Untitled%202.png" width="100"></center>

    - Second, Learn the parameters of $\phi$ and $\psi$ seperately.

        <center><img src="Untitled%203.png" width="100"></center>

### It turns out...

**Two-stream architecture, with two-stage learning procedure, with relatively small embedding dimension** $n$  is better. 

### UVFA training in RL Experiments

<center><img src="Untitled%204.png" width="400"></center>

## Results?

<center><img src="Untitled%205.png" width="400"></center>

- perform just the same as Horde architecture