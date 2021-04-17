---
title: "[NIPS 2019] Deconstructing Lottery Tickets: Zeros, Signs, and the Supermask"
tags: Model-Compression Network-Pruning Lottery-Ticket
permalink: "/notion_to_markdown/%5BPaper%20Review%5D%20Deconstructing%20Lottery%20Tickets%20Zero%20256c0f5ba9d2483cb37e197122f85459/"
---

## Generalizing the Lottery Ticket Hypothesis

### Lottery Ticket (LT) Algorithm is in fact doing...

1. Initiailize a mask $m$ to one (no pruning at all). Randomize the parameters $w$ of a network. Network is $f(x; w \odot m)$
2. Train the parameters $w$ of the network. Initial weights before the training is denoted as $w_i$  and weights after the training is denoted as $w_f$. 
3. To determine the weights to prune, we use a **'mask criterion'**. Mask criterion is defined as a scalar function $M(w_i, w_f )$ defined by both the initial and final weights. Specific shape of the  function $M$ is yet undetermined, while the original LT algorithm used $M(w_i , w_f) = \vert w_f \vert$. After that, we rank the weights by the value obtained from $M$, and the mask corresponding to top $p\%$ of weights are set to 1, and the bottom $(100-p)\%$ to 1. 
4. For the weights which its corresponding mask values are 1, **"Mask-1 Actions"** are taken. In the original LT algorithm, "Mask-1 Action" was to reinitialize its weights to their initial values, and marking as a trainable parameter in the subsequent training. 
5. For the weights which its corresponding mask values are 0, **"Mask-0 Actions"** are taken. In the original LT algorithm, "Mask-0 Action" was to freeze those weights with mask value 0. 
6. Repeat above procedure for iterative pruning. 

### This paper tries to generalize the LT algorithm by...

1. **Trying various versions of "mask criteria"** 

    <center><img src="Untitled.png" width="700"></center>

2. **Trying various versions of "mask-1 actions"**

    <center><img src="Untitled%201.png" width="700"></center>

3. **Trying various versions of "mask-0 actions"**

### In this summary article, I will...

(since this paper further analyzes the LT algorithm, which in my opinion can give us a deeper insight about the network pruning) summarize the experiment details & insights which can be applied to our experiment trying to connect pruning with outlier detection.

## Step 1. Trying various masking criterions

Authors focused on intial weights $w_i$ and final weights $w_f$. Maybe they believed that the *importance* of weights can be sufficiently expressed by $w_i$  and $w_f$. Note that authors visualize different masking criterions using a cartoon-form ellipse area of $w_i$ and $w_f$ space like below. 

<center><img src="Untitled%202.png" width="700"></center>

<center><img src="Untitled%203.png" width="700"></center>

Result shows that, while $\texttt{large\_final}$ criterion, which is originally used in the LT algorithm (and the one I am using for outlier detection experiments), is a very competitive masking criterion, **other criterion such as $\texttt{magnitude\_increase}$ / $\texttt{large\_init\_large\_final}$ $\texttt{movement}$ shows similar behavior.** 

<center><img src="Untitled%204.png" width="700"></center>

However, what we still don't know is the "Why" question. **"Why does those $\texttt{magnitude\_increase}$ or $\texttt{large\_final}$ criteria work better than the others?"** 

## Mask-1 Action : sign is everything.

For those lucky weights that survived the pruning process, **we have to decide the initialization method for training**. Recall, original LT algorithm paper stated that, to make the pruned network to learn successfully from scratch, we need to **rewind** the intialization to the original one: randomly reintializing degrades the performance. However, it is still unknown exactly which component of reinitialization process is responsible for the subsequent training procedure. **To find out, authors tried out three variants for Mask-1 Actions.**

- Reinitializing : reintialize the kept-weights based on the initialization distribution $\mathcal{D}_\theta$
- Reshuffling : within the trained kept-weights, shuffle them.
- Constants : Every weight on a layer becomes one of three values $-\alpha, 0 , \alpha$ while $\alpha$ is the standard deviation of each layer's $\mathcal{D}_\theta$

<center><img src="Untitled%205.png" width="700"></center>

Well, the result showed that, it is not easy to win the "rewind" technique (original LT algorithm) - none of above three intialization techniques showed promising results. Meanwhile, the authors didn't stop there: they asked themselves below questions. 

All of above intialization techniques doesn't preserve the 'signs' of original weights. **What if we preserve the signs of new-intialization?**  

Well, surprisingly, as soon as we ensured the new values of kept weights to have the same sign as their original initial values, all three variants above worked better (solid-line in Figure 4). We can clearly see that the **key-point of using the original initialization is preserving the sign**. This might allow us to state an interesting corollary about the behaviour of optimizers. 

**Optimizers work well anywhere in the correct sign quadrant for the weights, but encounter difficulty crossing the zero barrier between signs.** 

## Mask-0 Action : masking is in fact a new type of training.

Authors asked themselves a quite unique question.

**What should we do with the pruned weights? Just simply leave them and fix it to zero? Hmm. something more could have been done there as well.** 

The term 'pruning' implies that we want to disconnect the connections between the neurons. Thus, fixing the pruned weights to zero might be a reasonable thing to do. However, if we think it differently, we might construe the pruned connections being "unimportant" to the performance of the network. **In other words, we might think that the network "doesn't care that much" about those pruned weights! If that's the case, (authors wondered) why don't we set them to some other non-zero value?** 

To that end, authors designed an interesting experiment.

- Experiment A : (original LT) **reintialize the pruned weights to zero** + freeze during training
- Experiment B : **reintialize the pruned weights to their initial value** + freeze during training.

By conducting above experiment, we can get a sense how important the zero-ing procedure is!

If Experiment B wins (or at least perform similarly), it means that the zero-ing process isn't that significant. 

<center><img src="Untitled%206.png" width="700"></center>

**However, the results showed that zero-ing process is actually very important.** Authors then stated an hypothesis, which I personally consider really interesting. 

Hypothesis: Mask criterion we use ($\texttt{large\_final}$) tends to mask the weights that were headed to zero anyway!

To test above hypothesis, authors designed another experiment (mask-0 action) as well. 

- Experiment C : **for the weights that are pruned**, we set it and fix it to zero if they move towards zero during the training process, and set it to the initial value otherwise.
- Experiment D : **for every weights in the network**, we set it and fix it to zero if they move towards zero during the training process → this experiment actually doesn't prune the network.

Above experiments C and D each correspond to Variant 1 and Variant 2 in Figure 5 above. **Surprisingly, jusy by masking the weights** without any further training, it works better than non-pruned network. Also, since experiment D outperformed experiment C, we can conclude that this masking action of considering the 'movement of weights' during the training process is not only beneficial to mask-0 , but in fact also beneficial to mask-1 weights. 

To that end, authors conclude an interesting approach;

**Masking can be considered as a novel type of training procedure!**

Now, we can gain a new perspective to answer

1. why certain mask criteria works better than others →  $\texttt{large\_final}$ , pruning the weights that are small and setting it to zero, is in fact **effectively pushing them further in the direction they were heading anyway.**
2. important contribution of the value of the pruned weights to the overall performance of pruned networks
3. benefit of setting these select weights to zero as a better intialization for the network

## Supermask: if masking is training, let's realllly use it for training

### No training at all, but a simple masking to the randomly initialized network.

It turns out, that a well-chosen mask can already attain a test accuracy far better than chance! (MNIST classifier - random accuracy 10% → well-chosen mask operation 40%) Authors call those masks **"supermask"**, which is a mask that can produce better-than-chance accuracy without training of the underlying weights. 

### How can we find a supermask?

Authors first tested below types of masks. It turns out, **just by applying a large-final mask with additional same-sign constraint** can improve the accuracy of original network by far without any training. (**Orange solid line** in Figure 7)

<center><img src="Untitled%207.png" width="700"></center>

<center><img src="Untitled%208.png" width="200"></center>
We can apply this method for model compression ; simply saving a binary mask and a random seed can reconstruct the full weights of the network. 

### Bit more? Optimizing the supermask: training the mask, not the weights.

For an original weight tensor $w$ and a mask tensor $m$ of the same shape, we define an effective weight

$$w' = w_i  \odot g(m)$$

Training the mask with 

$$g(m) = \text{Bern}(S(m))$$

where $\text{Bern}(p)$ is the bernoulli sample with probability $p$ and $S(m)$ is the sigmoid function. **Training the $m$ matrix with SGD, authors obtained 95.3% test accuracy on MNIST and 65.4% on CIFAR-10.** (**red dashed-line** in Figure 7)

<center><img src="Untitled%209.png" width="700"></center>

### A Simple trick during training : Dynamic Weight Rescaling

For each training iteration and for each layer, we multiply the underlying weights by the ratio of the total number of weigts in the layer over the number of ones in the corresponding mask.

## Final Results & Remarks

<center><img src="Untitled%2010.png" width="700"></center>

**Network upon initialization already contains powerful subnetworks that work well without training!**

## So.. what's left for me? Opinions & Insights

흥미로운 페이퍼였다고 생각함. Lottery Ticket 페이퍼의 경우는 사실 "해봤더니 되었다" 정도여서 오호 그렇구나 정도였고 사실 크게 감흥은 없었는데.. 이 페이퍼의 경우 (물론 theoretical한 설명을 준 건 아니지만) 적어도 "왜 intialization을 그렇게 해야하는지" 라는 질문에 대해 어느 정도 안개를 걷어준 것 같아서 재미있게 읽었음. 뭔가 연구에서 인사이트와 적절한 실험 설계의 중요성을 보여준 것 같달까.. 

일단 제일 먼저.. 두 페이퍼의 가장 큰 contribution이 무엇일지를 한번 생각해봐야될 것 같은데... 왜냐하면... 사실 굳이 복잡하게 왜 intialization을 하려고 하냐 하는지를 사실 잘 이해를 못하겠어서임. LeCun이 subnetwork에서 아무렇게나 initialize하면 training이 잘 안된다고 이미 말한 사실이 있는데, 그 문제를 굳이 왜 태클하려고 하냐 이 말임. 어차피 **LT algorithm의 경우 pruning을 하기 위해서 일단 한번은 training을 해야되는데**, 차라리 거기서 굳이 initialize를 또 하지 않고 바로 fine-tuning을 해버리면 일이 쉬워지는데.. 굳이 이런 걸 연구해야 해? 하는 생각을 할 수도 있으니까. 

근데 학계의 관심이 Lottery Ticket 페이퍼에 쏠리게 된 데에는 그 만한 이유가 있을 것이라고 생각. 지금이야 over-parameterized된 네트워크에서 smaller network로 축소시키는 과정에서  $w_f$ (weight after training)을 써야 하지만, 나중에 혹시 아나? training 없이, 혹은 아주 짧은 training 과정만으로 위 두 논문에서 보인 effective sub-network 을 찾아내게 될 수 있을지 (pruning 을 할 수 있을지)?  **그럴 경우 어쨌든 간에 그런 subnetwork를 (거의) scratch로부터 training을 시켜야 할텐데 그 때 충분히 유용하게 쓰일 내용일 것이고, 그래서 사람들의 attention이 모이지 않았나 하는 생각이 든다.** 

그럼 이제 나에게 남은 문제는.. 이 두 편의 논문을 읽으면서 내가 얻었던 insight들과 그것들이 내 연구에 어떻게 활용될 수 있을지를 생각해봐야될텐데, 일단 먼저 위 연구들에서 추가적으로 확인하고 싶은 내용들을 몇 가지 적어보면서 생각을 정리해봐야겠음. 

1. 일단 당장 이 논문에서 masking criterion을 $M(w_i , w_f )$ 로 정의했는데, 사실 variable 들을 저렇게 두 개 사용하겠다고 한 것도 사실은 human choice였던 거고.. specific 한 function shape도 사실 intuition에 의지해서 hand-crafted되어 있는 함수들이어서.. 논문에서 네이밍한 $\texttt{large\_final}$ criterion이 반드시 optimal한 (**optimal in what sense?**의 문제가 남아있긴 하지만..) masking criterion이라는 보장은 없지 않나 싶음. 

 또 $w_f$를 criterion의 변수로 쓰는 순간 사실 original big (over-parameterized) network 에 대한 training을 한 번은 진행해야 하는데..  아까 말했듯 그런 경우 그냥 fine-tuning을 하면 되지 않냐? 는 질문을 할 수도 있을 거고. 

 **어쨌든 적절한 masking criterion이 무엇인지에 대한 문제를 조금 살펴봐야될 듯함.** 

 근데 이 과정에서.. **optimal in what sense?** 라는 질문에 답을 해야 함. 대다수의 LT 후속 논문들, 그리고 대부분의 model compression 관련 페이퍼들은 classifier에 대해서 다루고 있고, 일련의 optimization problem에서 minimization function을 "remaining weight의 숫자", primal equality/inequality constraint를 "classifier accuracy의 보존 혹은 향상"으로 잡고 있는데, 지금 내가 다루고자 하는 **autoencoder + outlier detection + pruning** 문제의 경우 그것들과 같은 선상에서 다룰 수 있는 문제가 아님.
 
 우리 상황에서는, autoencoder의 accuracy격인.. training data 에 대한 mean reconstruction error가 pruning 이후에 기존의 bigger network 와 비교했을 때 높아진다 하더라도 크게 상관이 없음. **우리가 원하는 것은 IND 와 OOD의 reconstruction error 사이 간격이 더 벌어지기를 바랄 뿐이지, IND의 RE가 보존되길 바라는 것이 아님.** 그렇다면 여러 masking criterion 중 무엇이 optimal인지를 결정할 때, 무엇을 바탕으로 결정을 해야 하는가? **outlier detection 성능?** 근데 그것은 이 세상에 존재하는 모든 outlier 에 대해서 다 실험을 해보지 않는 이상 그리 좋은 방법이 아닌듯 하고.. 상웅 조교님이 말씀하신 NAE의 objective function을 optimality의 기준으로 삼는 것이 이 시점에서는 가장 적절해 보이긴 하는데.. EBGAN의 objective을 써도 될 것 같기도 하고. 이건 autoencoder 쪽 논문을 더 읽어봐야 하나... 일단 조금 더 고민을 해봐야겠음. 

2. Supermask에 대한 내용은 무척 흥미롭게 읽었던 부분 중 하나인데, 일단 weight 대신에 mask를 training 한다는 것 자체가 매우 흥미로웠음. which neuron 간의 연결을 끊어버릴지를 learning을 통해서 학습을 한다는 것인데, 조금 거창히 말하자면 **optimal 한 network architecture를 learning으로 학습**하는 것과 같다고 생각함. 사실 지금까지 (특히 computer vision 분야에서) network architecture는 대부분 hand-crafted되는 경우가 많았던 것 같은데 - 이는 개인적으로 (그럴 깜냥도 안되지만) computer vision 분야의 deep learning 관련 성능 향상 progress가 그다지 흥미롭게 느껴지지 않는 이유이기도 했고 - supermask의 경우 optimal한 network architecture를 찾아내는 나름 합리적인 방법인 것 같다는 점에서 아주 인상적이었음. 

그러나 이 논문에서 소개된 supermask 의 경우 pruning ratio를 explicit하게 조절할 수는 없어 보이는데 (supermask 형성 과정 자체가 stochastic한 측면이 있고, 논문에서도 20~80% 사이의 pruning ratio 정도만 obtain할 수 있었던 것으로 보임) pruning ratio를 직접적으로 정해야 하는 상황이라면 문제가 될 수도 있을 것 같음 (근데 그런 상황이 있나?)
 

또한, supermask generating function을  $g(m) = \text{Bern}(\text{sigmoid}(m))$ 으로 결정하였는데 이것도 다른 방법이 있을 것이라고 생각함. 당장 생각나는 건 예를 들어 

$$g(m) = u{(\text{sigmoid}(m))}$$

where 

$$u(s;t \in (0,1))=\begin{cases}1 & \text{if } s>t \\ 0& \text{else}\end{cases}$$

이렇게 정의를 한다면 $t$를 조절하면서 간접적으로 pruning ratio를 조절할 수 있을 수도 있을 것 같고, supermask generating 과정이 stochastic하지 않기 때문에 조금 더 나을 수도 (물론 못할 수도) 있을 것 같고. 실험을 해봐야될 것 같음. 

이 supermask 에 대한 논의도 마찬가지로, 현재 우리의 문제인 autoencoder + pruning + outlier detection 쪽에다가 적용을 하려면 무엇을 objective function으로 삼아 training할 것인지를 결정해야됨. 일단 가장 간단하게 생각 나는 것은 일반적인 AE를 학습하듯 mean RE를 minimize하는 방안인데, 이것이 흥미로운 결과가 되려면 

**Result A** - weight를 학습 (original)
**Result B** - weight는 first initialization 상태 그대로 fix 시켜둔 상태에서 mask 를 학습
**Result C** - Result 2의 결과에서 학습된 mask를 통해 pruned된 weight들은 고정시켜둔 상태에서 한 차례 더 weight들을 fine-tuning

Result B 혹은 C 에서 Result A와 비교해 comparable or better outlier detection performance를 보여줄 수 있어야 함. 

만약 Result B 혹은 C의 결과가 동일한 pruning ratio를 가진 base pruning method 결과보다 좋다면 또 다른 의미를 찾을 수도 있을 것 같음. 

3. 쓰다가 또 든 생각인데, **autoencoder + pruning + outlier detection 쪽에 supermask의 아이디어를 적용하는 것의 장점은 뭐지?** 

일단 지금까지 했던 pruning 실험과 supermask가 다른 점은.. 
- pruning : $\texttt{large\_final}$ mask criterion을 사용한 hand-crafted pruning process + precise weight fine-tuning
- supermask : original objective function를 minimize하기 위한 mask function을 학습

supermask 테크닉의 경우 minimize하고자 하는 **objective function 을** precise하게 minimize 한다기보다는 **조금 rough 하게 minimize 시킨다는 특징이** 있는 것 같은데, **better outlier detection을 위해서 precise한 training이 좋을지, rough한 training이 좋을지는 모르는 일 아닌가?** (당장 rough한 training이라는게 뭔지,, 구체적으로 정의할 수 있는 개념도 아닌 듯 하고..) 

objective function이 NAE처럼 outlier detection task를 잘 하기 위해 specifically design 되어 있다면 해당 objective function을 매우 precise하게 minimize하는게 중요하겠지만, outlier에 대한 고려가 되지 않은 채 설계된 objective function의 경우 regularizing term 을 적절히 잘 넣는 것이 (= rough 하게 training 시키는 것과 동의어일 것 같긴 한데) outlier detection에 도움이 될 수도 있을 것 같고... 

4. Training from scratch 가 outlier detection 성능에 영향을 줄 수 있을까? 도 고민해봐야 할 것 같음. 상웅 조교님이 지지난 미팅 과정에서 언뜻 임의의 criterion을 가지고 pruned 된 네트워크를 scratch에서 training 시키는 것도 한 번 해보면 좋을 것 같다고 하시긴 하셨는데, 사실 LT 페이퍼에 의하면 이게 쉬운 일은 아니라고 하니까. 근데 pruning + finetuning 과 pruning + training from scratch 의 결과가 많이 다를까? 잘 모르겠음.