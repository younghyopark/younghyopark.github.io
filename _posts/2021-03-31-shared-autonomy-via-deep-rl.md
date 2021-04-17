---
title: "[arXiv 2018] Shared Autonomy via Deep Reinforcement Learning"
tags: Reinforcement-Learning Shared-Autonomy
permalink: "/notion_to_markdown/%5BPaper%20Review%5D%20Shared%20Autonomy%20via%20Deep%20Reinforcem%20abb251ed95e24e3186ed46bd449bf6ce/"
---

## Introduction

### Imagine a situation of landing a quadrotor safely...

- Humans suffer mostly because... **controlling many degrees of freedom is hard!**
→ but knows what a "safe landing" is.
- Robots suffer mostly because... **they don't know the concept of good landing!**  
*??? : By the way, can't I just stop spinning the rotors? I can make this land anyway.*
→ but they do not struggle with high degrees of freedom

Shared autonomy can be the solution in this case... 
**"by combining the user input with automated assistance"**

### What's different with the Hindsight-optimization paper?

- "We focus on an area of shared autoonomy in which information about the user's intent is hidden from the robot...."

    그럼 hindsight optimization 에서는 안 그랬나?
    "...in which prior work has proposed approaches that infer the user's goal from their input and autonomously act to achieve it."

- However, t**hese approahces tend to assume that**
    1. we know the dynamics model fo the world
    2. we know how to represent our goal
    3. we know the policy to achieve that goal
- **However, above assumptions may be too much of a constraint considering that**
    1. Fitting an accurate global dynamics model can be more difficult than learning to perform the task
    2. assuming a fixed representation of the user's goal reduces the flexibility of the system to perform tasks in which the user's desires are difficult to specify but easy to evaluate
    3. user input can exhibit systematic suboptimality that prevents standard goal inference algorithms from recovering user intent by inverting a geneartive model of behavior. 

### From each perspective..

- From the agent's perspective → the user acts like a prior policy that can be fine-tuned + additional sensor generating observations from which the agent can implicitly decode the user's private information
- From the user's perspective → the agent behvaes like an adaptive interface that learns a personalized mapping from user commands to actions that maximizes task reward.

### To achieve their goal..

- use human-in-loop deep Q-learning to learn an approximate state-action value function that computes the expected future return of an action given the current environmental observation

## Model-free shared autonomy

### Problem statement

Authors relax the standard formulation of shared autonomy defined by POMDP in [[Paper Review] Shared Autonomy via Hindsight Optimization](https://www.notion.so/Paper-Review-Shared-Autonomy-via-Hindsight-Optimization-e7d311f0436f496dbc50a97ed6b29594)  

In their problem formulation, the transition $T$, the user's policy $\pi_h$, and the goal space $\mathcal{G}$ are no longer all necessarily known to the robot. 

그치, hindsight optimization 페이퍼에서는 POMDP를 사용하기 위해서 이것들을 다 알아야 했었지. user's policy $\pi_h$의 경우 MaxEnt IOC로 알아내려고 했었고. 

The reward function, which still depends on the user's private information, is decomposed as:

$$R(s,a,s') =R_{general}(s,a,s')+ R_{feedback}(s,a,s')$$

여기서 $R_{general}$이란 거는 reward that are known (e.g. such as the need to avoid collisions)

$R_{feedback}$ is a user-generated feedback that depends on their private information. (do not know)

In practice, the user might simply indicate once per trail whether the robot succeeded or not. 

### Three types of setting

1. known-user-policy : **unknown** dynamics, **known** goal space and user policy
2. known-goal-space : **unknown** dynamics, user policy, and **known** goal space
3. min assumptions : **unknown** dynamics, user policy, goal space ← most focused

### Method overview

- input  =  observations of the environment and the user's controls or inferred goal
- output =  high value action / control output that is as close as possible to the user's control

→ how the agent combines user input with environmental observations? 

### Incorporating user control

- incorporate information from the user as useful observations for the agent
- jointly embeds the agent's observation of the environement $s_t$ with the information from the user $u_t$ by simply concatenating

    $$\tilde s_t = \begin{bmatrix} s_t \\ u_t\end{bmatrix}$$

- for min-assumption case...
    - the policy directly takes in the user's actions $a_t ^h$ and must learn to implicitly decode the user's intent and perform the task (action → intent)
    - to the agent, the user is part of the external environment → user's control is yet another source of observations
    - Agent can discover arbitrary relationships between user controls and observations of the physical environment, rather than explicitly assuming the existence of a goal.

        음.. 훨씬 깔끔하군.. information $u_t$ 로서 raw $a_t ^h$를 사용한다는 거고, 나머지는 deep neural network 에 맡긴다는 거 같음. 

### Q-learning with user control

human-in-the-loop model-free RL 의 biggest challenge

1. maintaining informative user input → user input이 suggested control 일 경우, user의 suggestion 을 계속 무시한 채 different action을 취하면 user input의 quality가 떨어지게 될 것 (user는 자신의 action으로부터 파생된 feedback을 바탕으로 control을 하니까)
2. minimizing the number of interactions with the environment → model-free reinforcement learning은 주변 environment와 많은 interaction을 필요로 하는데 이게 impractical 하다. 

이를 해결하기 위해 DQN 대신에 neural fitted Q-iteration (NFQI)를 사용. 

### Control Sharing

Select a **feasible action closest to the user's suggestion**, where an action is feasible if it isn't that much worse than the optimal action. 

$$\pi_\alpha (a|\tilde{s}, a^h) = \delta \Big (a= \argmax_{\{a:Q'(\tilde{s},a)\geq(1-\alpha)Q'(\tilde{s},a^*)\}} f(a,a^h) \Big )$$

where $f$ is an action simliarty function  and 

$$Q'(\tilde{s},a) = Q(\tilde{s},a) - \min_{a'\in \mathcal{A}} Q(\tilde{s},a')$$

$\alpha$ determines the tolerance of the system to suboptimal human suggestions → **amount of assistance!**

### Exact Algorithm

<center><img src="Untitled.png" width="400"></center>