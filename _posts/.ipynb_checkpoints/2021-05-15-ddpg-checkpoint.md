---
title: "[RL Papers] Deep Deterministic Policy Gradient"
tags: Reinforcement-Learning 
published: true
comment: true
---

## Policy Evaluatio

### Recall

- our policy gradient (REINFORCE) algorithm requires a gradient of 

  $$
  J(\theta):= \mathbb{E}_{\tau \sim p_\theta(\tau)}\Big [ \sum_t r(s_t, a_t) \Big ]
  $$
  
  which can be calculated in a form of expectation:
  
  $$
  \nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim p_\theta (\tau)}\bigg [ \Big (\sum_{t=0}^T \nabla_\theta \log \pi_\theta (a_t |s_t) \Big ) \Big (\sum_{t=0}^T r(s_t, a_t) \Big ) \bigg ]
  $$
  
- We can also estimate above gradient in a data-driven approach:

  - sample $N$ episodes of state-action transition based on current policy $\pi_\theta(a_t \vert s_t )$

  - Estimate the gradient by

    $$
    \nabla_\theta J(\theta) \approx \frac{1}{N} \sum_{i=1}^N \bigg [ \Big (\sum_{t=0}^T \nabla_\theta \log \pi_\theta (a_t^i |s_t^i ) \Big ) \Big (\sum_{t=0}^T r(s_t^i, a_t^i ) \Big) \bigg ]
    $$
    
  - Meanwhile, because of **causality**: policy at time $t'$ cannot affect reward at time $t<t'$, we can rewrite the equation above

    $$
    \begin{aligned}
    \nabla_\theta J(\theta) & \approx \frac{1}{N} \sum_{i=1}^N \bigg [ \Big (\sum_{t=0}^T \nabla_\theta \log \pi_\theta (a_t^i |s_t^i ) \Big ) \Big (\sum_{t=0}^T r(s_t^i, a_t^i ) \Big) \bigg ]\\
    & \approx \frac{1}{N} \sum_{i=1}^N \bigg [ \Big (\sum_{t=0}^T \nabla_\theta \log \pi_\theta (a_t^i |s_t^i ) \Big )\sum_{t'=t}^T r(s_{t'}^i, a_{t'}^i )  \bigg ]\\
    & = \frac{1}{N} \sum_{i=1}^N \bigg [ \Big (\sum_{t=0}^T \nabla_\theta \log \pi_\theta (a_t^i |s_t^i ) \Big )Q(s_{t'}^i, a_{t'}^i )  \bigg ]
    \end{aligned}
    $$

- Unfortunately, above gradient estimation can be extremely noisy: to reduce the variance, we introduced a technique called **basline**, 

  $$
  \nabla_\theta J(\theta) \approx \frac{1}{N} \sum_{i=1}^N \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t^i |s_t^i ) \Big [ Q^{\pi_\theta}(s_t^i, a_t^i ) - b\Big ]
  $$

  while a good choise of baseline is $b= v^{\pi_\theta}(s_t, a_t)$ which leads to
  
  $$
  \begin{aligned}
  \nabla_\theta J(\theta) & \approx \frac{1}{N} \sum_{i=1}^N \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t^i |s_t^i ) \Big [ Q^{\pi_\theta}(s_t^i, a_t^i ) - v^{\pi_\theta}(s_t^i, a_t^i)\Big ]\\
  & \approx \frac{1}{N} \sum_{i=1}^N \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t^i |s_t^i ) \Big [ A^{\pi_\theta}(s_t^i, a_t^i) \Big ]
  \end{aligned}
  $$

where $A$ is called an **advantage function** (always has negative value)

Now, our task is to better evaluate the policy: calculate $v^{\pi_\theta}$, or $Q^{\pi_\theta}$.
{:.info}

### Monte Carlo

One naive way to evaluate such policy might be the **Monte Carlo** method.
$$
v^\pi(s_t) \approx \frac{1}{N} \sum_{i=1}^N \sum_{t'=t}^T r_{t'}^i
$$

### Function Approximation

Otherwise, we might want to fit the value function by

$$
v^\pi(s_t) \approx v_{\phi}^\pi (s_t)
$$
where $\phi$ is the parameter vector for this value approximation function. To find the optimal $\phi$, we might consider a supervised learning with some training data with labels.

$$
\text{training data} = \{(s^i, y^i)\}
$$

Thus, our immediate task is to find out the labels $y^i$. Recall, that one naive way of doing so is the **Monte Carlo** method, 

$$
y^i = \sum_{t'=t}^T r_{t'}^i
$$

or we might use the previous fitted value function 

$$
y_i = r(s_t^i, a_t^i) + v_{\phi}^\pi (s_{t+1}^i).
$$

If we have all the labels, next step is simple: just a simple regression.

$$
\min_\phi \mathcal{L}(\phi) = \frac{1}{2} \sum_i \|v_\phi^\pi(s_i) - y_i \|^2
$$




## Actor-Critic Algorithm

### Algorithm

1. sample $$\{(s_t^i, a_t^i, s_{t+1}^i, r_t^i)\}$$ using $\pi_\theta(a\vert s)$.

2. Fit $v_\phi^\pi(s)$ by solving the regression problem

   $$
   \min_\phi \mathcal{L}(\phi) = \frac{1}{2} \sum_i \|v_\phi^\pi(s_i) - y_i \|^2
   $$
   
   choose an appropriate method to estimate $y_i$. 
   
3. Evaluate the advantage

   $$
   A^\pi (s_t^i, a_t^i) = Q^\pi (s_t^i, a_t^i) - v^\pi(s_t^i ) = r_t^i + v_\phi^\pi (s_{t+1}^i) - v_\phi^\pi(s_t^i)
   $$
   
4. Estimate the gradient
5. Gradient ascent

If we anaylze this algorithm, we can see that it's quite similar to the policy iteration algorithm. **Actor Critic is a data-driven version of PI.** Step 2-3 is the part where we evalulate current policy, and step 4-5 is the part where we aim to improve(update) the policy. 
{:.info}

### Intuition behind the algorithm

<center><img src="https://live.staticflickr.com/65535/51148681930_40f06580fe_o.png" alt="image-20210430125806266" style="zoom:50%;" /></center>

### Actor-critic algorithm with discount factor

Simple, just take the discounting factor into account when

1. estimating $y_i$ via monte Carlo or TD(0)

2. Evaluate the advantage by 

   $$
   A^\pi (s_t^i, a_t^i) = Q^\pi (s_t^i, a_t^i) - v^\pi(s_t^i ) = r_t^i + {\color{red}{\gamma} }v_\phi^\pi (s_{t+1}^i) - v_\phi^\pi(s_t^i)
   $$

### Disadvantages

The biggest disadvantage of this actor-critic algorithm is that it is an **on-policy** algorithm. This can be extremely inefficient!



## Off-policy Actor-Critic

### What if we don't have samples from $\pi_\theta(\tau)$?

Recall, that we are trying to find

$$
\theta^\star = \arg \max_\theta J(\theta)= \arg \max_\theta \mathbb{E}_{\tau \sim p_\theta(\tau)} [r(\tau)]
$$

What if we don't have samples from $p_\theta(\tau)$, which is a distribution defined by current policy $\pi_\theta(\tau)$? Let's assume, fortuantely, we have samples from some $\bar{\pi}(\tau)$ instead.  Then, 

$$
J(\theta) = \mathbb{E}_{\tau \sim \bar{p}(\tau)}\bigg [ \frac{p_\theta(\tau)}{\bar{p}(\tau)} r(\tau)\bigg ]
\label{s}
$$

which is driven by the **importance sampling** technique:

$$
\begin{aligned}
\mathbb{E}_{x\sim p(x)} [f(x)] & = \int p(x)f(x)dx\\
& = \int \frac{q(x)}{q(x)}p(x)f(x)dx\\
& = \int q(x) \frac{p(x)}{	q(x)}f(x) dx\\
& = \mathbb{E}_{x\sim q(x)} \bigg [ \frac{p(x)}{q(x)}f(x)d x \bigg ] 
\end{aligned}
$$

Note that 

$$
\begin{aligned}
& p_\theta(\tau) = p(s_0) \prod_{t=0}^T \pi_\theta(a_t | s_t) p(s_{t+1}|s_t, a_t)\\
& \bar{p}(\tau) = p(s_0) \prod_{t=0}^T \bar{\pi}(a_t |s_t) p(s_{t+1}|s_t, a_t)
\end{aligned}
$$

Thus, equation $\ref{s}$ can be rewritten as 

$$
J(\theta) = \mathbb{E}_{\tau \sim \bar{p}(\tau)}\bigg [ \frac{\prod_{t=0}^T \pi_\theta(a_t | s_t)}{\prod_{t=0}^T \bar{\pi}(a_t|s_t)}r(\tau) \bigg ]
$$

while its gradient can be approximated by

$$
\nabla_\theta J(\theta) \approx \mathbb{E}_{\tau \sim \bar{p}(\tau)}\bigg [ \frac{\pi_\theta(a|s)}{\bar{\pi}(a|s)}\nabla_\theta \log \pi_\theta(a|s) r(\tau) \bigg ]
$$
