---
title: "[NIPS 2017] Neural Discrete Representation Learning"
tags: Autoencoder
permalink: "/notion_to_markdown/%5BPaper%20Review%5D%20Neural%20Discrete%20Representation%20Lear%20bd407a55549646a2a73e1aa2d5b6cd61/"
---


<!-- # [Paper Review] Neural Discrete Representation Learning (NIPS 2017)

[%5BPaper%20Review%5D%20Neural%20Discrete%20Representation%20Lear%20bd407a55549646a2a73e1aa2d5b6cd61/1711.00937.pdf](%5BPaper%20Review%5D%20Neural%20Discrete%20Representation%20Lear%20bd407a55549646a2a73e1aa2d5b6cd61/1711.00937.pdf)
 -->
## Why Discrete Representations?

- Discrete representations are potentially more natural fit for many of the modalities
- Languages is inherently discrete, images can often be described by languages
- Discrete represntations are a natural fit for complex reasoning, planning and predictive learning.

## Vector Quantization VAE (VQ-VAE)

### Discrete Latent Variables

- Define a latent embedding space $e \in \mathbb{R}^{K\times D}$ where $K$ is the size of the discrete latent space (K-way categorical) and $D$ is the dimensionality of each latent embedding vector $e_i$
- Denote $e_i \in \mathbb{R}^D$ as an embedding vector corresponding to $k=i$
- Model takes an input $x$, and an encoder produces output $z_e (x)$
- The discrete latent variables $z$ is then calculated by a nearest neighbor look-up using the shared embedding space $e$

    $$q(z=k|x)=\begin{cases}1&\text{for }k=\arg\min_j \|z_e (x)-e_j \|_2 \\ 0& \text{otherwise} \end{cases}$$

    ![Untitled.png](Untitled.png)

### Learning

- Overall loss function has three components

    $$L= \log p(x|z_q (x))+ \|\text{sg}[z_e (x)]- e\|_2 ^2 + \beta \|z_e (x)-\text{sg}[e]\|_2 ^2$$

    1. Reconstruction loss ($\log p(x \vert z_q (x))$) : optimizes the decoder and encoder

        → However, the embeddings $e_i$  receive no gradients from this loss
        → Therfore, in order to learn a proper embedding space, one of the simplest dictionary learning algorithm - Vector Quantisation (VQ) - is used instead. 

    2. VQ obejctive : optimizes the dictionary (only used for updating the dictionary $e$)

        → sg stands from stopgradient operator, which is an identity at forward computation, and has zero partial derivative for backpropping. 

    3. Regularization term : to make sure that the dictionary $e$ is simultaneously trained along with the encoder parameters. $\beta = 0.25$ is used for the experiment in this paper.