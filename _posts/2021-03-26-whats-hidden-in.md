---
title: "[CVPR 2020] What’s Hidden in a Randomly Weighted Neural Network?"
tags: Model-Compression Network-Pruning Lottery-Ticket
permalink: "/notion_to_markdown/%5BPaper%20Review%5D%20What%E2%80%99s%20Hidden%20in%20a%20Randomly%20Weighte%20a4b62c1371134df789f399dbc3f6e284/"
---

## Motivation

<center><img src="Untitled.png" width="500"></center>

Paper claims that, there is a subnetwork within a neural network that performs well on a given task, and authors propose an algorithm to find such subnetwork. Authors emphasize that they do not even consider tuning the weights values in the network: **they are just trying to find the best network structure within a fixed, randomly weighted network.** 

Meanwhile, this main goal seems quite similar to the one we read in the "Deconstructing the Lottery Ticket" paper: learning a supermask! However, authors claim that (and just like I pointed out) the stochasticity underlying the mask generating function may limit the performance. Thus, they propose another algorithm to find such supermask (edge-popup algorithm), finding an effective subnetwork within randomly weighted neural networks. 

To summarize, this paper is different from previous papers I read before

- Comparing with the original ***Lottery Ticket*** paper : they said that there is a subnetwork that can be effectively trained from scratch (when properly intialized!) → they actually tune the weight values.
- Comparing with previous ***Deconstructing the Lottery Ticket*** paper : they said that they can found a supermask (thus a subnetwork) which can perform quite effectively → **but their supermask learning algorithm contains too much stochasticity (even though they learn the same masking pre-matrix, resulting mask cannot be reproduced!)**

## Related Works

### Neural Architecture Search (NAS)

아.. 이런 분야도 있었구만..! 흥미롭군... feature (hand-crafted) engineering → feature learning 하는 것으로 시대가 변하였는데 사실 **feature 대신에 neural network architecture 에 대한 hand-crafted engineering** 을 하고 있는 것 아니냐는 지적.. NAS 는 그 부분을 태클하는 학문 분야인듯. 아래는 원문을 그대로 옮겨오겠음. 

> The advent of modern neural networks has **shifted the focus from feature engineering to feature learning**. However, researchers may now ﬁnd themselves **manually engineering the architecture of the network**. Methods of Neural Architecture Search (NAS) instead provide a mechanism for learning the architecture of neural network jointly with the weights. Models powered by NAS have recently obtained state of the art classiﬁcation performance on ImageNet.

### Discovering Nerual Wirings (DNW)

→ weights and structure are jointly optimnized free from the typical constraints of NAS

→ however the subnetwork is chosen by taking the weights with the highest magnitude

→ there is no way to separate the weights and the structure

### Weight Agnostic Neural Networks (WANN)

Architecture alone can be the solution of a problem! WANN builds a neural network that achieve high performance while all of the weights have the same value, and surprisingly, the shared weight value doesn't affect the performance **(= which means, architecture itself is solving the problem by itself!)**

Authors claim that they are inspired by WANN → **instead having shared weights, they fix it to a random value!** 

## Details

### Why are authors so sure about the existence of effective subnetwork?

They in fact provide a pseudo-proof of their intuition. As noted in Figure 1, let's assume that $\tau$ is a network with same structure of $N$ that achieves good accuracy. Let $q$ be the probability that given subnetwork of $N$ has weights that are close enough to $\tau$, and thus obtain the same accuracy. This probability $q$ is extremely small, but it is still nonzero. Therefore, the probability that **no subnetwork of N is close enough to $\tau$ is effectively $(1-q)^S$ where S is the number of possible networks.** 

그러니까 얘네가 하고자 하는 말은... 사이즈가 작은 네트워크 $\tau$ 도 잘 training 시키면 accuracy가 잘 나오는 모델이 있지 않냐. 그니까 저자들은 조금 더 큰 randomly weighted network 안에서 뽑아낼 수 있는 무수히 많은 subnetwork 중에서 저 $\tau$ 랑 비슷한 놈을 찾고야 말겠다 이건데, 

그냥 임의의 subnetwork 하나를 딱 뽑아내서 $\tau$ 랑 비슷한 weight를 가지고 비슷한 accuracy를 가질 확률을 $q$ 라 하면, 물론.. $q$는 무척 작은 숫자일터인데.. 얘네가 하는 말은.. 그래도 0은 아니지 않냐 이 말임. 여기서 저자들의 논리는, bigger network에서 뽑아낼 수 있는 subnetwork 의 전체 개수를 S라 하면 (네트워크가 깊어지면 깊어질수록 무진장 많아지겟지) 

그 무수히 많은 S개의 network 중에서 정말 그 어느것도 $\tau$ 랑 비슷한 놈이 없으려면

$$(1-q)^S$$

의 확률이지 않겠냐 이거지. 근데 $q$가 아무리 작더라도 $q>0$ nonzero value이니까 S 가 무진장 커지면 저게 0에 가까워지지 않겠냐 이 논리를 펴는 거임. 

### So how do they find out the subnetwork? Edge-popup algorithm.

일단 저자들은 node $u$ 와 $v$ 를 잇는 weight  $w_{uv}$ 에 score $s_{uv}$ 를 assign 하는데, 얘네들이 하는 거는 저 $s$ 값을 학습할 계획이고, forward pass 과정에서는 score $s$ 값을 기준으로 top -k % 만큼만 남기고 나머지는 pruning 을 하게 됨. 

일반적인 pruning은 weight $w$를 기준으로 pruning을 한다면 여기서는 별도의 score 값 $s$를 기준으로 pruning을 시킨다는 것임. **다르게 보면 [deconstructing LT] paper에서 weight의 중요도를 평가하기 위한 masking criterion을 hand-craft 하였는데 여기서는 이거를 learning으로 얻어내겠다고 생각할 수도 있을 것 같음.**

만약 weight $w_{uv}$가 loss를 낮추는 데 critical한 역할을 한다면 이전 training iteration에서는 $s_{uv}$가 낮았다 하더라도 다음 iteration에서는 $s_{uv}$를 높이는 쪽으로 학습을 해야된다는 것. 그래서 초기에 낮은 값을 assign 받은 $s_{uv}$ 가 자기 직속 weight의 역할을 인정받아 차츰 score가 높아진다면 결국 특정 threshold 이상으로, 수면 위로 **pop-up** 하게 된다는 얘기임. 

구체적인 update equation은 아래와 같음. 이거 derive하는 과정에서 top-k% high score를 기준으로 masking을 하는 function이 gradient 계산이 불가능해서 backprop 과정에서는 그 과정을 고려하지 않고 계산하였음. 

$$\tilde{s}_{uv} = s_{uv}- \alpha \frac{\partial \mathcal{L}}{\partial \mathcal{I}_v}w_{uv}\mathcal{Z}_u$$

여기서 $\mathcal{I}_v$는 $v$번째 neuron으로 들어오는 input이고 $\mathcal{Z}_u$는 $u$번째 neuron의 output, 그러니까 $\mathcal{Z}_u = \texttt{nn.ReLU}(\mathcal{I}_u)$임. 

$$\mathcal{I}_v = \sum_{u \in \mathcal{V}^{(l-1)}} {w_{uv}\mathcal{Z}_u}$$

## Opinions

뭐.. 그리 큰 감흥은 없는 듯. 이전의 supermask 페이퍼에서 stochasticity를 제거한 버전인 것 같기도 하고, 내가 직전 리뷰 페이지 마지막에 제안(?)했던 

또한, supermask generating function을  $g(m) = \text{Bern}(\text{sigmoid}(m))$ 으로 결정하였는데 이것도 다른 방법이 있을 것이라고 생각함. 당장 생각나는 건 예를 들어 

$$g(m) = u{(\text{sigmoid}(m))}$$

where 

$$u(s;t \in (0,1))=\begin{cases}1 & \text{if } s>t \\ 0& \text{else}\end{cases}$$

이렇게 정의를 한다면 $t$를 조절하면서 간접적으로 pruning ratio를 조절할 수 있을 수도 있을 것 같고, supermask generating 과정이 stochastic하지 않기 때문에 조금 더 나을 수도 (물론 못할 수도) 있을 것 같고. 실험을 해봐야될 것 같음. 

**위 방법에서 sigmoid 대신에 그냥 raw한 score 값을 쓰고 u function을 top-k% 만 남기는 function 으로 대체한 버전인 듯. 뭐가 좋을지는 모르겟구먼. pruning ratio를 명확하고 직접적으로 조절해야 될 필요가 있을 경우에는 이 페이퍼에서 제안한 방법이 더 좋을 것 같음.** 

근데 CVPR20 에 accept이 된걸 보면 내가 이해하지 못한 contribution이 뭔가가 더 있는듯..