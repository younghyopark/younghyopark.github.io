---
title: "[JAIR 2013] A Survey of Multi-Objective Sequential Decision-Making"
tags: Reinforcement-Learning Multi-Reward/Objective
permalink: "/notion_to_markdown/%5BJAIR%202013%5D%20A%20Survey%20of%20Multi-Objective%20Sequential%202596a1a7dc934dbc9ed305d644b17155/"
---

<br/>


<center><iframe width="560" height="315" src="https://www.youtube.com/embed/_zJ_cbg3TzY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>

## Introduction of MOMDP

- MOMDP is an MDP wichih the reward function

    $$\mathbf{R} : \mathcal{S\times A \times S} \rightarrow \mathbb{R}^n $$

    is a vector of $n$ rewards, one for each objective, instead of a scalar. 

- Value function $\mathbf{V}^\pi$ is also a vector where

    $$\mathbf{V}^\pi (s) = \mathbb{E}^\pi \bigg [ \sum_{k=0}^\infty \gamma^k \mathbf{r}_{t+k+1} \ | \ s_t = s \bigg ]$$

Unlike in an MDP, we can no longer determine which values are optimal without additional information about how to prioritize the objectives!

- ordering of the value function is complete for SOMDP

    $$V^\pi (s) > V^{\pi'} (s)$$

- only a partial ordering is possible for MOMDP

    $$\mathbf{V}_i ^\pi (s) > \mathbf{V}_i ^{\pi'}(s) \ \ \ \text{but} \ \ \ \mathbf{V}_j ^\pi (s) < \mathbf{V}_j ^{\pi'}(s)$$

## Fortuantely, MOMDP can always be converted to SOMDP

- Such a conversion is done by, specifying a scalarization function.

    $$V_\mathbf{w}^\pi (s) = f(\mathbf{V}^\pi (s), \mathbf{w})$$

- For example, $f$ may be a linear function → $\mathbf{w}$ quantifies the relative importance of the corresponding objective.

    $$V_\mathbf{w}^\pi  = \mathbf{w} \cdot \mathbf{V}^\pi$$

만약 이게 가능하다면, why specifically target the MOMDP problem? 

## Unfortuantely, the conversion is not always possible / desirable.

대중교통 시스템을 RL 로 결정한다고 해보자. 두 개의 objective 가 있음. 하나는 "Latency"이고, 다른 하나는 "Pollution costs"임.  

1. **Unknown weights scenario**
    - the weights $\mathbf{w}$ is unknown at the time of learning, or even at inference (planning).
    - it also includes the case where $\mathbf{w}$ fluctuates quite often, making the computation of new plan everytime the $\mathbf{w}$  changes burdensome.

        예를 들어 위 문제에서, pollution cost가 시시각각 변한다고 해보자. (실제로 온실가스 배출권거래제.. 때문에 pollution cost는 open market에 의해 시시각각 변한다고 함) → 그러면 weight $\mathbf{w}$는 그 값에 의해서 시시각각 변해야 할 것이고, SOMDP 로 문제를 풀려면 그 때마다 retraining을 해줘야 함. 

2. **Decision support scenario**
    - scalarization is in fact infeasible!

        one might say that : "Latency" cannot be converted to a scalar accurately → "economists cannot accurately compute the cost of lost productivity due to commuting" → there's a scaling issue as well  →  **thus, specifying $\mathbf{w}$ is feckless.** 

    - Humans' arbitrary decision should be made.
3. **Known weights scenario**
    - weight도 알고 있는데 뭐가 문제냐고?
    - If $f$ is nonlinear, then the resulting single-obejctive MDP may noat have additive returns, or even become stochastic.  ⇒ The resulting SOMDP can be difficult to solve.

## Important definitions and terminologies

In the planning or learning phase where $\mathbf{w}$ is unavailable, the planning or learning algorithm must return a set of policies, not a single policy.   → These policies should be an optimal policy for each $\mathbf{w}$. To that end, we define

1. **Undominated policies** for MOMDP $m$

    $$U(\Pi^m ) = \{\pi : \pi \in \Pi ^m  \ | \ V_\mathbf{w}^\pi \geq V_\mathbf{w}^{\pi'}, \ \ \forall \pi ' \in \Pi ^m,\  \exists \mathbf{w} \}$$

    However, this undominated policies contain redundant policies (some of those are **not the only optimal policy** for $\mathbf{w}$)  → such policies can be removed!

    적어도 하나의 $\mathbf{w}$ 에 대해서는 optimal policy 가 되는 policy들을 모두 모아놓은 집합.
    → 그런데 given $\mathbf{w}$ 에 대해서 $U(\Pi^m )$  안에 오직 하나의 optimal policy가 있지는 않을 것임.  
    → 어떤 $\mathbf{w}$가 들어왔을 때, 그에 해당하는 optimal policy **하나를** 딱 뽑아낼 수 있는 set이 필요!

2. **Coverage Set** (CS) for MOMDP $m$  ← **set we are interested in!**

    $$\begin{aligned} CS(\Pi^m ) & \subseteq U(\Pi^m )\\ \pi \in CS(\Pi^m ) & \ \ \forall \mathbf{w}, \exists \pi \text{ s.t.}  V_\mathbf{w}^\pi \geq V_{\mathbf{w}}^{\pi'} \end{aligned}$$

    undominated policies의 subset임과 동시에,
    모든 $\mathbf{w}$에 대한 optimal policy가 모두 담겨 있는 set 임. 

    Shimon Whiteson calls the process of going to **U → CS** (the fundamental of MOMDP), a **pruning process** : *"even if we don't know the weights a-priori, we are already eliminating the policies that we know that we aren't going to use"*

    - **Checkout the example if you're unclear about the difference between U vs CS**

        ![Untitled.png](Untitled.png)

3. **Convex Hull** (CH) for MOMDP $m$   → **undominated policy for linear scalarization function**

    $$CH(\Pi^m ) = \{\pi : \pi \in \Pi^m \ | \ \mathbf{w} \cdot \mathbf{V}^\pi \geq \mathbf{w} \cdot \mathbf{V}^{\pi'}, \ \ \forall \pi' \in \Pi^m , \ \ \exists \mathbf{w} \}$$

4. **Convex Coverage Set** (CCS) for MOMDP $m$  → **coverage set for linear scalarization function**

    $$\begin{aligned} CCS(\Pi^m ) & \subseteq CH(\Pi^m )\\ \pi \in CCS(\Pi^m ) & \ \ \forall \mathbf{w}, \exists \pi \text{ s.t.} \  \mathbf{w}\cdot \mathbf{V}^\pi \geq {\mathbf{w}}\cdot \mathbf{V}^{\pi'} \end{aligned}$$

## Important Visualizations

![Untitled%201.png](Untitled%201.png)

- we have two objectives $V_0$ and $V_1$
- left side graph tells exactly where our multi objective vector is, in this case, in $\mathbb{R}^2$

- right side graph, shows the 'scalarized version' → for this case, it's a linear function
- **each line in "Weight space"** corresponds to the **point in "Objective space"**

 → So what's the coverage set? 

Upper surface in the weight space!

*  for $0 \leq w_1 \leq 0.4$    →  policy corresponding to point 1  is the optimal policy
*  for $0.4 \leq w_1 \leq 0.8$   →  policy correspondnig to point 2 is the optimal policy
*  for $0.8 \leq w_1 \leq 1$   →  policy corresponding to point 3 is the optimal policy

여기서 파란색 line/point는 undominated policy set (convex hull) 에는 들어있지만 coverage set (convex coverage set) 안에는 들어있지 않음. 왜냐? upper surface를 define하는데 파란색 line은 필요가 없거든. 

$$\mathbf{V} = [\mathbf{V}_0 , \mathbf{V}_1 ]$$

$$V_{\mathbf{w}} = \mathbf{w}_0 \mathbf{V}_0 + \mathbf{w}_1 \mathbf{V}_1, \ \ \ \ \mathbf{w}_0 + \mathbf{w}_1 = 1$$