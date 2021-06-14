---
title: "[RL Research] Multi Reward for Robot Arm Manipluation Task (2)"
tags: Reinforcement-Learning 
published: false
comment: true
---

## Review

### Naive Implementation (First-Attempt)

Remember, in the previous post, I made a simple change on the DDPG architecture to make the algorithm accept multiple rewards. This alteration was pretty simple: I just had to change the critic network to output multi-valued vector where $n$ is the number of rewards we are going to use. 

$$
Q(s,a | \theta^Q) = \begin{bmatrix} Q_1 \\
 \vdots \\ Q_n\end{bmatrix} \in \mathbb{R}^n
$$

```python
# define the actor network
class actor(nn.Module):
    def __init__(self, env_params):
        super(actor, self).__init__()
        self.max_action = env_params['action_max']
        self.fc1 = nn.Linear(env_params['obs'] + env_params['goal'], 256)
        self.fc2 = nn.Linear(256, 256)
        self.fc3 = nn.Linear(256, 256)
        self.action_out = nn.Linear(256, env_params['action'])

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))
        actions = self.max_action * torch.tanh(self.action_out(x))
        return actions

class critic(nn.Module):
    def __init__(self, env_params):
        super(critic, self).__init__()
        self.max_action = env_params['action_max']
        self.num_reward = env_params['num_reward']
        self.fc1 = nn.Linear(env_params['obs'] + env_params['goal'] + env_params['action'], 256)
        self.fc2 = nn.Linear(256, 256)
        self.fc3 = nn.Linear(256, 256)
        self.intermediate_q_out = nn.Linear(256, self.num_reward)
#         self.q_out = nn.Linear(self.num_reward, 1, bias=False)

    def forward(self, x, actions):
        x = torch.cat([x, actions / self.max_action], dim=1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))
        q_value = self.intermediate_q_out(x)
#         q_value = self.q_out(x)

        return q_value
```

Then I changed the loss function that is used for updating the critic network. While the original DDPG updated the critic network by solving the regression problem below

$$
\begin{aligned}
& y_i = r_i + \gamma Q'(s_{i+1}, \mu'(s_{i+1}|\theta^{\mu'})\big |\theta^{Q'})\\
& \theta ^Q \leftarrow \arg\min_{\theta^Q}\frac{1}{N} \sum_i \big [ y_i - Q(s_i,a_i | \theta^Q)\big ]^2,
\end{aligned}
$$

since we now have multiple rewards and a critic network that ouputs a vectorized output, I changed above equation as:

$$
\begin{aligned}
& y_i = r_i + \gamma Q'(s_{i+1}, \mu'(s_{i+1};\theta^{\mu'}) ;\theta^{Q'})\\
& \theta ^Q \leftarrow \arg\min_{\theta^Q}\frac{1}{N} \sum_i \big \| y_i - Q(s_i,a_i ; \theta^Q)\big \|^2
\end{aligned}
$$

Notice any difference? The term $$y_i - Q(s_i, a_i ; \theta^Q) $$ is no longer a scalar, but a vector of $\mathbb{R}^n$. Thus, most naive choice might be to take the norm of that vector. Fortunately, the original code automatically calculates the critic loss function as defined above. 

```python
target_q_value = torch.clamp(target_q_value, -clip_return, 0) 
# the q loss
real_q_value = self.critic_network(inputs_norm_tensor, actions_tensor)
critic_loss = (target_q_value - real_q_value).pow(2).mean()   # compute the loss as the norm of vector difference divided by number of reward n
```

### Results

Well, the results, in terms of both training speed and final performance, can be summarized by

$$
\text{Scalar Sparse Reward} > \text{Multiple(Vectorized) Dense Reward} > \text{Scalar Dense Reward}
$$

Usage of HER algorithm allowed the simplest sparse reward to do a good job on training the agent, while hand-crafted dense rewards just basically hindered the training process with its side effect of (a) incentivizing wrong actions and (b) inequivalence between the objective of maximizing the success rate and maximizing the expected (hand-crafted) reward. 

However, the effect of multiple vector-reward was not entirely adversarial: compared to scalar dense rewards, use of multiple (vectorized) reward allowed a faster training, and in some cases, better performance. 

<center><img src="https://live.staticflickr.com/65535/51199878309_be21fe9299_o.png" alt="image-20210524131624755" style="zoom:50%;" /></center>



## Second Attempt : Optimize the Worst-Case Scenario

### Deterministic Policy Gradient with Vectorized Q-function

In many cases, it is sufficient to use deterministic policy rather than complicated stochastic policy. 

$$
a= \mu(s;\theta) = \mu_\theta(s)
$$

However, in this case, it seems quite awkward to compute the gradient of certain functions. Why? Try to compute $p_\theta(\tau)$ in above equations! How should we replace the stochastic probability term $\pi_\theta(a_t \| s_t)$ with deterministic policy term, which basically isn't a probability distribution?

In fact, in deterministic policy setting, our objective function should be defined as

$$
J(\theta) = \mathbb{E}_{s\sim \rho^\mu} \bigg [ Q(s, \mu_\theta(s)) \bigg ] = \int_{\mathcal{S}}\rho^\mu(s)Q(s, \mu_\theta(s))ds
$$

where $\rho^\mu$ is basically the equivalent of $p_\theta(\tau)$ from the stochastic version policy gradient, defined as 

$$
\rho^\mu (s') = \int_{\mathcal{S}}\sum_{k=1}^\infty \gamma^{k-1}\rho_0 (s) \rho^\mu (s \rightarrow s', k) ds.
$$

At this point, we to accept vectorized Q-values, we might want to change the definition of $J(\theta)$ a bit. 

$$
J(\theta) = \mathbb{E}_{s\sim \rho^\mu} \bigg [ \min_i Q_i (s, \mu_\theta(s)) \bigg ] = \int_{\mathcal{S}}\rho^\mu(s)\min_i Q_i (s, \mu_\theta(s))ds
$$

Defining like above, we can make the algorithm to maximize the smallest Q-value component, which can lead to a better overall policy at the end. 

### Deep Deterministic Policy Gradient with vectorized Q-function (DDPG-VQ)

DDPG is the combination of DQN + DPG (Deterministic Actor-Critic). While the fundamental procedure mainly follows DPG's actor-critic algorithm, important techniques such as experience replay and frozen target network idea are also implemented into the DDPG algorithm. Now, we want to implement the multi-reward (vectorized Q-function) idea into this algorithm.

1. Initialize the critic network $$Q(s,a ; \theta^Q)$$ and actor network $$\mu(s;\theta^\mu)$$ with weights $\theta^Q$ and $\theta^\mu$. 

2. Motivated by DQN, introduce the **target-version of each network**: $Q'$ and $\mu'$. Initialize it with the same parameter. 

3. Motivated by DQN, introduce **replay buffer** $R$. Initialize it. 

4. for $M$ episodes... do

   1. Replacing the $\epsilon$-greedy policy (for better exploration), DDPG adds **random noise** $\mathcal{N}$ to the deterministic policy $\mu_\theta(s)$ for exploration. Initialize this random noise $\mathcal{N}$. 

      $$
      \mu'(s)  = \mu_\theta(s) + \mathcal{N}
      $$

   2. Starting from the initial observation state $s_1$, repeat for $T$ steps...

      1. Select action $$a_t = \mu(s_t ; \theta^\mu)+\mathcal{N}_t$$ 

      2. Execute selected action $a_t$ and observe reward $r_t$ and new state $s_{t+1}$. 

      3. Store the transition $(s_t, a_t, r_t, s_{t+1})$ in the replay buffer $R$. 

      4. (If sufficient samples are stored inside the replay buffer) sample a random minibatch of $N$ transitions from the buffer $R$. 

         $$
         (s_i, a_i, r_i, s_{i+1}) \ \ \ i=1, \cdots, N
         $$

      5. Solve the **(vector-to-vector)** regression problem and update the critic network : **Critic Part of DDPG**

         $$
         \begin{aligned}
         & y_i = r_i + \gamma Q'(s_{i+1}, \mu'(s_{i+1}|\theta^{\mu'})\big |\theta^{Q'})\\
         & \theta ^Q \leftarrow \arg\min_{\theta^Q}\frac{1}{N} \sum_i  \big  \| y_{i} - Q (s_i,a_i | \theta^Q)\big \|_2 ^2
         \end{aligned}
         $$

      6. **Compute backward propagation to maximize $$J(\theta)$$** 

      7. Motivated by DQN, but slightly changing the method, update the target in a **soft-manner**, **every step**.
      
         $$
         \theta^{Q'} \leftarrow \tau \theta^Q + (1-\tau)\theta^{Q'}\\
         \theta^{\mu'} \leftarrow \tau \theta^{\mu} + (1-\tau)\theta^{\mu'}
         $$

### Summary

To summarize, two main difference between original DDPG and **DDPG-VQ (ver 2.)** is

1. **Critic part :** while updating (solving the regression problem) the critic network using the target values by the target network, DDPG-VQ minimizes the maximum difference
   $$
   \begin{aligned}
   & y_i = r_i + \gamma Q'(s_{i+1}, \mu'(s_{i+1}|\theta^{\mu'})\big |\theta^{Q'})\\
   & \theta ^Q \leftarrow \arg\min_{\theta^Q}\frac{1}{N} \sum_i \big  \| y_{i} - Q (s_i,a_i | \theta^Q)\big \|_2^2
	\end{aligned}
   $$
   
2. **Actor part  :** perform gradient ascent to maximize $J(\theta)$, which is defined a bit differently.
   $$
   J(\theta) = \mathbb{E}_{s\sim \rho^\mu} \bigg [ \min_i Q_i (s, \mu_\theta(s)) \bigg ] = \int_{\mathcal{S}}\rho^\mu(s)\min_i Q_i (s, \mu_\theta(s))ds
   $$



### Result

- **FetchPush-v1**

<center><img src="https://live.staticflickr.com/65535/51199350553_199e54df18_o.png" alt="image-20210524134507529" style="zoom:40%;" /></center>

​		- **Demo videos at epoch 30, middle of training** 

<div style="width: 100%;">
  <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
  <center><iframe src="https://player.vimeo.com/video/554140583" width="400" height="300" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
    <figcaption>Trained with DDPG-VQ(ver2) using multiple (dense) rewards</figcaption><br>
        </center>
  </div>
  <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
  <center><iframe src="https://player.vimeo.com/video/554140947" width="400" height="300" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
    <figcaption>Trained with original DDPG using single (dense) reward</figcaption><br>
    </center>
  </div>
</div>














We can see that DDPG-VQ (ver2) performs way better than the original DDPG trained with dense rewards, also better than my first attempt, acheiving similar performance of **DDPG+HER+Sparse reward** combination. 

- **FetchPickAndPlace-v1**

<center><img src="https://live.staticflickr.com/65535/51198455152_0f3320c7be_o.png" alt="image-20210524140943160" style="zoom:37%;" /></center>

​	- **Demo videos** 

<div style="width: 100%;">
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px; "> 
<center>
<iframe src="https://player.vimeo.com/video/554145387" width="400" height="300" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<figcaption>DDPG-VQ(ver2) using multiple (dense) rewards</figcaption>
      </center>
</div>
<div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
<center>
<iframe src="https://player.vimeo.com/video/554146149" width="400" height="300" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<figcaption>DDPG-VQ(ver1) using multiple (dense) rewards</figcaption>
  </center>
</div>
</div>


<center>
<iframe src="https://player.vimeo.com/video/554145775" width="400" height="300" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<figcaption>original DDPG using single (dense) reward</figcaption>
  </center>


Similar thing happend in **FetchPickAndPlace** task, which was quite problematic in previous attempt. We can see that DDPG-VQ (ver2) trains achieves better  performance compared to other methods that use dense rewards. It also achieves similar performance of **DDPG+HER+Sparse reward** combination.  

- **FetchSlide-v1**

<center><img src="https://live.staticflickr.com/65535/51199411558_e5d6ced365_o.png" alt="image-20210524143946004" style="zoom:40%;" /></center>

Well, **FetchSlide** task was still problematic. No attempts neither exceeded the original performance or showed worse performance compared to the DDPG+HER+sparse reward combination. 

## Several Tweaks

### Hyper-parameter Tuning

Remeber we were using the reward function defined below?

$$
r(\mathbf{s,g}) = - \begin{bmatrix} \sqrt{[M,1,1] \mathbf{d}} \\ \sqrt{[1,M,1] \mathbf{d}} \\ \sqrt{[1,1,M]  \mathbf{d}} \end{bmatrix}
$$

We were constantly using $M=10$ for previous experiments, but we can tune this parameter $M$. 

<img src="https://live.staticflickr.com/65535/51202108873_2d03d3c391_o.png" alt="image-20210525181737649" style="zoom:40%;" />

We could observe that, appropriate combination of hyperparmeter $M$ (used in vector reward $r$) and DDPG-VQ-v2 leads to a better performance, exceeding the original DDPG+HER+sparse reward combination's performance. 



### Trying MAE loss for vector-to-vector regression

$$
\begin{aligned}
& y_i = r_i + \gamma Q'(s_{i+1}, \mu'(s_{i+1}|\theta^{\mu'})\big |\theta^{Q'})\\
& \theta ^Q \leftarrow \arg\min_{\theta^Q}\frac{1}{N} \sum_i  \big  \| y_{i} - Q (s_i,a_i | \theta^Q)\big \|_1
\end{aligned}
$$





## Third Attempt : Mapping to Scalar Q-value

### Mapping q-value vector to scalar with FC layers

```python
class critic(nn.Module):
    def __init__(self, env_params):
        super(critic, self).__init__()
        self.max_action = env_params['action_max']
        self.num_reward = env_params['num_reward']
        self.fc1 = nn.Linear(env_params['obs'] + env_params['goal'] + env_params['action'], 256)
        self.fc2 = nn.Linear(256, 256)
        self.fc3 = nn.Linear(256, 256)
        self.intermediate_q_out = nn.Linear(256, self.num_reward)
        self.out_fc1 = nn.Linear(self.num_reward, 256)
        self.out_fc2 = nn.Linear(256, 256)
        self.out_fc3 = nn.Linear(256, 1)

    def forward(self, x, actions):
        x = torch.cat([x, actions / self.max_action], dim=1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))
        x = self.intermediate_q_out(x)
#         q_value = self.q_out(x)

        return x#q_value

    def deep_forward(self, x, actions):
        x = torch.cat([x, actions / self.max_action], dim=1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))
        x = self.intermediate_q_out(x)
        x = F.relu(self.out_fc1(x))
        x = F.relu(self.out_fc2(x))
        x = self.out_fc3(x)

        return x

    def multi_to_single(self, x):
        x = F.relu(self.out_fc1(x))
        x = F.relu(self.out_fc2(x))
        x = self.out_fc3(x)

        return x
```

Unlike the previous attempts where the critic network gave out vectorized-q values, in this case, i made the critic network to output scalar q-values (if the user wants to), mapping the vectorized q-values into a scalar value using multiple **fully-connected** layers. 

```python
    def multi_to_single(self, x):
        x = F.relu(self.out_fc1(x))
        x = F.relu(self.out_fc2(x))
        x = self.out_fc3(x)

        return x
```

### Critic Loss

```python
 with torch.no_grad():
      # concatenate the stuffs
      actions_next = self.actor_target_network(inputs_next_norm_tensor)
      q_next_value = self.critic_target_network(inputs_next_norm_tensor, actions_next)
      q_next_value = q_next_value.detach()
      target_q_value = r_tensor + self.args.gamma * q_next_value   # this is vector
      if self.args.ddpg_vq_version=='ver3':  # if executing version-3
          target_q_value = self.critic_target_network.multi_to_single(target_q_value)  # map that to a single scalar q-value
      target_q_value = target_q_value.detach()
      # clip the q value
      clip_return = 1 / (1 - self.args.gamma)
      target_q_value = torch.clamp(target_q_value, -clip_return, 0)  
  # the q loss
  if self.args.ddpg_vq_version=='ver3':
      real_q_value = self.critic_network.deep_forward(inputs_norm_tensor, actions_tensor)  # map the real-q value as well. 
  else:
      real_q_value = self.critic_network(inputs_norm_tensor, actions_tensor)

```

When updating the critic network, I computed the **target_q value** by passing the vectorized target_q value to the $$\texttt{multi-to-single}$$ function in the network. 

### Actor Loss 

```python
  actions_real = self.actor_network(inputs_norm_tensor)

  if self.args.ddpg_vq_version=='ver3':
      actor_loss_pre = self.critic_network.deep_forward(inputs_norm_tensor, actions_real)   # map it to singlular vector
  else:
      actor_loss_pre = self.critic_network(inputs_norm_tensor, actions_real) 

  if self.args.actor_loss_type=='default':
      actor_loss = -(actor_loss_pre).mean()
      actor_loss += self.args.action_l2 * (actions_real / self.env_params['action_max']).pow(2).mean()
  if self.args.actor_loss_type=='min':
      actor_loss = -(actor_loss_pre).min(axis=1)[0].mean() 
      actor_loss += self.args.action_l2 * (actions_real / self.env_params['action_max']).pow(2).mean()
```

Actor Loss is defined as usual. 

### Result

I tried various versions of final mapping layer: changing the hidden dimensions, depths, with and without the bias term. 

```python
  self.out_fc1 = nn.Linear(self.num_reward, h_dim)  ## tried h_dim = 16, 32, 64, 128, 256 ..
  self.out_fc2 = nn.Linear(h_dim, h_dim)
  self.out_fc3 = nn.Linear(h_dim, 1)  

  def multi_to_single(self, x):
      x = F.relu(self.out_fc1(x))
      x = F.relu(self.out_fc2(x))
      x = self.out_fc3(x)  ## tried depth of 2, 3, 4
      return x
```

However, no matter how I change the network, this third attempt showed **poor performance**. Its performance was similar to the **DDPG+HER+Single(scalar) Dense Reward**. 

<center><img src="https://live.staticflickr.com/65535/51201559926_dd30849f97_o.png" alt="image-20210525132234653" style="zoom:40%;" /></center>



## Let's work on some difficult tasks. 

Especially, those tasks that cannot be tackled efficiently with dense, or even sparse rewards.  

### OpenAI team's alleged performance

**Arm Manipulation**

<p>
<div style="width: 100%;">
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 0px 0px;"> 
  <center><img src="https://live.staticflickr.com/65535/51202145088_67394b7c9a_o.png" alt="image-20210525184939162" style="zoom:50%;" />
  </center>
   </div>
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 0px 0px;"> 
   <center><img src="https://live.staticflickr.com/65535/51202720744_eee945dc53_o.png" alt="image-20210525184953257" style="zoom:50%;" />
   </center>
	</div>
</div>
<div style="width: 100%;">
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
  <center><img src="https://live.staticflickr.com/65535/51203008735_b3600f1e5e_o.png" alt="image-20210525185007719" style="zoom:50%;" />
  </center>
   </div>
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
   <center><img src="https://live.staticflickr.com/65535/51202146043_0fcc6be76f_o.png" alt="image-20210525185025770" style="zoom:50%;" />
   </center>
	</div>
</div>
</p>
























**Hand Reach**

<center><img src="https://live.staticflickr.com/65535/51201277052_2ba67b1909_o.png" alt="image-20210525192730094" style="zoom:50%;" /></center>



**Hand Manipulate Block**

<p>
<div style="width: 100%;">
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 0px 0px;"> 
  <center><img src="https://live.staticflickr.com/65535/51201260437_2f16ef346b_o.png" alt="image-20210525191348567" style="zoom:50%;" />
  </center>
   </div>
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 0px 0px;"> 
   <center><img src="https://live.staticflickr.com/65535/51202754479_9ec905a3e4_o.png" alt="image-20210525191415023" style="zoom:50%;" />
   </center>
	</div>
</div>
<div style="width: 100%;">
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
  <center><img src="https://live.staticflickr.com/65535/51202180098_c1a9a095ef_o.png" alt="image-20210525191431339" style="zoom:50%;" />
  </center>
   </div>
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
   <center><img src="https://live.staticflickr.com/65535/51201261427_a8056de989_o.png" alt="image-20210525191450528" style="zoom:50%;" />
   </center>
	</div>
</div>
</p>

**Hand Manipulate Egg**

<p>
<div style="width: 100%;">
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
  <center><img src="https://live.staticflickr.com/65535/51201978596_49b90bcb31_o.png" alt="image-20210525191522943" style="zoom:50%;" />
  </center>
   </div>
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
   <center><img src="https://live.staticflickr.com/65535/51202756039_0923bd581e_o.png" alt="image-20210525191542125" style="zoom:50%;" />
   </center>
	</div>
</div>
</p>

**Hand Manipulate Pen**

<p>
<div style="width: 100%;">
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
  <center><img src="https://live.staticflickr.com/65535/51201979771_84fc93ba71_o.png" alt="image-20210525191615340" style="zoom:50%;" />
  </center>
   </div>
    <div style="width: 50%; height: 300px; float: left; margin: 0px 0px 40px 0px;"> 
   <center><img src="https://live.staticflickr.com/65535/51201263402_65dd8f4068_o.png" alt="image-20210525191629570" style="zoom:50%;" />
   </center>
	</div>
</div>
</p>


### Environment Description

- **HandReach** : A simple task in which the goal is 15-dimensional and contains the target Cartesian position of each fingertip of the hand. Similarly to the FetchReach task, this task is relatively easy to learn. A goal is considered achieved if the mean distance between fingertips and their desired position is less than 1 cm.
- **HandManipulateBlockRotateZ** : Block placed on the palm of the hand, and the task is to manipulate the block. Goal is 7-dimensional and includes the target position (in Cartesian coordinates) and target rotation (in quaternions). **BlockRotateZ** task has a random target rotation around the $z$ axis of the block. No target position.
- **HandManipulateBlockRotateParallel** : Random target rotation around the $z$ axis of the block and axis-aligned target rotation for the $x$ and $y$ axes. No target position.
- **HandManipulateBlockRotateXYZ** : Random target rotation for all axes of the block. No target position. 
- **HandManipulateBlockFull** : Random target rotation for all axes of the block. Random target position.
- **HandManipulateEggRotate** RAndom target rotation for all axes of the egg. No target position.
- **HandManipulateEggFull** : Random target rotation for all axes of the egg. Random target position.
- **HandManipulatePenRotate** : Random target rotation $x$ and $y$ axes of the pen and no target rotation around the $z$ axis. No target position
- **HandManipulatePenFull** : Random target rotation $x$ and $y$ axes of the pen and no target rotation around the $z$ axis. Random target position.



## HandReach Task

### Environment Description







### Result



### Troubleshooting

- **Tuning the optimizer (method, learning rate..)**

  

- **Softmin** instead of **Hardmin**

  Instead of (hard-)min function, 

  $$
  J(\theta) = \mathbb{E}_{s\sim \rho^\mu} \bigg [ \min_i Q_i (s, \mu_\theta(s)) \bigg ] = \int_{\mathcal{S}}\rho^\mu(s)\min_i Q_i (s, \mu_\theta(s))ds
  $$

  I tried using the softmin function to define the expected reward

  $$
  J(\theta) = \mathbb{E}_{s\sim \rho^\mu} \bigg [ \min_i Q_i (s, \mu_\theta(s)) \bigg ] = \int_{\mathcal{S}}\rho^\mu(s) \cdot \bigg [\text{softmin}\big(\mathbf{Q}(s,\mu_\theta(s))/\tau\big )\bigg ] ^T \mathbf{Q} (s, \mu_\theta(s))ds
  $$

  where the soft-min function is defined by

  $$
  \text{softmin}(x_i) = \frac{\exp(-x_i/\tau)}{\sum_j \exp{(-x_j/\tau)}}
  $$
  
  where $\tau$ is the temperature that decides the softness of the min function. As $\tau$ approaches zero, softmin resembles hardmin. 
  
- **Learning** 

   





## Let's read some more papers. 



hello my name is 