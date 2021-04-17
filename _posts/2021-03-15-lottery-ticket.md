---
title: "[ICLR 2019] The Lottery Ticket Hypothesis: Finding sparse, trainable neural networks"
tags: Network-Pruning Model-Compression Lottery-Ticket
permalink: "/notion_to_markdown/%5BPaper%20Review%5D%20The%20Lottery%20Ticket%20Hypothesis%20Findi%203d18358bc43c4a62ba460c6d8c5f75c7/"
comments: true
---

<!-- # [Paper Review] The Lottery Ticket Hypothesis: Finding sparse, trainable neural networks -->
<br/>

<center><iframe width="560" height="315" src="https://www.youtube.com/embed/8UxS4ls6g1g?start=5144" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>

## Motivation

According to previous observations (LeCun et al., 1990), eliminating unnecessary weights can 

1. decrease the size / energy consumption of the model
2. faster inference
3. without harming the accuracy.

Knowing that above is indeed possible, why not "train a smaller architecture" instead from scratch? However, authors observed that this isn't an easy task.

![Untitled.png](Untitled.png)

What we can see above is that as the model gets sparser (as more and more weights get pruned)

1. learning is slower
2. test accuracy is lower

This phenomenon was actually observed by several previous works, which the author admits that themselves are influenced by, claiming that **"Training a pruned model from scratch performs worse that retraining a pruned model, which may indicate the difficulty of training a network with small capacity."**

However, authors show that **"there is actually a winning (lottery) ticket"** that can make a sparse network to learn faster and even achieve higher accuracy. Authors coined their claim as "Lottery Ticket Hypothesis". 

**The Lottery Ticket Hypothesis.**  A randomly-initialized, dense neural network contains a subnetwork that is initialized such that - when trained in isolation - it can match the test accuracy of the original network after training for at most the same number of iterations. 

It can be formally expressed by below.

<center><img src="Untitled%201.png" width="400"></center>

If this hypothesis is indeed true, we can also state a corollary. 

**Neural networks, in many cases, do not have to be so over-parameterized.** 

## So what's the winning ticket?

So what solved the problem? You know, many previous literatures have stated that training a sparse network from scratch is difficult. Authors found out, that the key point was in **"initialization"**. **Each unpruned connection's value is reset to its initialization from the original network before it was trained.**  This is the key. 

1. Randomly initialize a neural network $f(x;\theta_0 )$ where $\theta_0 \sim \mathcal{D}_\theta$
2. Train the network for $j$ iterations, arriving at parameters $\theta_j$
3. Prune $p\%$ of the parameters in $\theta_j$ , creating a mask $m$.
4. Reset the reamining parameters to their values in $\theta_0$ , creating the **"winning ticket" $f(x; m \odot \theta_0 )$**

While this approach described above is a one-shot process, pruning $p\%$ of the weights in single step, we can do an iterative pruning: repeats above process $n$ times while pruning $p^{\frac{1}{n}}\%$ weights at each round. 

## Results

### Experiment Setting

They experimented on 

- Fully-connected model for MNIST
- ConvNets for CIFAR10

across multiple optimization strategies (SGD, momentum, Adam) with various techniques such as dropout, weight decay, batchnorm and residual connections. 

### Pruning Strategy

They used unstructured pruning technique → start pruning weights with least magnitude 

### Remarks

- Finding the winning ticket was sensitive to learning rate (required warmup to find the winning tickets)
- winning tickets are found at pruning ratio 10%~20%
- At that size, they meet or exceed the original network's test accuracy in at most the same number of iterations.
- However, when randomly reintialized, winning tickets perform far worse!

![Untitled%202.png](Untitled%202.png)

![Untitled%203.png](Untitled%203.png)

## Implications

This paper initiated an interesting approach of "learning the optimal structure" of neural network. The authors stated that they want to further research on

- Improving the training performance : we want to **find the lottery ticket at earlier stage**
- Design better networks : while this work revealed that a particular combination of "sparse architecture" and "specific type of intialization" is particularlly adept at learning, we might **find out a better combination** that is way more conducive to learning!
- Improve our theoretical understanding of neural networks : **answer the "Why" question** - why does randomly-initialized feed-forward networks seem to contain winning tickets and potential implications for theoretical study of optimization.
