---
title: "[NIPS 2017] Hybrid Reward Architecture for Reinforcement Learning "
tags: Reinforcement-Learning Multi-Reward/Objective
permalink: "/notion_to_markdown/%5BNIPS%202017%5D%20Hybrid%20Reward%20Architecture%20for%20Reinfor%20ec4b86df520441bab17567b05419da01/"
---

<br/>
<center>
<iframe width="560" height="315" src="https://www.youtube.com/embed/DYNy7Fvonro" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>


## Horde vs HRA vs UVFA

- Horde architecture learns multiple general value functions(GVFs), each corresponding to different reward functions and other question functions, using multiple demons.
- UVFA tries to generalize the value functions across different task and goals.
- HRA, on the other hand, decomposes the reward function into $n$ different reward functions, with the intent to solve a **SINGLE, but COMPLEX** task.

    Reward 가 너무 sparse하거나 function이 너무 high-dimensional일 경우 문제 해결이 어려움 → too much state component들에 dependent한 reward function을 여러 개의 small reward function (dependent on less state components) 들의 합으로 해석함

    → Reward Function Decomposition 이라는 topic도 therefore closely related!

## Proposed Method

- Let's decompose the reward function $R_{env}$ into $n$ reward functions!

    $$R_{env} (s,a,s') = \sum_{k=1}^n  R_k(s,a,s')$$

    and train separate RL agent on each of these reward functions. 

- Because agent $k$ has its own reward function, it has also its own Q-value function, $Q_k$.

    In general, different agents can share multiple lower-level layers of deep Q-network. Hence, authors use a single vector $\theta$ to describe the combined weights of the agents!

- Combined network that represents all $Q$-value functions = **Hybrid Reward Architecture**

    $$Q_{\text{HRA}}(s,a;\theta) = \sum_{k=1}^n Q_k (s,a;\theta)$$

- The collection of agents can be viewed as a single agent with multiple heads!

    Lower-level layer는 고정되어 있는 상태에서 higher-level layer들의 weight들만 각 reward function에 대해 달라지는 것임. 

- Loss function associated with HRA

    $$\begin{aligned} \mathcal{L}_i (\theta_i ) & = \mathbb{E}_{s,a,r,s'}\bigg [ \sum_{k=1}^n (y_{k,i} - Q_k (s,a;\theta_i ))^2 \bigg ] , \\ \text{with }  & y_{k,i} = R_k (s,a,s') + \gamma \max_{a'} Q_k (s',a'; \theta_{k-1}) \end{aligned}$$

- To that end, we get an optimal weight $\theta^\star$

    $$Q_k ^\star (s,a) = Q_k (s,a;\theta^\star)$$

    where

    $$Q_{\text{HRA}}^\star(s,a) := \sum_{k=1}^n Q_k^\star (s,a) $$

Resulting $Q_{\text{HRA}}^\star$ is different from $Q_{env}^\star$  which is generated by $R_{env}$.

<center><img src="Untitled.png" width="400"></center>

## What's good about HRA?

- Easily exploit more domain knowledge!
    1. Remove irrelevant features : reward에 영향을 주지 않는 feature들은 과감히 배제시켜버릴 수 있음
    2. Identifying terminal states : terminal state에 대해서는 학습을 하지 않도록 refrain 시켜 weight들이 오로지 meaningful 한 non-terminal state을 estimate 하는데 사용되도록 할 수 있음
    3. Using pseudo-reward functions : 실제 environment reward function을 decompose하는 것이 아니라, pseudo-reward function 을 사용하여 $\theta$ 를 update할 수도 있음. 

## Experiments

### Experiment Setting : Fruit Collection Task

- 10x10 격자에 과일들이 놓임
- 과일들이 놓일 수 있는 위치는 10개가 있고, each episode마다 과일들은 랜덤한 5개 위치에 놓임
- agent는 랜덤한 위치에서 시작하고
- 과일을 하나 먹을 때마다 reward +1 이 주어짐
- each episode는 과일 5개를 다 먹거나 300 step 이 지나면 끝남

- 이 문제를 일반적인 DQN 으로 풀었을 때와 HRA로 풀었을 때 두 가지를 비교했음.
- HRA의 경우 → reward function을 10개의 다른 small-reward function으로 decompose했음, one per possible fruit location.
- **HRA network 의 실제 구성**
    - input = 110 binary code (100 for encoding the agent's position, and the remaining 10 for encoding whether the fruit is in each of the possible positions)
    - FC layer 110 → 250 → (10 heads of) 4   (each consisting of the action values of 4 actions)
    - Mean of all heads is computed through a final linear layer  (with fixed weights 1)


<center><img src="Untitled%201.png" width="400"></center>

위 그림에서, DQN은 맨 마지막 layer에서 나온 reward 를 가지고 loss function을 minimize한다면, HRA는 그 직전 layer에서 나온 reward (vector)들을 가지고 each agent들을 업데이트하는 것. 

- 여기서 HRA+3 에 주목하고 싶은데, decomposing the existing reward (fruit-related) 에 더해서 pseudo-reward 를 추가한 실험임. **(reward is given when the agent GOT TO the predefined 10 places)**

    → 그 장소에 과일이 없더라도 뭔가를 배울 수 있음 


<center><img src="Untitled%202.png" width="600"></center>

- 그 결과 DQN보다 HRA를 썼을 때 훨씬 더 학습을 잘 했다는 것을 볼 수 있음. 특히, pseudo-reward를 썼을 때의 효과는 아주 강력했는데, 아무것도 쓰지 않는 상태와 비교해 아주 빠르게 학습을 완료함을 볼 수 있음.

### Ms.Pac-Man

- 이 논문은 Ms.Pac-Man 게임에서 SOTA를 찍었다고 해서 꽤나 유명세를 탄 논문인데, 뭐 결론은 (전혀 놀랍지 않게도) HRA가 DQN보다 잘한다는 것이었음.

- reward function이 복잡해? → small reward function으로 쪼개세요!