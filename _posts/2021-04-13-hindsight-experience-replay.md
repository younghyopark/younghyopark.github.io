---
title: "[NIPS 2017] Hindsight Experience Replay "
tags: Reinforcement-Learning Multi-Reward/Objective
permalink: "/notion_to_markdown/%5BNIPS%202017%5D%20Hindsight%20Experience%20Replay%206daf8b2ade014cf58ea2d223723e0390/"
---

## Introduction

### Designing a reward function is important, but not easy.

- common challenge of RL is to carefully enegineer the reward function → not only reflecting the task at hand, but also carefully shaped to guide the policy optimization.
- The necessity of cost engineering limits the applicability of RL in the real world, because it requires both RL expertise and domain-specific knowledge.
- Not applicable in situations where we do not know what admissible behaviour may look like.
- **Therefore, we need to develop algorithms which can learn from unshaped reward signals (e.g. a binary signal indicating successful task completion)**

### What can humans do?

- humans can learn almost as much from achieveing an undesired outcome as from the desired one.

    인간은 실패로부터 배울 수 있다는데, 왜 RL은 못 하냐.. For example, 사람은 하키를 치는 방법을 배운다 쳤을 때, 반드시 골을 넣어야만 배우는 건 아니잖음? 네트의 오른쪽에 맞았을 때는 내가 좀 왼쪽으로 쳐야겠구나 뭐 이런 것을 배울 수 있으니.. 근데 RL은 네트에 골인하지 못하고 살짝 오른쪽으로 빗겨나갔을 때의 failed situation에서 배울 수 있는게 거의 없음. 

- It is however possible to draw another conclusion: ⭐ **this sequence of actions would be succesful if the net had been placed further to the right** ⭐

    RL은 네트에 골인을 해야만 무언가를 학습할 수 있다고 하면, 네트를 여러개 두면 안됨? 오른쪽으로 빗나간 케이스였으면, 살짝 오른쪽에 있는 네트에 대해서는 학습이 가능할 수도 있는거 아닌가?

### Authors propose "Hindsight Experience Replay"

- allows the algorithm to perform exactly this kind of reasoning and can be combined with any off-policy RL algorithm.
- multiple goals → always applicable.  (e.g. achieving each state of the system may be treated as a separate goal)
- makes the training easier, even if the reward signal is sparse and binary

## Background

### Deep Q-Networks (DQN)

- model-free RL algorithm for discrete action spaces
- $\epsilon$-greedy policy w.r.t. Q is defined as:

    a) take the greedy action $\pi_Q (s) = \argmax _{a\in \mathcal{A}} Q(s,a)$ with probability $1-\epsilon$

    b) take a random action sampled uniformly in $\mathcal{A}$ with probability $\epsilon$

- taking an $\epsilon$-greedy policy, generate episodes
- transition tuples $\langle s_t, a_t, r_t, s_{t+1} \rangle$ is stored inside the replay buffer
- network is trained using mini-batch gradient descent on the loss $\mathcal{L}$ which encourages the approximated Q-function to satisfy the Bellman equation.

    $$\begin{aligned} y_t = r_t + \gamma \max_{a'\in \mathcal{A}} Q(s_{t+1}, a')\\ \mathcal{L} = \mathbb{E} (Q(s_t, a_t) - y_t)^2 \end{aligned}$$

- to make the optimization procedure more stable, targets $y_t$ are usually computed using a seperate target network, changes at a slower pace than the main network

    ```python
    # update is done every n epochs/iterations, but way slower than the policy network
    target_network.load_state_dict(policy_network.state_dict())
    ```

### Deep Determinisitc Policy Gradients (DDPG)

- DDPG is a model-free RL algoirithm for continuous action spaces.
- DDPG use two neural networks
    1. target poclicy (actor) $\pi : \mathcal{S} \rightarrow \mathcal{A}$
    2. action-value function approximator (critic) : $Q: \mathcal{S} \times \mathcal{A} \rightarrow \mathbb{R}$
- critic's job is to approximate the actor's action-value function $Q^\pi$

- Episodes are generated using a behaviooral policy ($\pi_b$ ) - noisy version of target policy ($\pi$)

    $$\pi_b (s) = \pi(s) + \mathcal{N}(0,1)$$

- episodes stored inside the replay buffer
- $y_t = r_t + \gamma Q(s_{t+1}, \pi(s_{t+1}) )$ target is computed by the actor, not the max function of Q-function
- The actor is trained with mini-batch gradient descent on the loss

    $$\mathcal{L}_a = - \mathbb{E}_s Q(s,\pi(s))$$

### Universal Value Function Approximators (UVFA)

[[ICML 2015] Universal Value Function Approximators](https://www.notion.so/ICML-2015-Universal-Value-Function-Approximators-7f40ff1fd4d54484990b57dd8c2d4b14)

- UVFA is extended version of DQN, where there is more than one goal we may try to achieve
- Let $\mathcal{G}$ be the space of possible goals.
- Every goal $g\in \mathcal{G}$ corresponds to some reward function

    $$r_g : \mathcal{S\times A} \rightarrow \mathbb{R}$$

- every episode starts with sampling a state-goal pair from some distribution $p(s_0, g)$, and the goal stays fixed for the entire episode.
- At every timestep, the agent gets as input not only the current state, but also the current goal.

    $$\pi : \mathcal{S\times G} \rightarrow \mathcal{A}$$

    and gets the reward

    $$r_t  = r_g (s_t, a_t )$$

- Q-function now depends not only on state action pair, but also on goal. Thus,

    $$Q^\pi (s_t, a_t, g) = \mathbb{E}[R_t |s_t, a_t, g]$$

- we can similarly train an approximator Q-function using the Bellman equation, just like DQN.

## Hindsight Experience Replay

### A motivating example

- state space $\mathcal{S} = \{0,1\}^n$
- action space $\mathcal{A} = \{0,1,\cdots, n-1\}$   → action $i$ flips the $i$-th bit of the state
- There's a goal $g \in \mathcal{S}$
- The agent receives a reward $r_g (s,a) =-[s\not = g]$.

    bit-flipping operation을 통해서 특정 n-bit binary code와 똑같이 만들지 못하는 이상 계속 -1 reward 밖에 못 받음. 당연히 $n$이 커지면 커질수록 reward는 점점 더 sparse 해질 것이고, 학습을 불안정하게 만들 것. As a matter of fact...

    - Standard RL algorithms fail in this environment for $n>40$
    - One solution might be using a more informative reward function

        $$r_g (s,a) = -\|s-g\|^2$$

        however it might not be applicable to more complicated problems. 

### How should we tackle this problem?

- consider an episode with state $s_1, \cdots, s_T$
- and our goal is $g \not = s_1, \cdots, s_T$

    → this means that the agent received a reward of -1 at every timestep. 

- we now reexamine the same trajectory with a different goal!

    → this information can be harvested by using RL algorithm and experience replay **where we replace $g$ in the replay buffer by $s_T$.**

    이왕 final state $s_T$ 까지 간거, 그 곳을 goal 이라고 생각하면 뭔가라도 얻을 수 있잖음?

- by implementing HER technique, DQN with HER easily solves the task for $n$ up to 50!

### Multi-goal RL

- follow the approach from UVFA, train policies and value functions which take as input not only a state $s\in \mathcal{S}$ but also a goal $g\in \mathcal{G}$.

    Authors also prove that
    "training an agent to perform multiple tasks can be easier than training it to perform only one task"  → 자기네들 방법론이 다방면으로 사용될 수 있다는 것!

- They assume that every goal $g \in \mathcal{G}$ corresponds to some predicate

    $$f_g : \mathcal{S} \rightarrow \{0,1\}$$

- Agent's goal is to acheve any state that satisfies

    $$f_g(s)=1$$

- One example of goal space is

    state space $\mathcal{S}$ 의 특정 state 하나를 goal 로 지정하는 경우

    $$\begin{aligned} \mathcal{S}&=\mathcal{G} \\ f_g(s) &= [s=g]\end{aligned}$$

- Another example of goal space might be

    $\mathbb{R}^2$ state space 에서 특정 $x$  좌표값을 goal 로 지정하고 싶은 경우

    $$\begin{aligned} \mathcal{S}&=\mathbb{R}^2 \\ \mathcal{G} & = \mathbb{R} \\ f_g((x,y)) &= [x=g]\end{aligned}$$

- assume that, for a given state $s$, we can easily find a goal $g$  which is satisfied in this state. More formally, we assume that there is given a mapping

    $$m: \mathcal{S\rightarrow G}\ \ \text{s.t.} \ \ \forall s\in \mathcal{S}, \  f_{m(s)}(s) = 1$$

    자신이 있는 state을 goal 이 되도록 해주는 mapping이라는 건데, 위 첫번째 예시에서는 $m(s) = s$, 두 번째 예시에서는 $m((x,y)) = x$. state space $\mathcal{S}$ 와 goal space $\mathcal{G}$ 가 항상 같지 않을 수 있으니 필요한 정의인 듯. 

### Main Algorithm : Hindsight Experience Replay (HER)

- after experiencing some episode $s_0, s_1, \cdots, s_T$ we store in the replay buffer every trainsition $s_t \rightarrow s_{t+1}$ not only with the original goal used for this episode, but also with a subset of other goals.
- One choice which has to be made to use HER → set of additional goals used for replay.
- simplest version? we replay each trajectory with the goal $m(s_T)$ → goal which is achieved in the final state of the episode.

<center><img src="Untitled.png" width="500"></center>

Simple!

## Results
<center>
<iframe width="560" height="315" src="https://www.youtube.com/embed/Dz_HuzgMxzo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>

![Untitled%201.png](Untitled%201.png)