---
title: "[Personal Research] Autoencoder Sparsity and Outlier Detection "
tags: Personal-Research
published: false
comment: true

---

## Introduction

### Sparsity of Neural Network

Sparsity of a neural network can be construed as a **constraint**. Given a dataset $\mathcal{D}= \{ \mathbf{x}_1,\mathbf{x}_2, \cdots, \mathbf{x}_N \}$ and a desired sparsity level $\kappa$ (number of zero weights), neural network pruning can be formulated as  a **constrained optimization problem**. In case of autoencoder $\mathbf{x} \rightarrow f(\mathbf{x}; \mathbf{w}) = d(e(\mathbf{x}))$ where $e, d$ each corresponds to encoder and decoder network, sparsifying the network is an optimization problem of:

$$
\begin{aligned}
\min_\mathbf{w} & \ \ \ \mathcal{L}(\mathbf{w}; \mathcal{D}) = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}_i; \mathbf{w}) - \mathbf{x}_i \|_2\\
\text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^m , \ \ \|\mathbf{w}\|_0  \leq \kappa 
\end{aligned}
$$

We can alternatively describe the problem above by decoupling the weight term $\mathbf{w}$ and sparsifying (pruning) term - mask $\mathbf{c}$.

$$
\begin{aligned}
\min_\mathbf{c,w} & \ \ \ \mathcal{L}(\mathbf{c} \odot \mathbf{w}; \mathcal{D}) = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}; \mathbf{c}\odot \mathbf{w}) - \mathbf{x}_i \|_2^2 \\
\text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^n \\
& \ \ \|\mathbf{c}\| \in \{0,1\}^m   , \ \ \ \|\mathbf{c}\|_0 \leq \kappa 
\end{aligned}
$$

Note that, we can optimize the objective with respect to $\mathbf{w}$, $\mathbf{c}$, or both. In fact, one line of research treats the weight term $\mathbf{w}$ as a fixed constant (usually at its initialized state), while the other line of research tries to jointly optimize both $\mathbf{w}$ and $\mathbf{c}$. Former line of research was rather recently ignited by the Lottery Ticket paper (ICLR 2019), while the latter line of research was done for quite a while. 

### Regularizing Neural Network

A similar, but way more popular constraint is the **weight regularization**. $L_1$ or $L_2$ norm of the weight parameters can be added to the objective function to penalize the magnitude of weights during training, making the network **semi-sparse**. 

$$
\begin{aligned}
\min_\mathbf{w} & \ \ \ \mathcal{L}(\mathbf{w} ; \mathcal{D}) + \gamma \|\mathbf{w}\|_2 ^2 = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}; \mathbf{w}) - \mathbf{x}_i \|_2^2 + \gamma \|\mathbf{w}\|_2 ^2\\
\text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^n \\
\end{aligned}
$$

Adding a regularizing term when training a neural network can effectively prevent the problem of over-fitting. 

However, this regularization cannot achieve the effect of **model compression**, since we cannot entirely eliminate the neurons or disconnect the wires unless it's completely zero. 



## Sparsity of Autoencoder and Outlier Detection

At this point, what we want to prove is:

By **appropriately** sparsifying the autoencoder, one can improve its outlier detection performance. To be specific, appropriately sparsifying the autoencoder can prevent the **outlier reconstruction** phenomenon.
{:.info}

When tackling this problem, we have two options.

### 1. Solving the same optimization problem

We can use the same optimization problem we formulated above, **naively expecting** that, reducing the inlier reconstruction errors **by sparsifying the network** can effectively prevent the outliers from being reconstructed.

To be specific, we are expecting the autoencoder $f(\cdot \ ; \mathbf{w^\star})$  to have better outlier detection performance than autoencoder $f(\cdot \ ; \mathbf{w}_{\text{base}})$ while $\mathbf{w}^\star$ and $\mathbf{w}_{\text{base}}$ are each the optimized weights corresponding to sparsity constrained and non-constrained optimization problem.

$$
\begin{aligned}
\mathbf{w^\star} = \arg \min_\mathbf{w} & \ \ \ \mathcal{L}(\mathbf{w}; \mathcal{D}) = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}_i; \mathbf{w}) - \mathbf{x}_i \|_2\\
\text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^m , \ \ \|\mathbf{w}\|_0  \leq \kappa 
\end{aligned}
$$

$$
\begin{aligned}
   \mathbf{w}_{\text{base}} = \arg \min_\mathbf{w} & \ \ \ \mathcal{L}(\mathbf{w}; \mathcal{D}) = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}_i; \mathbf{w}) - \mathbf{x}_i \|_2\\
   \text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^m
   \end{aligned}
$$

### 2. Solving a different optimization problem

One might use a different optimization problem, explicitly targetting the outlier reconstruction phenomenon:

$$
   \begin{aligned}
     \min_\mathbf{c,w} & \ \ \ \mathcal{L}(\mathbf{c} \odot \mathbf{w}; \mathcal{D}_\text{in}) - \mathcal{L}(\mathbf{c} \odot \mathbf{w}; \mathcal{D}_\text{out})\\ & \ \ \ \ \ \ \ \ \  = \bigg (\frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}_i; \mathbf{c}\odot \mathbf{w}) - \mathbf{x}_i \|_2 ^2 - \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}'_i; \mathbf{c}\odot \mathbf{w}) - \mathbf{x}_i \|_2 ^2 \bigg ) \\
     \text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^m \\
     & \ \ \|\mathbf{c}\| \in \{0,1\}^m   , \ \ \ \|\mathbf{c}\|_0 \leq \kappa 
     \end{aligned}
$$

   where $\mathcal{D}_{\text{out}} = \{ \mathbf{x}'_1, \cdots,  \mathbf{x}'_N\}$ is the dataset that represents the outliers. However, since we cannot obtain the dataset that represents all possible outliers, one must use an alternative strategy (e.g. MCMC sampling) to realize above objective function.  

However, to make our assertion to gain some sort of novelty, the outlier detection performance achieved by either of above **pruning-based approaches** should be better than the performance we can achieve by **regularization-based method.**
{:.gray_no_border}

To be specific, we have to obtain a **sparse weight** $\mathbf{w}^\star$ that makes the autoencoder $f(\cdot \ ; \mathbf{w}^\star)$ to have better outlier detection performance than $$f(\cdot ; \mathbf{w}_{\text{reg}})$$ or $f(\cdot ; \mathbf{w}_{\text{base}})$ where  $$\mathbf{w}_{\text{reg}}$$ is the weight we obtain from regularized loss function:

$$
\begin{aligned}
\mathbf{w}_{\text{reg}} = \arg\min_\mathbf{w} & \ \ \ \mathcal{L}(\mathbf{w} ; \mathcal{D}) + \gamma \|\mathbf{w}\|_2 ^2 = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}; \mathbf{w}) - \mathbf{x}_i \|_2^2 + \gamma \|\mathbf{w}\|_2 ^2\\
\text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^n \\
\end{aligned}
$$

$$
\begin{aligned}
   \mathbf{w}_{\text{base}} = \arg \min_\mathbf{w} & \ \ \ \mathcal{L}(\mathbf{w}; \mathcal{D}) = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}_i; \mathbf{w}) - \mathbf{x}_i \|_2\\
   \text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^m
   \end{aligned}
$$

## Ways to implement sparsity (ways to prune)

To prove our point, we should first and foremost determine the **sparsifying method** that can be applied to the autoencoder. 

### Traditional Saliency Estimation Techniques

Saliency based methods selectively removes redundant parameters in the neural network. In this case, **assessing the saliency** is the most important task. One of the earliest saliency estimating functions are based on 1) magnitude and 2) Hessian matrix. 

$$
s_j = 
\begin{cases}
|\mathbf{w}_j | , & \text{magnitude based}\\
\frac{\mathbf{w}_j^2 \mathbf{H}_{jj}}{2}, & \text{Hessian based}
\end{cases}
$$

Note that both the [magnitude](https://arxiv.org/pdf/1506.02626.pdf) and Hessian is computed for pretrained weights $\mathbf{w}_{\text{pt}}$, while the Hessian matrix is defined as:

$$
\mathbf{H} = \frac{\partial^2 \mathcal{L}}{\partial \mathbf{w}^2} \bigg \vert _{\mathbf{w}_{\text{pt}}} \in \mathbb{R}^{m\times m}.
$$

**Regularizing constraint** can also be used: one might add some regularizer during the pretraining phase, and then estimate the saliency in the preceding step. 

### Modern Advances in Saliency Estimation Techniques

Meanwhile, as the neural network gets larger and deeper, many modern advances were made in saliency estimation techniques.

[Lee et al.](https://openreview.net/pdf?id=B1VZqjAcYX) proposed a method called **SNIP**, a single-shot saliency estimating technique where the saliency is computed by the **effect of connection (weight) $j$ on the loss**. To do so, authors remove the connection $j$ and measure its effect:
$$
\Delta \mathcal{L}_j (\mathbf{w}; \mathcal{D}) = \mathcal{L} (\mathbf{1} \odot \mathbf{w}; \mathcal{D}) - \mathcal{L} \big ((\mathbf{1}-\mathbf{e}_j) \odot \mathbf{w}; \mathcal{D}\big )
$$

Since this computation is quite expensive, authors try to approximate this by the derivative of $\mathcal{L}$ with respect to $c_j$. 

$$
\Delta\mathcal{L}_j (\mathbf{w}; \mathcal{D}) \approx g_j (\mathbf{w}; \mathcal{D})  = \frac{\partial \mathcal{L}(\mathbf{c}\odot \mathbf{w}; \mathcal{D}) }{\partial c_j } \bigg \vert _{\mathbf{c=1}} = \lim_{\delta \rightarrow 0} \frac{\mathcal{L}(\mathbf{1}\odot \mathbf{w} ; \mathcal{D}) - \mathcal{L}((\mathbf{1} - \delta\mathbf{e}_j )\odot \mathbf{w}; \mathcal{D})}{\delta}
$$

Finally, we can compute the saliency by its normalized magnitude:

$$
s_j = \frac{|g_j (\mathbf{w}; \mathcal{D})|}{\sum_{k=1}^n |g_k (\mathbf{w}; \mathcal{D})|}
$$

### Optimization based Masking/Pruning

One may directly optimize the mask $\mathbf{c}$ in the optimization problem below:

$$
\begin{aligned}
\min_\mathbf{c} & \ \ \ \mathcal{L}(\mathbf{c} \odot \mathbf{w}_\text{init}; \mathcal{D}) = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}; \mathbf{c}\odot \mathbf{w}_\text{init}) - \mathbf{x}_i \|_2^2 \\
\text{s.t.} 
& \ \ \|\mathbf{c}\| \in \{0,1\}^m   , \ \ \ \|\mathbf{c}\|_0 \leq \kappa 
\end{aligned}
$$

while fixing the weight to its initialized value $\mathbf{w}_\text{init}$. 

We can optimize the binary mask $\mathbf{c}$ by optimizing its associated (continuos) weight $\mathbf{w}_c$, which can be converted to binary mask $\mathbf{c}$ in a stochastic way, 

$$
\mathbf{c}(\mathbf{w}_c) (i)  = \text{Bern}\big (p= \text{sigmoid}(\mathbf{w}_c (i))\big )\\
\mathbf{w}_c  \in \mathbb{R}^m
$$

or in a non-stochastic way

$$
\mathbf{c}(\mathbf{w}_c )(i) = 
\begin{cases}
1&\ \ \text{if } \mathbf{w}_c (i) \geq \mathbf{w}_{\text{th}} \\
0&\ \ \text{if } \mathbf{w}_c (i) < \mathbf{w}_{\text{th}}.
\end{cases}
$$

These methods are called **supermask** training method. One of the advantage of supermask training is that, we can directly minimize any kind of objective function we'd like to optimize only by pruning. 

To summarize, we can enforce the sparsity (obtain the mask $\mathbf{c}$) by the following methods:
{:.gray_no_border}

2. **Magnitude based pruning**: train the network with conventional training procedure, and then prune the weights with small magnitudes. 
4. **Hessian based pruning**: train the network with conventional training procedure, and then prune the weights with small Hessians. 
5. **SNIP** : estimate the effect of individual weights on loss, and prune the connections that has small effect on loss. 
5. **Supermask** : directly the optimize the mask $\mathbf{c}$ to minimize the loss while fixing the weight $\mathbf{w}$



## Baseline Experiment

### Experiment Setting

We will use MNIST hold-out experiment to test our hypothesis. (e.g. If we hold-out MNIST 1, our inlier data is the set of images including MNIST $0,2,3,\cdots,9$, and we will treat MNIST 1 images as an outlier)

Regarding the network architecture, will use a convolutional autoencoder with $D_z = 17$. 

<center><img src="https://live.staticflickr.com/65535/51131302801_680e533339_o.png" alt="image-20210422222410214" style="zoom:50%;" /></center>

### AUROC of $f(\cdot \ ; \mathbf{w}_{\text{base}})$ 

In this section, we will first check the baseline results corresponding to the baseline weight $\mathbf{w}_{\text{base}}$ that optimizes the following unconstrained optimization problem.

$$
\begin{aligned}
   \mathbf{w}_{\text{base}} = \arg \min_\mathbf{w} & \ \ \ \mathcal{L}(\mathbf{w}; \mathcal{D}) = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}_i; \mathbf{w}) - \mathbf{x}_i \|_2\\
   \text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^m
   \end{aligned}
$$

We optimized above problem by Adam optimizer with learning rate 0.0001 and batch size 128.

<center><img src="https://live.staticflickr.com/65535/51132526223_a0928c088f_o.png" alt="image-20210423085150199" style="zoom:50%;" /></center>



### AUROC of $f(\cdot \ ;\mathbf{w}_{\text{reg}})$

Now, we will first check the regularized results corresponding to the regularized weight $\mathbf{w}_{\text{reg}}$ that optimizes the following optimization problem.

$$
\begin{aligned}
\mathbf{w}_{\text{reg}} = \arg\min_\mathbf{w} & \ \ \ \mathcal{L}(\mathbf{w} ; \mathcal{D}) + \gamma \|\mathbf{w}\|_2 ^2 = \frac{1}{N}\sum_{i=1}^N \|f(\mathbf{x}; \mathbf{w}) - \mathbf{x}_i \|_2^2 + \gamma \|\mathbf{w}_{\text{enc}}\|_2 ^2\\
\text{s.t.} & \ \ \ \mathbf{w}\in \mathbb{R}^n \\
\end{aligned}
$$

In this case, I will regularize only the encoder weights with regularizing constant $\gamma = 0.0001$. 

<center><img src="https://live.staticflickr.com/65535/51133089564_15249f4420_o.png" alt="image-20210423085045940" style="zoom:50%;" /></center>





## Sparsifying the Autoencoder

### Weight based Pruning

This procedure can be either done in **one-shot:**

1. pretrain the weights
2. prune $p\%$ of the weights with small magnitude
3. finetune the remaining $(100-p)\%$ of the weights, fixing the pruned weights to zero. 

or in an **iterative process:**

1. pretrain the weights
2. leave $(1-p)^{1/n}\%$ of the weights with large magnitude $\iff$ prune $\big (1- (1-p)^{1/n}\big)\%$ of the weights wit small magnitude
3. finetune the remaining weights, fixing the pruned weights to zero.
4. repeat step 2 and 3 $n$ times, and achieve $p\%$ pruning ratio.

For faster experiments, I used one-shot pruning method:



### Hessian based Pruning






