---
title: "[Control Theory] Kalman Filter Tutorial"
tags: Control Theory/Survey Tutorial
permalink: "/notion_to_markdown/%5BTutorial%5D%20Kalman%20Filter%20Applications%20cc2de64bc6e14a9c9129c72f8085032c/"
comments: true
show_subscribe: false
---

## Kalman Filter

### Problem Statement

- Vehicle state, position, velocity estimated from IMU / GNSS
- Three dimensional position and velocity comprise the state vector

    $$\mathbf{x}=[\mathbf{p}^T, \mathbf{v}^T ] ^T$$

    where $\mathbf{p}= [p_x, p_y, p_z]^T$ and $\mathbf{v}= [v_x, v_y, v_z ] ^T$ are each position and velocity vector

- The state in time $k$ can be predicted by the previous state in time $k-1$ as

    $$\mathbf{x}_k = \begin{bmatrix} \mathbf{p}_k \\ \mathbf{v}
    _k \end{bmatrix} = \begin{bmatrix} \mathbf{p}_{k-1}+\mathbf{v}_{k-1} \Delta t + \frac{1}{2}\tilde {\mathbf{a}}_{k-1}\Delta t^2  \\ \mathbf{v}_{k-1}+ \tilde {\mathbf{a}}_{k-1} \Delta t \end{bmatrix}$$

    where $\tilde {\mathbf{a}}\_{k-1}$ is the **real** acceleration applied to the vehicle. 

- Above equation can be rewritten as:

    $$\mathbf{x}_k = \begin{bmatrix} \mathbf{p}_k \\ \mathbf{v}_k \end{bmatrix} = \begin{bmatrix} \mathbf{I}_{3\times 3}&\mathbf{I}_{3\times 3}\Delta t\\ \mathbf{O}_{3\times3}&\mathbf{I}_{3\times 3} \end{bmatrix} \begin{bmatrix} \mathbf{p}_{k-1} \\ \mathbf{v}_{k-1} \end{bmatrix} + \begin{bmatrix} \frac{1}{2}\mathbf{I}_{3\times3}\Delta t ^2 \\ \mathbf{I}_{3\times3}\Delta t\end{bmatrix}\tilde {\mathbf{a}}_{k-1}\\\mathbf{x}_k = \begin{bmatrix} \mathbf{I}_{3\times 3}&\mathbf{I}_{3\times 3}\Delta t\\ \mathbf{O}_{3\times3}&\mathbf{I}_{3\times 3} \end{bmatrix} \mathbf{x}_{k-1}+ \begin{bmatrix} \frac{1}{2}\mathbf{I}_{3\times3}\Delta t ^2 \\ \mathbf{I}_{3\times3}\Delta t\end{bmatrix}\tilde {\mathbf{a}}_{k-1}$$

- Defining

    $$\mathbf{F}=\begin{bmatrix} \mathbf{I}_{3\times 3}&\mathbf{I}_{3\times 3}\Delta t\\ \mathbf{O}_{3\times3}&\mathbf{I}_{3\times 3} \end{bmatrix} \\ \mathbf{B}=\begin{bmatrix} \frac{1}{2}\mathbf{I}_{3\times3}\Delta t ^2 \\ \mathbf{I}_{3\times3}\Delta t\end{bmatrix}$$

    we can rewrite the equation above

    $$\mathbf{x}_k = \mathbf{F}\mathbf{x}_{k-1} + \mathbf{B} \tilde {\mathbf{a}}_{k-1}$$

- Note that the acceleration (measured by the accelerometer) has a process noise

    $$\mathbf{a}_{k-1} = \tilde {\mathbf{a}}_{k-1} + \mathbf{e}_{k-1}$$

    where $\mathbf{e}_{k-1}$ denotes the noise of the accelerometer output. 

- Then, we can rewrite the equation

    $$\mathbf{x}\_k = \mathbf{F}\mathbf{x}_{k-1} + \mathbf{B} \mathbf{a}_{k-1} - \mathbf{B} \mathbf{e}_{k-1}$$

- Let's assume $\mathbf{e}\_{k-1} \sim \mathcal{N}(\mathbf{0}, \mathbf{I}\_{3\times 3} \sigma \_e ^2)$. Then, the covariance matrix of process noise $\mathbf{B}\mathbf{e}\_{k-1}$ can be calculated using $\text{cov}(\mathbf{Ax})=\mathbf{A}\text{cov}(\mathbf{x})\mathbf{A}^T$

    $$\mathbf{Q}= \mathbf{B}\sigma_e^2 \mathbf{B}^T = \begin{bmatrix} \frac{1}{4}\mathbf{I}_{3\times 3}\Delta t^4 & \mathbf{0}_{3\times 3} \\\mathbf{0}_{3\times 3}& \mathbf{I}_{3\times 3} \Delta t^2\end{bmatrix}\sigma_e^2$$

### Process Model

- Now, we have the process model

    $$\mathbf{x}_{k}= \mathbf{Fx}_{k-1} + \mathbf{B}\mathbf{a}_{k-1} + \mathbf{w}_{k-1}$$

    where $\mathbf{F}$ and $\mathbf{B}$ is defined above, and $\mathbf{w}_{k-1} \sim \mathcal{N}(0, \mathbf{Q})$

- Now, the GNSS reciever provides the position and velocity measurement corrupted by measurement noise $\mathbf{v}_{k}$

    $$\mathbf{z}_{k}= \begin{bmatrix} \mathbf{p}_k \\ \mathbf{v}_k \end{bmatrix}+ \mathbf{v}_k$$

    which can be rewritten as

    $$\mathbf{z}_k = \mathbf{Hx}_k + \mathbf{v}_k $$

    where

    $$\mathbf{H}= \mathbf{I}_{6\times 6}\\ \mathbf{v}_k \sim \mathcal{N}(0, \mathbf{R})$$

### Simulation

- To conduct a simulation, consider $N=20$  time steps ($k=1,2,\cdots,N$)
- First generate the series of true accelerations over time → integrate to get true velocity & position
    - In this example, set the true acceleration as zero, and a constant velocity $\mathbf{v}_k = [5,5,0]^T$ and initial position $\mathbf{p}_0 = [0,0,0]^T$
- Generate noise of the acceleration output → set variance of $0.3^2$

    $$\mathbf{Q}= \begin{bmatrix} \frac{1}{4}\mathbf{I}_{3\times 3}\Delta t^4 & \mathbf{0}_{3\times 3} \\\mathbf{0}_{3\times 3}& \mathbf{I}_{3\times 3} \Delta t^2\end{bmatrix}0.3^2 $$

- Generate noise of the GNSS measurements
    - GNSS position measurement → set variance of $3^2$
    - GNSS velocity measruement → set variance of $0.03^2$

    $$\mathbf{R}= \begin{bmatrix} \mathbf{I}_{3\times 3}3^2 & \mathbf{0}_{3\times 3}\\ \mathbf{0}_{3\times 3} & \mathbf{I}_{3\times 3}0.03^2 \end{bmatrix}$$

    Have in mind that in real applications, we do not know the real statistics of the noises and the noises are often not Gaussian. Common practice is to conservatively set $\mathbf{Q}$ and $\mathbf{R}$ slightly larger than the expected values to get robusteness. 

- Start with an initial guess:

    $$\hat {\mathbf{x}}_0 = [2,-2,0,5,5.1,0.1]^T \\ \mathbf{P}_0 = \begin{bmatrix} \mathbf{I}_{3\times 3}4^2 & \mathbf{0}_{3\times 3} \\ \mathbf{0}_{3\times 3} & \mathbf{I}_{3\times 3}0.4^2\end{bmatrix}$$

### Python Implementation of KF

```python
import numpy as np
import matplotlib.pyplot as plt
from numpy.linalg import inv

np.random.seed(0)
def kalman_filter(z_meas, x_esti, P):
    """Kalman Filter Algorithm."""
    # (1) Prediction.
    x_pred = A @ x_esti
    P_pred = A @ P @ A.T + Q

    # (2) Kalman Gain.
    K = P_pred @ H.T @ inv(H @ P_pred @ H.T + R)

    # (3) Estimation.
    x_esti = x_pred + K @ (z_meas - H @ x_pred)

    # (4) Error Covariance.
    P = P_pred - K @ H @ P_pred

    return x_esti, P
```

## Extended Kalman Filter

### Target Tracking

- We are going to estimate a 3-dimensional target state (position and velocity) by using measurements provided by a range sensor and an angle sensor → ex) Radar system can provide range and angle measurement
- Define target state as

    $$\mathbf{x}=[\mathbf{p}^T, \mathbf{v}^T ] ^T$$

### System Model

- System model is described as a near-constant-velocity model

    $$\mathbf{x}_k = \begin{bmatrix} \mathbf{p}_k \\ \mathbf{v}_k \end{bmatrix} = \mathbf{f}(\mathbf{x}_{k-1}, \mathbf{w}_{k-1})=\begin{bmatrix} \mathbf{p}_{k-1}+\mathbf{v}_{k-1} \Delta t   \\ \mathbf{v}_{k-1}\end{bmatrix}+ \mathbf{w}_{k-1}$$

    where the process noise has the covariance of $\mathbf{w}_{k-1} \sim \mathcal{N}(0, \mathbf{Q})$

- Measurement vector is composed of line-of-sight angles to the target

<center><img src="Untitled.png" width="500"></center>

Measurement has nonlinear relationship with the target state → cannot be expressed in a matrix form → apply EKF → take first derivatives of the process model

<center><img src="Untitled%201.png" width="500"></center>