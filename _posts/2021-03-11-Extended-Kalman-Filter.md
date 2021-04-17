---
title: "[Control Theory] Extended/Unscented Kalman Filter"
tags: Control Theory/Survey
permalink: "/notion_to_markdown/%5BTheory%5D%20Extended%20Unscented%20Kalman%20Filter%20fdfb8f055fb740eb9d4433c806f68fde/"
comments: true
---


## Introduction

- UKF belongs to a bigger class of filters called Sigma-Point Kalman Filters / Linear Regression Kalman Filters → using **statistical lineraization technique**.

    **Statistical linearization technique** = technique that linearizes a nonlinear function of a random variable through a linear regression between $n$ points drawn from the prior distribution of the random variable. 

- Similar line of filters include..
    1. The Central Difference Kalman Filter (CDKF)
    2. The Divided Difference Filter (DDF)
    3. Square-Root alternatives of UKF and CDKF
- In EKF, the state distribution is propagated analytically through the **first-order linearization** )(by derivative) of the nonlinear system. → posterior mean and covariance could be corrupted.
- The UKF, a derivative-free alternative to EKF, overcomes this problem by using a deterministic sampling approach.

## Extended Kalman Filter

In extended Kalman filter, the state transition and observation models don't need to be linear functions, but may instead be differentiable functions. 

$$\mathbf{x}_k = f(\mathbf{x}_{k-1} , \mathbf{u}_k ) + \mathbf{w}_k  \\ \mathbf{z}_k = h (\mathbf{x}_k) + \mathbf{v}_k $$

where $\mathbf{w}_k \sim \mathcal{N}(0, \mathbf{Q}_k )$  and $\mathbf{v}_k \sim \mathcal{N}(0, \mathbf{R}_k )$. 

In this case, we first cannot calculate ethe error covariance matrix term efficiently: since the error itself isn't Gaussian anymore. 

$$\hat {\mathbf{x}}_k = \hat {\mathbf{x}}_k ' + \mathbf{K}_k (h( \mathbf{x}_k) + \mathbf{v}_k  - h(\hat {\mathbf{x}}_k '))\\ \hat {\mathbf{x}}_k - \mathbf{x}_k = (\hat {\mathbf{x}}_k ' - \mathbf{K}_k h(\hat{ \mathbf{x}}_k ' )) +(\mathbf{K}_k h (\mathbf{x}_k )-\mathbf{x}_k  )+ \mathbf{K}_k \mathbf{v}_k $$

Extended Kalman Filter(EKF) approximates the non-linear function as a linear function by taking the first order Jacobian: the state transition and observation matrices are defined to be the following Jacobians.

$$\mathbf{F}_k = \frac{\partial f}{\partial \mathbf{x}}\Big |_{\hat {\mathbf{x}}_{k-1} , \mathbf{u}_k}\\ \mathbf{H}_k = \frac{\partial h}{\partial \mathbf{x}}\Big|_{\hat {\mathbf{x}}_k'}$$

### Predict

- Predict a priori state estimate : $\hat {\mathbf{x}}\_k '  = f(\hat {\mathbf{x}}\_{k-1},\mathbf{u}\_k)$
- Predict a priori covariance estimate : $\mathbf{P}\_k ' = \mathbf{F}\_k \mathbf{P}\_{k-1}\mathbf{F}\_k ^T + \mathbf{Q}\_k$

### Update

- Updated a posteriori state estimate : $\hat {\mathbf{x}}\_k = \hat {\mathbf{x}}\_k ^\prime + \mathbf{K}\_k (\mathbf{z}\_k - h(\hat {\mathbf{x}}_k ^\prime))$
- Updated a posteriori covariance estimate : $\mathbf{P}\_k = (\mathbf{I}- \mathbf{K}\_k \mathbf{H}\_k)\mathbf{P}\_k^\prime$
- Near-Optimal Kalman Gain : $\mathbf{K}\_k = \mathbf{P}\_k ^\prime \mathbf{H}\_k^T (\mathbf{H}\_k\mathbf{P}\_k ^\prime \mathbf{H}\_k^T + \mathbf{R}\_k)^{-1}$

Note that extended Kalman filter is not an optimal estimator. 

## UKF Algorithm

The UKF addresses the approximation issues with the EKF. The state distribution is specified using a minimal set of carefully chosen sample points. These sample points completely capture the true mean and covariance of the Gaussian Random Variable (GRV), and when propagated through the true non-linear system, captures the posterior mean and covariance accruately to the 3rd order for any nonlinearlity. 

### Unscented Transformation (UT)

Unscented Transformation is a method for calculating the statistics of a random variable which undergoes a nonlinear transformation. Consider propagating a random variable $\mathbf{x}$ with dimension $L$ through a nonlinear function 

$$\mathbf{y}=g(\mathbf{x}).$$

Let's assume that $\mathbf{x}$ has mean $\bar {\mathbf{x}}$ and covariance $\mathbf{P_x}$. Now, to calculate the statistics of $\mathbf{y}$, we form a matrix $\mathcal{X}$ of $2L+1$ sigma vectors $\mathcal{X}_i$  with corresponding weights $W_i$ 

<center><img src="Untitled.png" width="450"></center>

- Scaling parameter : $\lambda = \alpha^2 (L+ \kappa )- L$ 
- Parameter determining the spread of sigma points around $\bar {\mathbf{x}}$ : $\alpha$
- Secondary scaling parameter : $\kappa$
- Incorporate prior knowledge about the distribution : $\beta$

Now, these sigma vectors are propagated through the nonlinear function

$$\mathcal{Y}_i = g(\mathcal{X}_i) \ \ \ \text{for } i=0, \cdots, 2L$$

and the mean and covariance for $\mathbf{y}$ are approximated using a weighted sample mean and covariance of the **posterior sigma points** $\mathcal{Y}_i$ . 

$$\bar {\mathbf{y}} \approx \sum_{i=0}^{2L} W_i ^{(m)}\mathcal{Y}_i \\ \mathbf{P_y} \approx \sum_{i=0}^{2L}W_i^{(c)}\{ \mathcal{Y} - \bar {\mathbf{y}}_i \} \{\mathcal{Y}_i - \bar {\mathbf{y}}\}^T$$

- Comparison with Monte-Carlo Sampling : UT needs much less sampling points
- For non Gaussian inputs, approximations are accurate up to the second order. 

<center><img src="Untitled%201.png" width="450"></center>

### State-Space System

- Basic framework of EKF (note that it is no longer a linear system)

$$\mathbf{x}_{k+1} = \mathbf{F}(\mathbf{x}_k , \mathbf{v}_k)\\ \mathbf{y}_k = \mathbf{H}(\mathbf{x}_k , \mathbf{n}_k)$$

- $\mathbf{x}_k$  represent the unobserved state of the system, $\mathbf{y}_k$ is the only observed signal.
- The process noise $\mathbf{v}_k$  drives the dynamic system, and the observation noise is given by $\mathbf{n}_k$
- **We are not assuming the additivity of noises**.
- System dynamic model $\mathbf{F}$ and $\mathbf{H}$ are assumed known.

### Unscented Kalman Filter Algorithm

1. **Define:**

    $$\mathbf{x}_k^a = [ \mathbf{x}_k ^T \ \ \mathbf{v}_k ^T \ \ \mathbf{n}_k^T]^T\\ \mathcal{X}_k ^a = [(\mathcal{X}_k ^x)^T\ \ (\mathcal{X}_k ^v)^T\ \ (\mathcal{X}_k ^n)^T]^T$$

    and $\mathbf{P_v}$ as the process noise covariance matrix, and $\mathbf{P_n}$ as the measurement noise covariance matrix. 

2. **Initialize with:**

    $$\hat {\mathbf{x}}_0 = \mathbb{E}[\mathbf{x}_0 ]\\ \mathbf{P}_0 = \mathbb{E}[ (\mathbf{x}_0 - \hat{ \mathbf{x}}_0 )(\mathbf{x}_0 - \hat {\mathbf{x}}_0 )^T] $$

    $$\mathbf{x}_0^a = \mathbb{E}[\mathbf{x}^a ] = [\hat {\mathbf{x}}_0 ^T \ \ 0 \ \  0 ] ^T\\ \mathbf{P}_0 ^a = \mathbb{E}[(\mathbf{x}_0^a-\hat {\mathbf{x}}_0^a)(\mathbf{x}_0^a-\hat {\mathbf{x}}_0^a)^T] = \begin{bmatrix}\mathbf{P_0}&0&0\\0&\mathbf{P_v}&0\\0&0&\mathbf{P_n} \end{bmatrix}$$

3. **Calculate the sigma points** : $\mathcal{X}_{k-1}^a$
4. **Time Update :** 
    - Pass the sigma points through $\mathbf{F}$ : $\mathcal{X}\_{k \vert k-1}^x = \mathbf{F} (\mathcal{X}\_{k-1}^x, \mathcal{X}\_{k-1}^v)$
    - Estimate the state using the posterior sigma points : $\hat {\mathbf{x}}\_k ' = \sum\_{i=0}^{2L} W_i ^{(m)} \mathcal{X}\_{i,k \vert k-1}^x$
    - Estimate the covariance : $\mathbf{P}\_k ' = \sum\_{i=0}^{2L}W_i ^{(c)}[\mathcal{X}\_{i,k \vert k-1}^x- \hat {\mathbf{x}}\_k ' ] [\mathcal{X}\_{i,k \vert k-1}^x - \hat {\mathbf{x}}\_k ' ] ^T$
    - Pass the sigma points through $\mathbf{H}$ : $\mathcal{Y}\_{k \vert k-1} = \mathbf{H}[\mathcal{X}\_{k \vert k-1}^x, \mathcal{X}\_{k-1}^n]$
    - Estimate the observation: $\hat {\mathbf{y}}\_k ' = \sum\_{i=0}^{2L} W\_i^{(m)}\mathcal{Y}\_{i,k \vert k-1}$
5. **Measurement update equations** : 

    <center><img src ="Untitled%202.png" width="450"></center>

## References

[https://www.cs.ubc.ca/~murphyk/Papers/Julier_Uhlmann_mar04.pdf](https://www.cs.ubc.ca/~murphyk/Papers/Julier_Uhlmann_mar04.pdf)