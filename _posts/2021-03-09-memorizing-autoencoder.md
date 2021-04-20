---
title: "[ICCV 2019] Memorizing Normality to Detect Anomaly: Memory-augmented Deep Autoencoder for Unsupervised Anomaly Detection"
tags: Autoencoder
permalink: "/notion_to_markdown/%5BPaper%20Review%5D%20Memorizing%20Normality%20to%20Detect%20Anom%209d61a839fc9a41a68d1fd4d65a8ace01/"
comment: true
---

## Motivation

- AE can "generalize" so well that it can also reconstruct the abnormal inputs well (same motivation with swyoon's paper)
- This paper proposes to augment the deep AE with a **memory module : MemAE**
    - Given an input, MemAE does not directly feed its encoding into the decoder but uses it as a query to retrieve the most relevant items in the memory.
    - Memory bank is trained as well along with the encoder / decoder.
- MemAE is encouraged to optimally and efficiently use the limited number of memory slots to record the prototypical normal patterns in the normal training data to obtain low average reconstruction error.

<center><img src="Untitled.png" width="400"></center>

## Related Works - Memory Networks

### Neural Turing Machines

- **Motivation** : conventional neural networks doesn't have memory function
    - Although RNNs or LSTMs can be thought of a sort of memory, it is still an implicit memory which the memory is stored inside the hidden variables.
    - This neural turing machine implements an external memory into the architecture.

    <center><img src="Untitled%201.png" width="400"></center>

- **Memory Reading**

    <center><img src="Untitled%202.png" width="400"></center>

- **Memory Addressing**
    - Focusing by Content

        <center><img src="Untitled%203.png" width="400"></center>


    - Focusing by Location

## MemAE - architecture

<center><img src="Untitled%204.png" width="600"></center>


### Encoder and Decoder

- Encoder $f_e (\cdot): \mathbb{X} \rightarrow \mathbb{Z}$ , $\mathbf{z} = f_e (\mathbf{x}; \theta_e )$
- Decoder $f_d (\cdot) : \mathbb{Z} \rightarrow \mathbb{X}$ , $\hat{\mathbf{x}}=f_d (\mathbf{\hat{z}}; \theta_d)$
- $\ell_2$ -norm based MSE $\|\mathbf{x}-\hat{\mathbf{x}} \|_2 ^2$  is used to measure the reconstruction quality

### Memory & Addressing

- Memory $\mathbf{M}\in \mathbb{R}^{N\times C}$
- For convenience, we assume that $\mathbb{Z} = \mathbb{R}^C$
- Row vector $\mathbf{m}_i \in \mathbb{R}^C$  is a memory item
- Given a query encoding $\mathbf{z} \in \mathbb{R}^C$, this memory network outputs $\hat{\mathbf{z}}$ using a soft addressing vector $\mathbf{w} \in \mathbb{R}^{1 \times N}$

    $\hat{\mathbf{z}}=\mathbf{w}\mathbf{M}=\sum_i w_i \mathbf{m}_i$

### Attention Weights

- Just like the NTM (Neural Turing Machine), attention weights $\mathbf{w}$ is computed based on the similarity of the memory items and the query $\mathbf{z}$. Similarity is measured by a **consine similarity**.

    $w_i = \frac{\exp{(d(\mathbf{z},\mathbf{m}_i ))}}{\sum_j \exp{(d(\mathbf{z}, \mathbf{m}_j))}}$

With above two methods, we can see that this memory module allows only a small number of memory items to be addressed every time. By doing so, we can earn below benefits.

1. Training Phase : Decoder of MemAE is restricted to perform reconstruction only using a limited number of addressed memory items → making it to efficiently utilize the memory itmes → forces the memory to record the **most representative** prototypical patterns in the input normal patterns. 
2. Testing Phase : since the memory is only containing the normal patterns, normal samples can naturally be reconstructed well while abnormal inputs cannot. 

<center><img src="Untitled%205.png" width="400"></center>

### Hard Shrinkage for Sparse Addressing

- Although it seems like a rare case, some outlier reconstruction can still happen with a complex combination of the memory items.
- To alleviate this issue, this paper applied a **hard shrinkage operation** to promote the sparsity of $\mathbf{w}$

    $$\hat{w_i} = h(w_i ; \lambda) = \begin{cases}w_i, & \text{if }w_i > \lambda \\ 0, &\text{otherwise} \end{cases}$$

    which is slightly altered (considering difficulty of backward operation for discontinuous function) using a continuous ReLU activation function as follows:

    $$\hat{w_i} =\frac{\max(w_i -\lambda,0)\cdot w_i}{\vert w_i -\lambda\vert+\epsilon}$$

- After shrinkage, we re-normalize $\hat{\mathbf{w}}$ by letting $\hat{\mathbf{w}}=\hat{\mathbf{w}}/\|\hat{\mathbf{w}}\|_1$

This sparse addressing encourages the model to represent an example **using fewer but more relvant memory items**, leading to learning more informative representations in memory. 

## Training the MemAE

- Given a dataset $\{\mathbf{x}^t \}_{t=1}^{T}$ containing $T$ samples
- Reconstruction error

    $$R(\mathbf{x}^t, \hat{\mathbf{x}}^t )=  \|\mathbf{x}^t - \hat{\mathbf{x}}^t \|_2 ^2$$

- To further improve the sparsity of $\hat {\mathbf{w}}$, in addition to the hard-shrinkage operation above, we minimize a sparsity regularizer on $\hat {\mathbf{w}}$ during training.

    $$E(\hat {\mathbf{w}}^t )= \sum_{i=1}^T -\hat{w_i} \cdot \log (\hat w_i )$$

- Final loss function

    $$L(\theta_e , \theta_d , \mathbf{M}) = \frac{1}{T}\sum_{t=1}^T \big(R(\mathbf{x}^t, \hat{\mathbf{x}}^t ) + \alpha E(\hat {\mathbf{w}}^t ) \big )$$

## Experiment Results

### One-Class MNIST outlier detection

<center><img src="Untitled%206.png" width="400"></center>

### Comparison with AE+Sparse Regularization

<center><img src="Untitled%207.png" width="400"></center>