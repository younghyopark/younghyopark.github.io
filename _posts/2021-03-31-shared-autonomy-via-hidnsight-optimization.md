---
title: "[RSS 2015] Shared Autonomy via Hindsight Optimization"
tags: Reinforcement-Learning Shared-Autonomy
permalink: "/notion_to_markdown/%5BPaper%20Review%5D%20Shared%20Autonomy%20via%20Hindsight%20Optim%20738343bab70c49ef93e56604a8941ee8/"
---

## Introduction

### General Idea of Shared Autonomy

- Robot Teleoperation is often hard for humans to tackle becuase..
    - input inerfaces are often noisy
    - and inputs may have fewer DOF than the robot they control
- Shared Autonomy seeks to alleviate this issue by combining teleoperation with autonomous assistance!

### What's so difficult about Shared Autonomy?

- The biggest difficulty is that.. "the system doesn't know what the user is trying to achieve"

- Thus, **many prior works** split the shared autonomy into two parts:
    1. predicting the user's goal 일단 사용자가 뭘 하려는지 예측을 하고
    2. assist for that single goal, potentially using prediction confidence to regulate assistance 아무때나 시도때도 없이 개입하면 좀 그러니까 (예를 들어 예측에 대한 확신이 없을 때) 1번의 goal prediction confidence를 기반으로 얼마 정도를 도와줄지 결정한다는 듯

    This procedure is called "**predict-then-blend**"

- However, more recent work assits for an **entire distribution over goals** enabling assitance even when the confidence for any particular goal is low.

    Useful in cluttered environment - difficult / impossible to predict a single goal

### What did this author do?

- modeling the system's task as a **POMDP (Partially Observable MDP)**

    → assumes the user is executing a policy for their known goal without the knowlege of assistance, while the system models both the user input and robot action and solves for an assistance action that minimizes the total expected cost.

- When a good assistance strategy is ambiguous (e.g. the robot is in between two goals), it blends the user input and robot autonomy based on confidence in a particular goal.

<center><img src="Untitled.png" width="400"></center>

## Problem Statement

- User wants to move the robot to one goal in discrete set of goals $g \in G$.

    →  근데 user은 자기가 어디로 향하는지 알고 있는데, system은 그걸 모른다 이거지. 이걸 알아내는게 goal prediction이라는 거고. 

- **We assume access to a stochastic user policy for each goal** $\pi_g^{usr}=p(u \vert x,g)$
  → 그니까, user 입장에서는 goal 이 하나 딱 정해졌을 때, 자신의 state를 바탕으로 어떤 stochastic input $u$를 넣어줘야 될지를 알고 있다고 가정한다는 건데, 
  
  → 이는 보통 user demonstration를 이용해 MaxEnt IOC로 modeling을 한다는 것 같음. 
  
  >   여기서 IRL / IOC가 왜 등장하냐? IRL 에 대해서 잠깐이나마 알아봤던 것을 이 쪽에 연결을 지어보자면...
  >
  >    IRL 에서는 어떤 policy $\pi$가 주어진 상황에서 (either in a form of trajectory, or a complete policy) 어떤 MDP가 주어진 policy $\pi$를 optimal policy로 결정하기 위해서 필요한 reward $R$을 찾아내는 것이 목적이었음. 
  >
  >    이 곳에서는, stochastic user policy $\pi_g^{usr}(x)= p(u \vert x,g)$ 를 MaxEnt IOC로 모델링을 하고자 하는 상황인 듯. 그러니까, user demonstration으로부터 얻은 어떤 trajectory를 통해서 현재 state $x$, goal $g$에 따라 input control $u$가 stochastic하게 결정되는 policy를 modeling하자는 것 같은데, 이걸 왜 IRL류로 모델링을 하냐? 
  >
  >    "IRL/IOC framework assumes the user is approximatelty optimizing a cost function for their intended goal" → 그러니까 IRL 이 given trajectory가 (near-)optimal 한 policy일 수 있도록 하는 reward function을 output하는 것처럼, 여기서도 MaxEnt IOC를 통해 관측된 user demonstration이 near-optimal한 policy에서 기인한 것으로 해석될 수 있도록 하는 cost function $C_g^{usr}:X \times U \rightarrow \mathcal{R}$ 을 찾아내고자 하는 듯. 

- But the system does not know the intended goal! → **we model this with a POMDP with uncertainty over the user's goal.**

    잠깐만. POMDP는 state에 대한 uncertainty가 있을 때 사용하는 건데, 우리는 state을 모르는게 아니라 goal을 모르는 거 아닌가?

    - Define the system state $s\in S$ at the robot state augmented by a goal $s= (x,g)$
    - We assume that the robot state $x$ is known, and **all uncertainty is over the user's goal $g$.**

        아하 그렇구만.  goal을 state에다가 얹어놓고 goal 에 대한 uncertainty를 state에다가 묶어버렸구만. 근데 POMDP 에서는 observation도 있어야 되는거 아닌가? 그 observation을 바탕으로 belief $b$를 update했었는데?

    - Observations in our POMPD correspond to user inputs $u \in U$.
    - Given a sequencec of user inputs, we ionfer a distributino over system states (equivalently a distribution over goals) using an observation model $\Omega$

## Modeling the user policy

Define a sequence of robot states and user inputs as $\xi= \{x_0, u_0, \cdots, x_T, u_T\}$

In shared autonomy, $x_{t+1}$ is not necessarily the result of applying $u_t$ in state $x_t$ (Why? autonomous robot actions are combined!)

Define the cost of a sequence

$$C_g^{usr}(\xi)= \sum_t {C_g^{usr}(x_t, u_t)}$$

Again, how do we learn the cost function $C_g^{usr}$? By MaxEnt IOC/IRL

Meanwhile, it is known that given the goal $g$, the probability of $\xi$ decreases expoentially with cost

$$p(\xi|g) ∝\exp (-C_g^{usr}(\xi))$$

Thus, since computing the normalizing factor $\int_\xi \exp (-C_g^{usr}(\xi))$ is difficult, we think of a different way. 

**"Cost of a sequence is the sum of costs of all state-action pairs" → Dynamic Programming! (compute it through soft-minimum value iteration)**

$$Q_{g,t}^{\approx}(x,u)= C_g^{usr}(x,u)+ V_{g,t+1}^{\approx}(x')$$

where

$$x'=T(x,D(u))\\ V_{g,t}^{\approx}= \text{softmin}_u(Q_{g,t}^\approx (x,u))\\ \text{softmin}_xf(x)= -\log \int_x \exp (-f(x))dx$$

...

$$p(\xi|g) = \prod _t \pi_t^{usr}(u_t |x_t, g)$$

Finally, to compute the probability of a goal given the partial sequence up to $t$,

$$p(g|\xi^{0\rightarrow t})= \frac{p(\xi ^{0 \rightarrow t}|g)p(g)}{\sum _{g'}p(\xi^{0\rightarrow t} | g' )p(g') }$$

어떤 goal 이 주어졌을 때 sequence가 관찰될 확률을 먼저 정의하고, 
그걸 바탕으로 특정 sequence가 관찰되었을 때 특정 goal을 향할 확률을 구한듯. 
**근데 중간의 mathematical detail 들을 아직 완전히 이해하지는 못함. Review 필요.** 

## Hindsight Optimization

- POMDP  (finding the optimal action for any belief state) is intractable.
- Utilize QMDP approximation (Hindsight optimization)
    - idea is to estimate the cost-to-go of the belief by assuming **full observabiltiy**
- **They believe that this QMDP approximation is suitable for shared autonomy for many reasons.**
    1. conceptually, we assume the user will provide inputs at all times, and **therefore we gain information without explicit information gathering.** → In this setting, works in ohter domains have shown that QMDP perfoms similarly to methods that consider explicit information gathering. 다른 비슷한 도메인에서 해봤더니 QMDP가 잘 되더라 하는 건가
    2. computationally, QMDP is efficient to compute even with continuous state and action spaces

        그런가? QMDP 가 continuous state and action space에서도 working 하는 이유... 뭐 그렇다 하니까 일단 넘어가고

    3. explicit information gathering where the user is treated as an oracle would likely be frustrating → ? 

### So how do they do this?

$Q(b,a,u)$ be the action-value fcuntion of the POMDP, estimating the cost-to-go of taking action $a$ when in belief $b$ with user input $u$. 

저자들은 여기서 $u$가 들어가 있는게 생소하겠지만 심리학적으로(?) 사용자들이 in-control 되어 있다고 느낄 떄 만족감이 크다(?)는 결과를 바탕으로 $u$  를 q-function 에 넣게 되었다고 말함. 

Recall, that uncertainty is only over goals, which it creates the belief to be

$$b(s)=b(g) = p(g|\xi^{0\rightarrow t})$$

Now, let's define $Q_g (x,a,u)$ to be the action-value for goal $g$, acting optimally for goal $g$ after taking action $a$. 

여기서 이제 QMDP를 쓰는거지. so-far so-good.

$$Q(b,a,u) = \sum_g b(g)Q_g (x,a,u)$$

허나.. $\argmax_a Q(b,a,u)$를 계산하는 것이 쉽지는 않은 문제일 터... first-order approximation 을 사용한다고 함. 근데 어떻게 $Q_g$를 approximate 하냐가 관건. 왜?

1. Robot and user both act : estimate $u$ with $\pi_g^{usr}$ at each time step, utilize $C^{rob}(\{x,g\}, a,u)$ for the cost → run **q-learning** algorithms to compute $Q_g$
2. Robot takes over : assume the user will stop supplying inputs, and the robot will complete the task. → enables us to use cost function $C^{rob}(s,a,0)$ → we can ssume the robot will optimally → we can analytically compute the value for many cost functions

## Remarks

- Authors then conducted a human experiment, asking them to compare with a traditional **predict-and-blend based shared autonomy** algorithm and their algorithm.
- 그러니까 predict-and-blend based shared autonomy의 경우에는 말하자면, 이 경우 MaxEnt IOC를 통해서 goal prediction을 아래와 같이 했으니까 이걸 그대로 사용하자면,

    $$p(g|\xi^{0\rightarrow t})= \frac{p(\xi ^{0 \rightarrow t}|g)p(g)}{\sum _{g'}p(\xi^{0\rightarrow t | g^t )}p(g') }$$

    predict-and-blend의 경우 여기서 **argmax로 goal $g$를 one-hot vector로 완전히 classify해버리되 해당 classification에 해당하는** confidence를 바탕으로 얼마나 user input에 얼마나 개입할지를 결정하는 반면.. (그러니까 결국 argmax로 얻어지는 goal 의 정보만 쓴다는 건듯)

    이 저자들이 제안한 work의 경우 모든 goal에 대한 probability를 고려,  **assists for an entire distribution of goals** 가 핵심인 듯. 

    ![Untitled%201.png](Untitled%201.png)

