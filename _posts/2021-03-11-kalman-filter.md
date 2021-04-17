---
title: "[Control Theory] Kalman Filter"
tags: Control Theory/Survey
permalink: "/notion_to_markdown/kalman-filter/"
comments: true
---

## Introduction

Kalman filters are used to estimate states based on linear dynamical systems in state-space format. 

$$\mathbf{x}_k  = \mathbf{F}_k \mathbf{x}_{k-1} + \mathbf{B}_k \mathbf{u}_{k-1}+\mathbf{w}_{k-1}$$

where $ \mathbf{x}\_{k} $ is the state vector, $\mathbf{F}$ is the state transitiion matrix, $\mathbf{B}$ is the control-input matrix, and $\mathbf{w}\_{k-1}$ is the process noise vector that is assumed to be zero-mean Gaussian with the covariance $\mathbf{Q}\_k$, i.e., $\mathbf{w}\_{k-1}\sim \mathcal{N}(0,\mathbf{Q}\_k)$.

This process model is paried with thte measurement model that describes the relationship between the state and the measurement at the current time step $k$ as:

$$\mathbf{z}_k = \mathbf{H}_k \mathbf{x}_k + \mathbf{v}_k $$

where $\mathbf{z}_k$ is the measurement vector, $\mathbf{H}_k$ is the measurement matrix, and $\mathbf{v}_k$ is the measurement noise vector that is assumed to be zero-mean Gaussian with the covariance $\mathbf{R}_k$, i.e., $\mathbf{v}_k \sim \mathcal{N}(0,\mathbf{R}_k
)$.

Recall the definition of covariance matrix:  $\mathbb{E}[\mathbf{v}_k\mathbf{v}_k^T]=\mathbf{R}_k$ and $\mathbb{E}[\mathbf{w}_k\mathbf{w}_k^T]=\mathbf{Q}_k$

## What is a Kalman Filter?

The role of Kalmn filter is to provide an **optimal** estimate of $\mathbf{x}_k$ at time $k$, given the initial estimate of $\mathbf{x}_0$, the series of measurement $\mathbf{z}_1, \mathbf{z}_2, \cdots, \mathbf{z}_k$, and the information of the system described by the matrices $\mathbf{F},\mathbf{B},\mathbf{H},\mathbf{Q}$ and $\mathbf{R}$. (If these matrices does not have subscripts, we are assuming that these are invariant over time, which is still a reasonable assumption in most cases.)

Note that the matrices $\mathbf{Q}$ and $\mathbf{R}$, associated with the noise vectors, cannot be precisely determined. Thus, $\mathbf{Q}$ and $\mathbf{R}$ are usually used as tuning parameters that the user can adjust to get desired performance. 

To summarize, Kalman Filter solves the problem stated below:

- **Given Information**
    - Matrices $\mathbf{F},\mathbf{B},\mathbf{H},\mathbf{Q}$ and $\mathbf{R}$ involved with the dynamic state-space system below

        $$\mathbf{x}_k  =\mathbf{F}_k \mathbf{x}_{k-1} + \mathbf{B}_k  \mathbf{u}_{k-1}+\mathbf{w}_{k-1} \\ \mathbf{z}_k = \mathbf{H} _k \mathbf{x}_k + \mathbf{v}_k $$

    - Initial Estimate of $\hat{\mathbf{x}}_0$
    - Series of measurement $\mathbf{z}_1, \mathbf{z}_2, \cdots, \mathbf{z}_k$
- **Objective** : **Optimally** Estimate the state $\hat{\mathbf{x}}_k$

## Optimal in what sense?

One might ask, "in what sense" should we determine whether our estimation is optimal or not? Thus, it might be necessary to define a **cost / loss function** that can measure how well a filter performs this estimation task. Indeed, we may define the goal of the filter to be the minimisation of such loss function. 

Our overall objective is to estimate $\mathbf{x}_k$. Thus, the difference between the estimate $\hat {\mathbf{x}}_k$ and $\mathbf{x}_k$ itself is termed as an error. The particular shape of loss function is dependent upon the application, while squared error function is most widely used. 

$$f(\mathbf{e}_k) = f(\mathbf{x}_k - \hat {\mathbf{x}}_k)= \|\hat {\mathbf{x}}_k -\mathbf{x}_k \|^2$$

Since it is necessary to consider the ability of the filter to predict many data over a period of time, a more meaningful  metric is the expected value of the error function:

$$\text{MSE}= \mathbb{E}\big(\|\hat {\mathbf{x}}_k - \mathbf{x}_k \|^2 \big)$$

Note that $\mathbf{P}_k$ is the error covariance matrix at time $k$

$$\mathbf{P}_k = \mathbb{E}[\mathbf{e}_k \mathbf{e}_k ^T] = \mathbb{E} \big [(\hat {\mathbf{x}}_k - \mathbf{x}_k )(\hat {\mathbf{x}}_k - \mathbf{x}_k )^T \big ]$$

## Kalman Filter Derivation

### Deriving the posteriori estimate covariance matrix

Assuming the prior estimate of $\hat {\mathbf{x}}_k$ as $\hat {\mathbf{x}}_k'$, it is possible to write an update the equation for the new estimate, combining the old estimate $\hat {\mathbf{x}}_k'$ with new measurement $\mathbf{z}_k$

$$\hat {\mathbf{x}}_k = \hat {\mathbf{x}}_k ' + \mathbf{K}_k (\mathbf{z}_k - \mathbf{H}_k\hat {\mathbf{x}}_k ')$$

where $\mathbf{K}_k$  is the Kalman gain, and the term $\mathbf{z}_k - \mathbf{H}\hat {\mathbf{x}}_k '$ is known as the **innovation** or **measurement residual**. 

$$\mathbf{i}_k = \mathbf{z}_k - \mathbf{H}_k\hat {\mathbf{x}}_k '$$

Our first goal is to find out the Kalman gain matrix $\mathbf{K}_k$!

Rewriting the equation above:

$$\hat {\mathbf{x}}_k = \hat {\mathbf{x}}_k ' + \mathbf{K}_k (\mathbf{H}_k \mathbf{x}_k + \mathbf{v}_k  - \mathbf{H}_k\hat {\mathbf{x}}_k ')\\ \hat {\mathbf{x}}_k - \mathbf{x}_k = (\mathbf{K}_k \mathbf{H}_k-\mathbf{I})(\mathbf{x}_k - \hat {\mathbf{x}}_k')+\mathbf{K}_k \mathbf{v}_k$$

Substituting above equation into the error covariance matrix term:

$$\mathbf{P}_k  =\mathbb{E} \Big [\big[ (\mathbf{I}-\mathbf{K}_k \mathbf{H}_k)(\mathbf{x}_k - \hat {\mathbf{x}}_k ') -\mathbf{K}_k \mathbf{v}_k \big ]\\  \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \big[ (\mathbf{I}-\mathbf{K}_k \mathbf{H}_k)(\mathbf{x}_k - \hat {\mathbf{x}}_k ') -\mathbf{K}_k \mathbf{v}_k \big ]^T \Big ]$$

Note that $\mathbf{x}_k - \hat {\mathbf{x}}_k '$  is the error of the prior estimate. Defining $P_k '$  is the prior estimate of $P_k$ :

$$\mathbf{P}_k = (\mathbf{I}- \mathbf{K}_k \mathbf{H}_k)\  \mathbb{E}[ (\mathbf{x}_k - \hat {\mathbf{x}}_k ')(\mathbf{x}_k - \hat {\mathbf{x}}_k ')^T](\mathbf{I}-\mathbf{K}_k \mathbf{H}_k)^T + \mathbf{K}_k \mathbb{E}[v_k v_k ^T] \mathbf{K}_k ^T $$

$$ \mathbf{P}_k = (\mathbf{I}-\mathbf{K}_k \mathbf{H}_k) \ \mathbf{P}_k '   \ (\mathbf{I}-\mathbf{K}_k \mathbf{H}_k)^T + \mathbf{K}_k \mathbf{R} \mathbf{K}_k ^T$$

Expanding above equation:

$$\mathbf{P}_k = \mathbf{P}_k ' -\mathbf{K}_k \mathbf{H}_k\mathbf{P}_k ' - \mathbf{P}_k ' \mathbf{H}_k^T \mathbf{K}_k ^T + \mathbf{K}_k (\mathbf{H}_k\mathbf{P}_k ' \mathbf{H}_k^T + \mathbf{R}_k)\mathbf{K}_k ^T$$

### Deriving the Kalman Gain

Since this Kalman filter is trying to minimze the expected value of MSE  $\mathbb{E}\big(\|\hat {\mathbf{x}}_k - \mathbf{x}_k \|^2 \big)$, which is equivalent to **minimizing the trace of $\mathbf{P}_k$**, we can find out the optimal Kalman gain $\mathbf{K}_k$ by taking the derivative with repsect to $\mathbf{K}_k$.

$$\frac{\partial \ \text{tr}(\mathbf{P}_k )}{\partial \mathbf{K}_k } = -2(\mathbf{H}_k \mathbf{P}_k')^T + 2\mathbf{K}_k (\mathbf{H}_k\mathbf{P}_k ' \mathbf{H}_k^T + \mathbf{R}_k)=0$$

Solving this for $\mathbf{K}_k$ gives us the optimal Kalman gain:

$$\mathbf{K}_k = \mathbf{P}_k ' \mathbf{H}_k^T (\mathbf{H}_k\mathbf{P}_k ' \mathbf{H}_k^T + \mathbf{R}_k)^{-1}$$

Defining 

$$\mathbf{S}_k = \mathbf{H}_k\mathbf{P}_k ' \mathbf{H}_k^T + \mathbf{R}_k,$$

we can further simplify the equation

$$\mathbf{K}_k = \mathbf{P}_k ' \mathbf{H}_k^T \mathbf{S}_k ^{-1}$$

which can be alternatively written as follows. 

$$\mathbf{K}_k \mathbf{S}_k \mathbf{K}_k ^T = \mathbf{P}_k ' \mathbf{H}_k^T \mathbf{K}_k ^T$$

Now, the formula for posteriroi error covariance $\mathbf{P}_k$ being

$$\mathbf{P}_k = \mathbf{P}_k ' -\mathbf{K}_k \mathbf{H}_k\mathbf{P}_k ' - \mathbf{P}_k ' \mathbf{H}_k^T \mathbf{K}_k ^T + \mathbf{P}_k ' \mathbf{H}_k^T \mathbf{K}_k ^T  = (\mathbf{I}- \mathbf{K}_k \mathbf{H}_k)\mathbf{P}_k' $$

Note that this formula is computationally cheaper, and thus almost always used in practice, but it is only correct in case where $\mathbf{K}_k$  is defined as an optimal Kalman gain.

### Obtaining the a priori estimated state / covariance

First, the a priori state estimation is obtained by ignoring the noice vector $\mathbf{w}_{k-1}$  term in the governing equation at the top. 

$$\hat {\mathbf{x}}_{k+1}' = \mathbf{F}_k \hat {\mathbf{x}}_{k}+ \mathbf{B}_k \mathbf{u}_k$$

To complete the recursion, we have to calculate the error covariance matrix as well. First, let's find out the a priori error term. 

$$\mathbf{e}_{k+1}' = \mathbf{x}_{k+1} - \hat {\mathbf{x}}_{k+1}' \\ \mathbf{e}_{k+1}'= (\mathbf{F}_k \mathbf{x}_k + \mathbf{B}_k \mathbf{u}_k + \mathbf{w}_k ) \ - \ (\mathbf{F}_k \hat {\mathbf{x}}_k + \mathbf{B}_k \mathbf{u}_k )\\ \mathbf{e}_{k+1}'= \mathbf{F}_k \mathbf{e}_k + \mathbf{w}_k $$

Now, let's 

$$\mathbf{P}_{k+1} '= \mathbb{E}[\mathbf{e}_{k+1}' \mathbf{e}_{k+1}'^{\ T}] = \mathbb{E}[ (\mathbf{F}_k \mathbf{e}_k + \mathbf{w}_k )(\mathbf{F}_k \mathbf{e}_k + \mathbf{w}_k )^T ]\\ \mathbf{P}_{k+1} '= \mathbf{F_k }\mathbb{E}[\mathbf{e}_k \mathbf{e}_k ^T] \mathbf{F}_k ^T + \mathbb{E} [ \mathbf{w}_k \mathbf{w}_k ^T] \\ \mathbf{P}_{k+1} '=\mathbf{F}_k \mathbf{P}_k \mathbf{F}_k ^T + \mathbf{Q}_k $$

## Kalman Filter Algorithm

Kalman filter is a recursive algorithm, which needs only the **estimated state from the previous time step** and the **measurement at current time step** to estimate the **current state.** (No history estimations are required.)

The Kalman filter can be written as a single equation, however, it is most often conceptualized as two distinct phases: "Predict" and "Update". The predict phase uses the state estimate from the previous timestep to produce an estimate of the state at the current timestep. This predicted state estimate is also known as the a priori state estimate because, although it is an estimate of the state at the current timestep, it does not include observation information from the current timestep. In the update phase, the current a priori prediction is combined with current observation information to refine the state estimate. This improved estimate is termed the a posteriori state estimate.

### Predict

- Predict a priori state estimate : $\hat {\mathbf{x}}\_k '  = \mathbf{F}\_k \hat {\mathbf{x}}\_{k-1} + \mathbf{B}_k\mathbf{u}_k$
- Predict a priori covariance estimate : $\mathbf{P}\_k ' = \mathbf{F}\_k \mathbf{P}\_{k-1}\mathbf{F}\_k ^T + \mathbf{Q}\_k$

### Update

- Updated a posteriori state estimate : $\hat {\mathbf{x}}\_k = \hat {\mathbf{x}}_k ' + \mathbf{K}_k (\mathbf{z}_k - \mathbf{H}_k\hat {\mathbf{x}}_k ')$
- Updated a posteriori covariance estimate : $\mathbf{P}_k = (\mathbf{I}- \mathbf{K}_k \mathbf{H}_k)\mathbf{P}_k'$
- Optimal Kalman Gain : $\mathbf{K}_k = \mathbf{P}_k ' \mathbf{H}_k^T (\mathbf{H}_k\mathbf{P}_k ' \mathbf{H}_k^T + \mathbf{R}_k)^{-1}$

## Extended Kalman Filter

In extended Kalman filter, the state transition and observation models don't need to be linear functions, but may instead be differentiable functions. 

$$\mathbf{x}\_k = f(\mathbf{x}\_{k-1} , \mathbf{u}\_k ) + \mathbf{w}\_k  \\ \mathbf{z}\_k = h (\mathbf{x}\_k) + \mathbf{v}\_k $$

where $\mathbf{w}\_k \sim \mathcal{N}(0, \mathbf{Q}\_k )$  and $\mathbf{v}\_k \sim \mathcal{N}(0, \mathbf{R}\_k )$. 

In this case, we first cannot calculate ethe error covariance matrix term efficiently: since the error itself isn't Gaussian anymore. 

$$\hat {\mathbf{x}}_k = \hat {\mathbf{x}}_k ' + \mathbf{K}_k (h( \mathbf{x}_k) + \mathbf{v}_k  - h(\hat {\mathbf{x}}_k '))\\ \hat {\mathbf{x}}_k - \mathbf{x}_k = (\hat {\mathbf{x}}_k ' - \mathbf{K}_k h(\hat {\mathbf{x}}_k ' )) +(\mathbf{K}_k h (\mathbf{x}_k )-\mathbf{x}_k  )+ \mathbf{K}_k \mathbf{v}_k $$

Extended Kalman Filter(EKF) approximates the non-linear function as a linear function by taking the first order Jacobian: the state transition and observation matrices are defined to be the following Jacobians.

$$\mathbf{F}\_k = \frac{\partial f}{\partial \mathbf{x}}\Big |_{\hat {\mathbf{x}}_{k-1} , \mathbf{u}_k}\\ \mathbf{H}\_k = \frac{\partial h}{\partial \mathbf{x}}\Big|_{\hat {\mathbf{x}}_k'}$$

### Predict

- Predict a priori state estimate : $\hat {\mathbf{x}}\_k ^\prime  = f(\hat {\mathbf{x}}\_{k-1},\mathbf{u}\_k)$
- Predict a priori covariance estimate : $\mathbf{P}\_k ^\prime = \mathbf{F}\_k \mathbf{P}\_{k-1}\mathbf{F}\_k ^T + \mathbf{Q}\_k$

### Update

- Updated a posteriori state estimate : $\hat {\mathbf{x}}_k = \hat {\mathbf{x}}_k ^\prime + \mathbf{K}_k (\mathbf{z}_k - h(\hat {\mathbf{x}}_k '))$
- Updated a posteriori covariance estimate : $\mathbf{P}_k = (\mathbf{I}- \mathbf{K}_k \mathbf{H}_k)\mathbf{P}_k'$
- Nar-Optimal Kalman Gain : $\mathbf{K}_k = \mathbf{P}_k ' \mathbf{H}_k^T (\mathbf{H}_k\mathbf{P}_k ' \mathbf{H}_k^T + \mathbf{R}_k)^{-1}$

Note that extended Kalman filter is not an optimal estimator. 

[[Tutorial] Kalman Filter Applications](https://www.notion.so/Tutorial-Kalman-Filter-Applications-59df15d05fb14feebc087ebc2adc5730) 

## References

[https://en.wikipedia.org/wiki/Extended_Kalman_filter](https://en.wikipedia.org/wiki/Extended_Kalman_filter) 

[https://en.wikipedia.org/wiki/Kalman_filter](https://en.wikipedia.org/wiki/Kalman_filter)

[https://web.stanford.edu/~jduchi/projects/matrix_prop.pdf](https://web.stanford.edu/~jduchi/projects/matrix_prop.pdf)

[https://stanford.edu/class/ee363/lectures/ekf.pdf](https://stanford.edu/class/ee363/lectures/ekf.pdf) 

[https://www.seas.harvard.edu/courses/cs281/papers/unscented.pdf](https://www.seas.harvard.edu/courses/cs281/papers/unscented.pdf)

[https://perso.crans.org/club-krobot/doc/kalman.pdf](https://perso.crans.org/club-krobot/doc/kalman.pdf) 

[http://biorobotics.ri.cmu.edu/papers/sbp_papers/integrated3/kleeman_kalman_basics.pdf](http://biorobotics.ri.cmu.edu/papers/sbp_papers/integrated3/kleeman_kalman_basics.pdf)

[https://faculty.washington.edu/eeholmes/Files/Intro_to_kalman.pdf](https://faculty.washington.edu/eeholmes/Files/Intro_to_kalman.pdf)